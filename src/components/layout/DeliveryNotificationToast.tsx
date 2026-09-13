"use client";

import { Truck, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { markDeliverySeen, useUnreadDeliveryNotifications } from "@/lib/use-delivery-notifications";

export default function DeliveryNotificationToast() {
  const unread = useUnreadDeliveryNotifications();
  const [dismissedId, setDismissedId] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);

  const current = unread.find((d) => d.id !== dismissedId) ?? null;

  useEffect(() => {
    if (!current) return;
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, [current]);

  if (!current) return null;

  const dismiss = () => {
    setEntered(false);
    markDeliverySeen(current.id, current.updatedAt);
    setTimeout(() => setDismissedId(current.id), 200);
  };

  return (
    <div
      className={`fixed bottom-20 lg:bottom-4 right-4 z-50 w-72 max-w-[calc(100vw-2rem)] transition-all duration-300 ${
        entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="relative overflow-hidden rounded-tl-2xl bg-ink p-4 shadow-2xl">
        <button
          onClick={dismiss}
          aria-label="Cerrar"
          className="absolute top-2 right-2 w-6 h-6 rounded-tl-sm bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-colors"
        >
          <X size={13} />
        </button>
        <p className="text-sm font-semibold text-white pr-6">Tu producto ya está en proceso de despacho</p>
        <p className="text-xs text-white/70 mt-1 line-clamp-1">{current.productName}</p>
        <Link
          href="/pedidos"
          onClick={dismiss}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold bg-white text-ink px-3 py-1.5 rounded-tl-sm hover:bg-white/90 transition-colors"
        >
          Ver seguimiento
        </Link>
        <Truck size={56} strokeWidth={1} className="absolute -right-3 -bottom-3 text-white/15" />
      </div>
    </div>
  );
}
