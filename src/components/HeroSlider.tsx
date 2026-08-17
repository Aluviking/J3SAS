"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  { src: "/banners/banner1.webp", alt: "Comercializadora J3: directo, sin intermediarios", href: "/colecciones" },
  { src: "/banners/banner2.webp", alt: "Comercializadora J3: colección directa", href: "/colecciones" },
  { src: "/banners/banner3.webp", alt: "Comercializadora J3: fabricantes, directo a ti", href: "/programa-aliados" },
];

export default function HeroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative overflow-hidden rounded-tl-3xl bg-ink">
      <div className="relative aspect-[16/9] sm:aspect-[16/7] overflow-hidden">
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide, i) => (
            <Link key={slide.src} href={slide.href} className="relative w-full h-full shrink-0">
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                priority={i === 0}
                className="object-cover"
              />
            </Link>
          ))}
        </div>
      </div>

      <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5 z-20">
        {slides.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Ir al banner ${i + 1}`}
            aria-current={i === index}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/75"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
