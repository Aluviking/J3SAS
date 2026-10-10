"use client";

import { Rocket, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const TICKER_MESSAGES = [
  "Ropa, hogar, tecnología y más en un solo lugar",
  "Envíos a todo el país",
  "Compra por WhatsApp o en línea",
  "Pagos con Visa, Mastercard, PSE y Nequi",
];

function Ticker() {
  return (
    <span className="inline-flex items-center shrink-0">
      {TICKER_MESSAGES.map((msg, i) => (
        <span key={i} className="inline-flex items-center gap-3 px-4 text-[11px] font-bold uppercase tracking-wide text-white/90">
          {msg}
          <span className="text-cta">/</span>
        </span>
      ))}
    </span>
  );
}

export default function PromoBar() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="bg-ink">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-2.5 flex items-center gap-3">
        <Link
          href="/categorias/rescate"
          className="shrink-0 bg-cta text-white px-3 py-1.5 rounded-tl-lg text-[11px] font-black uppercase tracking-[0.18em] hover:bg-cta-dark transition-colors"
        >
          Rescate
        </Link>

        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex w-max whitespace-nowrap animate-marquee hover:[animation-play-state:paused]">
            <Ticker />
            <Ticker />
          </div>
        </div>

        <Link
          href="/proximamente"
          className="hidden md:inline-flex shrink-0 items-center gap-1.5 border border-white/25 text-white px-3.5 py-1.5 rounded-tl-lg text-[11px] font-bold uppercase tracking-wide hover:border-white hover:bg-white/10 transition-colors"
        >
          <Rocket size={13} className="shrink-0" />
          Próximamente
        </Link>

        <button
          onClick={() => setVisible(false)}
          aria-label="Cerrar aviso"
          className="shrink-0 text-white/60 hover:text-white transition-colors"
        >
          <X size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
