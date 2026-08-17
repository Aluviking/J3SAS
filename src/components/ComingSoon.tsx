import { Hammer } from "lucide-react";
import Link from "next/link";

export default function ComingSoon({ title }: { title: string }) {
  return (
    <div className="px-4 lg:px-8 py-5">
      <div className="text-sm text-muted mb-3">
        <Link href="/" className="hover:text-ink">
          Inicio
        </Link>{" "}
        / <span className="text-ink">{title}</span>
      </div>

      <div className="relative overflow-hidden rounded-tl-3xl bg-ink px-6 py-8 sm:px-10 sm:py-10">
        <div className="relative w-12 h-12 rounded-tl-lg bg-white/10 flex items-center justify-center mb-4">
          <Hammer size={22} className="text-white" />
        </div>
        <h1 className="relative text-2xl sm:text-3xl font-semibold text-white">{title}</h1>
        <p className="relative mt-2 text-sm text-white/70 max-w-lg">
          Esta sección está en desarrollo.
        </p>
        <Hammer
          size={160}
          strokeWidth={1}
          className="absolute -right-6 -bottom-10 text-white/[0.06] pointer-events-none"
        />
      </div>

      <div className="mt-6 flex flex-col items-center justify-center text-center bg-surface border border-border rounded-tl-2xl py-16 px-6">
        <div className="w-14 h-14 rounded-tl-lg bg-surface-alt flex items-center justify-center">
          <Hammer size={24} className="text-muted" />
        </div>
        <p className="mt-4 font-semibold text-ink">Todavía no está disponible</p>
        <p className="mt-1 text-sm text-muted max-w-sm">
          Por ahora J3SAS vende camisetas, pantalonetas, polos y busos. Esta parte del sitio va a
          estar disponible más adelante.
        </p>
        <Link
          href="/"
          className="mt-5 inline-block text-sm font-semibold bg-ink text-white px-5 py-2.5 rounded-tl-md hover:bg-cta transition-colors"
        >
          Volver al catálogo
        </Link>
      </div>
    </div>
  );
}
