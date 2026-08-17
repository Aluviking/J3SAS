"use client";

import { Heart, Home, LayoutGrid, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useFavorites } from "@/lib/favorites-context";

export default function MobileBottomNav({ onCartClick }: { onCartClick: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { count } = useCart();
  const { ids: favoriteIds } = useFavorites();

  const itemClass = (active: boolean) =>
    `flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 text-[10px] font-medium transition-colors ${
      active ? "text-cta" : "text-muted"
    }`;

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-border flex items-stretch pb-[env(safe-area-inset-bottom)]">
      <Link href="/" className={itemClass(pathname === "/")}>
        <Home size={19} />
        Inicio
      </Link>
      <Link href="/categorias" className={itemClass(pathname?.startsWith("/categorias") ?? false)}>
        <LayoutGrid size={19} />
        Categorías
      </Link>
      <button onClick={onCartClick} className={`relative ${itemClass(false)}`}>
        <ShoppingBag size={19} />
        Carrito
        {count > 0 && (
          <span className="absolute top-0 right-1/2 translate-x-3.5 min-w-[15px] h-[15px] px-0.5 rounded-tl-sm bg-accent text-white text-[9px] font-semibold flex items-center justify-center">
            {count}
          </span>
        )}
      </button>
      <Link href="/favoritos" className={`relative ${itemClass(pathname === "/favoritos")}`}>
        <Heart size={19} />
        Favoritos
        {favoriteIds.length > 0 && (
          <span className="absolute top-0 right-1/2 translate-x-3.5 min-w-[15px] h-[15px] px-0.5 rounded-tl-sm bg-accent text-white text-[9px] font-semibold flex items-center justify-center">
            {favoriteIds.length}
          </span>
        )}
      </Link>
      <Link
        href={user ? "/cuenta" : "/login"}
        target={user ? undefined : "_blank"}
        rel={user ? undefined : "noopener noreferrer"}
        className={itemClass(pathname === "/cuenta" || pathname === "/login")}
      >
        <User size={19} />
        Cuenta
      </Link>
    </nav>
  );
}
