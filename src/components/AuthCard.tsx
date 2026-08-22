"use client";

import { ArrowLeft, Check, Eye, EyeOff, Lock, Mail, Shield, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";

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

type Tab = "login" | "registro";

export default function AuthCard({ initialTab }: { initialTab: Tab }) {
  const { user, loading, login, register } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(initialTab);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  const inputClass = (field: string) =>
    `w-full bg-surface-alt border rounded-tl-md pl-9 pr-3 py-2.5 text-sm text-ink placeholder:text-muted outline-none ${
      fieldErrors[field] ? "border-accent" : "border-border"
    }`;

  const switchTab = (next: Tab) => {
    if (next === tab) return;
    setTab(next);
    setFieldErrors({});
    setFormError("");
    setCaptchaChecked(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (tab === "login") {
      if (!email) errs.email = "Ingresa tu correo.";
      if (!password) errs.password = "Ingresa tu contraseña.";
      if (Object.keys(errs).length > 0) {
        setFieldErrors(errs);
        setFormError("Completa los campos marcados.");
        return;
      }
      if (!captchaChecked) {
        setFieldErrors({});
        setFormError("Confirma que no eres un robot.");
        return;
      }
      const result = login(email, password);
      if (!result.ok) {
        setFieldErrors({ password: " " });
        setFormError(result.error ?? "No se pudo iniciar sesión.");
        return;
      }
      setFieldErrors({});
      setFormError("");
      router.push("/cuenta");
    } else {
      if (!name) errs.name = "Ingresa tu nombre.";
      if (!email) errs.email = "Ingresa tu correo.";
      if (!password) errs.password = "Ingresa una contraseña.";
      if (!confirm) errs.confirm = "Confirma tu contraseña.";
      if (password && confirm && password !== confirm) {
        errs.password = " ";
        errs.confirm = "Las contraseñas no coinciden.";
      }
      if (Object.keys(errs).length > 0) {
        setFieldErrors(errs);
        setFormError("Revisa los campos marcados.");
        return;
      }
      if (!captchaChecked) {
        setFieldErrors({});
        setFormError("Confirma que no eres un robot.");
        return;
      }
      const result = register(name, email, password);
      if (!result.ok) {
        setFieldErrors({ email: " " });
        setFormError(result.error ?? "No se pudo crear la cuenta.");
        return;
      }
      setFieldErrors({});
      setFormError("");
      router.push("/cuenta");
    }
  };

  if (!loading && user) {
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
            Estás conectado como <span className="font-medium text-ink">{user.name}</span>.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link href="/" className="rounded-tl-md border border-border px-4 py-2.5 text-sm font-semibold text-ink hover:border-ink">
              Volver al sitio
            </Link>
            <Link href="/cuenta" className="rounded-tl-md bg-cta px-4 py-2.5 text-sm font-semibold text-white hover:bg-cta-dark">
              Mi cuenta
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh grid grid-rows-[auto_1fr_auto] items-center justify-items-center px-4 py-4 overflow-x-hidden">
      {/* Blurred backdrop */}
      <Image
        src="/banners/banner1.webp"
        alt=""
        fill
        priority
        className="object-cover"
        style={{ filter: "blur(20px) brightness(0.6)", transform: "scale(1.1)" }}
      />

      <div className="relative w-full max-w-6xl mb-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white hover:text-white/80"
        >
          <ArrowLeft size={15} />
          Volver al sitio
        </Link>
      </div>

      <div className="relative w-full h-auto lg:h-full max-w-6xl border border-white/20 rounded-tl-3xl overflow-hidden shadow-2xl">
        {/* Graphic panel: absolutely positioned so form content can never affect its size */}
        <div className="hidden lg:block absolute inset-y-0 left-0 w-1/2">
          <Image
            src="/banners/banner1.webp"
            alt="Comercializadora J3"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Form panel */}
        <div className="relative w-full lg:w-1/2 lg:ml-[50%] h-auto lg:h-full p-6 sm:p-8 lg:p-9 flex flex-col justify-start lg:justify-center bg-white overflow-hidden">
          <div className="mb-4 flex justify-end lg:mb-0 lg:block">
            <Link href="/" className="lg:absolute lg:top-10 lg:right-10">
              <div className="relative w-10 h-10 lg:h-20">
                <Image src="/logo-j3.webp" alt="Comercializadora J3" fill className="object-contain" />
              </div>
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              type="button"
              onClick={() => switchTab("login")}
              className={`flex-1 sm:flex-none sm:px-6 pb-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                tab === "login" ? "border-cta text-ink" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              Ingresar
            </button>
            <button
              type="button"
              onClick={() => switchTab("registro")}
              className={`flex-1 sm:flex-none sm:px-6 pb-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                tab === "registro" ? "border-cta text-ink" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              Crear cuenta
            </button>
          </div>

          <h1 className="mt-3 text-xl font-semibold text-ink">
            {tab === "login" ? "Inicia sesión" : "Crea tu cuenta"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {tab === "login"
              ? "Ingresa a tu cuenta de Comercializadora J3."
              : "Regístrate para comprar más rápido."}
          </p>

          <form onSubmit={handleSubmit} className="mt-3 space-y-2">
            {tab === "registro" && (
              <div>
                <label className="text-xs font-medium text-ink">Nombre completo</label>
                <div className="relative mt-1.5">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                    className={inputClass("name")}
                  />
                </div>
                {fieldErrors.name && (
                  <p className="mt-1 text-xs text-accent">{fieldErrors.name}</p>
                )}
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-ink">Correo electrónico</label>
              <div className="relative mt-1.5">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  className={inputClass("email")}
                />
              </div>
              {fieldErrors.email && fieldErrors.email.trim() && (
                <p className="mt-1 text-xs text-accent">{fieldErrors.email}</p>
              )}
            </div>

            {tab === "registro" ? (
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-medium text-ink">Contraseña</label>
                  <div className="relative mt-1.5">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={inputClass("password").replace("pr-3", "pr-9")}
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
                  {fieldErrors.password && fieldErrors.password.trim() && (
                    <p className="mt-1 text-xs text-accent">{fieldErrors.password}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-ink">Confirmar</label>
                  <div className="relative mt-1.5">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      className={inputClass("confirm")}
                    />
                  </div>
                  {fieldErrors.confirm && (
                    <p className="mt-1 text-xs text-accent">{fieldErrors.confirm}</p>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <label className="text-xs font-medium text-ink">Contraseña</label>
                <div className="relative mt-1.5">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass("password").replace("pr-3", "pr-9")}
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
                <div className="mt-1.5 flex items-center justify-between">
                  {fieldErrors.password && fieldErrors.password.trim() ? (
                    <p className="text-xs text-accent">{fieldErrors.password}</p>
                  ) : (
                    <span />
                  )}
                  <Link href="/recuperar-contrasena" className="text-xs text-muted hover:text-ink">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setCaptchaChecked((c) => !c);
                setFormError("");
              }}
              aria-pressed={captchaChecked}
              className="w-fit ml-auto flex items-center gap-3 border border-border rounded-tl-md pl-4 pr-5 py-2 bg-surface-alt/60 hover:border-ink transition-colors"
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

            {formError && <p className="text-xs text-accent">{formError}</p>}
            <button
              type="submit"
              className="w-full bg-cta text-white text-sm font-semibold py-2.5 rounded-tl-lg hover:bg-cta-dark transition-colors"
            >
              {tab === "login" ? "Iniciar sesión" : "Crear cuenta"}
            </button>
          </form>

          <div className="mt-3 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted">Síguenos en</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="mt-2.5 grid grid-cols-2 gap-3">
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
