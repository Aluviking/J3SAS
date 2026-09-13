"use client";

import LeafletMap, { type MapMarker } from "@/components/maps/LeafletMap";
import { WAREHOUSE_ORIGIN, type Delivery } from "@/lib/deliveries";

export default function RouteMap({
  deliveries,
  route,
}: {
  deliveries: Delivery[];
  route?: { lat: number; lng: number }[];
}) {
  const originMarker: MapMarker = {
    id: "origin",
    lat: WAREHOUSE_ORIGIN.lat,
    lng: WAREHOUSE_ORIGIN.lng,
    label: `Bodega J3 · ${WAREHOUSE_ORIGIN.label}`,
    color: "#14161c",
    type: "origin",
  };

  const packageMarkers: MapMarker[] = deliveries
    .filter((d) => d.destination.lat && d.destination.lng)
    .map((d, i) => ({
      id: d.id,
      lat: d.destination.lat,
      lng: d.destination.lng,
      label: `${(d.sequence ?? i) + 1} · ${d.productName} — ${d.customerName}`,
      color: d.status === "entregado" ? "#16a34a" : "#ff5a1f",
      type: "package",
      number: (d.sequence ?? i) + 1,
    }));

  const driverMarker = deliveries
    .map((d) => d.locationSharing.driverLastLocation)
    .find((loc): loc is NonNullable<typeof loc> => Boolean(loc));

  const markers: MapMarker[] = [
    originMarker,
    ...packageMarkers,
    ...(driverMarker
      ? [
          {
            id: "driver",
            lat: driverMarker.lat,
            lng: driverMarker.lng,
            label: "Repartidor",
            color: "#ff5a1f",
            type: "driver" as const,
          },
        ]
      : []),
  ];

  return (
    <LeafletMap
      center={driverMarker ?? { lat: WAREHOUSE_ORIGIN.lat, lng: WAREHOUSE_ORIGIN.lng }}
      zoom={12}
      markers={markers}
      route={route}
      className="h-80"
    />
  );
}
