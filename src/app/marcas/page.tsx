import { BadgeCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { products } from "@/lib/mock-data";

export default function MarcasPage() {
  return (
    <div className="px-4 lg:px-8 py-5">
      <div className="text-sm text-muted mb-3">
        <Link href="/" className="hover:text-ink">
          Inicio
        </Link>{" "}
        / <span className="text-ink">Marcas</span>
      </div>

      <h1 className="text-xl font-semibold text-ink">Marcas</h1>
      <p className="mt-1 text-sm text-muted">Las marcas que vas a encontrar en J3SAS.</p>

      <div className="mt-5 max-w-sm bg-surface border border-border rounded-tl-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="bg-white border border-border rounded-tl-lg p-1.5 shrink-0">
            <div className="relative w-7 h-14">
              <Image src="/logo-j3.webp" alt="Comercializadora J3" fill className="object-contain" />
            </div>
          </div>
          <div>
            <p className="font-semibold text-ink flex items-center gap-1">
              J3SAS
              <BadgeCheck size={15} className="text-brand" />
            </p>
            <p className="text-xs text-muted">{products.length} productos</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted">
          Marca colombiana propia. Diseño, producción y envío directo, sin intermediarios.
        </p>
        <Link
          href="/colecciones"
          className="mt-4 inline-block text-sm font-semibold bg-ink text-white px-4 py-2 rounded-tl-md hover:bg-cta transition-colors"
        >
          Ver catálogo
        </Link>
      </div>

      <p className="mt-6 text-sm text-muted">Pronto vendrán más marcas aliadas.</p>
    </div>
  );
}
