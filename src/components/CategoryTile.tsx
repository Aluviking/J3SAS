"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Category } from "@/lib/mock-data";

const SLIDE_INTERVAL_MS = 3500;

type CategoryTileProps = Omit<Category, "icon">;

export default function CategoryTile({ id, label, image, images, href }: CategoryTileProps) {
  const slides = images && images.length > 1 ? images : [image];
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => {
      setActiveSlide((i) => (i + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <Link
      href={href ?? `/categorias/${id}`}
      className="group relative overflow-hidden aspect-[4/5] rounded-tl-lg bg-ink transition-transform duration-200 hover:-translate-y-1"
    >
      {slides.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={label}
          fill
          className={`object-cover object-top transition-opacity duration-700 ease-in-out group-hover:scale-110 ${
            i === activeSlide ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
      <span className="absolute bottom-3 inset-x-0 text-xs font-medium text-white text-center">
        {label}
      </span>
    </Link>
  );
}
