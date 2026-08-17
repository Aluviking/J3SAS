"use client";

import { Minus, Package, Plus, ShoppingBag, Trash2, Truck, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { products } from "@/lib/mock-data";

const currency = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export default function CartPanel({
  open,
  onClose,
  desktopOpen,
  onCloseDesktop,
}: {
  open: boolean;
  onClose: () => void;
  desktopOpen: boolean;
  onCloseDesktop: () => void;
}) {
  const {
    items,
    lines,
    updateQty,
    removeItem,
    addItem,
    count,
    originalSubtotal,
    discount,
    wholesaleDiscount,
    freeShippingReason,
    shipping,
    total,
  } = useCart();
  const [promo, setPromo] = useState("");

  const recommended = products
    .filter((p) => !items.some((i) => i.productId === p.id))
    .slice(0, 2);

  return (
    <>
      {open && (
        <div onClick={onClose} className="fixed inset-0 bg-black/40 z-40 xl:hidden" />
      )}
      <aside
        className={`fixed top-0 right-0 h-screen w-72 sm:w-80 shrink-0 bg-surface border-l border-border flex flex-col z-50 transition-transform duration-200 ${
          open ? "translate-x-0" : "translate-x-full"
        } ${desktopOpen ? "xl:translate-x-0" : "xl:translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-3 pt-3">
          <h2 className="font-semibold text-ink">Mi carrito ({count})</h2>
          <button
            onClick={() => {
              onClose();
              onCloseDesktop();
            }}
            aria-label="Cerrar carrito"
            className="w-9 h-9 rounded-tl-md bg-ink text-white flex items-center justify-center transition-colors hover:bg-cta"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 mt-2.5 space-y-2.5">
          {lines.length === 0 && (
            <p className="text-sm text-muted">Tu carrito está vacío.</p>
          )}
          {lines.map(({ index, item, product, unitPrice, wholesaleApplied }) => (
            <div key={index} className="flex gap-2">
              <div className="relative w-12 h-12 rounded-tl-lg overflow-hidden bg-surface-alt border border-border shrink-0">
                <Image src={product.image} alt={product.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-ink line-clamp-1">
                  {product.name}
                </p>
                {item.size && (
                  <p className="text-xs text-muted">Talla {item.size}</p>
                )}
                {wholesaleApplied && (
                  <p className="text-[10px] font-semibold text-brand flex items-center gap-1 mt-0.5">
                    <Package size={10} /> Precio mayorista
                  </p>
                )}
                <div className="mt-1 flex items-center justify-between gap-1">
                  <p className="text-xs font-semibold text-ink">
                    {currency.format(unitPrice)}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQty(index, item.qty - 1)}
                      className="w-5 h-5 rounded-tl-sm bg-surface-alt border border-border flex items-center justify-center shrink-0"
                    >
                      <Minus size={10} className="text-ink" />
                    </button>
                    <span className="text-xs font-medium text-ink w-3 text-center">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(index, item.qty + 1)}
                      className="w-5 h-5 rounded-tl-sm bg-surface-alt border border-border flex items-center justify-center shrink-0"
                    >
                      <Plus size={10} className="text-ink" />
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => removeItem(index)}
                className="text-muted hover:text-accent shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {lines.length > 0 && (
            <div className="flex items-center gap-1.5 pt-1">
              <input
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
                placeholder="Pega tu código, si tienes"
                className="flex-1 min-w-0 bg-surface-alt border border-border rounded-tl-md px-2.5 py-1.5 text-xs text-ink placeholder:text-muted outline-none"
              />
              <button className="text-xs font-semibold bg-ink text-white px-2.5 py-1.5 rounded-tl-md shrink-0">
                Aplicar
              </button>
            </div>
          )}
        </div>

        <div className="px-3 py-2.5 border-t border-border">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span>{currency.format(originalSubtotal)}</span>
            </div>
            <div className="flex justify-between text-accent">
              <span>Ahorro</span>
              <span>-{currency.format(discount)}</span>
            </div>
            {wholesaleDiscount > 0 && (
              <div className="flex justify-between text-brand">
                <span>Precio mayorista</span>
                <span>-{currency.format(wholesaleDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-muted">
              <span>Envío</span>
              <span>{shipping === 0 ? "Gratis" : currency.format(shipping)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold text-ink pt-1.5 border-t border-border mt-1.5">
              <span>Total</span>
              <span>{currency.format(total)}</span>
            </div>
          </div>

          {freeShippingReason === "quantity" && (
            <p className="mt-1.5 flex items-center gap-1 text-[10px] text-brand">
              <Truck size={11} />
              Envío gratis por llevar más de 3 artículos
            </p>
          )}

          <Link
            href="/checkout"
            className={`mt-2.5 flex items-center justify-center gap-2 bg-cta text-white text-sm font-semibold py-2.5 rounded-tl-lg transition-colors hover:bg-cta-dark ${
              lines.length === 0 ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <ShoppingBag size={15} />
            Finalizar compra ({count})
          </Link>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-1 text-[9px] text-muted">
            <span className="border border-border rounded-tl-sm px-1.5 py-0.5">Visa</span>
            <span className="border border-border rounded-tl-sm px-1.5 py-0.5">Mastercard</span>
            <span className="border border-border rounded-tl-sm px-1.5 py-0.5">PSE</span>
            <span className="border border-border rounded-tl-sm px-1.5 py-0.5">Nequi</span>
          </div>

          {recommended.length > 0 && (
            <div className="mt-2.5 pt-2.5 border-t border-border">
              <p className="text-xs font-semibold text-ink mb-1.5">
                También te puede interesar
              </p>
              <div className="space-y-1.5">
                {recommended.map((p) => (
                  <div key={p.id} className="flex items-center gap-1.5">
                    <div className="relative w-9 h-9 rounded-tl-md overflow-hidden bg-surface-alt border border-border shrink-0">
                      <Image src={p.image} alt={p.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-ink line-clamp-1">{p.name}</p>
                      <p className="text-xs font-semibold text-ink">
                        {currency.format(p.price)}
                      </p>
                    </div>
                    <button
                      onClick={() => addItem(p.id)}
                      className="w-5 h-5 rounded-tl-sm bg-brand-soft text-brand flex items-center justify-center shrink-0 transition-colors hover:bg-brand hover:text-white"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </aside>
    </>
  );
}
