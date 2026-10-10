"use client";

import { MessageCircle } from "lucide-react";

const PHONE = "573244603474";
const MESSAGE = "Hola, tengo una pregunta sobre un producto de Comercializadora J3.";
const WHATSAPP_HREF = `https://wa.me/${PHONE}?text=${encodeURIComponent(MESSAGE)}`;

export default function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_HREF}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className="fixed bottom-20 lg:bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-[#25D366] shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
    >
      <MessageCircle size={22} className="text-white" fill="white" />
    </a>
  );
}
