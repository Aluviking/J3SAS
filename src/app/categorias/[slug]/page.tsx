import { notFound } from "next/navigation";
import ProductGridPage from "@/components/ProductGridPage";
import { CATEGORY_AUDIENCES, products } from "@/lib/mock-data";

const slugMap: Record<string, string> = {
  camisetas: "Camisetas",
  pantalonetas: "Pantalonetas",
  polos: "Polos",
  buzos: "Buzos",
  ninos: "Niños",
  blusas: "Blusas",
  camisas: "Camisas",
};

export function generateStaticParams() {
  return Object.keys(slugMap).map((slug) => ({ slug }));
}

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = slugMap[slug];
  if (!category) notFound();

  const items = products.filter((p) => p.category === category);

  const categoryTabs = Object.entries(slugMap).map(([tabSlug, label]) => ({
    label,
    href: `/categorias/${tabSlug}`,
    active: tabSlug === slug,
  }));

  return (
    <ProductGridPage
      key={slug}
      title={category}
      subtitle={`${items.length} productos disponibles`}
      products={items}
      categoryTabs={categoryTabs}
      audiences={CATEGORY_AUDIENCES[category]}
    />
  );
}
