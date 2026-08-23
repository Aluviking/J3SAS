"use client";

import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import { FabricanteAuthProvider } from "@/lib/fabricante-auth-context";
import { FavoritesProvider } from "@/lib/favorites-context";
import CartPanel from "./CartPanel";
import ClubPromoToast from "./ClubPromoToast";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";
import PromoBar from "./PromoBar";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import WhatsAppButton from "./WhatsAppButton";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartPanelOpen, setCartPanelOpen] = useState(true);

  const isStandaloneAuthPage =
    pathname?.startsWith("/fabricantes") ||
    pathname === "/login" ||
    pathname === "/registro" ||
    pathname === "/recuperar-contrasena";

  if (isStandaloneAuthPage) {
    return (
      <AuthProvider>
        <FabricanteAuthProvider>
          <FavoritesProvider>
            <CartProvider>
              <div className="min-h-screen bg-canvas">{children}</div>
            </CartProvider>
          </FavoritesProvider>
        </FabricanteAuthProvider>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
    <FabricanteAuthProvider>
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
            <main className="flex-1 pb-16 lg:pb-0">{children}</main>
          </div>
          <CartPanel
            open={cartOpen}
            onClose={() => setCartOpen(false)}
            desktopOpen={cartPanelOpen}
            onCloseDesktop={() => setCartPanelOpen(false)}
          />
        </div>
        <Footer />
        <MobileBottomNav onCartClick={() => setCartOpen(true)} />
        <ClubPromoToast />
        <WhatsAppButton />
      </div>
    </CartProvider>
    </FavoritesProvider>
    </FabricanteAuthProvider>
    </AuthProvider>
  );
}
