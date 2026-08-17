"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import ProductCard from "@/components/ProductCard";
import { useFavorites } from "@/lib/favorites-context";
import { products } from "@/lib/mock-data";

export default function FavoritosPage() {
  const { ids } = useFavorites();
  const items = products.filter((p) => ids.includes(p.id));

  return (
    <div className="px-4 lg:px-8 py-5">
      <div className="text-sm text-muted mb-3">
        <Link href="/" className="hover:text-ink">
          Inicio
        </Link>{" "}
        / <span className="text-ink">Favoritos</span>
      </div>

      <h1 className="text-xl font-semibold text-ink">Favoritos</h1>
      <p className="mt-1 text-sm text-muted">Los productos que guardaste para más tarde.</p>

      {items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Tu lista de favoritos está vacía"
          description="Toca el corazón en cualquier producto para guardarlo aquí."
          actionLabel="Explorar catálogo"
          actionHref="/"
        />
      ) : (
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
