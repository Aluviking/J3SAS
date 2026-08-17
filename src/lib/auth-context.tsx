"use client";

import { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
};

type StoredCustomer = User & { password: string };

type AuthResult = { ok: boolean; error?: string };

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => AuthResult;
  register: (name: string, email: string, password: string) => AuthResult;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const SESSION_KEY = "j3sas_user";
const CUSTOMERS_KEY = "j3sas_customers";

function getCustomers(): StoredCustomer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOMERS_KEY);
    return raw ? (JSON.parse(raw) as StoredCustomer[]) : [];
  } catch {
    return [];
  }
}

function saveCustomers(list: StoredCustomer[]) {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(list));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        try {
          setUser(JSON.parse(raw));
        } catch {
          localStorage.removeItem(SESSION_KEY);
        }
      }
      setLoading(false);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const persist = (u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    else localStorage.removeItem(SESSION_KEY);
  };

  const login = (email: string, password: string): AuthResult => {
    const normalized = email.trim().toLowerCase();
    const found = getCustomers().find((c) => c.email.toLowerCase() === normalized);
    if (!found || found.password !== password) {
      return { ok: false, error: "Correo o contraseña incorrectos." };
    }
    persist({ id: found.id, name: found.name, email: found.email });
    return { ok: true };
  };

  const register = (name: string, email: string, password: string): AuthResult => {
    const normalized = email.trim().toLowerCase();
    const customers = getCustomers();
    if (customers.some((c) => c.email.toLowerCase() === normalized)) {
      return { ok: false, error: "Ya existe una cuenta registrada con ese correo." };
    }
    const newCustomer: StoredCustomer = {
      id: `cus-${Date.now()}`,
      name,
      email,
      password,
    };
    saveCustomers([...customers, newCustomer]);
    persist({ id: newCustomer.id, name: newCustomer.name, email: newCustomer.email });
    return { ok: true };
  };

  const logout = () => persist(null);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
