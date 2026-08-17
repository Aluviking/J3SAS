"use client";

import { createContext, useContext, useEffect, useState } from "react";

type FavoritesContextValue = {
  ids: string[];
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);
const STORAGE_KEY = "j3sas_favorites";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setIds(JSON.parse(raw));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const persist = (next: string[]) => {
    setIds(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const isFavorite = (productId: string) => ids.includes(productId);

  const toggleFavorite = (productId: string) => {
    persist(ids.includes(productId) ? ids.filter((id) => id !== productId) : [...ids, productId]);
  };

  return (
    <FavoritesContext.Provider value={{ ids, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
