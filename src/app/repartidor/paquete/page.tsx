"use client";

import { AlertTriangle, ArrowLeft, CheckCircle2, Loader2, MapPinned, Navigation, PlayCircle, Send, Wrench } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import LeafletMap from "@/components/maps/LeafletMap";
import {
  appendChatMessage,
  getDeliveriesForDriver,
  getDeliveryById,
  setLocationConsent,
  updateDelivery,
  updateDriverLocation,
  WAREHOUSE_ORIGIN,
  type Delivery,
} from "@/lib/deliveries";
import { geocodeAddress } from "@/lib/geocode";
import { useRepartidorAuth } from "@/lib/repartidor-auth-context";
import { getRoute } from "@/lib/routing";

const PRESETS = [
  { key: "trafico", label: "Hay tráfico", icon: AlertTriangle },
  { key: "pinchado", label: "Estoy pinchado", icon: Wrench },
];

function PaqueteDetailContent() {
  const { repartidor, loading } = useRepartidorAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";

  const [delivery, setDelivery] = useState<Delivery | null | undefined>(undefined);
  const [message, setMessage] = useState("");
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState("");
  const [startingRoute, setStartingRoute] = useState(false);
  const [route, setRoute] = useState<{ lat: number; lng: number }[] | undefined>(undefined);
  const [routeInfo, setRouteInfo] = useState<{ distanceKm: number; durationMin: number } | undefined>(undefined);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!loading && !repartidor) router.replace("/repartidor/login");
  }, [loading, repartidor, router]);

  useEffect(() => {
    if (!id) return;
    const load = () => setDelivery(getDeliveryById(id) ?? null);
    load();
    const timer = setInterval(load, 3000);
    window.addEventListener("storage", load);
    return () => {
      clearInterval(timer);
      window.removeEventListener("storage", load);
    };
  }, [id]);

  const driverConsent = delivery?.locationSharing.driverConsent ?? false;

  useEffect(() => {
    if (!delivery || !driverConsent) return;
    if (!("geolocation" in navigator)) return;

    let lastSent = 0;
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now();
        if (now - lastSent < 10000) return;
        lastSent = now;
        updateDriverLocation(delivery.id, pos.coords.latitude, pos.coords.longitude);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delivery?.id, driverConsent]);

  const hasDestination = Boolean(delivery && (delivery.destination.lat !== 0 || delivery.destination.lng !== 0));

  useEffect(() => {
    if (!delivery || !hasDestination) return;
    if (delivery.status !== "programado" && delivery.status !== "en_ruta") return;
    let cancelled = false;
    getRoute([WAREHOUSE_ORIGIN, delivery.destination]).then((result) => {
      if (!cancelled && result) {
        setRoute(result.coords);
        setRouteInfo({ distanceKm: result.distanceKm, durationMin: result.durationMin });
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delivery?.id, delivery?.status, hasDestination]);

  if (loading || !repartidor) return null;

  if (delivery === undefined) return null;

  if (delivery === null) {
    return (
      <div className="px-4 lg:px-8 py-16 text-center">
        <p className="font-semibold text-ink">No encontramos este paquete.</p>
        <Link href="/repartidor/dashboard" className="mt-3 inline-block text-sm text-brand hover:underline">
          Volver al panel
        </Link>
      </div>
    );
  }

  const handleProgramar = async () => {
    if (!repartidor) return;
    setGeocodeError("");
    let destination = delivery.destination;

    if (!hasDestination) {
      setGeocoding(true);
      const found = await geocodeAddress(destination.addressLine);
      setGeocoding(false);
      if (!found) {
        setGeocodeError("No pudimos ubicar esta dirección en el mapa automáticamente. Puedes seguir con el texto de la dirección.");
      } else {
        destination = { ...destination, lat: found.lat, lng: found.lng };
      }
    }

    const yaAsignados = getDeliveriesForDriver(repartidor.id).filter((d) => d.sequence !== null).length;
    updateDelivery(delivery.id, {
      status: "programado",
      sequence: delivery.sequence ?? yaAsignados,
      destination,
    });
  };

  const handleArrancar = async () => {
    if (!hasDestination) return;
    setStartingRoute(true);
    const result = await getRoute([WAREHOUSE_ORIGIN, delivery.destination]);
    setStartingRoute(false);
    if (result) {
      setRoute(result.coords);
      setRouteInfo({ distanceKm: result.distanceKm, durationMin: result.durationMin });
    }
    // Al arrancar, se activa de una vez el seguimiento en vivo de ambos
    // lados — sin pedirle un clic extra ni al repartidor ni al cliente.
    updateDelivery(delivery.id, {
      status: "en_ruta",
      locationSharing: { ...delivery.locationSharing, driverConsent: true, customerConsent: true },
    });
  };

  const handleEntregado = () => {
    updateDelivery(delivery.id, { status: "entregado", deliveredAt: new Date().toISOString() });
  };

  const handlePreset = (presetKey: string, label: string) => {
    appendChatMessage(delivery.id, { from: "driver", text: label, presetKey });
  };

  const handleSend = () => {
    if (!message.trim()) return;
    appendChatMessage(delivery.id, { from: "driver", text: message.trim() });
    setMessage("");
  };

  const toggleShareLocation = () => {
    setLocationConsent(delivery.id, "driver", !driverConsent);
  };

  return (
    <div className="px-4 lg:px-8 py-5 max-w-2xl mx-auto">
      <Link href="/repartidor/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-4">
        <ArrowLeft size={15} />
        Volver al panel
      </Link>

      <div className="bg-surface border border-border rounded-tl-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14 rounded-tl-md overflow-hidden bg-surface-alt border border-border shrink-0">
            <Image src={delivery.productImage} alt={delivery.productName} fill className="object-cover" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-ink line-clamp-1">{delivery.productName}</p>
            <p className="text-xs text-muted">{delivery.qty} {delivery.qty === 1 ? "unidad" : "unidades"} · Pedido {delivery.orderNumber}</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border space-y-1">
          <p className="text-sm text-ink font-medium">{delivery.customerName}</p>
          <p className="text-sm text-muted">{delivery.customerPhone}</p>
          <p className="text-sm text-muted">{delivery.destination.addressLine}</p>
        </div>

        <div className="mt-4">
          <div>
            <LeafletMap
              center={hasDestination ? delivery.destination : WAREHOUSE_ORIGIN}
              zoom={13}
              markers={[
                {
                  id: "origin",
                  lat: WAREHOUSE_ORIGIN.lat,
                  lng: WAREHOUSE_ORIGIN.lng,
                  label: "Bodega J3",
                  color: "#14161c",
                  type: "origin",
                },
                ...(hasDestination
                  ? [
                      {
                        id: "destino",
                        lat: delivery.destination.lat,
                        lng: delivery.destination.lng,
                        label: "Destino",
                        color: "#ff5a1f",
                        type: "destination" as const,
                      },
                    ]
                  : []),
              ]}
              route={route}
              className="h-56"
            />
            {/* Debajo del mapa (no encima) para no chocar nunca con los
                controles/atribución de Leaflet en pantallas angostas */}
            {routeInfo && (delivery.status === "programado" || delivery.status === "en_ruta") && (
              <div className="mt-2 flex items-center gap-3 rounded-tl-xl bg-surface-alt px-3.5 py-2 border border-border">
                <div>
                  <p className="text-sm font-bold text-ink leading-none">
                    {routeInfo.durationMin < 1 ? "< 1" : Math.round(routeInfo.durationMin)} min
                  </p>
                  <p className="text-[10px] text-muted mt-0.5">{routeInfo.distanceKm.toFixed(1)} km</p>
                </div>
                <span className="h-7 w-px bg-border" />
                <span
                  className={`text-[11px] font-semibold px-2 py-1 rounded-tl-sm ${
                    delivery.status === "en_ruta" ? "bg-brand-soft text-brand" : "bg-surface text-ink"
                  }`}
                >
                  {delivery.status === "en_ruta" ? "En camino" : "Programado"}
                </span>
              </div>
            )}
          </div>
          {geocoding && (
            <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted">
              <Loader2 size={12} className="animate-spin" />
              Ubicando la dirección en el mapa...
            </p>
          )}
          {geocodeError && <p className="mt-1.5 text-[11px] text-accent">{geocodeError}</p>}
          {!hasDestination && !geocoding && !geocodeError && (
            <p className="mt-1.5 text-[11px] text-accent">
              Este pedido no tiene pin de ubicación — guíate por la dirección de texto.
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {delivery.status !== "programado" && delivery.status !== "en_ruta" && delivery.status !== "entregado" && (
            <button
              onClick={handleProgramar}
              disabled={geocoding}
              className="flex items-center gap-1.5 bg-ink text-white text-sm font-semibold px-4 py-2.5 rounded-tl-md hover:bg-cta transition-colors disabled:opacity-60"
            >
              {geocoding ? <Loader2 size={15} className="animate-spin" /> : <MapPinned size={15} />}
              Programar entrega
            </button>
          )}
          {delivery.status === "programado" && (
            <button
              onClick={handleArrancar}
              disabled={startingRoute}
              className="flex items-center gap-1.5 bg-brand text-white text-sm font-semibold px-4 py-2.5 rounded-tl-md hover:opacity-90 transition-colors disabled:opacity-60"
            >
              {startingRoute ? <Loader2 size={15} className="animate-spin" /> : <PlayCircle size={15} />}
              Arrancar ruta
            </button>
          )}
          {delivery.status !== "entregado" && (
            <button
              onClick={handleEntregado}
              className="flex items-center gap-1.5 bg-brand text-white text-sm font-semibold px-4 py-2.5 rounded-tl-md hover:opacity-90 transition-colors"
            >
              <CheckCircle2 size={15} />
              Marcar como entregado
            </button>
          )}
          <button
            onClick={toggleShareLocation}
            className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-tl-md border transition-colors ${
              driverConsent ? "bg-brand-soft text-brand border-brand/30" : "border-border text-ink hover:border-ink"
            }`}
          >
            <Navigation size={15} />
            {driverConsent ? "Compartiendo mi ubicación" : "Compartir mi ubicación"}
          </button>
        </div>

        <div className="mt-5 pt-4 border-t border-border">
          <p className="text-sm font-semibold text-ink mb-2">Comentarios para el cliente</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {PRESETS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => handlePreset(key, label)}
                className="flex items-center gap-1.5 text-xs font-medium border border-border rounded-tl-md px-3 py-1.5 hover:border-ink transition-colors"
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1 mb-3">
            {delivery.chat.length === 0 ? (
              <p className="text-xs text-muted">Todavía no hay mensajes.</p>
            ) : (
              delivery.chat.map((m) => (
                <div
                  key={m.id}
                  className={`text-xs rounded-tl-md px-3 py-2 max-w-[80%] ${
                    m.from === "driver" ? "bg-ink text-white ml-auto" : "bg-surface-alt text-ink"
                  }`}
                >
                  {m.text}
                </div>
              ))
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Escribe un comentario..."
              className="flex-1 bg-surface-alt border border-border rounded-tl-md px-3 py-2 text-sm text-ink placeholder:text-muted outline-none"
            />
            <button
              onClick={handleSend}
              aria-label="Enviar"
              className="w-9 h-9 shrink-0 rounded-tl-md bg-ink text-white flex items-center justify-center hover:bg-cta transition-colors"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaqueteDetailPage() {
  return (
    <Suspense fallback={null}>
      <PaqueteDetailContent />
    </Suspense>
  );
}
