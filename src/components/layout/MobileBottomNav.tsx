"use client";

import { Factory, Heart, Home, LayoutGrid, ShoppingBag, User, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useFabricanteAuth } from "@/lib/fabricante-auth-context";
import { useFavorites } from "@/lib/favorites-context";

type NavItem = {
  key: string;
  label: string;
  active: boolean;
  badge?: number;
  icon?: LucideIcon;
  initial?: string;
} & ({ href: string; onClick?: undefined } | { href?: undefined; onClick: () => void });

export default function MobileBottomNav({ onCartClick }: { onCartClick: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { fabricante } = useFabricanteAuth();
  const { count } = useCart();
  const { ids: favoriteIds } = useFavorites();

  // trailingSlash:true hace que Next sirva "/favoritos/" — se normaliza
  // quitando el "/" final antes de comparar por igualdad (igual que Sidebar).
  const normalizedPath = pathname && pathname !== "/" ? pathname.replace(/\/$/, "") : pathname;

  const items: NavItem[] = [
    { key: "inicio", href: "/", icon: Home, label: "Inicio", active: normalizedPath === "/" },
    {
      key: "subcategorias",
      href: "/categorias",
      icon: LayoutGrid,
      label: "Subcategorías",
      active: normalizedPath?.startsWith("/categorias") ?? false,
    },
    { key: "carrito", onClick: onCartClick, icon: ShoppingBag, label: "Carrito", active: false, badge: count },
    {
      key: "favoritos",
      href: "/favoritos",
      icon: Heart,
      label: "Favoritos",
      active: normalizedPath === "/favoritos",
      badge: favoriteIds.length,
    },
    {
      key: "cuenta",
      href: fabricante ? "/fabricantes/dashboard" : user ? "/cuenta" : "/login",
      icon: fabricante ? Factory : user ? undefined : User,
      initial: !fabricante && user ? user.name.charAt(0).toUpperCase() : undefined,
      label: fabricante ? "Fabricante" : user ? "Mi cuenta" : "Cuenta",
      active:
        normalizedPath === "/cuenta" ||
        normalizedPath === "/login" ||
        (normalizedPath?.startsWith("/fabricantes") ?? false),
    },
  ];

  const activeIndex = items.findIndex((i) => i.active);
  const activeItem = activeIndex >= 0 ? items[activeIndex] : null;
  const itemWidthPct = 100 / items.length;
  const bubbleCenterPct = activeIndex >= 0 ? (activeIndex + 0.5) * itemWidthPct : 0;

  // "Líquido" solo al navegar, nunca en loop: cuando el ítem activo cambia
  // se dispara un squish de gel una sola vez (se quita la clase al terminar
  // la animación, para poder volver a dispararla si el cliente sigue
  // tocando otros ítems seguido).
  const [morph, setMorph] = useState(false);
  const prevIndexRef = useRef<number | null>(null);
  useEffect(() => {
    if (prevIndexRef.current !== null && prevIndexRef.current !== activeIndex && activeIndex >= 0) {
      setMorph(true);
    }
    prevIndexRef.current = activeIndex;
  }, [activeIndex]);

  // Hueco real recortado en la barra (no solo la burbuja flotando encima).
  // IMPORTANTE: el gradiente va sin mask-size/mask-repeat propios — por
  // defecto un mask-image ya cubre el 100% de la caja con "black" (visible)
  // en todos lados excepto el círculo transparente. Un intento anterior fijó
  // un "sello" de 60x60 con mask-repeat:no-repeat para poder animar la
  // posición, pero eso deja TODO lo que está fuera de ese sello sin máscara
  // definida — y CSS trata lo no cubierto como transparente, volviendo
  // invisible el resto de la barra.
  // El hueco va a propósito MÁS GRANDE que la burbuja (radio 40 vs. los 30
  // del círculo) — así siempre queda un anillo de espacio visible alrededor
  // del círculo, sin importar qué tan cerca de la barra flote.
  // "Efecto líquido": la posición "at X%" queda fija en el string del
  // gradiente (vía la variable --bubble-pos, registrada con @property en
  // globals.css) y solo esa variable cambia por render — así el navegador
  // SÍ interpola la transición suave del hueco (un string de gradiente
  // distinto en cada render no se puede animar, pero una variable numérica
  // registrada sí), en vez de que el hueco salte de golpe a la posición.
  const LIQUID_EASE = "cubic-bezier(0.34, 1.56, 0.64, 1)";
  const maskStyle: CSSProperties | undefined =
    activeIndex >= 0
      ? ({
          WebkitMaskImage: "radial-gradient(circle 40px at var(--bubble-pos) 0px, transparent 38px, black 40.5px)",
          maskImage: "radial-gradient(circle 40px at var(--bubble-pos) 0px, transparent 38px, black 40.5px)",
          "--bubble-pos": `${bubbleCenterPct}%`,
          transition: `--bubble-pos 0.4s ${LIQUID_EASE}`,
        } as CSSProperties)
      : undefined;

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-3 z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="relative">
        {/* fondo de la barra, con el hueco recortado — capa aparte para que
            el recorte nunca afecte a los íconos ni a la burbuja de encima.
            El "squish" líquido va AQUÍ (la barra), no en el círculo — el
            círculo sigue solo deslizándose. Al estar en su propia capa
            separada de los íconos, el squish nunca mueve ni deforma el
            contenido (textos/íconos), solo el fondo oscuro con el hueco. */}
        <div
          onAnimationEnd={() => setMorph(false)}
          className={`absolute inset-0 bg-ink border border-white/15 rounded-full shadow-2xl ${
            morph ? "animate-liquid-squish" : ""
          }`}
          style={maskStyle}
        />

        {/* burbuja flotante: separada de la barra (no la toca), el hueco de
            abajo solo insinúa de dónde "salió" */}
        {activeItem && (
          <div
            className="absolute w-[60px] h-[60px] -top-[28px] rounded-full bg-cta shadow-lg flex items-center justify-center transition-[left] duration-[0.4s]"
            style={{ left: `calc(${bubbleCenterPct}% - 30px)`, transitionTimingFunction: LIQUID_EASE }}
          >
            {activeItem.initial ? (
              <span className="text-base font-bold text-white">{activeItem.initial}</span>
            ) : (
              activeItem.icon && <activeItem.icon size={22} className="text-white" />
            )}
          </div>
        )}

        <div className="relative flex items-stretch px-1">
          {items.map((item, i) => {
            const isActive = i === activeIndex;
            const content = (
              <>
                {!isActive && (
                  <span className="relative">
                    {item.initial ? (
                      <span className="text-xs font-semibold text-white/70">{item.initial}</span>
                    ) : (
                      item.icon && <item.icon size={19} className="text-white/60" />
                    )}
                    {!!item.badge && (
                      <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] px-0.5 rounded-full bg-accent text-white text-[9px] font-semibold flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </span>
                )}
                <span className={`text-[9px] font-medium ${isActive ? "text-white mt-6" : "text-white/60"}`}>
                  {item.label}
                </span>
              </>
            );

            const className = "flex-1 flex flex-col items-center justify-center gap-1 py-3";

            return item.href ? (
              <Link key={item.key} href={item.href} className={className}>
                {content}
              </Link>
            ) : (
              <button key={item.key} onClick={item.onClick} className={className}>
                {content}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
