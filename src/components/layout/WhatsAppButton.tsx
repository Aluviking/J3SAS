"use client";

import { MessageCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "j3sas_whatsapp_closed";
const PHONE = "573244603474";
const MESSAGE = "Hola, tengo una pregunta sobre un producto de Comercializadora J3.";
const WHATSAPP_HREF = `https://wa.me/${PHONE}?text=${encodeURIComponent(MESSAGE)}`;

export default function WhatsAppButton() {
  const [hydrated, setHydrated] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        setClosed(localStorage.getItem(STORAGE_KEY) === "1");
      } catch {
        // storage unavailable — default to expanded
      }
      setHydrated(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const close = () => {
    setClosed(true);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // storage unavailable — stays closed for this visit only
    }
  };

  const reopen = () => {
    setClosed(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // storage unavailable
    }
  };

  if (!hydrated) return null;

  if (closed) {
    return (
      <button
        onClick={reopen}
        aria-label="Abrir chat de WhatsApp"
        className="fixed bottom-20 lg:bottom-4 right-4 z-50 w-10 h-10 rounded-full bg-[#25D366] shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
      >
        <MessageCircle size={18} className="text-white" fill="white" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 lg:bottom-4 right-4 z-50 flex items-center gap-2">
      <a
        href={WHATSAPP_HREF}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escríbenos por WhatsApp"
        className="flex items-center gap-2 bg-[#25D366] text-white rounded-full pl-4 pr-5 py-3 shadow-lg hover:bg-[#1ebe5a] transition-colors"
      >
        <MessageCircle size={20} fill="white" />
        <span className="text-sm font-semibold hidden sm:inline">Escríbenos</span>
      </a>
      <button
        onClick={close}
        aria-label="Cerrar chat de WhatsApp"
        className="w-6 h-6 rounded-full bg-ink/80 text-white flex items-center justify-center hover:bg-ink transition-colors shrink-0"
      >
        <X size={13} />
      </button>
    </div>
  );
}
