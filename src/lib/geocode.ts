// Geocodificación gratuita vía Nominatim (OpenStreetMap) — sin cuenta ni
// token. Es un servicio comunitario con límite de uso razonable (pensado
// para consultas puntuales como esta, no para volumen alto), por eso solo
// se llama una vez por paquete, al programar la entrega.
export async function geocodeAddress(query: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=co&q=${encodeURIComponent(
      query
    )}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const data = (await res.json()) as { lat: string; lon: string }[];
    if (!data.length) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}
