"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { initialCart, products, type CartItem, type Product } from "@/lib/mock-data";

export type CartLine = {
  index: number;
  item: CartItem;
  product: Product;
  unitPrice: number;
  wholesaleApplied: boolean;
};

type ConsumerCoupon = { type: "percent"; value: number } | { type: "free-shipping" };

type CartContextValue = {
  items: CartItem[];
  lines: CartLine[];
  addItem: (productId: string, size?: string) => void;
  updateQty: (index: number, qty: number) => void;
  removeItem: (index: number) => void;
  clearCart: () => void;
  subtotal: number;
  originalSubtotal: number;
  discount: number;
  wholesaleDiscount: number;
  promoCode: string | null;
  promoDiscount: number;
  applyPromoCode: (code: string) => { ok: boolean; error?: string };
  removePromoCode: () => void;
  freeShippingReason: "quantity" | "promo" | null;
  shipping: number;
  total: number;
  count: number;
};

const FREE_SHIPPING_MIN_ITEMS = 3;
const SHIPPING_COST = 12000;
const STORAGE_KEY = "j3sas_cart";

// Cupones de consumidor (distintos de los códigos de fabricante, que son para
// atribución B2B). Solo se incluyen aquí los que se pueden aplicar de forma
// inequívoca; "FLASH70" no está modelado como subconjunto de productos real.
const CONSUMER_COUPONS: Record<string, ConsumerCoupon> = {
  BIENVENIDA10: { type: "percent", value: 10 },
  ENVIOGRATIS: { type: "free-shipping" },
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(initialCart);
  const hydrated = useRef(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setItems(JSON.parse(raw));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        hydrated.current = true;
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage unavailable (private browsing, quota, blocked) — cart still works in-memory
    }
  }, [items]);

  const addItem = (productId: string, size?: string) => {
    setItems((prev) => {
      const existing = prev.findIndex(
        (i) => i.productId === productId && i.size === size
      );
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = { ...next[existing], qty: next[existing].qty + 1 };
        return next;
      }
      return [...prev, { productId, size, qty: 1 }];
    });
  };

  const updateQty = (index: number, qty: number) => {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((_, i) => i !== index);
      const next = [...prev];
      next[index] = { ...next[index], qty };
      return next;
    });
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => setItems([]);

  const [promoCode, setPromoCode] = useState<string | null>(null);

  const applyPromoCode = (code: string): { ok: boolean; error?: string } => {
    const key = code.trim().toUpperCase();
    if (!key) return { ok: false, error: "Ingresa un código." };
    if (!CONSUMER_COUPONS[key]) return { ok: false, error: "Ese código promocional no existe." };
    setPromoCode(key);
    return { ok: true };
  };

  const removePromoCode = () => setPromoCode(null);

  const {
    lines,
    subtotal,
    originalSubtotal,
    discount,
    wholesaleDiscount,
    promoDiscount,
    freeShippingReason,
    shipping,
    total,
    count,
  } = useMemo(() => {
    // El mayorista se activa por categoría (ej. todas las Camisetas juntas),
    // no por referencia exacta: mezclar diseños de la misma categoría cuenta.
    const qtyByCategory = new Map<string, number>();
    items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return;
      qtyByCategory.set(product.category, (qtyByCategory.get(product.category) ?? 0) + item.qty);
    });

    const lines: CartLine[] = [];
    let count = 0;
    let originalSubtotal = 0;
    let regularSubtotal = 0;
    let effectiveSubtotal = 0;

    items.forEach((item, index) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return;

      const totalQtyForCategory = qtyByCategory.get(product.category) ?? item.qty;
      const wholesaleApplied = Boolean(
        product.wholesalePrice &&
          product.wholesaleMinQty &&
          totalQtyForCategory >= product.wholesaleMinQty
      );
      const unitPrice = wholesaleApplied ? product.wholesalePrice! : product.price;

      lines.push({ index, item, product, unitPrice, wholesaleApplied });
      count += item.qty;
      originalSubtotal += (product.originalPrice ?? product.price) * item.qty;
      regularSubtotal += product.price * item.qty;
      effectiveSubtotal += unitPrice * item.qty;
    });

    const discount = originalSubtotal - regularSubtotal;
    const wholesaleDiscount = regularSubtotal - effectiveSubtotal;

    const coupon = promoCode ? CONSUMER_COUPONS[promoCode] : null;
    const promoDiscount =
      coupon?.type === "percent" ? Math.round(effectiveSubtotal * (coupon.value / 100)) : 0;
    const subtotalAfterPromo = effectiveSubtotal - promoDiscount;

    const qualifiesByQuantity = count >= FREE_SHIPPING_MIN_ITEMS;
    const qualifiesByPromo = coupon?.type === "free-shipping";
    const freeShippingReason: "quantity" | "promo" | null =
      effectiveSubtotal === 0
        ? null
        : qualifiesByQuantity
          ? "quantity"
          : qualifiesByPromo
            ? "promo"
            : null;
    const shipping = freeShippingReason ? 0 : effectiveSubtotal === 0 ? 0 : SHIPPING_COST;
    const total = subtotalAfterPromo + shipping;

    return {
      lines,
      subtotal: subtotalAfterPromo,
      originalSubtotal,
      discount,
      wholesaleDiscount,
      promoDiscount,
      freeShippingReason,
      shipping,
      total,
      count,
    };
  }, [items, promoCode]);

  return (
    <CartContext.Provider
      value={{
        items,
        lines,
        addItem,
        updateQty,
        removeItem,
        promoCode,
        promoDiscount,
        applyPromoCode,
        removePromoCode,
        clearCart,
        subtotal,
        originalSubtotal,
        discount,
        wholesaleDiscount,
        freeShippingReason,
        shipping,
        total,
        count,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
