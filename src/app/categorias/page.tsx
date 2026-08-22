import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { categories, categorySlug, products } from "@/lib/mock-data";

export default function CategoriasPage() {
  const groups = new Map<string, typeof products>();
  for (const p of products) {
    const list = groups.get(p.category) ?? [];
    list.push(p);
    groups.set(p.category, list);
  }

  const orderedEntries = [
    ...categories
      .map((c) => [c.label, groups.get(c.label)] as const)
      .filter((entry): entry is [string, typeof products] => Boolean(entry[1])),
    ...Array.from(groups.entries()).filter(
      ([category]) => !categories.some((c) => c.label === category)
    ),
  ];

  return (
    <div className="px-4 lg:px-8 py-5">
      <div className="text-sm text-muted mb-3">
        <Link href="/" className="hover:text-ink">
          Inicio
        </Link>{" "}
        / <span className="text-ink">Categorías</span>
      </div>

      <h1 className="text-xl font-semibold text-ink">Categorías</h1>
      <p className="mt-1 text-sm text-muted">Explora el catálogo por tipo de producto.</p>

      <div className="mt-6 space-y-8">
        {orderedEntries.map(([category, items]) => (
          <section key={category}>
            <div className="flex items-center justify-between mb-3">
              <Link href={`/categorias/${categorySlug(category)}`} className="group flex items-center gap-2">
                <h2 className="font-semibold text-ink text-lg group-hover:text-cta transition-colors">
                  {category}
                </h2>
              </Link>
              <span className="text-sm text-muted">{items.length} productos</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
