// Cálculo de rutas reales (siguiendo calles) vía OSRM, el servidor de
// demostración público — gratis, sin cuenta ni token. No está pensado para
// tráfico alto de producción, pero es ideal para esta tienda.
export async function getRoute(
  points: { lat: number; lng: number }[]
): Promise<{ coords: { lat: number; lng: number }[]; distanceKm: number; durationMin: number } | null> {
  if (points.length < 2) return null;
  try {
    const coordsParam = points.map((p) => `${p.lng},${p.lat}`).join(";");
    const url = `https://router.project-osrm.org/route/v1/driving/${coordsParam}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const route = data?.routes?.[0];
    if (!route) return null;
    const coords: { lat: number; lng: number }[] = route.geometry.coordinates.map(
      ([lng, lat]: [number, number]) => ({ lat, lng })
    );
    return {
      coords,
      distanceKm: route.distance / 1000,
      durationMin: route.duration / 60,
    };
  } catch {
    return null;
  }
}
