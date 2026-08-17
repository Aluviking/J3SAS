"use client";

import { ArrowLeft, Check, Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useFabricanteAuth } from "@/lib/fabricante-auth-context";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path d="M13.5 21v-7.6h2.6l.4-3H13.5V8.4c0-.87.24-1.46 1.5-1.46h1.6V4.28C16.3 4.2 15.4 4.1 14.35 4.1c-2.2 0-3.7 1.34-3.7 3.8v2.5H8v3h2.65V21h2.85Z" />
    </svg>
  );
}

export default function FabricanteLoginPage() {
  const { fabricante, loading, login } = useFabricanteAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!captchaChecked) {
      setError("Confirma que no eres un robot.");
      return;
    }
    const result = login(email, password);
    if (!result.ok) {
      setError(result.error ?? "No se pudo iniciar sesión.");
      return;
    }
    router.push("/fabricantes/dashboard");
  };

  if (!loading && fabricante) {
    return (
      <div className="relative min-h-dvh flex items-center justify-center px-4 py-8 overflow-x-hidden">
        <Image
          src="/banners/banner1.webp"
          alt=""
          fill
          priority
          className="object-cover"
          style={{ filter: "blur(20px) brightness(0.6)", transform: "scale(1.1)" }}
        />
        <div className="relative w-full max-w-md rounded-tl-3xl bg-white p-6 sm:p-8 text-center shadow-2xl">
          <div className="relative mx-auto h-12 w-12">
            <Image src="/logo-j3.webp" alt="Comercializadora J3" fill className="object-contain" />
          </div>
          <h1 className="mt-4 text-xl font-semibold text-ink">Ya tienes una sesión activa</h1>
          <p className="mt-2 text-sm text-muted">
            Estás conectado como <span className="font-medium text-ink">{fabricante.businessName}</span>.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link href="/" className="rounded-tl-md border border-border px-4 py-2.5 text-sm font-semibold text-ink hover:border-ink">
              Volver al sitio
            </Link>
            <Link href="/fabricantes/dashboard" className="rounded-tl-md bg-cta px-4 py-2.5 text-sm font-semibold text-white hover:bg-cta-dark">
              Ir al panel
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen flex flex-col items-center px-4 py-4 overflow-hidden">
      {/* Blurred backdrop */}
      <Image
        src="/banners/banner1.webp"
        alt=""
        fill
        priority
        className="object-cover"
        style={{ filter: "blur(20px) brightness(0.6)", transform: "scale(1.1)" }}
      />

      <div className="relative w-full max-w-6xl mb-2 shrink-0">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white hover:text-white/80"
        >
          <ArrowLeft size={15} />
          Volver al sitio
        </Link>
      </div>

      <div className="relative w-full max-w-6xl flex-1 min-h-0 border border-white/20 rounded-tl-3xl overflow-hidden grid lg:grid-cols-2 shadow-2xl">
        {/* Graphic panel */}
        <div className="hidden lg:block relative">
          <Image
            src="/banners/banner1.webp"
            alt="Comercializadora J3"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Form panel */}
        <div className="relative p-8 sm:p-9 lg:p-10 flex flex-col justify-center bg-white">
          <Link href="/" className="absolute top-8 right-8 sm:top-9 sm:right-9 lg:top-10 lg:right-10">
            <div className="relative w-10 h-20">
              <Image src="/logo-j3.webp" alt="Comercializadora J3" fill className="object-contain" />
            </div>
          </Link>

          <h1 className="text-2xl font-semibold text-ink">Portal de fabricantes</h1>
          <p className="mt-1.5 text-sm text-muted">
            Ingresa a tu cuenta para ver tu inventario y tus ventas.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <div>
              <label className="text-xs font-medium text-ink">Correo electrónico</label>
              <div className="relative mt-1.5">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tuempresa@ejemplo.com"
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
            <button
              type="button"
              onClick={() => {
                setCaptchaChecked((c) => !c);
                setError("");
              }}
              aria-pressed={captchaChecked}
              className="w-fit ml-auto flex items-center gap-3 border border-border rounded-tl-md pl-4 pr-5 py-3 bg-surface-alt/60 hover:border-ink transition-colors"
            >
              <span
                className={`w-5 h-5 rounded-tl-sm border flex items-center justify-center shrink-0 transition-colors ${
                  captchaChecked ? "bg-brand border-brand" : "bg-white border-border"
                }`}
              >
                {captchaChecked && <Check size={13} className="text-white" />}
              </span>
              <span className="text-sm text-ink text-left">No soy un robot</span>
              <span className="flex flex-col items-center gap-0.5 shrink-0">
                <span className="relative w-5 h-5 flex items-center justify-center">
                  <Shield size={20} className="text-green-600" fill="currentColor" />
                  <Check size={10} strokeWidth={3.5} className="absolute text-white" />
                </span>
                <span className="text-[9px] text-muted leading-none">reCAPTCHA</span>
              </span>
            </button>

            {error && <p className="text-xs text-accent">{error}</p>}
            <button
              type="submit"
              className="w-full bg-cta text-white text-sm font-semibold py-3 rounded-tl-lg hover:bg-cta-dark transition-colors"
            >
              Iniciar sesión
            </button>
          </form>

          <div className="mt-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted">Síguenos en</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 border border-border rounded-tl-md py-2.5 text-sm font-medium text-ink hover:border-ink transition-colors"
            >
              <InstagramIcon />
              Instagram
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 border border-border rounded-tl-md py-2.5 text-sm font-medium text-ink hover:border-ink transition-colors"
            >
              <FacebookIcon />
              Facebook
            </button>
          </div>
        </div>
      </div>

      <div className="relative w-full max-w-6xl mt-2 shrink-0 flex justify-center">
        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-center">
          <p className="text-xs text-white/70">
            © {new Date().getFullYear()} Comercializadora J3. Todos los derechos reservados.
          </p>
          <span className="hidden sm:inline text-white/30">·</span>
          <p className="text-xs text-white/70">
            Powered by <span className="text-white font-semibold">Rubik Control Digital</span>
          </p>
        </div>
      </div>
    </div>
  );
}
