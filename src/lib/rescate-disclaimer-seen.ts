// Recuerda, solo en memoria (se olvida al recargar la página), qué diseños de
// Rescate ya mostraron el aviso en esta sesión de navegación. Así, al cambiar
// de color entre variantes del mismo diseño (misma variantGroup) el aviso no
// vuelve a salir, pero sí sale de nuevo al entrar a un diseño distinto.
const seenDesigns = new Set<string>();

export function hasSeenRescateDisclaimer(designKey: string) {
  return seenDesigns.has(designKey);
}

export function markRescateDisclaimerSeen(designKey: string) {
  seenDesigns.add(designKey);
}
