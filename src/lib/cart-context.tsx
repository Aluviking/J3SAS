"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { initialCart, products, type CartItem, type Product } from "@/lib/mock-data";

export type CartLine = {
  index: number;
  item: CartItem;
  product: Product;
  unitPrice: number;
  wholesaleApplied: boolean;
};

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
  freeShippingReason: "amount" | "quantity" | null;
  shipping: number;
  total: number;
  count: number;
};

const FREE_SHIPPING_THRESHOLD = 150000;
const FREE_SHIPPING_MIN_ITEMS = 3;
const SHIPPING_COST = 12000;

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(initialCart);

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

  const {
    lines,
    subtotal,
    originalSubtotal,
    discount,
    wholesaleDiscount,
    freeShippingReason,
    shipping,
    total,
    count,
  } = useMemo(() => {
    // Same "reference" (product) can be split across sizes; the wholesale
    // tier looks at the total quantity per product, not per size line.
    const qtyByProduct = new Map<string, number>();
    items.forEach((item) => {
      qtyByProduct.set(item.productId, (qtyByProduct.get(item.productId) ?? 0) + item.qty);
    });

    const lines: CartLine[] = [];
    let count = 0;
    let originalSubtotal = 0;
    let regularSubtotal = 0;
    let effectiveSubtotal = 0;

    items.forEach((item, index) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return;

      const totalQtyForProduct = qtyByProduct.get(item.productId) ?? item.qty;
      const wholesaleApplied = Boolean(
        product.wholesalePrice &&
          product.wholesaleMinQty &&
          totalQtyForProduct >= product.wholesaleMinQty
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

    const qualifiesByAmount = effectiveSubtotal >= FREE_SHIPPING_THRESHOLD;
    const qualifiesByQuantity = count > FREE_SHIPPING_MIN_ITEMS;
    const freeShippingReason: "amount" | "quantity" | null =
      effectiveSubtotal === 0
        ? null
        : qualifiesByAmount
          ? "amount"
          : qualifiesByQuantity
            ? "quantity"
            : null;
    const shipping = freeShippingReason ? 0 : effectiveSubtotal === 0 ? 0 : SHIPPING_COST;
    const total = effectiveSubtotal + shipping;

    return {
      lines,
      subtotal: effectiveSubtotal,
      originalSubtotal,
      discount,
      wholesaleDiscount,
      freeShippingReason,
      shipping,
      total,
      count,
    };
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        lines,
        addItem,
        updateQty,
        removeItem,
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
