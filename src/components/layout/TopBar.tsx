"use client";

import { Bell, Heart, LogOut, Menu, Package, Search, Settings, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useFavorites } from "@/lib/favorites-context";

export default function TopBar({
  onMenuClick,
  onCartClick,
  onCartToggle,
  cartPanelOpen,
}: {
  onMenuClick: () => void;
  onCartClick: () => void;
  onCartToggle: () => void;
  cartPanelOpen: boolean;
}) {
  const { count } = useCart();
  const { user, logout } = useAuth();
  const { ids: favoriteIds } = useFavorites();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setQuery(searchParams.get("q") ?? "");
    });
    return () => cancelAnimationFrame(frame);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/buscar?q=${encodeURIComponent(q)}` : "/buscar");
  };

  return (
    <header className="sticky top-0 z-30 bg-canvas/95 backdrop-blur border-b border-border px-4 lg:px-8 py-4 flex items-center gap-3">
      <button
        onClick={onMenuClick}
        aria-label="Abrir menú"
        className="lg:hidden w-10 h-10 rounded-tl-lg bg-surface border border-border flex items-center justify-center shrink-0"
      >
        <Menu size={18} className="text-ink" />
      </button>

      <form
        onSubmit={handleSearch}
        className={`flex-1 flex items-center gap-2 bg-surface border border-border rounded-tl-lg pl-4 pr-1.5 py-2 max-w-xl transition-[max-width] duration-200 ${
          cartPanelOpen ? "xl:max-w-xl" : "xl:max-w-3xl"
        }`}
      >
        <button type="submit" aria-label="Buscar" className="shrink-0">
          <Search size={16} className="text-muted" />
        </button>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar productos, marcas y más..."
          className="flex-1 bg-transparent outline-none text-sm text-ink placeholder:text-muted min-w-0"
        />
      </form>

      <Link
        href="/favoritos"
        aria-label="Favoritos"
        className="hidden md:flex relative w-10 h-10 rounded-tl-lg bg-surface border border-border items-center justify-center shrink-0 transition-colors hover:border-ink"
      >
        <Heart size={17} className="text-ink" />
        {favoriteIds.length > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-tl-md bg-accent text-white text-[10px] font-semibold flex items-center justify-center">
            {favoriteIds.length}
          </span>
        )}
      </Link>
      <button className="hidden md:flex relative w-10 h-10 rounded-tl-lg bg-surface border border-border items-center justify-center shrink-0 transition-colors hover:border-ink">
        <Bell size={17} className="text-ink" />
        <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-accent" />
      </button>
      {user ? (
        <div className="relative hidden md:block">
          <button
            onClick={() => setAccountMenuOpen((o) => !o)}
            aria-label="Mi cuenta"
            aria-expanded={accountMenuOpen}
            className="w-10 h-10 rounded-tl-lg bg-surface border border-border flex items-center justify-center shrink-0 transition-colors hover:border-ink"
          >
            <span className="text-xs font-semibold text-ink">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </button>

          {accountMenuOpen && (
            <>
              <div
                onClick={() => setAccountMenuOpen(false)}
                className="fixed inset-0 z-40"
              />
              <div className="absolute right-0 top-12 z-50 w-56 bg-surface border border-border rounded-tl-lg shadow-lg py-1.5">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-sm font-medium text-ink truncate">{user.name}</p>
                  <p className="text-xs text-muted truncate">{user.email}</p>
                </div>
                <Link
                  href="/cuenta"
                  onClick={() => setAccountMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-ink hover:bg-surface-alt transition-colors"
                >
                  <Settings size={15} />
                  Mi cuenta
                </Link>
                <Link
                  href="/pedidos"
                  onClick={() => setAccountMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-ink hover:bg-surface-alt transition-colors"
                >
                  <Package size={15} />
                  Mis pedidos
                </Link>
                <Link
                  href="/favoritos"
                  onClick={() => setAccountMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-ink hover:bg-surface-alt transition-colors"
                >
                  <Heart size={15} />
                  Favoritos
                </Link>
                <button
                  onClick={() => {
                    setAccountMenuOpen(false);
                    logout();
                    router.push("/");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-accent hover:bg-accent-soft transition-colors border-t border-border mt-1"
                >
                  <LogOut size={15} />
                  Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <Link
          href="/login"
          aria-label="Iniciar sesión"
          className="hidden md:flex w-10 h-10 rounded-tl-lg bg-surface border border-border items-center justify-center shrink-0 transition-colors hover:border-ink"
        >
          <User size={17} className="text-ink" />
        </Link>
      )}
      <button
        onClick={onCartClick}
        aria-label="Abrir carrito"
        className="xl:hidden relative w-10 h-10 rounded-tl-lg bg-surface border border-border flex items-center justify-center shrink-0 transition-colors hover:border-ink"
      >
        <ShoppingBag size={17} className="text-ink" />
        {count > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-tl-md bg-accent text-white text-[10px] font-semibold flex items-center justify-center">
            {count}
          </span>
        )}
      </button>
      <button
        onClick={onCartToggle}
        aria-label={cartPanelOpen ? "Ocultar carrito" : "Mostrar carrito"}
        aria-pressed={cartPanelOpen}
        className="hidden xl:flex relative w-10 h-10 rounded-tl-lg bg-cta items-center justify-center shrink-0 transition-colors hover:bg-cta-dark"
      >
        <ShoppingBag size={17} className="text-white" />
        {count > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-tl-md bg-ink text-white text-[10px] font-semibold flex items-center justify-center">
            {count}
          </span>
        )}
      </button>
    </header>
  );
}
