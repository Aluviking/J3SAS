import { LayoutGrid } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CAMISETAS_SUBCATEGORIES, getProductsBySubcategory, products, type Product } from "@/lib/mock-data";

const SUBCATEGORY_SLUG: Record<string, string> = {
  "Oversize Hombre Moda Línea": "oversize-hombre",
  "Camiseta Pedrería Hombre": "pedreria-hombre",
  "Camiseta Pedrería Dama": "pedreria-dama",
  "Camiseta Oversize Dama Línea": "oversize-dama",
};

type Section = { slug: string; label: string; items: Product[]; coverOverride?: string };

export default function CategoriasPage() {
  const sections: Section[] = [
    ...CAMISETAS_SUBCATEGORIES.map((name) => ({
      slug: SUBCATEGORY_SLUG[name],
      label: name,
      items: getProductsBySubcategory(name),
    })),
    { slug: "pantaloneta-hombre", label: "Pantaloneta Hombre", items: products.filter((p) => p.category === "Pantalonetas") },
    { slug: "polo-hombre", label: "Polo Hombre", items: products.filter((p) => p.category === "Polos") },
    { slug: "unisex", label: "Buzos Unisex", items: products.filter((p) => p.category === "Buzos") },
    {
      slug: "ninos",
      label: "Camiseta Línea Niño",
      items: products.filter((p) => p.category === "Niños"),
      coverOverride: "/products/niños/portadas niños.webp",
    },
    { slug: "tshirt-dama", label: "T-shirts", items: products.filter((p) => p.category === "T-shirts") },
    { slug: "blusas", label: "Blusas", items: products.filter((p) => p.category === "Blusas") },
    { slug: "camisas-dama", label: "Camisas Largas Dama", items: products.filter((p) => p.category === "Camisas") },
    { slug: "vestidos-dama", label: "Vestidos Dama", items: products.filter((p) => p.category === "Vestidos") },
    { slug: "chaquetas-dama", label: "Chaquetas Dama", items: products.filter((p) => p.category === "Chaquetas" && p.audience === "mujer") },
    { slug: "chaquetas-hombre", label: "Chaquetas Hombre", items: products.filter((p) => p.category === "Chaquetas" && p.audience === "hombre") },
  ].filter((s) => s.items.length > 0);

  const totalProducts = products.length;

  return (
    <div className="px-4 lg:px-8 py-5">
      <div className="text-sm text-muted mb-3">
        <Link href="/" className="hover:text-ink">
          Inicio
        </Link>{" "}
        / <span className="text-ink">Subcategorías</span>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-semibold text-ink">Subcategorías</h1>
          <p className="mt-1 text-sm text-muted">Segmentos puntuales del catálogo.</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted bg-surface border border-border rounded-tl-md px-3 py-1.5">
          <LayoutGrid size={13} />
          {totalProducts} productos en {sections.length} subcategorías
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
        {sections.map(({ slug, label, items, coverOverride }) => {
          const cover = items.find((p) => p.frontImage) ?? items[0];
          const coverSrc = coverOverride ?? cover?.image ?? "/logo-j3.webp";
          return (
          <Link
            key={slug}
            href={`/categorias/${slug}`}
            className="group relative overflow-hidden aspect-[16/11] rounded-tl-2xl bg-ink text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
          >
            <Image
              src={coverSrc}
              alt={label}
              fill
              className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-4">
              <p className="text-base font-semibold text-white leading-tight">{label}</p>
              <p className="mt-1.5 text-xs font-medium text-white/85 max-h-0 overflow-hidden opacity-0 transition-all duration-200 group-hover:max-h-5 group-hover:opacity-100">
                Ver colección →
              </p>
            </div>
          </Link>
          );
        })}
      </div>
    </div>
  );
}
