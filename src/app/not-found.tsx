import { Home, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="relative w-16 h-32">
        <Image src="/logo-j3.webp" alt="Comercializadora J3" fill className="object-contain" />
      </div>
      <p className="mt-6 text-6xl font-semibold text-ink">404</p>
      <h1 className="mt-2 text-xl font-semibold text-ink">Esta página no existe</h1>
      <p className="mt-1.5 text-sm text-muted max-w-sm">
        El enlace puede estar roto o la página pudo haberse movido. Revisa la dirección o vuelve
        al catálogo.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold bg-ink text-white px-5 py-2.5 rounded-tl-md hover:bg-cta transition-colors"
        >
          <Home size={15} />
          Ir al inicio
        </Link>
        <Link
          href="/buscar"
          className="inline-flex items-center gap-2 text-sm font-semibold border border-border text-ink px-5 py-2.5 rounded-tl-md hover:border-ink transition-colors"
        >
          <Search size={15} />
          Buscar productos
        </Link>
      </div>
    </div>
  );
}
