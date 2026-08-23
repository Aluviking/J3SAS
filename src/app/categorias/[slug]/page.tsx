import { notFound } from "next/navigation";
import ProductGridPage, { type SubFilter, type SubFilterField } from "@/components/ProductGridPage";
import { AUDIENCE_GROUP_TYPES, products, type Product } from "@/lib/mock-data";

type SlugConfig = {
  label: string;
  filter: (p: Product) => boolean;
  subFilters?: SubFilter[];
  subFilterField?: SubFilterField;
  /** Otras rutas a las que esta sección puede cruzar (fila de pestañas). */
  tabs?: string[];
};

const HOMBRE_DAMA_TABS = ["hombre", "dama", "ninos", "unisex"];

const SLUGS: Record<string, SlugConfig> = {
  hombre: {
    label: "Hombres",
    filter: (p) => p.audience === "hombre" || p.category === "Buzos",
    subFilters: [
      ...AUDIENCE_GROUP_TYPES.hombre.map((c) => ({ key: c, label: c })),
      { key: "Unisex", label: "Unisex", field: "subcategory" as const },
    ],
    subFilterField: "category",
  },
  dama: {
    label: "Dama",
    filter: (p) => p.audience === "mujer" || p.category === "Buzos",
    subFilters: [
      ...AUDIENCE_GROUP_TYPES.dama.map((c) => ({ key: c, label: c })),
      { key: "Unisex", label: "Unisex", field: "subcategory" as const },
    ],
    subFilterField: "category",
  },
  ninos: {
    label: "Niños",
    filter: (p) => p.category === "Niños",
    subFilters: [
      { key: "nino", label: "Niño" },
      { key: "nina", label: "Niña" },
    ],
    subFilterField: "audience",
  },
  unisex: {
    label: "Unisex",
    filter: (p) => p.category === "Buzos",
    tabs: HOMBRE_DAMA_TABS,
  },
  "oversize-hombre": {
    label: "Oversize Hombre Moda Línea",
    filter: (p) => Boolean(p.subcategories?.includes("Oversize Hombre Moda Línea")),
  },
  "pedreria-hombre": {
    label: "Camiseta Pedrería Hombre",
    filter: (p) => Boolean(p.subcategories?.includes("Camiseta Pedrería Hombre")),
  },
  "pedreria-dama": {
    label: "Dama Pedrería Mujer",
    filter: (p) => Boolean(p.subcategories?.includes("Dama Pedrería Mujer")),
  },
  "oversize-dama": {
    label: "Camiseta Oversize Dama Línea",
    filter: (p) => Boolean(p.subcategories?.includes("Camiseta Oversize Dama Línea")),
  },
  "pantaloneta-hombre": {
    label: "Pantaloneta Hombre",
    filter: (p) => p.category === "Pantalonetas",
  },
  "polo-hombre": {
    label: "Polo Hombre",
    filter: (p) => p.category === "Polos",
  },
  blusas: {
    label: "Blusas",
    filter: (p) => p.category === "Blusas",
  },
  "camisas-dama": {
    label: "Camisas Largas Dama",
    filter: (p) => p.category === "Camisas",
  },
};

export function generateStaticParams() {
  return Object.keys(SLUGS).map((slug) => ({ slug }));
}

export default async function CategoriaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const config = SLUGS[slug];
  if (!config) notFound();

  const items = products.filter(config.filter);

  // Por defecto cada sección solo enlaza a sí misma (nunca a las otras
  // audiencias); "hombre"/"dama"/"ninos" tampoco se cruzan entre ellas.
  const visibleTabSlugs = config.tabs ?? [slug];
  const categoryTabs = visibleTabSlugs.map((tabSlug) => ({
    label: SLUGS[tabSlug].label,
    href: `/categorias/${tabSlug}`,
    active: tabSlug === slug,
  }));

  return (
    <ProductGridPage
      key={slug}
      title={config.label}
      subtitle={`${items.length} productos disponibles`}
      products={items}
      categoryTabs={categoryTabs}
      subFilters={config.subFilters}
      subFilterField={config.subFilterField}
    />
  );
}
