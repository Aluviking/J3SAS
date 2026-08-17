import ProductGridPage from "@/components/ProductGridPage";
import { products } from "@/lib/mock-data";

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim().toLowerCase();

  const results = query
    ? products.filter((p) =>
        [p.name, p.category, p.description].some((field) =>
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
