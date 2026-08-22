"use client";

import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Clock,
  Heart,
  Package,
  Percent,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CountdownInline } from "@/components/CountdownTimer";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/lib/cart-context";
import { useFavorites } from "@/lib/favorites-context";
import {
  categorySlug,
  currency,
  getRelatedProducts,
  isBasicCatalogPhoto,
  ratingBreakdown,
  sampleReview,
  type Product,
} from "@/lib/mock-data";

function Accordion({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  const panelId = `accordion-${title.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="border-t border-border py-3">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full flex items-center justify-between text-sm font-semibold text-ink"
      >
        {title}
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div id={panelId} className="mt-2.5">
          {children}
        </div>
      )}
    </div>
  );
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(product.id);
  const [size, setSize] = useState(product.sizes[0]);
  const [added, setAdded] = useState(false);
  const [activeThumb, setActiveThumb] = useState(0);

  const handleAdd = () => {
    addItem(product.id, size);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const related = getRelatedProducts(product, 4);
  const breakdown = ratingBreakdown();
  const basicCatalogPhoto = isBasicCatalogPhoto(product.category);
  const gallery = [
    { src: product.image, label: "Frente" },
    ...(product.backImage ? [{ src: product.backImage, label: "Espalda" }] : []),
  ];

  return (
    <div className="px-4 lg:px-8 py-5 pb-8">
      <Link
        href={`/categorias/${categorySlug(product.category)}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:text-cta mb-2"
      >
        <ArrowLeft size={14} />
        Volver a {product.category}
      </Link>

      <div className="text-sm text-muted mb-3">
        <Link href="/" className="hover:text-ink">
          Inicio
        </Link>{" "}
        /{" "}
        <Link href={`/categorias/${categorySlug(product.category)}`} className="hover:text-ink">
          {product.category}
        </Link>{" "}
        / <span className="text-ink">{product.name}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Gallery */}
        <div>
          <div
            className={`relative rounded-tl-3xl overflow-hidden border border-border aspect-[4/5] ${
              basicCatalogPhoto ? "bg-white" : "bg-surface-alt"
            }`}
          >
            <Image
              src={gallery[activeThumb]?.src ?? product.image}
              alt={product.name}
              fill
              className={basicCatalogPhoto ? "object-contain p-6" : "object-cover"}
            />
          </div>
          {gallery.length > 1 && (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {gallery.map((g, i) => (
                <button
                  key={g.src}
                  onClick={() => setActiveThumb(i)}
                  className={`relative aspect-square rounded-tl-md overflow-hidden border transition-colors ${
                    activeThumb === i ? "border-ink" : "border-border"
                  } ${basicCatalogPhoto ? "bg-white" : "bg-surface-alt"}`}
                >
                  <Image
                    src={g.src}
                    alt={`${product.name} ${g.label}`}
                    fill
                    className={basicCatalogPhoto ? "object-contain p-1" : "object-cover"}
                  />
                  <span className="absolute bottom-0 inset-x-0 bg-ink/70 text-white text-[10px] text-center py-0.5">
                    {g.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-muted">{product.category}</p>
          <h1 className="mt-1 text-2xl font-semibold text-ink">{product.name}</h1>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-2xl font-semibold text-ink">
              {currency.format(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted line-through">
                {currency.format(product.originalPrice)}
              </span>
            )}
          </div>

          <div className="mt-2 flex items-center gap-1.5">
            <Star size={14} className="text-amber-500 fill-amber-500" />
            <span className="text-sm text-ink">{product.rating}</span>
            <span className="text-sm text-muted">({product.reviewCount} reseñas)</span>
          </div>

          {product.wholesalePrice && product.wholesaleMinQty && (
            <div className="mt-3 flex items-center gap-2 bg-brand-soft rounded-tl-md px-3 py-2 text-xs text-ink">
              <Package size={14} className="text-brand shrink-0" />
              Compra {product.wholesaleMinQty} o más unidades de esta referencia y paga{" "}
              <span className="font-semibold">{currency.format(product.wholesalePrice)}</span> c/u
            </div>
          )}

          <div className="mt-3 flex items-center gap-2 border border-border rounded-tl-md px-3 py-2 text-xs text-ink">
            <Clock size={14} className="text-brand shrink-0" />
            Pide en <CountdownInline hours={2.5} /> para recibirlo mañana
          </div>

          {/* Size */}
          <p className="mt-4 text-sm font-medium text-ink">Selecciona la talla</p>
          <div className="mt-2 flex gap-2 flex-wrap">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`w-11 h-11 rounded-full text-sm font-medium flex items-center justify-center border transition-colors ${
                  size === s
                    ? "bg-ink text-white border-ink"
                    : "bg-surface text-ink border-border hover:border-ink"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleAdd}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-cta text-white text-sm font-semibold py-3.5 rounded-tl-lg transition-colors hover:bg-cta-dark"
            >
              <ShoppingBag size={16} />
              {added ? "¡Agregado!" : `Agregar al carrito · ${currency.format(product.price)}`}
            </button>
            <button
              onClick={() => toggleFavorite(product.id)}
              aria-label={favorite ? "Quitar de favoritos" : "Guardar en favoritos"}
              aria-pressed={favorite}
              className="w-12 h-12 rounded-tl-lg bg-surface border border-border flex items-center justify-center shrink-0 transition-colors hover:border-ink"
            >
              <Heart size={18} className={favorite ? "text-accent fill-accent" : "text-ink"} />
            </button>
          </div>

          <Accordion title="Descripción y detalle" defaultOpen>
            <p className="text-sm text-muted leading-relaxed">{product.description}</p>
          </Accordion>

          <Accordion title="Envío">
            <div className="grid grid-cols-2 gap-3 text-xs text-ink">
              <div className="flex items-center gap-2">
                <Percent size={15} className="text-brand shrink-0" />
                <div>
                  <p className="font-medium">Descuento</p>
                  <p className="text-muted">
                    {product.originalPrice
                      ? `${Math.round(100 - (product.price / product.originalPrice) * 100)}% off`
                      : "Sin descuento"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Package size={15} className="text-brand shrink-0" />
                <div>
                  <p className="font-medium">Empaque</p>
                  <p className="text-muted">Empaque estándar</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Truck size={15} className="text-brand shrink-0" />
                <div>
                  <p className="font-medium">Tiempo de entrega</p>
                  <p className="text-muted">3-4 días hábiles</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-brand shrink-0" />
                <div>
                  <p className="font-medium">Llegada estimada</p>
                  <p className="text-muted">10-12 de octubre</p>
                </div>
              </div>
            </div>
          </Accordion>
        </div>
      </div>

      {/* Rating & Reviews */}
      <section className="mt-8 border-t border-border pt-6">
        <h3 className="font-semibold text-ink text-lg mb-4">Calificaciones y reseñas</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-5xl font-semibold text-ink">{product.rating}</p>
              <p className="text-sm text-muted mt-1">/ 5</p>
              <p className="text-xs text-muted mt-2">({product.reviewCount} reseñas)</p>
            </div>
            <div className="flex-1 space-y-1.5">
              {breakdown.map(({ star, pct }) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-muted w-3">{star}</span>
                  <Star size={11} className="text-amber-500 fill-amber-500 shrink-0" />
                  <div className="flex-1 h-1.5 bg-surface-alt rounded-full overflow-hidden">
                    <div className="h-full bg-ink" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-border rounded-tl-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-xs font-semibold text-white">
                {sampleReview.author
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <p className="text-sm font-medium text-ink">{sampleReview.author}</p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: sampleReview.rating }).map((_, i) => (
                    <Star key={i} size={11} className="text-amber-500 fill-amber-500" />
                  ))}
                </div>
              </div>
              <span className="ml-auto text-xs text-muted">{sampleReview.date}</span>
            </div>
            <p className="mt-3 text-sm text-muted leading-relaxed">{sampleReview.text}</p>
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="mt-8 border-t border-border pt-6">
        <h3 className="font-semibold text-ink text-lg mb-4">También te puede gustar</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
