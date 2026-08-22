"use client";

import {
  BadgeCheck,
  CreditCard,
  Landmark,
  Loader2,
  Lock,
  ShoppingBag,
  Smartphone,
  Tag,
  Truck,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { findFabricanteByCode, type Fabricante } from "@/lib/fabricantes-data";
import {
  banks,
  detectCardBrand,
  formatCardNumber,
  formatExpiry,
  generateOrderNumber,
} from "@/lib/payment-utils";
import { currency } from "@/lib/mock-data";
import { recordOrder } from "@/lib/orders";
import { recordSale } from "@/lib/sales-ledger";

type Method = "tarjeta" | "pse" | "nequi";

export default function CheckoutPage() {
  const { user } = useAuth();
  const {
    lines,
    originalSubtotal,
    discount,
    wholesaleDiscount,
    promoCode,
    promoDiscount,
    applyPromoCode,
    removePromoCode,
    freeShippingReason,
    shipping,
    total,
    clearCart,
  } = useCart();
  const router = useRouter();

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    line: "",
    city: "",
    department: "",
  });

  useEffect(() => {
    if (!user?.name) return;
    const frame = requestAnimationFrame(() => {
      setAddress((prev) => (prev.fullName ? prev : { ...prev, fullName: user.name }));
    });
    return () => cancelAnimationFrame(frame);
  }, [user]);

  const [method, setMethod] = useState<Method>("tarjeta");
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [pse, setPse] = useState({ bank: "", docType: "CC", docNumber: "" });
  const [nequiPhone, setNequiPhone] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [errors, setErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const formTopRef = useRef<HTMLDivElement>(null);

  const fieldClass = (field: string, base = "w-full bg-surface-alt border rounded-tl-md px-3 py-2 text-sm text-ink placeholder:text-muted outline-none") =>
    `${base} ${fieldErrors[field] ? "border-accent" : "border-border"}`;

  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState("");
  const [appliedFabricante, setAppliedFabricante] = useState<Fabricante | null>(null);

  const promoLines = appliedFabricante
    ? lines.filter((l) => appliedFabricante.productIds.includes(l.product.id))
    : [];
  const finalTotal = total;

  const handleApplyPromo = () => {
    const found = findFabricanteByCode(promoInput);
    if (found) {
      const applies = lines.some((l) => found.productIds.includes(l.product.id));
      if (!applies) {
        setPromoError("Este código no aplica a los productos de tu carrito.");
        setAppliedFabricante(null);
        return;
      }
      setPromoError("");
      setAppliedFabricante(found);
      return;
    }

    const result = applyPromoCode(promoInput);
    if (!result.ok) {
      setPromoError(result.error ?? "Ese código promocional no existe.");
      setAppliedFabricante(null);
      return;
    }
    setPromoError("");
  };

  const handleRemovePromo = () => {
    setAppliedFabricante(null);
    removePromoCode();
    setPromoInput("");
  };

  if (lines.length === 0 && !processing) {
    return (
      <div className="px-4 lg:px-8 py-16 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-tl-lg bg-surface-alt flex items-center justify-center">
          <ShoppingBag size={24} className="text-muted" />
        </div>
        <p className="mt-4 font-semibold text-ink">Tu carrito está vacío</p>
        <p className="mt-1 text-sm text-muted">Agrega productos antes de pasar por caja.</p>
        <Link
          href="/"
          className="mt-5 inline-block text-sm font-semibold bg-ink text-white px-5 py-2.5 rounded-tl-md hover:bg-cta transition-colors"
        >
          Ir al catálogo
        </Link>
      </div>
    );
  }

  const validate = () => {
    const fieldErrs: Record<string, string> = {};
    if (!address.fullName) fieldErrs.fullName = "Falta el nombre completo.";
    if (!address.phone) fieldErrs.phone = "Falta el teléfono.";
    if (!address.city) fieldErrs.city = "Falta la ciudad.";
    if (!address.line) fieldErrs.line = "Falta la dirección.";
    if (!address.department) fieldErrs.department = "Falta el departamento.";

    if (method === "tarjeta") {
      if (card.number.replace(/\s/g, "").length < 13) fieldErrs.cardNumber = "Número de tarjeta inválido.";
      if (!card.name) fieldErrs.cardName = "Falta el nombre del titular.";
      if (!/^\d{2}\/\d{2}$/.test(card.expiry)) fieldErrs.cardExpiry = "Fecha inválida.";
      if (card.cvv.length < 3) fieldErrs.cardCvv = "CVV inválido.";
    } else if (method === "pse") {
      if (!pse.bank) fieldErrs.pseBank = "Selecciona tu banco.";
      if (!pse.docNumber) fieldErrs.pseDoc = "Falta el número de documento.";
    } else if (method === "nequi") {
      if (nequiPhone.replace(/\D/g, "").length < 10) fieldErrs.nequiPhone = "Número de celular inválido.";
    }
    if (!acceptedTerms) fieldErrs.terms = "Debes aceptar los términos y condiciones.";

    return fieldErrs;
  };

  const handlePay = async (e: FormEvent) => {
    e.preventDefault();
    const fieldErrs = validate();
    setFieldErrors(fieldErrs);
    setErrors(Object.values(fieldErrs));
    if (Object.keys(fieldErrs).length > 0) {
      formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    setProcessing(true);

    // --- Integración con pasarela de pagos ---
    // Aquí es donde se conecta la pasarela real (Wompi, PayU, ePayco, etc.):
    // 1. Tokenizar los datos de pago con el SDK de la pasarela (nunca enviar
    //    el número de tarjeta completo a nuestro propio backend).
    // 2. Enviar el token + el resumen del pedido al backend para crear la
    //    transacción y esperar la confirmación (o redirigir al checkout
    //    hospedado de la pasarela, según el proveedor).
    // 3. Reemplazar el setTimeout de abajo por esa llamada real.
    const orderNumber = generateOrderNumber();
    const order = {
      orderNumber,
      date: new Date().toISOString(),
      method,
      address,
      lines: lines.map(({ product, item, unitPrice, wholesaleApplied }) => ({
        productId: product.id,
        name: product.name,
        image: product.image,
        size: item.size,
        qty: item.qty,
        price: unitPrice,
        wholesaleApplied,
      })),
      subtotal: originalSubtotal,
      discount,
      wholesaleDiscount,
      promoCode: appliedFabricante?.code ?? promoCode ?? null,
      shipping,
      total: finalTotal,
    };

    await new Promise((resolve) => setTimeout(resolve, 1600));

    if (user) {
      recordOrder({ ...order, userId: user.id });
    }

    if (appliedFabricante && promoLines.length > 0) {
      recordSale({
        id: `sale-${Date.now()}`,
        date: order.date,
        fabricanteId: appliedFabricante.id,
        code: appliedFabricante.code,
        orderNumber,
        items: promoLines.map((l) => ({
          productId: l.product.id,
          name: l.product.name,
          qty: l.item.qty,
          price: l.unitPrice,
        })),
      });
    }

    try {
      sessionStorage.setItem("j3sas_last_order", JSON.stringify(order));
    } catch {
      // storage unavailable (private browsing, quota, blocked) — order was still recorded above
    }
    clearCart();
    removePromoCode();
    router.push("/checkout/confirmacion");
  };

  return (
    <div className="px-4 lg:px-8 py-5">
      <div ref={formTopRef} className="text-sm text-muted mb-3 scroll-mt-20">
        <Link href="/" className="hover:text-ink">
          Inicio
        </Link>{" "}
        / <span className="text-ink">Finalizar compra</span>
      </div>

      <h1 className="text-xl font-semibold text-ink mb-5">Finalizar compra</h1>

      {errors.length > 0 && (
        <div className="mb-5 bg-accent-soft border border-accent/30 rounded-tl-md px-4 py-3">
          <p className="text-sm font-semibold text-accent">
            Revisa los siguientes datos antes de pagar:
          </p>
          <ul className="mt-1.5 space-y-0.5">
            {errors.map((err) => (
              <li key={err} className="text-xs text-accent">
                {err}
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handlePay} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Shipping */}
          <section className="bg-surface border border-border rounded-tl-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Truck size={17} className="text-brand" />
              <h2 className="font-semibold text-ink">Datos de envío</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-ink">Nombre completo</label>
                <input
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  className={`mt-1.5 ${fieldClass("fullName")}`}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-ink">Teléfono</label>
                <input
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  placeholder="+57 300 000 0000"
                  className={`mt-1.5 ${fieldClass("phone")}`}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-ink">Ciudad</label>
                <input
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className={`mt-1.5 ${fieldClass("city")}`}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-ink">Dirección</label>
                <input
                  value={address.line}
                  onChange={(e) => setAddress({ ...address, line: e.target.value })}
                  placeholder="Calle, número, apto/casa"
                  className={`mt-1.5 ${fieldClass("line")}`}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-ink">Departamento</label>
                <input
                  value={address.department}
                  onChange={(e) => setAddress({ ...address, department: e.target.value })}
                  className={`mt-1.5 ${fieldClass("department")}`}
                />
              </div>
            </div>
          </section>

          {/* Payment method */}
          <section className="bg-surface border border-border rounded-tl-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Lock size={16} className="text-brand" />
              <h2 className="font-semibold text-ink">Método de pago</h2>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "tarjeta" as const, label: "Tarjeta", icon: CreditCard },
                { id: "pse" as const, label: "PSE", icon: Landmark },
                { id: "nequi" as const, label: "Nequi", icon: Smartphone },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMethod(id)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-tl-md border text-sm font-medium transition-colors ${
                    method === id
                      ? "bg-ink text-white border-ink"
                      : "bg-surface-alt text-ink border-border hover:border-ink"
                  }`}
                >
                  <Icon size={17} />
                  {label}
                </button>
              ))}
            </div>

            {method === "tarjeta" && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-medium text-ink">Número de tarjeta</label>
                  <div className="relative mt-1.5">
                    <input
                      value={card.number}
                      onChange={(e) =>
                        setCard({ ...card, number: formatCardNumber(e.target.value) })
                      }
                      placeholder="0000 0000 0000 0000"
                      inputMode="numeric"
                      className={fieldClass("cardNumber")}
                    />
                    {detectCardBrand(card.number) && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-muted">
                        {detectCardBrand(card.number)}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-ink">Nombre del titular</label>
                  <input
                    value={card.name}
                    onChange={(e) => setCard({ ...card, name: e.target.value })}
                    placeholder="Como aparece en la tarjeta"
                    className={`mt-1.5 ${fieldClass("cardName")}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-ink">Vencimiento</label>
                    <input
                      value={card.expiry}
                      onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                      placeholder="MM/AA"
                      inputMode="numeric"
                      className={`mt-1.5 ${fieldClass("cardExpiry")}`}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink">CVV</label>
                    <input
                      value={card.cvv}
                      onChange={(e) =>
                        setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })
                      }
                      placeholder="123"
                      inputMode="numeric"
                      className={`mt-1.5 ${fieldClass("cardCvv")}`}
                    />
                  </div>
                </div>
              </div>
            )}

            {method === "pse" && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-medium text-ink">Banco</label>
                  <select
                    value={pse.bank}
                    onChange={(e) => setPse({ ...pse, bank: e.target.value })}
                    className={`mt-1.5 ${fieldClass("pseBank")}`}
                  >
                    <option value="">Selecciona tu banco</option>
                    {banks.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-ink">Tipo de documento</label>
                    <select
                      value={pse.docType}
                      onChange={(e) => setPse({ ...pse, docType: e.target.value })}
                      className="mt-1.5 w-full bg-surface-alt border border-border rounded-tl-md px-3 py-2 text-sm text-ink outline-none"
                    >
                      <option value="CC">Cédula de ciudadanía</option>
                      <option value="CE">Cédula de extranjería</option>
                      <option value="NIT">NIT</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-ink">Número de documento</label>
                    <input
                      value={pse.docNumber}
                      onChange={(e) =>
                        setPse({ ...pse, docNumber: e.target.value.replace(/\D/g, "") })
                      }
                      inputMode="numeric"
                      className={`mt-1.5 ${fieldClass("pseDoc")}`}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted">
                  Al continuar serás redirigido a tu banco para autorizar el pago de forma segura.
                </p>
              </div>
            )}

            {method === "nequi" && (
              <div className="mt-4 space-y-2">
                <label className="text-xs font-medium text-ink">Número de celular Nequi</label>
                <input
                  value={nequiPhone}
                  onChange={(e) => setNequiPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="3000000000"
                  inputMode="numeric"
                  className={fieldClass("nequiPhone")}
                />
                <p className="text-xs text-muted">
                  Vas a recibir una notificación push en tu app Nequi para aprobar el pago.
                </p>
              </div>
            )}

            <label
              className={`mt-5 flex items-start gap-2 text-xs ${
                fieldErrors.terms ? "text-accent" : "text-muted"
              }`}
            >
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5"
              />
              He leído y acepto los{" "}
              <Link href="/terminos" className="text-ink underline hover:text-cta">
                términos y condiciones
              </Link>{" "}
              y la{" "}
              <Link href="/privacidad" className="text-ink underline hover:text-cta">
                política de privacidad
              </Link>
              .
            </label>
          </section>
        </div>

        {/* Order summary */}
        <aside className="lg:sticky lg:top-20 h-fit bg-surface border border-border rounded-tl-2xl p-5">
          <h2 className="font-semibold text-ink mb-3">Resumen del pedido</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {lines.map(({ index, item, product, unitPrice, wholesaleApplied }) => (
              <div key={index} className="flex gap-2.5">
                <div className="relative w-12 h-12 rounded-tl-md overflow-hidden bg-surface-alt border border-border shrink-0">
                  <Image src={product.image} alt={product.name} fill className="object-cover" />
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-ink text-white text-[9px] font-semibold flex items-center justify-center">
                    {item.qty}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-ink line-clamp-1">{product.name}</p>
                  {item.size && <p className="text-[11px] text-muted">Talla {item.size}</p>}
                  {wholesaleApplied && (
                    <p className="text-[10px] font-semibold text-brand">Precio mayorista</p>
                  )}
                </div>
                <p className="text-xs font-semibold text-ink shrink-0">
                  {currency.format(unitPrice * item.qty)}
                </p>
              </div>
            ))}
          </div>

          {/* Promo code */}
          <div className="mt-4 pt-4 border-t border-border">
            <label className="text-xs font-medium text-ink flex items-center gap-1.5">
              <Tag size={13} className="text-brand" />
              ¿Tienes un código? Ponlo aquí
            </label>

            {appliedFabricante || promoCode ? (
              <div className="mt-1.5 flex items-center justify-between gap-2 bg-brand-soft rounded-tl-md px-3 py-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <BadgeCheck size={14} className="text-brand shrink-0" />
                  <p className="text-xs text-ink truncate">
                    Código <span className="font-semibold">{appliedFabricante?.code ?? promoCode}</span> aplicado
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Quitar código"
                  onClick={handleRemovePromo}
                  className="text-muted hover:text-accent shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="mt-1.5 flex items-center gap-1.5">
                <input
                  value={promoInput}
                  onChange={(e) => {
                    setPromoInput(e.target.value);
                    setPromoError("");
                  }}
                  placeholder="Ej: DORADO10"
                  className="flex-1 min-w-0 bg-surface-alt border border-border rounded-tl-md px-3 py-2 text-xs text-ink placeholder:text-muted outline-none uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="text-xs font-semibold bg-ink text-white px-3 py-2 rounded-tl-md shrink-0 hover:bg-cta transition-colors"
                >
                  Aplicar
                </button>
              </div>
            )}
            {promoError && <p className="mt-1.5 text-xs text-accent">{promoError}</p>}
          </div>

          <div className="mt-4 pt-4 border-t border-border space-y-1.5 text-sm">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span>{currency.format(originalSubtotal)}</span>
            </div>
            <div className="flex justify-between text-accent">
              <span>Descuento</span>
              <span>-{currency.format(discount)}</span>
            </div>
            {wholesaleDiscount > 0 && (
              <div className="flex justify-between text-brand">
                <span>Precio mayorista</span>
                <span>-{currency.format(wholesaleDiscount)}</span>
              </div>
            )}
            {appliedFabricante && (
              <div className="flex justify-between text-brand">
                <span>Código {appliedFabricante.code}</span>
                <span>Registrado</span>
              </div>
            )}
            {promoDiscount > 0 && (
              <div className="flex justify-between text-brand">
                <span>Cupón {promoCode}</span>
                <span>-{currency.format(promoDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted">
              <span>Envío</span>
              <span>{shipping === 0 ? "Gratis" : currency.format(shipping)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-ink pt-1.5 border-t border-border mt-1.5">
              <span>Total</span>
              <span>{currency.format(finalTotal)}</span>
            </div>
          </div>

          {freeShippingReason === "quantity" && (
            <p className="mt-1.5 flex items-center gap-1 text-[11px] text-brand">
              <Truck size={12} />
              Envío gratis por llevar más de 3 artículos
            </p>
          )}
          {freeShippingReason === "promo" && (
            <p className="mt-1.5 flex items-center gap-1 text-[11px] text-brand">
              <Truck size={12} />
              Envío gratis por tu cupón {promoCode}
            </p>
          )}

          <button
            type="submit"
            disabled={processing}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-cta text-white text-sm font-semibold py-3 rounded-tl-lg transition-colors hover:bg-cta-dark disabled:opacity-70"
          >
            {processing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Procesando pago...
              </>
            ) : (
              <>
                <Lock size={15} />
                Pagar {currency.format(finalTotal)}
              </>
            )}
          </button>
          <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-muted">
            <Lock size={11} />
            Pago 100% seguro y encriptado
          </p>
        </aside>
      </form>
    </div>
  );
}
