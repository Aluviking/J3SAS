import { RotateCcw, ShieldCheck, Star, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CountdownBlocks } from "@/components/CountdownTimer";
import HeroSlider from "@/components/HeroSlider";
import ProductCard from "@/components/ProductCard";
import { categories, currency, getBestSellers, products } from "@/lib/mock-data";

export default function Home() {
  const newArrivals = products.slice(0, 4);
  const bestSellers = getBestSellers(3);

  return (
    <div className="px-4 lg:px-8 py-5 space-y-5">
      {/* Hero */}
      <HeroSlider />

      {/* Trending + social proof */}
      <div className="flex flex-wrap items-center gap-3 px-1">
        <span className="inline-block bg-ink text-white text-xs font-semibold px-3 py-1.5 rounded-tl-md tracking-wide uppercase">
          Tendencia ahora
        </span>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {["CR", "JM", "AL", "TP"].map((initials, i) => (
              <div
                key={initials}
                className="w-7 h-7 rounded-full border-2 border-canvas flex items-center justify-center text-[9px] font-semibold text-white"
                style={{ background: ["#3f3f46", "#52525b", "#71717a", "#a1a1aa"][i] }}
              >
                {initials}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted">
            Amado por <span className="text-ink font-medium">+50.000</span> clientes
          </p>
        </div>
      </div>

      {/* Trust badges */}
      <div className="bg-surface border border-border rounded-tl-lg px-4 py-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: Truck, title: "Envío gratis", subtitle: "Por llevar más de 3 artículos" },
          { icon: ShieldCheck, title: "Pago seguro", subtitle: "100% protegido" },
          { icon: RotateCcw, title: "Devoluciones fáciles", subtitle: "8 días hábiles" },
        ].map(({ icon: Icon, title, subtitle }) => (
          <div key={title} className="flex items-center gap-2">
            <Icon size={16} className="text-brand shrink-0" />
            <div>
              <p className="text-xs font-medium text-ink leading-tight">{title}</p>
              <p className="text-[10px] text-muted leading-tight">{subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Categories */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-ink text-lg">Comprar por categoría</h3>
            <Link href="/categorias" className="text-sm text-muted hover:text-ink transition-colors">
              Ver todas
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {categories.map(({ id, label, image, href }) => (
              <Link
                key={id}
                href={href ?? `/categorias/${id}`}
                className="group relative overflow-hidden aspect-[4/5] rounded-tl-lg bg-ink transition-transform duration-200 hover:-translate-y-1"
              >
                <Image
                  src={image}
                  alt={label}
                  fill
                  className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                <span className="absolute bottom-3 inset-x-0 text-xs font-medium text-white text-center">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* New arrivals */}
        <section className="bg-surface border border-border rounded-tl-3xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-ink text-lg">Nuevos ingresos</h3>
            <Link href="/nuevos" className="text-sm text-muted hover:text-ink transition-colors">
              Ver todo
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {newArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* Best sellers */}
        <section className="bg-surface border border-border rounded-tl-3xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-ink text-lg">Más vendidos</h3>
            <Link href="/mas-vendidos" className="text-sm text-muted hover:text-ink transition-colors">
              Ver todo
            </Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {bestSellers.map((p) => (
              <div
                key={p.id}
                className="flex gap-2.5 border border-border rounded-tl-lg p-2.5 transition-colors hover:border-ink"
              >
                <Link href={`/producto/${p.id}`} className="relative w-16 h-16 rounded-tl-md overflow-hidden bg-surface-alt shrink-0">
                  <Image src={p.image} alt={p.name} fill className="object-cover" />
                </Link>
                <div className="min-w-0 flex-1">
                  <span className="inline-block bg-accent text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-tl-sm uppercase tracking-wide">
                    Bestseller
                  </span>
                  <Link href={`/producto/${p.id}`}>
                    <p className="mt-1 text-sm font-medium text-ink line-clamp-1">{p.name}</p>
                  </Link>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star size={11} className="text-amber-500 fill-amber-500" />
                    <span className="text-[11px] text-muted">
                      {p.rating} ({p.reviewCount})
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-ink">{currency.format(p.price)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Flash sale + collection */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="relative overflow-hidden rounded-tl-3xl bg-gradient-to-br from-cta to-cta-dark p-5 sm:p-6">
            <p className="relative text-xs font-semibold text-white/80 uppercase tracking-wide">
              Venta flash
            </p>
            <p className="relative mt-1 text-xl font-semibold text-white">Hasta 70% de descuento</p>
            <div className="relative mt-3">
              <CountdownBlocks hours={63} />
            </div>
            <Link
              href="/ofertas"
              className="relative mt-4 inline-flex items-center gap-2 bg-white text-cta-dark text-sm font-semibold px-5 py-2 rounded-tl-lg hover:bg-white/90 transition-colors"
            >
              Comprar ahora
            </Link>
          </div>
          <div className="relative overflow-hidden rounded-tl-3xl bg-ink p-5 sm:p-6 flex flex-col justify-center">
            <p className="relative text-xs font-semibold text-white/60 uppercase tracking-wide">
              Nueva colección
            </p>
            <p className="relative mt-1 text-xl font-semibold text-white">Colección Verano 2026</p>
            <p className="relative mt-1.5 text-sm text-white/60 max-w-xs">
              Descubre las últimas tendencias y estilos de la temporada.
            </p>
            <Link
              href="/colecciones"
              className="relative mt-4 inline-flex w-fit items-center gap-2 bg-white text-ink text-sm font-semibold px-5 py-2 rounded-tl-lg hover:bg-white/90 transition-colors"
            >
              Ver colección
            </Link>
          </div>
        </div>
    </div>
  );
}


