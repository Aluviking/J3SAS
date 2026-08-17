"use client";

import { CheckCircle2, Package, Tag, Truck, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import EmptyState from "@/components/EmptyState";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/lib/auth-context";
import { products } from "@/lib/mock-data";
import { getOrderStatus, getOrdersForUser, type Order } from "@/lib/orders";

const currency = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

function OrderCard({ order }: { order: Order }) {
  const status = getOrderStatus(order.date);
  return (
    <div className="bg-surface border border-border rounded-tl-2xl p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm font-semibold text-ink">Pedido {order.orderNumber}</p>
          <p className="text-xs text-muted mt-0.5">
            {new Date(order.date).toLocaleString("es-CO")}
          </p>
        </div>
        <span
          className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-tl-sm shrink-0 ${
            status === "en_camino" ? "bg-brand-soft text-brand" : "bg-surface-alt text-ink"
          }`}
        >
          {status === "en_camino" ? <Truck size={12} /> : <CheckCircle2 size={12} />}
          {status === "en_camino" ? "En camino" : "Entregado"}
        </span>
      </div>

      <div className="mt-3 space-y-2">
        {order.lines.map((line, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className="relative w-10 h-10 rounded-tl-sm overflow-hidden bg-surface-alt border border-border shrink-0">
              <Image src={line.image} alt={line.name} fill className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-ink line-clamp-1">{line.name}</p>
              <p className="text-[11px] text-muted">
                {line.size ? `Talla ${line.size} · ` : ""}
                {line.qty} {line.qty === 1 ? "unidad" : "unidades"}
              </p>
            </div>
            <p className="text-xs font-medium text-ink shrink-0">
              {currency.format(line.price * line.qty)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted">Total</span>
        <span className="text-sm font-semibold text-ink">{currency.format(order.total)}</span>
      </div>
    </div>
  );
}

export default function PedidosPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = () => setOrders(getOrdersForUser(user.id));
    load();
    const id = setInterval(load, 3000);
    window.addEventListener("storage", load);
    return () => {
      clearInterval(id);
      window.removeEventListener("storage", load);
    };
  }, [user]);

  if (loading) return null;

  const offers = products.filter((p) => p.originalPrice).slice(0, 4);

  const header = (
    <div className="text-sm text-muted mb-3">
      <Link href="/" className="hover:text-ink">
        Inicio
      </Link>{" "}
      / <span className="text-ink">Mis pedidos</span>
    </div>
  );

  if (!user) {
    return (
      <div className="px-4 lg:px-8 py-5">
        {header}
        <h1 className="text-xl font-semibold text-ink">Mis pedidos</h1>
        <p className="mt-1 text-sm text-muted">Consulta el estado de tus compras.</p>

        <div className="mt-6 flex flex-col items-center justify-center text-center bg-surface border border-border rounded-tl-2xl py-16 px-6">
          <div className="w-14 h-14 rounded-tl-lg bg-surface-alt flex items-center justify-center">
            <User size={24} className="text-muted" />
          </div>
          <p className="mt-4 font-semibold text-ink">Inicia sesión para ver tus pedidos</p>
          <p className="mt-1 text-sm text-muted max-w-xs">
            Tus compras y su estado de envío quedan asociados a tu cuenta de J3SAS.
          </p>
          <Link
            href="/login"
            className="mt-5 inline-block text-sm font-semibold bg-ink text-white px-5 py-2.5 rounded-tl-md hover:bg-cta transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  const enCamino = orders.filter((o) => getOrderStatus(o.date) === "en_camino");
  const entregados = orders.filter((o) => getOrderStatus(o.date) === "entregado");

  return (
    <div className="px-4 lg:px-8 py-5">
      {header}
      <h1 className="text-xl font-semibold text-ink">Mis pedidos</h1>
      <p className="mt-1 text-sm text-muted">Consulta el estado de tus compras.</p>

      {orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Todavía no tienes pedidos"
          description="Cuando compres algo en J3SAS, el estado de tu pedido va a aparecer aquí."
          actionLabel="Ir a comprar"
          actionHref="/"
        />
      ) : (
        <div className="mt-5 space-y-8">
          {enCamino.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 font-semibold text-ink mb-3">
                <Truck size={16} className="text-brand" />
                Pedidos en camino
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {enCamino.map((o) => (
                  <OrderCard key={o.orderNumber} order={o} />
                ))}
              </div>
            </section>
          )}

          {entregados.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 font-semibold text-ink mb-3">
                <CheckCircle2 size={16} className="text-brand" />
                Compras realizadas
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {entregados.map((o) => (
                  <OrderCard key={o.orderNumber} order={o} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {offers.length > 0 && (
        <section className="mt-10 pt-6 border-t border-border">
          <h2 className="flex items-center gap-2 font-semibold text-ink mb-4">
            <Tag size={16} className="text-cta" />
            Ofertas que te pueden interesar
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {offers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
