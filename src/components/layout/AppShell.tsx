"use client";

import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { AdministrativoAuthProvider } from "@/lib/administrativo-auth-context";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import { FabricanteAuthProvider } from "@/lib/fabricante-auth-context";
import { FavoritesProvider } from "@/lib/favorites-context";
import { RepartidorAuthProvider } from "@/lib/repartidor-auth-context";
import CartPanel from "./CartPanel";
import CelesteChat from "./CelesteChat";
import ClubPromoToast from "./ClubPromoToast";
import DeliveryNotificationToast from "./DeliveryNotificationToast";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";
import PromoBar from "./PromoBar";
import RescateToast from "./RescateToast";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import WhatsAppButton from "./WhatsAppButton";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartPanelOpen, setCartPanelOpen] = useState(true);

  // trailingSlash:true hace que Next sirva estas rutas como "/login/", etc.
  // — se normaliza quitando el "/" final antes de comparar por igualdad.
  const normalizedPath = pathname?.replace(/\/$/, "") || "";

  const isStandaloneAuthPage =
    normalizedPath.startsWith("/fabricantes") ||
    normalizedPath.startsWith("/administrativo") ||
    normalizedPath.startsWith("/repartidor") ||
    normalizedPath === "/login" ||
    normalizedPath === "/registro" ||
    normalizedPath === "/recuperar-contrasena";

  if (isStandaloneAuthPage) {
    return (
      <AuthProvider>
        <FabricanteAuthProvider>
          <AdministrativoAuthProvider>
            <RepartidorAuthProvider>
              <FavoritesProvider>
                <CartProvider>
                  <div className="min-h-screen bg-canvas">{children}</div>
                </CartProvider>
              </FavoritesProvider>
            </RepartidorAuthProvider>
          </AdministrativoAuthProvider>
        </FabricanteAuthProvider>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
    <FabricanteAuthProvider>
    <AdministrativoAuthProvider>
    <RepartidorAuthProvider>
    <FavoritesProvider>
    <CartProvider>
      <div className="flex flex-col min-h-screen bg-canvas">
        <PromoBar />
        <div className="flex flex-1">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div
            className={`flex-1 flex flex-col min-w-0 transition-[margin] duration-200 ${
              cartPanelOpen ? "xl:mr-80" : "xl:mr-0"
            }`}
          >
            <Suspense fallback={null}>
              <TopBar
                onMenuClick={() => setSidebarOpen(true)}
                onCartClick={() => setCartOpen(true)}
                onCartToggle={() => setCartPanelOpen((o) => !o)}
                cartPanelOpen={cartPanelOpen}
              />
            </Suspense>
            <main className="flex-1">{children}</main>
          </div>
          <CartPanel
            open={cartOpen}
            onClose={() => setCartOpen(false)}
            desktopOpen={cartPanelOpen}
            onCloseDesktop={() => setCartPanelOpen(false)}
          />
        </div>
        <Footer />
        {/* Reserva espacio real DESPUÉS del footer para que el navbar móvil
            (fixed, flota encima de lo que haya en pantalla) nunca lo tape —
            antes este padding estaba en <main>, que va ANTES del footer y
            por eso no servía para este caso. */}
        <div className="lg:hidden h-20 pb-[env(safe-area-inset-bottom)]" aria-hidden />
        <MobileBottomNav onCartClick={() => setCartOpen(true)} />
        <ClubPromoToast />
        <RescateToast />
        <DeliveryNotificationToast />
        <WhatsAppButton />
        <CelesteChat />
      </div>
    </CartProvider>
    </FavoritesProvider>
    </RepartidorAuthProvider>
    </AdministrativoAuthProvider>
    </FabricanteAuthProvider>
    </AuthProvider>
  );
}
