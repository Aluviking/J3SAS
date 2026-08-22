"use client";

import { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
};

type StoredCustomer = User & { password: string };

type AuthResult = { ok: boolean; error?: string };

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => AuthResult;
  register: (name: string, email: string, password: string) => AuthResult;
  updateProfile: (updates: Partial<Pick<User, "name" | "email" | "phone">>) => AuthResult;
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
  try {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(list));
  } catch {
    // storage unavailable (private browsing, quota, blocked)
  }
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
    try {
      if (u) localStorage.setItem(SESSION_KEY, JSON.stringify(u));
      else localStorage.removeItem(SESSION_KEY);
    } catch {
      // storage unavailable (private browsing, quota, blocked) — session still works in-memory
    }
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

  const updateProfile = (updates: Partial<Pick<User, "name" | "email" | "phone">>): AuthResult => {
    if (!user) return { ok: false, error: "No has iniciado sesión." };

    if (updates.email) {
      const normalized = updates.email.trim().toLowerCase();
      const clash = getCustomers().some(
        (c) => c.id !== user.id && c.email.toLowerCase() === normalized
      );
      if (clash) return { ok: false, error: "Ya existe una cuenta registrada con ese correo." };
    }

    const customers = getCustomers();
    const updatedCustomers = customers.map((c) => (c.id === user.id ? { ...c, ...updates } : c));
    saveCustomers(updatedCustomers);
    persist({ ...user, ...updates });
    return { ok: true };
  };

  const logout = () => persist(null);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
