"use client";

import { ChevronDown, HelpCircle } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const faqs = [
  {
    q: "¿Cuánto tarda mi pedido en llegar?",
    a: "Entre 3 y 4 días hábiles en ciudades principales, y de 5 a 7 días hábiles en el resto del país.",
  },
  {
    q: "¿Cuáles son los métodos de pago disponibles?",
    a: "Aceptamos Visa, Mastercard, PSE y Nequi.",
  },
  {
    q: "¿Puedo devolver un producto?",
    a: "Sí, tienes hasta 5 días hábiles después de recibirlo, siempre que esté sin uso y con etiquetas originales.",
  },
  {
    q: "¿Cómo sé qué talla pedir?",
    a: "Consulta nuestra guía de tallas con las medidas de cada prenda antes de comprar.",
  },
  {
    q: "¿El envío tiene costo?",
    a: "Es gratis al llevar más de 3 artículos. Por debajo de esa cantidad se calcula según tu ciudad.",
  },
  {
    q: "¿Cómo hago seguimiento a mi pedido?",
    a: "Desde la sección 'Mis pedidos' vas a poder ver el estado de tu compra una vez sea despachada.",
  },
];

export default function Page() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="px-4 lg:px-8 py-5">
      <div className="text-sm text-muted mb-3">
        <Link href="/" className="hover:text-ink">
          Inicio
        </Link>{" "}
        / <span className="text-ink">Preguntas frecuentes</span>
      </div>

      <div className="relative overflow-hidden rounded-tl-3xl bg-ink px-6 py-8 sm:px-10 sm:py-10">
        <div className="relative w-12 h-12 rounded-tl-lg bg-white/10 flex items-center justify-center mb-4">
          <HelpCircle size={22} className="text-white" />
        </div>
        <h1 className="relative text-2xl sm:text-3xl font-semibold text-white">
          Preguntas frecuentes
        </h1>
        <p className="relative mt-2 text-sm text-white/70 max-w-lg">
          Lo que más nos preguntan nuestros clientes.
        </p>
      </div>

      <div className="mt-6 bg-surface border border-border rounded-tl-2xl divide-y divide-border">
        {faqs.map((item, i) => (
          <div key={item.q} className="px-5">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between py-4 text-left text-sm font-medium text-ink"
            >
              {item.q}
              <ChevronDown
                size={16}
                className={`shrink-0 ml-3 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}
              />
            </button>
            {open === i && <p className="pb-4 text-sm text-muted">{item.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
