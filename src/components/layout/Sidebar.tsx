"use client";

import {
  Award,
  BadgeCheck,
  Heart,
  Home,
  Layers,
  LayoutGrid,
  LifeBuoy,
  MapPin,
  Package,
  Settings,
  Sparkles,
  Tag,
  Ticket,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/categorias", label: "Categorías", icon: LayoutGrid },
  { href: "/ofertas", label: "Ofertas", icon: Tag, badge: "Hot" },
  { href: "/nuevos", label: "Nuevos ingresos", icon: Sparkles },
  { href: "/mas-vendidos", label: "Más vendidos", icon: Award },
  { href: "/marcas", label: "Marcas", icon: BadgeCheck },
  { href: "/colecciones", label: "Colecciones", icon: Layers },
];

const accountItems = [
  { href: "/pedidos", label: "Mis pedidos", icon: Package },
  { href: "/favoritos", label: "Favoritos", icon: Heart },
  { href: "/cupones", label: "Cupones", icon: Ticket },
  { href: "/direcciones", label: "Direcciones", icon: MapPin },
  { href: "/cuenta", label: "Configuración", icon: Settings },
];

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { user } = useAuth();

  const linkClass = (href: string) => {
    const active = pathname === href;
    return `flex items-center gap-3 rounded-tl-md px-3 py-2.5 text-sm font-medium transition-colors ${
      active ? "bg-cta text-white" : "text-ink/70 hover:bg-surface-alt hover:text-ink"
    }`;
  };

  return (
    <>
      {open && (
        <div onClick={onClose} className="fixed inset-0 bg-black/40 z-40 lg:hidden" />
      )}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 shrink-0 bg-surface border-r border-border flex flex-col overflow-y-auto z-50 transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative px-4 pt-5 pb-4 flex justify-center border-b border-border shrink-0">
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="lg:hidden absolute top-4 right-4 w-8 h-8 rounded-tl-md bg-surface-alt flex items-center justify-center z-10"
          >
            <X size={16} className="text-ink" />
          </button>
          <Link href="/" className="relative w-24 h-48 shrink-0">
            <Image
              src="/logo-j3.webp"
              alt="Comercializadora J3"
              fill
              className="object-contain"
              priority
            />
          </Link>
        </div>

        {user && (
          <div className="px-4 mt-4">
            <Link
              href="/cuenta"
              className="flex items-center gap-2.5 bg-surface-alt rounded-tl-md px-3 py-2.5 hover:bg-brand-soft transition-colors"
            >
              <div className="w-8 h-8 rounded-tl-sm bg-ink text-white text-xs font-semibold flex items-center justify-center shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink truncate">{user.name}</p>
                <p className="text-xs text-muted truncate">{user.email}</p>
              </div>
            </Link>
          </div>
        )}

        <nav className="mt-4 px-3">
          <div className="space-y-0.5">
            {navItems.map(({ href, label, icon: Icon, badge }) => (
              <Link key={href} href={href} className={linkClass(href)}>
                <Icon size={18} />
                <span className="flex-1">{label}</span>
                {badge && (
                  <span className="text-[10px] font-semibold bg-accent text-white px-1.5 py-0.5 rounded-tl-sm">
                    {badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-border space-y-0.5">
            {accountItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className={linkClass(href)}>
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </nav>

        <div className="p-3">
          <div className="relative overflow-hidden rounded-tl-2xl bg-ink p-4">
            <p className="text-xs font-medium text-white/70">Oferta especial</p>
            <p className="mt-1 text-lg font-semibold text-white leading-tight">
              Hasta 50% de descuento
            </p>
            <Link
              href="/ofertas"
              className="mt-3 inline-block text-xs font-semibold bg-cta text-white px-3 py-1.5 rounded-tl-sm hover:bg-cta-dark transition-colors"
            >
              Ver ofertas
            </Link>
          </div>

          <Link
            href="/soporte"
            className="mt-3 w-full flex items-center gap-2 text-xs text-muted px-2 py-2 hover:text-ink transition-colors"
          >
            <LifeBuoy size={14} />
            Ayuda · Soporte 24/7
          </Link>
        </div>
      </aside>
    </>
  );
}
