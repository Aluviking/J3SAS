"use client";

import { LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function CuentaPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");

  if (loading) return null;

  if (!user) {
    return (
      <div className="px-4 lg:px-8 py-5">
        <div className="text-sm text-muted mb-3">
          <Link href="/" className="hover:text-ink">
            Inicio
          </Link>{" "}
          / <span className="text-ink">Configuración</span>
        </div>

        <h1 className="text-xl font-semibold text-ink">Configuración</h1>

        <div className="mt-6 flex flex-col items-center justify-center text-center bg-surface border border-border rounded-tl-2xl py-16 px-6">
          <div className="w-14 h-14 rounded-tl-lg bg-surface-alt flex items-center justify-center">
            <User size={24} className="text-muted" />
          </div>
          <p className="mt-4 font-semibold text-ink">No has iniciado sesión</p>
          <p className="mt-1 text-sm text-muted max-w-xs">
            Inicia sesión para ver y editar los datos de tu cuenta.
          </p>
          <Link
            href="/login"
            className="mt-5 inline-block text-sm font-semibold bg-ink text-white px-5 py-2.5 rounded-tl-md hover:bg-cta transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-8 py-5">
      <div className="text-sm text-muted mb-3">
        <Link href="/" className="hover:text-ink">
          Inicio
        </Link>{" "}
        / <span className="text-ink">Configuración</span>
      </div>

      <h1 className="text-xl font-semibold text-ink">Configuración</h1>
      <p className="mt-1 text-sm text-muted">Administra los datos de tu cuenta.</p>

      <div className="mt-5 max-w-md bg-surface border border-border rounded-tl-2xl p-5 space-y-4">
        <div>
          <label className="text-xs font-medium text-ink">Nombre completo</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full bg-surface-alt border border-border rounded-tl-md px-3 py-2 text-sm text-ink outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-ink">Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full bg-surface-alt border border-border rounded-tl-md px-3 py-2 text-sm text-ink outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-ink">Teléfono</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+57 300 000 0000"
            className="mt-1.5 w-full bg-surface-alt border border-border rounded-tl-md px-3 py-2 text-sm text-ink placeholder:text-muted outline-none"
          />
        </div>
        <button className="w-full bg-ink text-white text-sm font-semibold py-2.5 rounded-tl-md hover:bg-cta transition-colors">
          Guardar cambios
        </button>
      </div>

      <button
        onClick={() => {
          logout();
          router.push("/");
        }}
        className="mt-4 flex items-center gap-2 text-sm font-medium text-accent hover:underline"
      >
        <LogOut size={15} />
        Cerrar sesión
      </button>
    </div>
  );
}
