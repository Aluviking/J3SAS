"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getDeliveriesForCustomer } from "@/lib/deliveries";

const SEEN_PREFIX = "j3sas_delivery_toast_seen_";

function isUnseen(deliveryId: string, updatedAt: string): boolean {
  try {
    const seen = sessionStorage.getItem(SEEN_PREFIX + deliveryId);
    return seen !== updatedAt;
  } catch {
    return true;
  }
}

export function markDeliverySeen(deliveryId: string, updatedAt: string) {
  try {
    sessionStorage.setItem(SEEN_PREFIX + deliveryId, updatedAt);
  } catch {
    // storage unavailable
  }
}

export function useUnreadDeliveryNotifications() {
  const { user } = useAuth();
  const [unread, setUnread] = useState<{ id: string; productName: string; updatedAt: string }[]>([]);

  useEffect(() => {
    const load = () => {
      if (!user) {
        setUnread([]);
        return;
      }
      const enRuta = getDeliveriesForCustomer(user.id).filter((d) => d.status === "en_ruta");
      setUnread(
        enRuta
          .filter((d) => isUnseen(d.id, d.updatedAt))
          .map((d) => ({ id: d.id, productName: d.productName, updatedAt: d.updatedAt }))
      );
    };
    load();
    const timer = setInterval(load, 3000);
    window.addEventListener("storage", load);
    return () => {
      clearInterval(timer);
      window.removeEventListener("storage", load);
    };
  }, [user]);

  return unread;
}
