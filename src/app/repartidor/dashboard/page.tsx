"use client";

import { CheckCircle2, ChevronRight, LogOut, Map, Package, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getDeliveriesForDriver, seedDemoDeliveries, type Delivery, type DeliveryStatus } from "@/lib/deliveries";
import { useRepartidorAuth } from "@/lib/repartidor-auth-context";

const STATUS_LABEL: Record<DeliveryStatus, string> = {
  pendiente_programar: "Por programar",
  programado: "Programado",
  en_ruta: "En ruta",
  entregado: "Entregado",
  no_entregado: "No entregado",
};

const STATUS_STYLE: Record<DeliveryStatus, string> = {
  pendiente_programar: "bg-accent-soft text-accent",
  programado: "bg-brand-soft text-brand",
  en_ruta: "bg-brand-soft text-brand",
  entregado: "bg-surface-alt text-ink",
  no_entregado: "bg-accent-soft text-accent",
};

function DeliveryRow({ delivery }: { delivery: Delivery }) {
  return (
    <Link
      href={`/repartidor/paquete?id=${delivery.id}`}
      className="flex items-center gap-3 border border-border rounded-tl-lg p-3 hover:border-ink transition-colors"
    >
      <div className="relative w-11 h-11 rounded-tl-md overflow-hidden bg-surface-alt border border-border shrink-0">
        <Image src={delivery.productImage} alt={delivery.productName} fill className="object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-ink line-clamp-1">{delivery.productName}</p>
        <p className="text-[11px] text-muted line-clamp-1">
          {delivery.customerName} · {delivery.destination.addressLine}
        </p>
      </div>
      <span className={`text-[11px] font-semibold px-2 py-1 rounded-tl-sm shrink-0 ${STATUS_STYLE[delivery.status]}`}>
        {STATUS_LABEL[delivery.status]}
      </span>
      <ChevronRight size={16} className="text-muted shrink-0" />
    </Link>
  );
}

export default function RepartidorDashboardPage() {
  const { repartidor, loading, logout } = useRepartidorAuth();
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);

  useEffect(() => {
    if (!loading && !repartidor) router.replace("/repartidor/login");
  }, [loading, repartidor, router]);

  useEffect(() => {
    if (!repartidor) return;
    seedDemoDeliveries();
    const load = () => setDeliveries(getDeliveriesForDriver(repartidor.id));
    load();
    const id = setInterval(load, 3000);
    window.addEventListener("storage", load);
    return () => {
      clearInterval(id);
      window.removeEventListener("storage", load);
    };
  }, [repartidor]);

  if (loading || !repartidor) return null;

  const porEntregar = deliveries.filter((d) => d.status !== "entregado" && d.status !== "no_entregado");
  const entregados = deliveries.filter((d) => d.status === "entregado" || d.status === "no_entregado");

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="flex items-center justify-between border-b border-border bg-white px-4 sm:px-8 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 shrink-0 rounded-tl-lg bg-surface-alt flex items-center justify-center">
            <Truck size={17} className="text-ink" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink leading-tight">Portal de repartidores</p>
            <p className="text-[11px] text-muted leading-tight">{repartidor.name}</p>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            router.push("/repartidor/login");
          }}
          className="flex items-center gap-1.5 text-sm font-medium text-ink hover:text-accent"
        >
          <LogOut size={15} />
          Cerrar sesión
        </button>
      </header>

      <main className="px-4 sm:px-8 py-6 max-w-3xl mx-auto space-y-6">
        <Link
          href="/repartidor/mapa"
          className="flex items-center justify-between gap-3 rounded-tl-2xl bg-ink text-white px-5 py-4 hover:bg-ink/90 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Map size={20} />
            <div>
              <p className="text-sm font-semibold">Ver mi ruta en el mapa</p>
              <p className="text-xs text-white/70">Todos tus paquetes programados, en un solo mapa</p>
            </div>
          </div>
          <ChevronRight size={18} />
        </Link>

        <section>
          <h2 className="flex items-center gap-2 font-semibold text-ink mb-3">
            <Package size={16} className="text-brand" />
            Paquetes pagados por entregar
          </h2>
          {porEntregar.length === 0 ? (
            <p className="text-sm text-muted">No tienes paquetes pendientes por ahora.</p>
          ) : (
            <div className="space-y-2">
              {porEntregar.map((d) => (
                <DeliveryRow key={d.id} delivery={d} />
              ))}
            </div>
          )}
        </section>

        {entregados.length > 0 && (
          <section>
            <h2 className="flex items-center gap-2 font-semibold text-ink mb-3">
              <CheckCircle2 size={16} className="text-brand" />
              Entregas completadas
            </h2>
            <div className="space-y-2">
              {entregados.map((d) => (
                <DeliveryRow key={d.id} delivery={d} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
