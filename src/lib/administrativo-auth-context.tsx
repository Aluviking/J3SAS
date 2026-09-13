"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { adminUsers, findAdminByEmail, type AdminUser } from "@/lib/administrativo-data";

type AdministrativoAuthContextValue = {
  admin: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
};

const AdministrativoAuthContext = createContext<AdministrativoAuthContextValue | null>(null);
const STORAGE_KEY = "j3sas_admin_id";

export function AdministrativoAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const id = localStorage.getItem(STORAGE_KEY);
        if (id) {
          const found = adminUsers.find((a) => a.id === id);
          if (found) setAdmin(found);
        }
      } catch {
        // storage unavailable
      }
      setLoading(false);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const login = (email: string, password: string) => {
    const found = findAdminByEmail(email);
    if (!found || found.password !== password) {
      return { ok: false, error: "Correo o contraseña incorrectos." };
    }
    setAdmin(found);
    try {
      localStorage.setItem(STORAGE_KEY, found.id);
    } catch {
      // storage unavailable (privado/bloqueado) — la sesión sigue en memoria
    }
    return { ok: true };
  };

  const logout = () => {
    setAdmin(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // storage unavailable
    }
  };

  return (
    <AdministrativoAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdministrativoAuthContext.Provider>
  );
}

export function useAdministrativoAuth() {
  const ctx = useContext(AdministrativoAuthContext);
  if (!ctx) throw new Error("useAdministrativoAuth must be used within AdministrativoAuthProvider");
  return ctx;
}
