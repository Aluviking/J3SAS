"use client";

import {
  ArrowRight,
  Dumbbell,
  Handshake,
  Home as HomeIcon,
  Laptop2,
  LayoutGrid,
  Rocket,
  ShoppingBag,
  Sparkles,
  Wine,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import AliadoDestacadoSlider from "@/components/AliadoDestacadoSlider";
import ConceptProductCard from "@/components/ConceptProductCard";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/mock-data";
import { conceptCategories, getConceptProductsByCategory, type ConceptCategory } from "@/lib/proximamente-data";

const ROPA_IDS = [
  "brooklyn",
  "california",
  "denim",
  "cm-28-massachusetts",
  "cm-mickey-cafe",
  "cm-scooby-doo",
  "cm-bugs-bunny",
  "cm-bunny-queen",
  "cm-silvestre",
  "cm-betty-boop",
  "cm-bob-dog",
];

const CATEGORY_ICON: Record<ConceptCategory, LucideIcon> = {
  Licores: Wine,
  Tecnología: Laptop2,
  "Hogar y Cocina": HomeIcon,
  "Ropa Deportiva": Dumbbell,
};

type TabKey = "todo" | "Ropa J3" | ConceptCategory;

const TAB_ICON: Record<TabKey, LucideIcon> = {
  todo: LayoutGrid,
  "Ropa J3": ShoppingBag,
  Licores: Wine,
  Tecnología: Laptop2,
  "Hogar y Cocina": HomeIcon,
  "Ropa Deportiva": Dumbbell,
};

// Una sola línea visual para todas las pestañas — mismos tonos de marca
// (ink/blanco/naranja cta) que el resto del sitio, sin colores por categoría.

const WHATSAPP_HREF = `https://wa.me/573244603474?text=${encodeURIComponent(
  "Hola, quiero información sobre ser aliado/proveedor de la nueva tienda J3 (licores, tecnología, hogar y cocina, ropa deportiva)."
)}`;

const CATEGORY_BANNERS: { key: TabKey; label: string; sublabel?: string; tag?: string; count: number; image: string }[] = [
  {
    key: "Ropa J3",
    label: "Ropa J3",
    count: ROPA_IDS.length,
    image: "/products/hombre/Camiseta Hombre Oversize/brooklyn - Camiseta Hombre Oversize/brooklyn - Camiseta Hombre Oversize modelo.webp",
  },
  { key: "Licores", label: "Licores", count: 10, image: "/concept/whisky.webp" },
  { key: "Tecnología", label: "Tecnología", count: 9, image: "/concept/laptop.webp" },
  { key: "Hogar y Cocina", label: "Hogar y Cocina", count: 8, image: "/concept/cuchillos.webp" },
  { key: "Ropa Deportiva", label: "Ropa Deportiva", count: 8, image: "/concept/tenis.webp" },
];

export default function ProximamentePage() {
  const [tab, setTab] = useState<TabKey>("todo");
  const catalogRef = useRef<HTMLDivElement>(null);
  const ropaProducts = useMemo(
    () => ROPA_IDS.map((id) => products.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => Boolean(p)),
    []
  );

  const tabs: { key: TabKey; label: string }[] = [
    { key: "todo", label: "Todo" },
    { key: "Ropa J3", label: "Ropa J3" },
    ...conceptCategories.map((c) => ({ key: c, label: c })),
  ];

  const goToCategory = (key: TabKey) => {
    setTab(key);
    catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div>
      {/* Hero — incluye la vitrina del aliado destacado (RAMTEK) como parte
          del mismo banner inicial, no como sección aparte más abajo */}
      <div className="relative overflow-hidden bg-ink px-4 lg:px-8 py-14 sm:py-20">
        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-cta/20 blur-3xl" />
        <div className="absolute -bottom-16 -left-10 w-72 h-72 rounded-full bg-brand/30 blur-3xl" />
        <div className="relative grid lg:grid-cols-2 gap-8 items-stretch max-w-6xl mx-auto">
          <div className="flex flex-col justify-center">
            <span className="inline-flex items-center gap-1.5 bg-cta/15 text-cta text-xs font-semibold px-3 py-1.5 rounded-tl-md w-fit">
              <Rocket size={13} />
              Próximamente en J3
            </span>
            <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-white leading-tight">
              De tienda de ropa a marketplace de confianza
            </h1>
            <p className="mt-3 text-sm sm:text-base text-white/70">
              Estamos construyendo la siguiente etapa de Comercializadora J3: además de la ropa que ya conoces, muy
              pronto vas a poder comprar licores, tecnología, artículos para el hogar y la cocina, y ropa deportiva — todo con el mismo
              servicio y confianza de siempre.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-cta text-white text-sm font-semibold px-5 py-3 rounded-tl-lg hover:bg-cta-dark transition-colors"
              >
                <Handshake size={16} />
                Quiero ser aliado / proveedor
              </a>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-white/10 text-white text-sm font-semibold px-5 py-3 rounded-tl-lg hover:bg-white/15 transition-colors"
              >
                <ShoppingBag size={16} />
                Ver la tienda actual
              </Link>
            </div>
          </div>

          <AliadoDestacadoSlider ctaHref={WHATSAPP_HREF} />
        </div>
      </div>

      {/* Banners de categorías — de entrada se ve que hay de todo */}
      <div className="px-4 lg:px-8 pt-8 pb-2 max-w-6xl mx-auto">
        <h2 className="text-lg font-semibold text-ink mb-1">Todo lo que vas a encontrar</h2>
        <p className="text-sm text-muted mb-4">Un vistazo rápido a las categorías que se vienen.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {CATEGORY_BANNERS.map(({ key, label, sublabel, tag, count, image }) => (
            <button
              key={key}
              onClick={() => goToCategory(key)}
              className="group relative overflow-hidden aspect-[3/4] rounded-tl-2xl bg-ink text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
            >
              <Image
                src={image}
                alt={label}
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
              <span
                className={`absolute top-2.5 left-2.5 text-[10px] font-semibold px-2 py-0.5 rounded-tl-md ${
                  key === "Ropa J3" ? "bg-brand text-white" : tag ? "bg-amber-400 text-ink" : "bg-white/90 text-ink"
                }`}
              >
                {key === "Ropa J3" ? "Ya disponible" : (tag ?? "Próximamente")}
              </span>
              <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4">
                <p className="text-base sm:text-lg font-bold text-white leading-tight tracking-tight">{label}</p>
                {sublabel && <p className="text-[11px] sm:text-xs text-white/85 leading-tight">{sublabel}</p>}
                <p className="mt-0.5 text-[11px] sm:text-xs text-white/70">{count}+ productos</p>
                <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-white/85 max-h-0 overflow-hidden opacity-0 transition-all duration-200 group-hover:max-h-5 group-hover:opacity-100">
                  Ver categoría <ArrowRight size={12} />
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Value props */}
      <div className="px-4 lg:px-8 py-8 grid sm:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {[
          { icon: Sparkles, title: "Un solo lugar", text: "Ropa, licores, tecnología, hogar y deporte en una sola compra." },
          { icon: Handshake, title: "Nuevos aliados", text: "Espacio para marcas y proveedores que quieran vender con nosotros." },
          { icon: Rocket, title: "La misma confianza", text: "El mismo servicio y atención que ya conoces de J3." },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-3 bg-surface border border-border rounded-tl-2xl p-4">
            <div className="w-9 h-9 rounded-tl-md bg-brand-soft flex items-center justify-center shrink-0">
              <Icon size={17} className="text-brand" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">{title}</p>
              <p className="text-xs text-muted mt-0.5">{text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Catálogo vista previa */}
      <div ref={catalogRef} className="px-4 lg:px-8 pb-14 max-w-6xl mx-auto scroll-mt-20">
        <h2 className="text-lg font-semibold text-ink mb-3">Así se vería el nuevo catálogo</h2>
        <div className="flex items-stretch gap-2 flex-wrap mb-5">
          {tabs.map((t) => {
            const Icon = TAB_ICON[t.key];
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`group flex-1 basis-[150px] flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-tl-xl border transition-all duration-200 ${
                  active
                    ? "bg-ink border-ink shadow-md"
                    : "bg-surface border-border hover:border-ink hover:shadow-sm"
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-tl-md flex items-center justify-center shrink-0 transition-colors ${
                    active ? "bg-white/15" : "bg-surface-alt group-hover:bg-white"
                  }`}
                >
                  <Icon size={14} className={active ? "text-cta" : "text-muted group-hover:text-ink"} />
                </span>
                <span className={`text-sm font-semibold ${active ? "text-white" : "text-ink"}`}>{t.label}</span>
              </button>
            );
          })}
        </div>

        {(tab === "todo" || tab === "Ropa J3") && (
          <section className="mb-10">
            {tab === "todo" && (
              <h3 className="flex items-center gap-2 text-sm font-semibold text-ink mb-3">
                <ShoppingBag size={15} className="text-brand" />
                Ropa J3 · lo que ya conoces
              </h3>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {ropaProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {conceptCategories
          .filter((c) => tab === "todo" || tab === c)
          .map((category) => {
            const Icon = CATEGORY_ICON[category];
            return (
              <section key={category} className="mb-10">
                {tab === "todo" && (
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-ink mb-3">
                    <Icon size={15} className="text-brand" />
                    {category} · próximamente
                  </h3>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {getConceptProductsByCategory(category).map((p) => (
                    <ConceptProductCard key={p.id} product={p} />
                  ))}
                </div>
              </section>
            );
          })}
      </div>

      {/* CTA final para aliados */}
      <div className="px-4 lg:px-8 pb-14">
        <div className="max-w-4xl mx-auto rounded-tl-3xl bg-brand text-white p-8 sm:p-10 text-center">
          <h2 className="text-xl sm:text-2xl font-semibold">¿Tienes un negocio y quieres vender con J3?</h2>
          <p className="mt-2 text-sm text-white/75 max-w-xl mx-auto">
            Estamos buscando aliados en licores, tecnología, hogar y cocina, y ropa deportiva para crecer juntos esta nueva etapa de
            Comercializadora J3.
          </p>
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 bg-white text-brand text-sm font-semibold px-5 py-3 rounded-tl-lg hover:bg-white/90 transition-colors"
          >
            <Handshake size={16} />
            Hablemos por WhatsApp
          </a>
        </div>
        <p className="mt-4 text-center text-[11px] text-muted">
          Fotos ilustrativas de las nuevas categorías tomadas de{" "}
          <a
            href="https://commons.wikimedia.org"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-ink"
          >
            Wikimedia Commons
          </a>{" "}
          — no representan productos ni marcas específicas que hoy vendamos.
        </p>
      </div>
    </div>
  );
}
