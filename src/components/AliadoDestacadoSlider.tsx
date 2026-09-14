"use client";

import { Boxes, ChevronLeft, ChevronRight, PackageSearch, ShoppingCart, Star } from "lucide-react";
import { useEffect, useState } from "react";

const ALIADOS = ["RAMTEK", "Casa Moreno", "Vitoria", "Iluminación", "Rosa Negra", "911", "Rubik Coffee"];
const AUTO_MS = 4500;

export default function AliadoDestacadoSlider({ ctaHref }: { ctaHref: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % ALIADOS.length), AUTO_MS);
    return () => clearInterval(id);
  }, []);

  const go = (i: number) => setIndex(((i % ALIADOS.length) + ALIADOS.length) % ALIADOS.length);

  return (
    <div className="relative overflow-hidden rounded-tl-3xl bg-gradient-to-br from-cta to-orange-700 p-5 sm:p-9 flex flex-col justify-center min-h-[260px] sm:min-h-[360px]">
      <div className="absolute -bottom-14 -left-10 w-56 h-56 rounded-full bg-ink/15 blur-3xl" />
      {/* Franjas diagonales — guiño gráfico a las camisetas J3 */}
      <div className="absolute -right-10 -top-16 w-36 h-36 bg-ink/90 rotate-45" />
      <div className="absolute -right-24 -top-4 w-36 h-36 bg-white/10 rotate-45" />
      <Boxes size={110} strokeWidth={0.7} className="absolute -right-6 -bottom-6 text-white/15 sm:w-[170px] sm:h-[170px]" />
      <ShoppingCart size={56} strokeWidth={1} className="absolute left-5 bottom-5 text-ink/15 rotate-[8deg] sm:w-[84px] sm:h-[84px]" />

      <span className="relative inline-flex items-center gap-1.5 bg-ink text-white text-[11px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-tl-md w-fit">
        <Star size={12} className="fill-white" />
        Aliado destacado
      </span>

      <div key={index} className="relative animate-[j3-fade-in_0.4s_ease] pr-20 sm:pr-0">
        <h2 className="mt-3 sm:mt-4 text-3xl sm:text-6xl font-extrabold text-white tracking-tight">{ALIADOS[index]}</h2>
        <p className="mt-2 sm:mt-3 text-xs sm:text-base text-white/90 max-w-sm">
          Uno de los aliados que se suma a esta nueva etapa de J3, vendiendo su catálogo dentro de nuestro
          marketplace — con toda la confianza y el respaldo de siempre.
        </p>
      </div>

      <div className="relative mt-4 sm:mt-6 flex flex-wrap items-center gap-3 sm:gap-4">
        <a
          href={ctaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-ink text-white text-xs sm:text-sm font-semibold px-4 py-2.5 sm:px-5 sm:py-3 rounded-tl-lg hover:bg-black transition-colors w-fit"
        >
          <PackageSearch size={16} />
          Quiero un espacio como este
        </a>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Aliado anterior"
            className="w-7 h-7 rounded-tl-md bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <div className="flex items-center gap-1">
            {ALIADOS.map((name, i) => (
              <button
                key={name}
                type="button"
                onClick={() => go(i)}
                aria-label={`Ver ${name}`}
                className={`h-1.5 rounded-tl-sm transition-all ${
                  i === index ? "w-5 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Siguiente aliado"
            className="w-7 h-7 rounded-tl-md bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
