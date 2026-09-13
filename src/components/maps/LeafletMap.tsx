"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";

export type MapMarkerType = "origin" | "destination" | "driver" | "package" | "pin";

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  color?: string;
  draggable?: boolean;
  type?: MapMarkerType;
  number?: number;
};

// Insignia cuadrada redondeada (squircle) con ícono blanco encima — el
// mismo lenguaje visual para todos los pines, estilo apps de mapas modernas.
function squareBadge(bg: string, iconSvg: string, size = 38, radius = 13): string {
  return `
    <div class="j3-map-pin" style="width:${size}px;height:${size}px;border-radius:${radius}px;background:${bg};display:flex;align-items:center;justify-content:center;">
      ${iconSvg}
    </div>`;
}

function buildIconHtml(marker: MapMarker): { html: string; size: [number, number]; anchor: [number, number] } {
  const color = marker.color ?? "#ff5a1f";
  const type = marker.type ?? "pin";

  if (type === "driver") {
    return {
      size: [46, 46],
      anchor: [23, 23],
      html: `
        <div style="position:relative;width:46px;height:46px;display:flex;align-items:center;justify-content:center;">
          <div class="j3-driver-glow"></div>
          <div class="j3-driver-pulse"></div>
          <div style="position:relative;width:16px;height:16px;border-radius:9999px;background:#2563eb;border:3px solid white;box-shadow:0 2px 6px rgba(37,99,235,0.5);"></div>
        </div>`,
    };
  }

  if (type === "origin") {
    return {
      size: [38, 38],
      anchor: [19, 19],
      html: squareBadge(
        "#6366f1",
        `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>`
      ),
    };
  }

  if (type === "package") {
    return {
      size: [36, 36],
      anchor: [18, 18],
      html: squareBadge(
        color,
        `<span style="color:white;font-size:13px;font-weight:700;font-family:var(--font-sans,sans-serif);">${marker.number ?? ""}</span>`,
        36,
        12
      ),
    };
  }

  if (type === "destination") {
    return {
      size: [38, 38],
      anchor: [19, 19],
      html: squareBadge(
        "#f43f5e",
        `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9.5 12 3l9 6.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>
        </svg>`
      ),
    };
  }

  // "pin" genérico (checkout / marcador simple)
  return {
    size: [36, 36],
    anchor: [18, 18],
    html: squareBadge(
      color,
      `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s7-7.58 7-12.5A7 7 0 0 0 5 9.5C5 14.42 12 22 12 22Z"/><circle cx="12" cy="9.5" r="2.3"/>
      </svg>`,
      34,
      12
    ),
  };
}

export default function LeafletMap({
  markers,
  center,
  zoom = 13,
  onMarkerDragEnd,
  route,
  className = "h-64",
}: {
  markers: MapMarker[];
  center: { lat: number; lng: number };
  zoom?: number;
  onMarkerDragEnd?: (id: string, lat: number, lng: number) => void;
  route?: { lat: number; lng: number }[];
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markersRef = useRef<Record<string, import("leaflet").Marker>>({});
  const routeRef = useRef<import("leaflet").Polyline | null>(null);
  const routeOutlineRef = useRef<import("leaflet").Polyline | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return;
      const map = L.map(containerRef.current, { zoomControl: true, attributionControl: true }).setView(
        [center.lat, center.lng],
        zoom
      );
      // Tiles del Humanitarian OpenStreetMap Team: gratis, sin cuenta ni
      // clave, y con una paleta de colores más limpia/moderna que el estilo
      // por defecto de OpenStreetMap (más parecido al look de apps tipo Rappi/Uber).
      L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, tiles by <a href="https://www.hotosm.org">HOT</a>',
        maxZoom: 19,
        subdomains: "abc",
      }).addTo(map);
      mapRef.current = map;
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
    // Solo se monta una vez el mapa; center/zoom iniciales bastan como punto
    // de partida — los marcadores se sincronizan aparte en el efecto de abajo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;

    import("leaflet").then((L) => {
      const map = mapRef.current;
      if (cancelled || !map) return;

      const currentIds = new Set(markers.map((m) => m.id));
      Object.keys(markersRef.current).forEach((id) => {
        if (!currentIds.has(id)) {
          markersRef.current[id].remove();
          delete markersRef.current[id];
        }
      });

      markers.forEach((m) => {
        const { html, size, anchor } = buildIconHtml(m);
        const icon = L.divIcon({ className: "", html, iconSize: size, iconAnchor: anchor });

        const existing = markersRef.current[m.id];
        if (existing) {
          existing.setLatLng([m.lat, m.lng]);
          existing.setIcon(icon);
          return;
        }
        const marker = L.marker([m.lat, m.lng], { icon, draggable: m.draggable ?? false }).addTo(map);
        if (m.label) marker.bindPopup(m.label);
        if (m.draggable && onMarkerDragEnd) {
          marker.on("dragend", () => {
            const pos = marker.getLatLng();
            onMarkerDragEnd(m.id, pos.lat, pos.lng);
          });
        }
        markersRef.current[m.id] = marker;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [markers, onMarkerDragEnd]);

  useEffect(() => {
    let cancelled = false;

    import("leaflet").then((L) => {
      const map = mapRef.current;
      if (cancelled || !map) return;

      routeRef.current?.remove();
      routeRef.current = null;
      routeOutlineRef.current?.remove();
      routeOutlineRef.current = null;

      if (route && route.length > 1) {
        const latlngs = route.map((p) => [p.lat, p.lng]) as [number, number][];
        // Doble trazo (blanco grueso debajo + color encima) para que la
        // línea resalte bien sobre el mapa a color, como en apps tipo Rappi.
        routeOutlineRef.current = L.polyline(latlngs, { color: "#ffffff", weight: 7, opacity: 0.9 }).addTo(map);
        routeRef.current = L.polyline(latlngs, { color: "#ff5a1f", weight: 4, opacity: 0.95 }).addTo(map);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [route]);

  return (
    <div
      ref={containerRef}
      className={`${className} rounded-tl-2xl overflow-hidden shadow-[0_4px_20px_rgba(20,22,28,0.12)]`}
    />
  );
}
