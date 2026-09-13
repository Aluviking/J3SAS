"use client";

import { ArrowLeft, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAdministrativoAuth } from "@/lib/administrativo-auth-context";

export default function AdministrativoLoginPage() {
  const { admin, loading, login } = useAdministrativoAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const result = login(email, password);
    if (!result.ok) {
      setError(result.error ?? "No se pudo iniciar sesión.");
      return;
    }
    router.push("/administrativo/dashboard");
  };

  if (!loading && admin) {
    return (
      <div className="relative min-h-dvh flex items-center justify-center px-4 py-8 bg-ink">
        <div className="relative w-full max-w-md rounded-tl-3xl bg-white p-6 sm:p-8 text-center shadow-2xl">
          <div className="relative mx-auto h-12 w-12">
            <Image src="/logo-j3.webp" alt="Comercializadora J3" fill className="object-contain" />
          </div>
          <h1 className="mt-4 text-xl font-semibold text-ink">Ya tienes una sesión activa</h1>
          <p className="mt-2 text-sm text-muted">
            Conectado como <span className="font-medium text-ink">{admin.name}</span>.
          </p>
          <Link
            href="/administrativo/dashboard"
            className="mt-6 block rounded-tl-md bg-cta px-4 py-2.5 text-sm font-semibold text-white hover:bg-cta-dark"
          >
            Ir al panel administrativo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh flex flex-col items-center justify-center px-4 py-8 bg-ink">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white mb-4">
          <ArrowLeft size={15} />
          Volver al sitio
        </Link>

        <div className="rounded-tl-3xl bg-white p-8 sm:p-9 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 shrink-0">
              <Image src="/logo-j3.webp" alt="Comercializadora J3" fill className="object-contain" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Uso interno</p>
              <h1 className="text-lg font-semibold text-ink leading-tight">
                Login Comercializadora J3 Administrativo
              </h1>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted">
            Acceso exclusivo del equipo administrativo. No es el portal de clientes ni de fabricantes.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <div>
              <label className="text-xs font-medium text-ink">Correo electrónico</label>
              <div className="relative mt-1.5">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@j3sas.co"
                  className="w-full bg-surface-alt border border-border rounded-tl-md pl-9 pr-3 py-2.5 text-sm text-ink placeholder:text-muted outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-ink">Contraseña</label>
              <div className="relative mt-1.5">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-alt border border-border rounded-tl-md pl-9 pr-9 py-2.5 text-sm text-ink placeholder:text-muted outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-accent">{error}</p>}
            <button
              type="submit"
              className="w-full bg-cta text-white text-sm font-semibold py-3 rounded-tl-lg hover:bg-cta-dark transition-colors"
            >
              Iniciar sesión
            </button>
          </form>

          <div className="mt-5 flex items-center gap-2 text-[11px] text-muted">
            <ShieldCheck size={14} />
            Este panel no es visible ni accesible desde la tienda en línea.
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-white/50">
          © {new Date().getFullYear()} Comercializadora J3 · Módulo Administrativo
        </p>
      </div>
    </div>
  );
}
