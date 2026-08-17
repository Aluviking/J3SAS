"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

function Message() {
  return (
    <span className="inline-flex items-center gap-1.5 px-8 shrink-0">
      <span className="font-semibold uppercase tracking-wide">Nuevos productos</span>
      <Link
        href="/categorias/busos"
        className="rounded-tl-sm bg-cta px-2 py-0.5 font-semibold hover:bg-cta-dark transition-colors"
      >
        Busos
      </Link>
      <Link
        href="/categorias/polos"
        className="rounded-tl-sm bg-cta px-2 py-0.5 font-semibold hover:bg-cta-dark transition-colors"
      >
        Polos
      </Link>
    </span>
  );
}

export default function PromoBar() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="relative overflow-hidden bg-ink text-white text-xs py-1">
      <div className="flex w-max whitespace-nowrap animate-marquee hover:[animation-play-state:paused]">
        <Message />
        <Message />
      </div>
      <button
        onClick={() => setVisible(false)}
        aria-label="Cerrar aviso"
        className="absolute top-1/2 -translate-y-1/2 right-3 sm:right-5 w-5 h-5 rounded-tl-sm flex items-center justify-center bg-white/10 hover:bg-white/20 z-10"
      >
        <X size={13} />
      </button>
    </div>
  );
}
