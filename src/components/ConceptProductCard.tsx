import { Star } from "lucide-react";
import Image from "next/image";
import { currency } from "@/lib/mock-data";
import type { ConceptProduct } from "@/lib/proximamente-data";

export default function ConceptProductCard({ product }: { product: ConceptProduct }) {
  return (
    <div className="group">
      <div className="relative rounded-tl-2xl overflow-hidden aspect-[4/5] border border-border bg-surface-alt transition-shadow duration-300 group-hover:shadow-[0_12px_28px_rgba(20,22,28,0.12)]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />
        <span className="absolute top-2 left-2 bg-white/90 text-ink text-[10px] font-semibold px-2 py-0.5 rounded-tl-md">
          Próximamente
        </span>
      </div>
      <div className="mt-2">
        <p className="text-sm text-ink line-clamp-1">{product.name}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <Star size={12} className="text-amber-500 fill-amber-500" />
          <span className="text-xs text-muted">
            {product.rating} ({product.reviewCount})
          </span>
        </div>
        <div className="mt-1">
          <span className="text-sm font-semibold text-ink">{currency.format(product.price)}</span>
        </div>
      </div>
    </div>
  );
}
