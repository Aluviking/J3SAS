"use client";

import { Heart, Plus, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useFavorites } from "@/lib/favorites-context";
import type { Product } from "@/lib/mock-data";

const currency = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(product.id);
  const discount = product.originalPrice
    ? Math.round(100 - (product.price / product.originalPrice) * 100)
    : null;
  const isBasicCatalogPhoto = product.category === "Polos" || product.category === "Buzos";

  return (
    <div className="group">
      <Link href={`/producto/${product.id}`} className="block">
        <div
          className={`relative rounded-tl-2xl overflow-hidden aspect-square border border-border transition-shadow duration-300 group-hover:shadow-[0_12px_28px_rgba(20,22,28,0.12)] ${
            isBasicCatalogPhoto ? "bg-white" : "bg-surface-alt"
          }`}
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            className={
              isBasicCatalogPhoto
                ? "object-contain p-3 transition-transform duration-500 ease-out group-hover:scale-105"
                : "object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            }
          />
          {discount && (
            <span className="absolute top-2 left-2 bg-accent text-white text-[11px] font-semibold px-2 py-0.5 rounded-tl-md">
              -{discount}%
            </span>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(product.id);
            }}
            aria-label={favorite ? "Quitar de favoritos" : "Guardar en favoritos"}
            aria-pressed={favorite}
            className="absolute top-2 right-2 w-7 h-7 rounded-tl-md bg-white/90 flex items-center justify-center shrink-0 transition-colors hover:bg-white"
          >
            <Heart
              size={14}
              className={favorite ? "text-accent fill-accent" : "text-ink"}
            />
          </button>
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-ink/85 text-white text-xs font-medium text-center py-2">
            Ver producto
          </div>
        </div>
      </Link>
      <div className="mt-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link href={`/producto/${product.id}`}>
            <p className="text-sm text-ink line-clamp-1">{product.name}</p>
          </Link>
          <div className="flex items-center gap-1 mt-0.5">
            <Star size={12} className="text-amber-500 fill-amber-500" />
            <span className="text-xs text-muted">
              {product.rating} ({product.reviewCount})
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-sm font-semibold text-ink">
              {currency.format(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-muted line-through">
                {currency.format(product.originalPrice)}
              </span>
            )}
          </div>
          {product.colors && (
            <div className="flex items-center gap-1 mt-1.5">
              {product.colors.map((c) => (
                <span
                  key={c}
                  className="w-3 h-3 rounded-full border border-border"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => addItem(product.id)}
          className="w-7 h-7 rounded-tl-md bg-cta text-white flex items-center justify-center shrink-0 transition-all duration-200 hover:bg-cta-dark hover:scale-110"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
