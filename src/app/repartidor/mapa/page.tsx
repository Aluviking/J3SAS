"use client";

import { ArrowLeft, CheckCircle2, GripVertical, Loader2, PlayCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import RouteMap from "@/components/maps/RouteMap";
import {
  getDeliveriesForDriver,
  setDeliverySequence,
  updateDelivery,
  updateDriverLocation,
  WAREHOUSE_ORIGIN,
  type Delivery,
} from "@/lib/deliveries";
import { useRepartidorAuth } from "@/lib/repartidor-auth-context";
import { getRoute } from "@/lib/routing";

export default function RepartidorMapaPage() {
  const { repartidor, loading } = useRepartidorAuth();
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [route, setRoute] = useState<{ lat: number; lng: number }[] | undefined>(undefined);
  const [routeInfo, setRouteInfo] = useState<{ distanceKm: number; durationMin: number } | undefined>(undefined);
  const [startingRoute, setStartingRoute] = useState(false);
  const dragIndex = useRef<number | null>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!loading && !repartidor) router.replace("/repartidor/login");
  }, [loading, repartidor, router]);

  useEffect(() => {
    if (!repartidor) return;
    const load = () => setDeliveries(getDeliveriesForDriver(repartidor.id));
    load();
    const id = setInterval(load, 3000);
    window.addEventListener("storage", load);
    return () => {
      clearInterval(id);
      window.removeEventListener("storage", load);
    };
  }, [repartidor]);

  const activas = deliveries.filter((d) => d.status === "programado" || d.status === "en_ruta");
  const conDestino = activas.filter((d) => d.destination.lat && d.destination.lng);
  const enRuta = activas.some((d) => d.status === "en_ruta");

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (conDestino.length === 0) {
        setRoute(undefined);
        return;
      }
      if (!enRuta) return; // la ruta se dibuja automáticamente una vez arrancada
      getRoute([WAREHOUSE_ORIGIN, ...conDestino.map((d) => d.destination)]).then((result) => {
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
  }, [enRuta, conDestino.map((d) => d.id).join(",")]);

  useEffect(() => {
    if (!enRuta || !repartidor) return;
    if (!("geolocation" in navigator)) return;

    let lastSent = 0;
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now();
        if (now - lastSent < 10000) return;
        lastSent = now;
        const activeIds = getDeliveriesForDriver(repartidor.id)
          .filter((d) => d.status === "en_ruta")
          .map((d) => d.id);
        activeIds.forEach((id) => updateDriverLocation(id, pos.coords.latitude, pos.coords.longitude));
      },
      () => {
        // ubicación no disponible/permiso denegado — se sigue sin posición en vivo
      },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    };
  }, [enRuta, repartidor]);

  if (loading || !repartidor) return null;

  const handleArrancar = async () => {
    if (conDestino.length === 0 || !repartidor) return;
    setStartingRoute(true);
    const result = await getRoute([WAREHOUSE_ORIGIN, ...conDestino.map((d) => d.destination)]);
    setStartingRoute(false);
    if (result) {
      setRoute(result.coords);
      setRouteInfo({ distanceKm: result.distanceKm, durationMin: result.durationMin });
    }
    // Al arrancar, se activa de una vez el seguimiento en vivo de ambos
    // lados — sin pedirle un clic extra ni al repartidor ni al cliente.
    conDestino.forEach((d) =>
      updateDelivery(d.id, {
        status: "en_ruta",
        locationSharing: { ...d.locationSharing, driverConsent: true, customerConsent: true },
      })
    );
  };

  const handleDrop = (dropIndex: number) => {
    if (dragIndex.current === null || dragIndex.current === dropIndex) return;
    const reordered = [...activas];
    const [moved] = reordered.splice(dragIndex.current, 1);
    reordered.splice(dropIndex, 0, moved);
    dragIndex.current = null;
    setDeliverySequence(repartidor.id, reordered.map((d) => d.id));
  };

  const handleEntregado = (id: string) => {
    updateDelivery(id, { status: "entregado", deliveredAt: new Date().toISOString() });
  };

  return (
    <div className="px-4 lg:px-8 py-5 max-w-4xl mx-auto">
      <Link href="/repartidor/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-4">
        <ArrowLeft size={15} />
        Volver al panel
      </Link>

      <div className="flex items-center justify-between gap-3 flex-wrap mb-1">
        <h1 className="text-xl font-semibold text-ink">Mi ruta de entrega</h1>
        {conDestino.length > 0 && !enRuta && (
          <button
            onClick={handleArrancar}
            disabled={startingRoute}
            className="flex items-center gap-1.5 bg-brand text-white text-sm font-semibold px-4 py-2 rounded-tl-md hover:opacity-90 transition-colors disabled:opacity-60"
          >
            {startingRoute ? <Loader2 size={15} className="animate-spin" /> : <PlayCircle size={15} />}
            Arrancar ruta
          </button>
        )}
      </div>
      <p className="text-sm text-muted mb-4">
        Arrastra los paquetes para organizar tu ruta de forma eficiente, sin ir de un lado a otro de la ciudad.
      </p>

      <div>
        <RouteMap deliveries={activas} route={route} />
        {/* Debajo del mapa (no encima) para no chocar nunca con los
            controles/atribución de Leaflet en pantallas angostas */}
        {routeInfo && enRuta && (
          <div className="mt-2 flex items-center gap-3 rounded-tl-xl bg-surface-alt px-3.5 py-2 border border-border">
            <div>
              <p className="text-sm font-bold text-ink leading-none">
                {routeInfo.durationMin < 1 ? "< 1" : Math.round(routeInfo.durationMin)} min
              </p>
              <p className="text-[10px] text-muted mt-0.5">{routeInfo.distanceKm.toFixed(1)} km en total</p>
            </div>
            <span className="h-7 w-px bg-border" />
            <span className="text-[11px] font-semibold px-2 py-1 rounded-tl-sm bg-brand-soft text-brand">
              {conDestino.length} {conDestino.length === 1 ? "parada" : "paradas"}
            </span>
          </div>
        )}
      </div>

      {activas.length === 0 ? (
        <p className="mt-4 text-sm text-muted">No tienes paquetes programados todavía.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {activas.map((d, i) => (
            <div
              key={d.id}
              draggable
              onDragStart={() => (dragIndex.current = i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(i)}
              className="flex items-center gap-3 border border-border rounded-tl-lg p-3 bg-surface cursor-grab active:cursor-grabbing"
            >
              <GripVertical size={16} className="text-muted shrink-0" />
              <span className="w-6 h-6 shrink-0 rounded-full bg-ink text-white text-xs font-semibold flex items-center justify-center">
                {i + 1}
              </span>
              <div className="relative w-10 h-10 rounded-tl-md overflow-hidden bg-surface-alt border border-border shrink-0">
                <Image src={d.productImage} alt={d.productName} fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink line-clamp-1">{d.productName}</p>
                <p className="text-[11px] text-muted line-clamp-1">
                  {d.customerName} · {d.destination.addressLine}
                </p>
              </div>
              <button
                onClick={() => handleEntregado(d.id)}
                className="flex items-center gap-1 text-xs font-semibold text-brand hover:underline shrink-0"
              >
                <CheckCircle2 size={14} />
                Entregado
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
