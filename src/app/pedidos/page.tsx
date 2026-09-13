"use client";

import { CheckCircle2, ChevronDown, MapPin, Package, Send, Tag, Truck, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import EmptyState from "@/components/EmptyState";
import LeafletMap from "@/components/maps/LeafletMap";
import ProductCard from "@/components/ProductCard";
import { useAuth } from "@/lib/auth-context";
import {
  appendChatMessage,
  getDeliveriesForCustomer,
  setLocationConsent,
  WAREHOUSE_ORIGIN,
  type Delivery,
} from "@/lib/deliveries";
import { currency, getOnSaleProducts } from "@/lib/mock-data";
import { getOrderStatus, getOrdersForUser, type Order } from "@/lib/orders";
import { getRoute } from "@/lib/routing";

const DELIVERY_STATUS_LABEL: Record<Delivery["status"], string> = {
  pendiente_programar: "Preparando envío",
  programado: "Preparando envío",
  en_ruta: "En camino",
  entregado: "Entregado",
  no_entregado: "No se pudo entregar",
};

function DeliveryTracking({ delivery }: { delivery: Delivery }) {
  const [message, setMessage] = useState("");
  const [route, setRoute] = useState<{ lat: number; lng: number }[] | undefined>(undefined);
  const [routeInfo, setRouteInfo] = useState<{ distanceKm: number; durationMin: number } | undefined>(undefined);
  const customerConsent = delivery.locationSharing.customerConsent;
  const driverConsent = delivery.locationSharing.driverConsent;
  const canTrack = customerConsent && driverConsent && delivery.locationSharing.driverLastLocation;
  const hasDestination = Boolean(delivery.destination.lat || delivery.destination.lng);

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (delivery.status !== "en_ruta" || !hasDestination) {
        setRoute(undefined);
        return;
      }
      const origin = canTrack ? delivery.locationSharing.driverLastLocation! : WAREHOUSE_ORIGIN;
      getRoute([origin, delivery.destination]).then((result) => {
        if (!cancelled && result) {
          setRoute(result.coords);
          setRouteInfo({ distanceKm: result.distanceKm, durationMin: result.durationMin });
        }
      });
    };
    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delivery.status, hasDestination, canTrack, delivery.locationSharing.driverLastLocation?.updatedAt]);

  const handleSend = () => {
    if (!message.trim()) return;
    appendChatMessage(delivery.id, { from: "customer", text: message.trim() });
    setMessage("");
  };

  return (
    <div className="mt-3 pt-3 border-t border-border">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative w-9 h-9 rounded-tl-sm overflow-hidden bg-surface-alt border border-border shrink-0">
            <Image src={delivery.productImage} alt={delivery.productName} fill className="object-cover" />
          </div>
          <p className="text-xs text-ink line-clamp-1">{delivery.productName}</p>
        </div>
        <span
          className={`text-[11px] font-semibold px-2 py-1 rounded-tl-sm shrink-0 ${
            delivery.status === "entregado" ? "bg-surface-alt text-ink" : "bg-brand-soft text-brand"
          }`}
        >
          {DELIVERY_STATUS_LABEL[delivery.status]}
        </span>
      </div>

      {delivery.status !== "entregado" && delivery.status !== "pendiente_programar" && (
        <div className="mt-2.5">
          {delivery.status === "en_ruta" && hasDestination && (
            <div className="relative">
              <LeafletMap
                center={canTrack ? delivery.locationSharing.driverLastLocation! : delivery.destination}
                zoom={13}
                markers={[
                  ...(canTrack
                    ? [
                        {
                          id: "driver",
                          lat: delivery.locationSharing.driverLastLocation!.lat,
                          lng: delivery.locationSharing.driverLastLocation!.lng,
                          label: "Repartidor",
                          color: "#ff5a1f",
                          type: "driver" as const,
                        },
                      ]
                    : []),
                  {
                    id: "destino",
                    lat: delivery.destination.lat,
                    lng: delivery.destination.lng,
                    label: "Tu dirección",
                    color: "#1b2a4a",
                    type: "destination" as const,
                  },
                ]}
                route={route}
                className="h-48"
              />
              {routeInfo && canTrack && (
                <div className="absolute left-2.5 bottom-2.5 z-[400] flex items-center gap-2 rounded-tl-lg bg-white/95 backdrop-blur px-3 py-1.5 shadow-lg border border-border">
                  <p className="text-xs font-bold text-ink leading-none">
                    Llega en {routeInfo.durationMin < 1 ? "< 1" : Math.round(routeInfo.durationMin)} min
                  </p>
                  <span className="h-4 w-px bg-border" />
                  <p className="text-[10px] text-muted leading-none">{routeInfo.distanceKm.toFixed(1)} km</p>
                </div>
              )}
            </div>
          )}
          {!customerConsent ? (
            <button
              onClick={() => setLocationConsent(delivery.id, "customer", true)}
              className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
            >
              <MapPin size={13} />
              Activar seguimiento en vivo
            </button>
          ) : (
            !canTrack && (
              <p className="mt-2 text-xs text-muted">
                Esperando a que el repartidor active su ubicación para mostrar su posición en vivo.
              </p>
            )
          )}
        </div>
      )}

      <div className="mt-2.5 space-y-1.5 max-h-32 overflow-y-auto pr-1">
        {delivery.chat.map((m) => (
          <div
            key={m.id}
            className={`text-xs rounded-tl-md px-2.5 py-1.5 max-w-[85%] ${
              m.from === "customer" ? "bg-ink text-white ml-auto" : "bg-surface-alt text-ink"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      {delivery.status !== "entregado" && (
        <div className="mt-1.5 flex items-center gap-1.5">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Escríbele al repartidor..."
            className="flex-1 bg-surface-alt border border-border rounded-tl-md px-2.5 py-1.5 text-xs text-ink placeholder:text-muted outline-none"
          />
          <button
            onClick={handleSend}
            aria-label="Enviar"
            className="w-7 h-7 shrink-0 rounded-tl-md bg-ink text-white flex items-center justify-center hover:bg-cta transition-colors"
          >
            <Send size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, deliveries }: { order: Order; deliveries: Delivery[] }) {
  const [expanded, setExpanded] = useState(false);
  const hasDeliveries = deliveries.length > 0;
  const status = hasDeliveries
    ? deliveries.every((d) => d.status === "entregado")
      ? "entregado"
      : "en_camino"
    : getOrderStatus(order.date);

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

      {hasDeliveries && (
        <>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-ink hover:text-brand transition-colors"
          >
            {expanded ? "Ocultar seguimiento" : "Ver seguimiento del envío"}
            <ChevronDown size={14} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
          {expanded && deliveries.map((d) => <DeliveryTracking key={d.id} delivery={d} />)}
        </>
      )}
    </div>
  );
}

export default function PedidosPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = () => {
      setOrders(getOrdersForUser(user.id));
      setDeliveries(getDeliveriesForCustomer(user.id));
    };
    load();
    const id = setInterval(load, 3000);
    window.addEventListener("storage", load);
    return () => {
      clearInterval(id);
      window.removeEventListener("storage", load);
    };
  }, [user]);

  if (loading) return null;

  const offers = getOnSaleProducts(4);

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

  const deliveriesFor = (order: Order) => deliveries.filter((d) => d.orderNumber === order.orderNumber);
  const statusFor = (order: Order) => {
    const ds = deliveriesFor(order);
    if (ds.length === 0) return getOrderStatus(order.date);
    return ds.every((d) => d.status === "entregado") ? "entregado" : "en_camino";
  };

  const enCamino = orders.filter((o) => statusFor(o) === "en_camino");
  const entregados = orders.filter((o) => statusFor(o) === "entregado");

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
                  <OrderCard key={o.orderNumber} order={o} deliveries={deliveriesFor(o)} />
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
                  <OrderCard key={o.orderNumber} order={o} deliveries={deliveriesFor(o)} />
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
