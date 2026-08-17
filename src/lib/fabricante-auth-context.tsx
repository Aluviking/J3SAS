"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { fabricantes, findFabricanteByEmail, type Fabricante } from "@/lib/fabricantes-data";

type FabricanteAuthContextValue = {
  fabricante: Fabricante | null;
  loading: boolean;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
};

const FabricanteAuthContext = createContext<FabricanteAuthContextValue | null>(null);
const STORAGE_KEY = "j3sas_fabricante_id";

export function FabricanteAuthProvider({ children }: { children: React.ReactNode }) {
  const [fabricante, setFabricante] = useState<Fabricante | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const id = localStorage.getItem(STORAGE_KEY);
      if (id) {
        const found = fabricantes.find((f) => f.id === id);
        if (found) setFabricante(found);
      }
      setLoading(false);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const login = (email: string, password: string) => {
    const found = findFabricanteByEmail(email);
    if (!found || found.password !== password) {
      return { ok: false, error: "Correo o contraseña incorrectos." };
    }
    setFabricante(found);
    localStorage.setItem(STORAGE_KEY, found.id);
    return { ok: true };
  };

  const logout = () => {
    setFabricante(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <FabricanteAuthContext.Provider value={{ fabricante, loading, login, logout }}>
      {children}
    </FabricanteAuthContext.Provider>
  );
}

export function useFabricanteAuth() {
  const ctx = useContext(FabricanteAuthContext);
  if (!ctx) throw new Error("useFabricanteAuth must be used within FabricanteAuthProvider");
  return ctx;
}
