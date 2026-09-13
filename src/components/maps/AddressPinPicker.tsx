"use client";

import { useCallback } from "react";
import LeafletMap from "@/components/maps/LeafletMap";

const COLOMBIA_CENTER = { lat: 4.6389, lng: -74.0839 };

export default function AddressPinPicker({
  pin,
  onChange,
}: {
  pin: { lat: number; lng: number } | null;
  onChange: (pin: { lat: number; lng: number }) => void;
}) {
  const handleDragEnd = useCallback(
    (_id: string, lat: number, lng: number) => onChange({ lat, lng }),
    [onChange]
  );

  const center = pin ?? COLOMBIA_CENTER;

  return (
    <div>
      <LeafletMap
        center={center}
        zoom={pin ? 15 : 5.5}
        markers={[
          {
            id: "pin",
            lat: center.lat,
            lng: center.lng,
            draggable: true,
            color: "#ff5a1f",
            type: "destination",
          },
        ]}
        onMarkerDragEnd={handleDragEnd}
        className="h-56"
      />
      <p className="mt-1.5 text-[11px] text-muted">
        Arrastra el pin hasta el punto exacto de entrega. Esto le permite al repartidor llegar sin
        depender solo del texto de la dirección.
      </p>
    </div>
  );
}
