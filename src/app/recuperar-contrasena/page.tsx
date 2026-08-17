"use client";

import { ArrowLeft, Check, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Ingresa tu correo electrónico.");
      return;
    }
    setError("");
    setSent(true);
  };

  return (
    <div className="relative h-screen grid grid-rows-[auto_1fr_auto] items-center justify-items-center px-4 py-4 overflow-hidden">
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
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white hover:text-white/80"
        >
          <ArrowLeft size={15} />
          Volver al login
        </Link>
      </div>

      <div className="relative w-full h-full max-w-6xl border border-white/20 rounded-tl-3xl overflow-hidden shadow-2xl">
        <div className="hidden lg:block absolute inset-y-0 left-0 w-1/2">
          <Image
            src="/banners/banner1.webp"
            alt="Comercializadora J3"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="relative w-full lg:w-1/2 lg:ml-[50%] h-full p-6 sm:p-8 lg:p-9 flex flex-col justify-center bg-white overflow-hidden">
          <Link href="/" className="absolute top-8 right-8 sm:top-9 sm:right-9 lg:top-10 lg:right-10">
            <div className="relative w-10 h-20">
              <Image src="/logo-j3.webp" alt="Comercializadora J3" fill className="object-contain" />
            </div>
          </Link>

          {sent ? (
            <div className="max-w-sm">
              <div className="w-11 h-11 rounded-tl-lg bg-brand-soft flex items-center justify-center">
                <Check size={20} className="text-brand" />
              </div>
              <h1 className="mt-4 text-xl font-semibold text-ink">Revisa tu correo</h1>
              <p className="mt-2 text-sm text-muted">
                Si <span className="font-medium text-ink">{email}</span> tiene una cuenta con
                nosotros, te enviamos un enlace para restablecer tu contraseña.
              </p>
              <Link
                href="/login"
                className="mt-5 inline-block text-sm font-semibold bg-ink text-white px-5 py-2.5 rounded-tl-md hover:bg-cta transition-colors"
              >
                Volver al login
              </Link>
            </div>
          ) : (
            <div className="max-w-sm">
              <h1 className="text-xl font-semibold text-ink">Recupera tu contraseña</h1>
              <p className="mt-1.5 text-sm text-muted">
                Ingresa tu correo y te enviamos un enlace para restablecerla.
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
                      placeholder="tucorreo@ejemplo.com"
                      className="w-full bg-surface-alt border border-border rounded-tl-md pl-9 pr-3 py-2.5 text-sm text-ink placeholder:text-muted outline-none"
                    />
                  </div>
                </div>
                {error && <p className="text-xs text-accent">{error}</p>}
                <button
                  type="submit"
                  className="w-full bg-cta text-white text-sm font-semibold py-2.5 rounded-tl-lg hover:bg-cta-dark transition-colors"
                >
                  Enviar enlace
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      <div className="relative w-full max-w-6xl mt-2 flex justify-center">
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
