import { notFound } from "next/navigation";
import CategoryTile from "@/components/CategoryTile";
import type { Disclaimer } from "@/components/DisclaimerModal";
import ProductGridPage, { type SubFilter, type SubFilterField } from "@/components/ProductGridPage";
import { HOGAR_TECH_GROUP_TYPES } from "@/lib/hogar-tech-data";
import {
  AUDIENCE_GROUP_TYPES,
  categories,
  dedupeVariants,
  products,
  RESCATE_DISCLAIMER,
  type Product,
} from "@/lib/mock-data";

type SlugConfig = {
  label: string;
  filter: (p: Product) => boolean;
  subFilters?: SubFilter[];
  subFilterField?: SubFilterField;
  /** Otras rutas a las que esta sección puede cruzar (fila de pestañas). */
  tabs?: string[];
  /** Prioridad de orden por defecto (menor = primero); empate conserva el orden del catálogo. */
  sortPriority?: (p: Product) => number;
  /** Aviso emergente que se muestra siempre (sin persistencia) al entrar a la sección. */
  disclaimer?: Disclaimer;
  /** Muestra las tarjetas Hombres/Dama/Niños/Unisex/Rescate arriba — deben verse en las 5 secciones de ropa, no solo en /ropa. */
  showAudienceCards?: boolean;
};

const SLUGS: Record<string, SlugConfig> = {
  hombre: {
    label: "Hombres",
    filter: (p) => (p.audience === "hombre" || p.category === "Buzos") && p.category !== "Rescate",
    subFilters: [
      ...AUDIENCE_GROUP_TYPES.hombre.map((c) => ({ key: c, label: c })),
      { key: "Unisex", label: "Unisex", field: "subcategory" as const },
    ],
    subFilterField: "category",
    showAudienceCards: true,
  },
  dama: {
    label: "Dama",
    filter: (p) => (p.audience === "mujer" || p.category === "Buzos") && p.category !== "Rescate",
    subFilters: [
      ...AUDIENCE_GROUP_TYPES.dama.map((c) => ({ key: c, label: c })),
      { key: "Unisex", label: "Unisex", field: "subcategory" as const },
    ],
    subFilterField: "category",
    sortPriority: (p) =>
      p.category === "Blusas" || p.category === "Camisas" || p.category === "Vestidos" ? 0 : 1,
    showAudienceCards: true,
  },
  rescate: {
    label: "Rescate",
    filter: (p) => p.category === "Rescate",
    subFilters: [
      { key: "hombre", label: "Hombre" },
      { key: "mujer", label: "Dama" },
      { key: "nina", label: "Niña" },
      { key: "nino", label: "Niño" },
    ],
    subFilterField: "audience",
    disclaimer: RESCATE_DISCLAIMER,
    showAudienceCards: true,
  },
  ninos: {
    label: "Niños",
    filter: (p) => p.category === "Niños",
    subFilters: [
      { key: "nino", label: "Niño" },
      { key: "nina", label: "Niña" },
    ],
    subFilterField: "audience",
    showAudienceCards: true,
  },
  unisex: {
    label: "Unisex",
    filter: (p) => p.category === "Buzos",
    showAudienceCards: true,
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
    label: "Camiseta Pedrería Dama",
    filter: (p) => Boolean(p.subcategories?.includes("Camiseta Pedrería Dama")),
  },
  "oversize-dama": {
    label: "Camiseta Oversize Dama Línea",
    filter: (p) => Boolean(p.subcategories?.includes("Camiseta Oversize Dama Línea")),
  },
  "tshirt-dama": {
    label: "T-shirts",
    filter: (p) => p.category === "T-shirts",
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
  "vestidos-dama": {
    label: "Vestidos Dama",
    filter: (p) => p.category === "Vestidos",
  },
  "chaquetas-dama": {
    label: "Chaquetas Dama",
    filter: (p) => p.category === "Chaquetas" && p.audience === "mujer",
  },
  "chaquetas-hombre": {
    label: "Chaquetas Hombre",
    filter: (p) => p.category === "Chaquetas" && p.audience === "hombre",
  },
  electrodomesticos: {
    label: "Electrodomésticos",
    filter: (p) => p.category === "Electrodomésticos",
    subFilters: HOGAR_TECH_GROUP_TYPES["Electrodomésticos"].map((s) => ({
      key: s,
      label: s,
      field: "subcategory" as const,
    })),
  },
  "hogar-cocina": {
    label: "Hogar y Cocina",
    filter: (p) => p.category === "Hogar y Cocina",
    subFilters: HOGAR_TECH_GROUP_TYPES["Hogar y Cocina"].map((s) => ({
      key: s,
      label: s,
      field: "subcategory" as const,
    })),
  },
  tecnologia: {
    label: "Tecnología",
    filter: (p) => p.category === "Tecnología",
    subFilters: HOGAR_TECH_GROUP_TYPES["Tecnología"].map((s) => ({
      key: s,
      label: s,
      field: "subcategory" as const,
    })),
  },
  "zona-gamer": {
    label: "Zona Gamer",
    filter: (p) => p.category === "Zona Gamer",
    subFilters: HOGAR_TECH_GROUP_TYPES["Zona Gamer"].map((s) => ({
      key: s,
      label: s,
      field: "subcategory" as const,
    })),
  },
  "maletas-accesorios": {
    label: "Maletas y Accesorios",
    filter: (p) => p.category === "Maletas y Accesorios",
    subFilters: HOGAR_TECH_GROUP_TYPES["Maletas y Accesorios"].map((s) => ({
      key: s,
      label: s,
      field: "subcategory" as const,
    })),
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
  if (config.sortPriority) {
    items.sort((a, b) => config.sortPriority!(a) - config.sortPriority!(b));
  }

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
      subtitle={`${dedupeVariants(items).length} productos disponibles`}
      products={items}
      categoryTabs={categoryTabs}
      subFilters={config.subFilters}
      subFilterField={config.subFilterField}
      parentLink={{ label: "Subcategorías", href: "/categorias" }}
      disclaimer={config.disclaimer}
      headerExtra={
        config.showAudienceCards ? (
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {categories.map(({ id, label, image, images, href }) => (
              <CategoryTile key={id} id={id} label={label} image={image} images={images} href={href} />
            ))}
          </div>
        ) : undefined
      }
    />
  );
}
