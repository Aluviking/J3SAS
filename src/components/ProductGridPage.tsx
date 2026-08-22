"use client";

import { ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { AUDIENCE_LABEL, type Audience, type Product } from "@/lib/mock-data";

type SortOption = "relevancia" | "precio-asc" | "precio-desc" | "rating";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "relevancia", label: "Relevancia" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "rating", label: "Mejor calificados" },
];

export default function ProductGridPage({
  title,
  subtitle,
  products,
  categoryTabs,
  audiences,
}: {
  title: string;
  subtitle?: string;
  products: Product[];
  categoryTabs?: { label: string; href: string; active: boolean }[];
  audiences?: Audience[];
}) {
  const [sort, setSort] = useState<SortOption>("relevancia");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [audienceFilter, setAudienceFilter] = useState<Audience | "todos">("todos");

  const visibleProducts = useMemo(() => {
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;

    let list = products.filter((p) => {
      if (audienceFilter !== "todos" && p.audience !== audienceFilter) return false;
      if (min !== null && p.price < min) return false;
      if (max !== null && p.price > max) return false;
      return true;
    });

    if (sort === "precio-asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "precio-desc") list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);

    return list;
  }, [products, sort, minPrice, maxPrice, audienceFilter]);

  return (
    <div className="px-4 lg:px-8 py-5">
      <div className="text-sm text-muted mb-3">
        <Link href="/" className="hover:text-ink">
          Inicio
        </Link>{" "}
        / <span className="text-ink">{title}</span>
      </div>

      <h1 className="text-xl font-semibold text-ink">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}

      {categoryTabs && categoryTabs.length > 1 && (
        <div className="mt-3 flex items-center gap-2">
          {categoryTabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`text-sm font-medium px-3 py-1.5 rounded-tl-md transition-colors ${
                tab.active
                  ? "bg-ink text-white"
                  : "bg-surface-alt text-ink hover:bg-surface border border-border"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      )}

      {audiences && audiences.length > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => setAudienceFilter("todos")}
            className={`text-sm font-medium px-3 py-1.5 rounded-tl-md transition-colors ${
              audienceFilter === "todos"
                ? "bg-ink text-white"
                : "bg-surface-alt text-ink hover:bg-surface border border-border"
            }`}
          >
            Todos
          </button>
          {audiences.map((aud) => (
            <button
              key={aud}
              onClick={() => setAudienceFilter(aud)}
              className={`text-sm font-medium px-3 py-1.5 rounded-tl-md transition-colors ${
                audienceFilter === aud
                  ? "bg-ink text-white"
                  : "bg-surface-alt text-ink hover:bg-surface border border-border"
              }`}
            >
              {AUDIENCE_LABEL[aud]}
            </button>
          ))}
        </div>
      )}

      {products.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-muted">
            <ArrowUpDown size={14} />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="bg-surface-alt border border-border rounded-tl-md px-2.5 py-1.5 text-sm text-ink outline-none"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Precio mín."
              className="w-28 bg-surface-alt border border-border rounded-tl-md px-2.5 py-1.5 text-sm text-ink placeholder:text-muted outline-none"
            />
            <span className="text-muted text-sm">–</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Precio máx."
              className="w-28 bg-surface-alt border border-border rounded-tl-md px-2.5 py-1.5 text-sm text-ink placeholder:text-muted outline-none"
            />
          </div>

          <span className="text-xs text-muted">
            {visibleProducts.length} de {products.length} productos
          </span>
        </div>
      )}

      {visibleProducts.length === 0 ? (
        <p className="mt-6 text-sm text-muted">No hay productos que coincidan con esos filtros.</p>
      ) : (
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {visibleProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
