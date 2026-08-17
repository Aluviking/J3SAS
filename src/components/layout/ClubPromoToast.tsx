"use client";

import { Crown, X } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "j3sas_club_toast_dismissed";
const SHOW_DELAY_MS = 1500;

export default function ClubPromoToast() {
  const [mounted, setMounted] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    const showId = setTimeout(() => setMounted(true), SHOW_DELAY_MS);
    return () => clearTimeout(showId);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [mounted]);

  const dismiss = () => {
    setEntered(false);
    sessionStorage.setItem(STORAGE_KEY, "1");
    setTimeout(() => setMounted(false), 200);
  };

  if (!mounted) return null;

  return (
    <div
      className={`fixed bottom-20 lg:bottom-4 left-4 z-50 w-72 max-w-[calc(100vw-2rem)] transition-all duration-300 ${
        entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="relative overflow-hidden rounded-tl-2xl bg-brand p-4 shadow-2xl">
        <button
          onClick={dismiss}
          aria-label="Cerrar"
          className="absolute top-2 right-2 w-6 h-6 rounded-tl-sm bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-colors"
        >
          <X size={13} />
        </button>
        <p className="text-sm font-semibold text-white pr-6">Únete a J3SAS Club</p>
        <p className="text-xs text-white/70 mt-1">Ofertas exclusivas y acceso anticipado.</p>
        <button
          onClick={dismiss}
          className="mt-3 text-xs font-semibold bg-white text-brand px-3 py-1.5 rounded-tl-sm hover:bg-white/90 transition-colors"
        >
          Unirme ahora
        </button>
        <Crown size={56} strokeWidth={1} className="absolute -right-3 -bottom-3 text-white/15" />
      </div>
    </div>
  );
}
