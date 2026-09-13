"use client";

import { ChevronRight, LayoutDashboard, LogOut, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAdministrativoAuth } from "@/lib/administrativo-auth-context";

export default function AdministrativoDashboardPage() {
  const { admin, loading, logout } = useAdministrativoAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !admin) router.replace("/administrativo/login");
  }, [loading, admin, router]);

  if (loading || !admin) return null;

  return (
    <div className="min-h-dvh bg-canvas">
      <header className="flex items-center justify-between border-b border-border bg-white px-4 sm:px-8 py-3">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 shrink-0">
            <Image src="/logo-j3.webp" alt="Comercializadora J3" fill className="object-contain" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink leading-tight">Comercializadora J3 Administrativo</p>
            <p className="text-[11px] text-muted leading-tight">Panel interno</p>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            router.push("/administrativo/login");
          }}
          className="flex items-center gap-1.5 text-sm font-medium text-ink hover:text-accent"
        >
          <LogOut size={15} />
          Cerrar sesión
        </button>
      </header>

      <main className="px-4 sm:px-8 py-10 max-w-3xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-surface-alt mb-4">
            <LayoutDashboard size={26} className="text-ink" />
          </div>
          <h1 className="text-xl font-semibold text-ink">Hola, {admin.name} 👋</h1>
          <p className="mt-2 text-sm text-muted">
            Sesión administrativa activa. Los módulos de seguimiento (inventario, ventas, pedidos, etc.) se irán
            agregando aquí a medida que los construyamos.
          </p>
        </div>

        <div className="mt-8">
          <Link
            href="/repartidor/login"
            className="flex items-center justify-between gap-3 rounded-tl-2xl border border-border bg-surface px-5 py-4 hover:border-ink transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 shrink-0 rounded-tl-lg bg-surface-alt flex items-center justify-center">
                <Truck size={19} className="text-ink" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">Módulo de repartidores</p>
                <p className="text-xs text-muted">Seguimiento de entregas, rutas y ubicación en vivo</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-muted" />
          </Link>
        </div>
      </main>
    </div>
  );
}
