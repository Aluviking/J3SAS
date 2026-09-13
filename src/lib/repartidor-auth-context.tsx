"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { repartidores, findRepartidorByEmail, type Repartidor } from "@/lib/repartidores-data";

type RepartidorAuthContextValue = {
  repartidor: Repartidor | null;
  loading: boolean;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
};

const RepartidorAuthContext = createContext<RepartidorAuthContextValue | null>(null);
const STORAGE_KEY = "j3sas_repartidor_id";

export function RepartidorAuthProvider({ children }: { children: React.ReactNode }) {
  const [repartidor, setRepartidor] = useState<Repartidor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const id = localStorage.getItem(STORAGE_KEY);
        if (id) {
          const found = repartidores.find((r) => r.id === id);
          if (found) setRepartidor(found);
        }
      } catch {
        // storage unavailable
      }
      setLoading(false);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const login = (email: string, password: string) => {
    const found = findRepartidorByEmail(email);
    if (!found || found.password !== password) {
      return { ok: false, error: "Correo o contraseña incorrectos." };
    }
    setRepartidor(found);
    try {
      localStorage.setItem(STORAGE_KEY, found.id);
    } catch {
      // storage unavailable (privado/bloqueado) — la sesión sigue en memoria
    }
    return { ok: true };
  };

  const logout = () => {
    setRepartidor(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // storage unavailable
    }
  };

  return (
    <RepartidorAuthContext.Provider value={{ repartidor, loading, login, logout }}>
      {children}
    </RepartidorAuthContext.Provider>
  );
}

export function useRepartidorAuth() {
  const ctx = useContext(RepartidorAuthContext);
  if (!ctx) throw new Error("useRepartidorAuth must be used within RepartidorAuthProvider");
  return ctx;
}
