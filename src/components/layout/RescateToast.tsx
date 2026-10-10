"use client";

import { Flame, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { currency, products } from "@/lib/mock-data";

const FIRST_SHOW_DELAY_MS = 30000;
const INTERVAL_MS = 30000;

const rescateProducts = products.filter((p) => p.category === "Rescate");

export default function RescateToast() {
  const [mounted, setMounted] = useState(false);
  const [entered, setEntered] = useState(false);
  const [index, setIndex] = useState(0);

  // A propósito sin "recordar" el cierre: debe seguir saliendo cada 10s
  // aunque el usuario haya cerrado la anterior con la X.
  useEffect(() => {
    if (rescateProducts.length === 0) return;

    const showNext = () => {
      setIndex((i) => (i + 1) % rescateProducts.length);
      setMounted(true);
      requestAnimationFrame(() => setEntered(true));
    };

    const first = setTimeout(showNext, FIRST_SHOW_DELAY_MS);
    const interval = setInterval(showNext, INTERVAL_MS);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, []);

  const dismiss = () => {
    setEntered(false);
    setTimeout(() => setMounted(false), 200);
  };

  if (!mounted || rescateProducts.length === 0) return null;
  const product = rescateProducts[index];
  const discount = product.originalPrice
    ? Math.round(100 - (product.price / product.originalPrice) * 100)
    : null;

  return (
    <div
      className={`fixed inset-0 z-[60] flex flex-col items-center justify-center gap-5 px-4 transition-opacity duration-300 ${
        entered ? "opacity-100" : "opacity-0"
      }`}
    >
      <div onClick={dismiss} className="absolute inset-0 bg-ink/70 backdrop-blur-sm" />

      {/* Tarjeta tipo boleta de tren: foto arriba, franja de info, costura
          perforada con muescas a los lados, y talón abajo con el botón. */}
      <div
        className={`relative w-full max-w-[220px] transition-all duration-300 ${
          entered ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
      >
        <div className="rounded-2xl overflow-hidden shadow-2xl bg-ink">
          <Link href={`/producto/${product.id}`} className="relative aspect-[4/5] block">
            <Image src={product.image} alt={product.name} fill className="object-cover" sizes="220px" />
          </Link>

          <div className="px-3.5 pt-3 pb-3.5">
            <span className="inline-flex items-center gap-1 w-fit bg-cta text-white text-[9px] font-black uppercase tracking-[0.15em] px-2 py-1 rounded-tl-md">
              <Flame size={10} className="shrink-0" />
              Rescata esta prenda
            </span>

            <Link
              href={`/producto/${product.id}`}
              className="mt-1.5 block text-sm font-black text-white leading-snug line-clamp-2 hover:underline"
            >
              {product.name}
            </Link>

            <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
              <span className="text-lg font-black text-white">{currency.format(product.price)}</span>
              {discount && <span className="text-xs font-bold text-cta">-{discount}%</span>}
              {product.originalPrice && (
                <span className="text-xs text-white/50 line-through">
                  {currency.format(product.originalPrice)}
                </span>
              )}
            </div>
          </div>

          {/* costura perforada: muescas "transparentes" — mismo tratamiento que
              el fondo difuminado del modal, para que parezca un hueco real en
              vez de un círculo de color sólido */}
          <div className="relative h-0">
            <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-ink/70 backdrop-blur-sm" />
            <div className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-ink/70 backdrop-blur-sm" />
            <div className="absolute inset-x-5 top-0 border-t-2 border-dashed border-white/40" />
          </div>

          <div className="px-3.5 py-3">
            <Link
              href={`/producto/${product.id}`}
              className="flex items-center justify-center w-full bg-cta text-white text-xs font-bold uppercase tracking-wide py-2.5 rounded-tl-lg hover:bg-cta-dark transition-colors"
            >
              Rescatarla ahora
            </Link>
          </div>
        </div>
      </div>

      <button
        onClick={dismiss}
        aria-label="Cerrar"
        className="relative w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
      >
        <X size={20} />
      </button>
    </div>
  );
}
