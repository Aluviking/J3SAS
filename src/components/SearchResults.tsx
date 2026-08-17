"use client";

import { useSearchParams } from "next/navigation";
import ProductGridPage from "@/components/ProductGridPage";
import { products } from "@/lib/mock-data";

export default function SearchResults() {
  const q = useSearchParams().get("q") ?? "";
  const query = q.trim().toLowerCase();
  const results = query
    ? products.filter((product) =>
        [product.name, product.category, product.description].some((field) =>
          field.toLowerCase().includes(query)
        )
      )
    : [];
  const count = results.length;

  return (
    <ProductGridPage
      title={q ? `Resultados para "${q}"` : "Buscar"}
      subtitle={
        q
          ? `${count} producto${count === 1 ? "" : "s"} encontrado${count === 1 ? "" : "s"}`
          : "Escribe algo en el buscador para empezar."
      }
      products={results}
    />
  );
}
