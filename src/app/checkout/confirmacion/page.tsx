"use client";

import { CheckCircle2, Copy, Package, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { currency } from "@/lib/mock-data";

type OrderLine = {
  name: string;
  image: string;
  size?: string;
  qty: number;
  price: number;
};

type Order = {
  orderNumber: string;
  date: string;
  method: string;
  lines: OrderLine[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
};

const methodLabels: Record<string, string> = {
  tarjeta: "Tarjeta de crédito/débito",
  pse: "PSE",
  nequi: "Nequi",
};

export default function ConfirmacionPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const raw = sessionStorage.getItem("j3sas_last_order");
        if (raw) setOrder(JSON.parse(raw));
      } catch {
        sessionStorage.removeItem("j3sas_last_order");
      }
      setLoaded(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const copyOrderNumber = () => {
    if (!order) return;
    navigator.clipboard.writeText(order.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!loaded) return null;

  if (!order) {
    return (
      <div className="px-4 lg:px-8 py-16 flex flex-col items-center text-center">
        <p className="font-semibold text-ink">No encontramos un pedido reciente</p>
        <Link
          href="/"
          className="mt-5 inline-block text-sm font-semibold bg-ink text-white px-5 py-2.5 rounded-tl-md hover:bg-cta transition-colors"
        >
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-8 py-8 max-w-2xl mx-auto">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-tl-2xl bg-brand-soft flex items-center justify-center">
          <CheckCircle2 size={30} className="text-brand" />
        </div>
        <h1 className="mt-4 text-xl font-semibold text-ink">¡Gracias por tu compra!</h1>
        <p className="mt-1 text-sm text-muted">
          Tu pedido fue confirmado y ya lo estamos preparando.
        </p>

        <button
          onClick={copyOrderNumber}
          className="mt-4 inline-flex items-center gap-2 bg-surface-alt border border-border rounded-tl-md px-4 py-2 text-sm text-ink hover:border-ink transition-colors"
        >
          Pedido <span className="font-semibold">{order.orderNumber}</span>
          <Copy size={13} className="text-muted" />
          {copied && <span className="text-xs text-brand">¡Copiado!</span>}
        </button>
      </div>

      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        <div className="flex items-start gap-3 bg-surface border border-border rounded-tl-lg p-4">
          <Truck size={18} className="text-brand shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-ink">Entrega estimada</p>
            <p className="text-xs text-muted">3 a 4 días hábiles</p>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-surface border border-border rounded-tl-lg p-4">
          <Package size={18} className="text-brand shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-ink">Método de pago</p>
            <p className="text-xs text-muted">{methodLabels[order.method] ?? order.method}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-surface border border-border rounded-tl-2xl p-5">
        <p className="font-semibold text-ink mb-3">Resumen del pedido</p>
        <div className="space-y-3">
          {order.lines.map((line, i) => (
            <div key={i} className="flex gap-3">
              <div className="relative w-14 h-14 rounded-tl-md overflow-hidden bg-surface-alt border border-border shrink-0">
                <Image src={line.image} alt={line.name} fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink line-clamp-1">{line.name}</p>
                <p className="text-xs text-muted">
                  {line.size && `Talla ${line.size} · `}Cantidad {line.qty}
                </p>
              </div>
              <p className="text-sm font-semibold text-ink shrink-0">
                {currency.format(line.price * line.qty)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border space-y-1.5 text-sm">
          <div className="flex justify-between text-muted">
            <span>Subtotal</span>
            <span>{currency.format(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-accent">
            <span>Descuento</span>
            <span>-{currency.format(order.discount)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Envío</span>
            <span>{order.shipping === 0 ? "Gratis" : currency.format(order.shipping)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-ink pt-1.5 border-t border-border mt-1.5">
            <span>Total</span>
            <span>{currency.format(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Link
          href="/pedidos"
          className="flex-1 text-center text-sm font-semibold bg-ink text-white py-3 rounded-tl-md hover:bg-cta transition-colors"
        >
          Ver mis pedidos
        </Link>
        <Link
          href="/"
          className="flex-1 text-center text-sm font-semibold border border-border text-ink py-3 rounded-tl-md hover:border-ink transition-colors"
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
