"use client";

import { CreditCard, Landmark, Plus, ShieldCheck, Smartphone, Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  addPaymentMethod,
  getPaymentMethodsForUser,
  removePaymentMethod,
  setDefaultPaymentMethod,
  type PaymentMethodType,
  type SavedPaymentMethod,
} from "@/lib/payment-methods";
import { banks, detectCardBrand, formatCardNumber, formatExpiry } from "@/lib/payment-utils";

const TYPE_ICON: Record<PaymentMethodType, typeof CreditCard> = {
  tarjeta: CreditCard,
  pse: Landmark,
  nequi: Smartphone,
};

function methodLabel(m: SavedPaymentMethod): string {
  if (m.type === "tarjeta") return `${m.brand ?? "Tarjeta"} •••• ${m.last4}`;
  if (m.type === "nequi") return `Nequi •••• ${m.nequiPhone?.slice(-4)}`;
  return `PSE · ${m.pseBank}`;
}

export default function SavedPaymentMethods({ userId }: { userId: string }) {
  const [methods, setMethods] = useState<SavedPaymentMethod[]>([]);
  const [adding, setAdding] = useState(false);
  const [type, setType] = useState<PaymentMethodType>("tarjeta");
  const [card, setCard] = useState({ number: "", name: "", expiry: "" });
  const [nequiPhone, setNequiPhone] = useState("");
  const [pseBank, setPseBank] = useState("");
  const [error, setError] = useState("");

  const load = () => setMethods(getPaymentMethodsForUser(userId));

  useEffect(() => {
    const run = () => load();
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const resetForm = () => {
    setCard({ number: "", name: "", expiry: "" });
    setNequiPhone("");
    setPseBank("");
    setError("");
    setType("tarjeta");
  };

  const handleAdd = () => {
    if (type === "tarjeta") {
      const digits = card.number.replace(/\s/g, "");
      if (digits.length < 13 || !card.name || !/^\d{2}\/\d{2}$/.test(card.expiry)) {
        setError("Completa los datos de la tarjeta.");
        return;
      }
      addPaymentMethod({
        userId,
        type: "tarjeta",
        brand: detectCardBrand(card.number) ?? "Tarjeta",
        last4: digits.slice(-4),
        holderName: card.name,
        expiry: card.expiry,
        isDefault: false,
      });
    } else if (type === "nequi") {
      if (nequiPhone.replace(/\D/g, "").length < 10) {
        setError("Ingresa un número de celular válido.");
        return;
      }
      addPaymentMethod({ userId, type: "nequi", nequiPhone, isDefault: false });
    } else {
      if (!pseBank) {
        setError("Selecciona tu banco.");
        return;
      }
      addPaymentMethod({ userId, type: "pse", pseBank, isDefault: false });
    }
    resetForm();
    setAdding(false);
    load();
  };

  return (
    <div className="mt-5 max-w-md bg-surface border border-border rounded-tl-2xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-ink">Métodos de pago guardados</h2>
          <p className="text-xs text-muted mt-0.5">Para pagar más rápido en tu próxima compra.</p>
        </div>
      </div>

      {methods.length === 0 && !adding && (
        <p className="mt-4 text-xs text-muted">Todavía no tienes métodos de pago guardados.</p>
      )}

      {methods.length > 0 && (
        <div className="mt-4 space-y-2">
          {methods.map((m) => {
            const Icon = TYPE_ICON[m.type];
            return (
              <div
                key={m.id}
                className="flex items-center gap-2.5 border border-border rounded-tl-lg p-2.5"
              >
                <div className="w-8 h-8 rounded-tl-sm bg-surface-alt flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-ink" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-ink truncate">{methodLabel(m)}</p>
                  {m.isDefault && (
                    <p className="flex items-center gap-1 text-[10px] font-semibold text-brand mt-0.5">
                      <Star size={10} className="fill-brand" />
                      Predeterminado
                    </p>
                  )}
                </div>
                {!m.isDefault && (
                  <button
                    onClick={() => {
                      setDefaultPaymentMethod(userId, m.id);
                      load();
                    }}
                    className="text-[11px] font-medium text-muted hover:text-ink shrink-0"
                  >
                    Predeterminar
                  </button>
                )}
                <button
                  onClick={() => {
                    removePaymentMethod(m.id);
                    load();
                  }}
                  aria-label="Eliminar método de pago"
                  className="text-muted hover:text-accent shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {!adding ? (
        <button
          onClick={() => setAdding(true)}
          className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
        >
          <Plus size={15} />
          Agregar método de pago
        </button>
      ) : (
        <div className="mt-4 pt-4 border-t border-border space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "tarjeta" as const, label: "Tarjeta" },
              { id: "pse" as const, label: "PSE" },
              { id: "nequi" as const, label: "Nequi" },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setType(id);
                  setError("");
                }}
                className={`py-2 rounded-tl-md border text-xs font-medium transition-colors ${
                  type === id ? "bg-ink text-white border-ink" : "bg-surface-alt text-ink border-border hover:border-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {type === "tarjeta" && (
            <div className="space-y-2">
              <input
                value={card.number}
                onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
                placeholder="Número de tarjeta"
                inputMode="numeric"
                className="w-full bg-surface-alt border border-border rounded-tl-md px-3 py-2 text-sm text-ink placeholder:text-muted outline-none"
              />
              <input
                value={card.name}
                onChange={(e) => setCard({ ...card, name: e.target.value })}
                placeholder="Nombre del titular"
                className="w-full bg-surface-alt border border-border rounded-tl-md px-3 py-2 text-sm text-ink placeholder:text-muted outline-none"
              />
              <input
                value={card.expiry}
                onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                placeholder="MM/AA"
                inputMode="numeric"
                className="w-full bg-surface-alt border border-border rounded-tl-md px-3 py-2 text-sm text-ink placeholder:text-muted outline-none"
              />
            </div>
          )}
          {type === "nequi" && (
            <input
              value={nequiPhone}
              onChange={(e) => setNequiPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="Número de celular Nequi"
              inputMode="numeric"
              className="w-full bg-surface-alt border border-border rounded-tl-md px-3 py-2 text-sm text-ink placeholder:text-muted outline-none"
            />
          )}
          {type === "pse" && (
            <select
              value={pseBank}
              onChange={(e) => setPseBank(e.target.value)}
              className="w-full bg-surface-alt border border-border rounded-tl-md px-3 py-2 text-sm text-ink outline-none"
            >
              <option value="">Selecciona tu banco</option>
              {banks.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          )}

          {error && <p className="text-xs text-accent">{error}</p>}

          <div className="flex items-center gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 bg-ink text-white text-sm font-semibold py-2 rounded-tl-md hover:bg-cta transition-colors"
            >
              Guardar método
            </button>
            <button
              onClick={() => {
                resetForm();
                setAdding(false);
              }}
              className="text-sm font-medium text-muted hover:text-ink px-3"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <p className="mt-4 flex items-center gap-1.5 text-[11px] text-muted pt-3 border-t border-border">
        <ShieldCheck size={13} />
        Nunca guardamos el número completo de tu tarjeta ni tu CVV.
      </p>
    </div>
  );
}
