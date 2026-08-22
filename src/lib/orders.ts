export type OrderStatus = "en_camino" | "entregado";

export type OrderLine = {
  productId: string;
  name: string;
  image: string;
  size?: string;
  qty: number;
  price: number;
  wholesaleApplied: boolean;
};

export type Order = {
  orderNumber: string;
  userId: string;
  date: string;
  method: string;
  address: {
    fullName: string;
    phone: string;
    line: string;
    city: string;
    department: string;
  };
  lines: OrderLine[];
  subtotal: number;
  discount: number;
  wholesaleDiscount: number;
  promoCode: string | null;
  shipping: number;
  total: number;
};

const KEY = "j3sas_orders";
const TRANSIT_DAYS = 4;

export function getOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

export function recordOrder(order: Order) {
  const all = getOrders();
  all.push(order);
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // storage unavailable (private browsing, quota, blocked) — order still completes for this session
  }
}

export function getOrdersForUser(userId: string): Order[] {
  return getOrders()
    .filter((o) => o.userId === userId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getOrderStatus(dateIso: string): OrderStatus {
  const daysSince = (Date.now() - new Date(dateIso).getTime()) / (1000 * 60 * 60 * 24);
  return daysSince < TRANSIT_DAYS ? "en_camino" : "entregado";
}
