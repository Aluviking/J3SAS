import { Globe, Mail, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const columns = [
  {
    title: "Empresa",
    links: [
      { label: "Sobre nosotros", href: "/sobre-nosotros" },
      { label: "Cómo funciona", href: "/como-funciona" },
      { label: "Portal de fabricantes", href: "/fabricantes/login" },
      { label: "Trabaja con nosotros", href: "/trabaja-con-nosotros" },
    ],
  },
  {
    title: "Ayuda",
    links: [
      { label: "Soporte al cliente", href: "/soporte" },
      { label: "Detalles de envío", href: "/envios" },
      { label: "Términos y condiciones", href: "/terminos" },
      { label: "Privacidad", href: "/privacidad" },
    ],
  },
  {
    title: "Mi cuenta",
    links: [
      { label: "Mis pedidos", href: "/pedidos" },
      { label: "Direcciones", href: "/direcciones" },
      { label: "Métodos de pago", href: "/metodos-pago" },
      { label: "Favoritos", href: "/favoritos" },
    ],
  },
  {
    title: "Recursos",
    links: [
      { label: "Guía de tallas", href: "/guia-tallas" },
      { label: "Blog", href: "/blog" },
      { label: "Programa de aliados", href: "/programa-aliados" },
      { label: "Preguntas frecuentes", href: "/preguntas-frecuentes" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-white/80 mt-8">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
        <div className="col-span-2">
          <div className="bg-white rounded-tl-lg p-2 w-fit">
            <div className="relative w-10 h-20">
              <Image
                src="/logo-j3.webp"
                alt="Comercializadora J3"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <p className="mt-3 text-sm text-white/75 max-w-xs">
            Camisetas colombianas de calidad, directo a tu puerta. Envíos a
            todo el país.
          </p>
          <div className="mt-3 flex items-center gap-2">
            {[
              { Icon: Globe, label: "Sitio web" },
              { Icon: Mail, label: "Correo electrónico" },
              { Icon: MessageCircle, label: "Chat de soporte" },
            ].map(({ Icon, label }) => (
              <button
                key={label}
                aria-label={label}
                className="w-9 h-9 rounded-tl-md bg-white/10 flex items-center justify-center transition-colors hover:bg-cta"
              >
                <Icon size={15} className="text-white" />
              </button>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <p className="text-xs font-semibold text-white uppercase tracking-wide">
              {col.title}
            </p>
            <ul className="mt-2.5 space-y-1.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/75 hover:text-cta transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/15">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-center sm:text-left">
            <p className="text-xs text-white/75">
              © 2026 J3SAS. Todos los derechos reservados.
            </p>
            <span className="hidden sm:inline text-white/30">·</span>
            <p className="text-xs text-white/60">
              Powered by{" "}
              <span className="text-white font-semibold">Rubik Control Digital</span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-white/75">
            {["Visa", "Mastercard", "PSE", "Nequi"].map((m) => (
              <span key={m} className="border border-white/25 rounded-tl-sm px-1.5 py-0.5">
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
