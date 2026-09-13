export type PaymentMethodType = "tarjeta" | "nequi" | "pse";

export type SavedPaymentMethod = {
  id: string;
  userId: string;
  type: PaymentMethodType;
  brand?: string;
  last4?: string;
  holderName?: string;
  expiry?: string;
  nequiPhone?: string;
  pseBank?: string;
  isDefault: boolean;
  createdAt: string;
};

const KEY = "j3sas_payment_methods";

export function getPaymentMethods(): SavedPaymentMethod[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedPaymentMethod[]) : [];
  } catch {
    return [];
  }
}

function saveAll(all: SavedPaymentMethod[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // storage unavailable (privado/bloqueado) — el cambio queda solo en memoria
  }
}

export function getPaymentMethodsForUser(userId: string): SavedPaymentMethod[] {
  return getPaymentMethods()
    .filter((m) => m.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function addPaymentMethod(input: Omit<SavedPaymentMethod, "id" | "createdAt">): SavedPaymentMethod {
  const all = getPaymentMethods();
  const method: SavedPaymentMethod = {
    ...input,
    id: `pm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };

  // El primer método de un usuario siempre queda como predeterminado; si el
  // nuevo se marca predeterminado, se le quita esa marca a los demás.
  const userMethods = all.filter((m) => m.userId === input.userId);
  if (userMethods.length === 0) method.isDefault = true;
  const next = method.isDefault
    ? all.map((m) => (m.userId === input.userId ? { ...m, isDefault: false } : m))
    : all;

  next.push(method);
  saveAll(next);
  return method;
}

export function removePaymentMethod(id: string) {
  const all = getPaymentMethods();
  const removed = all.find((m) => m.id === id);
  const rest = all.filter((m) => m.id !== id);
  // Si el eliminado era el predeterminado, se le pasa la marca al más reciente que quede.
  if (removed?.isDefault) {
    const userRest = rest.filter((m) => m.userId === removed.userId);
    if (userRest.length > 0) {
      const newest = userRest.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      const index = rest.findIndex((m) => m.id === newest.id);
      rest[index] = { ...rest[index], isDefault: true };
    }
  }
  saveAll(rest);
}

export function setDefaultPaymentMethod(userId: string, id: string) {
  const all = getPaymentMethods();
  saveAll(all.map((m) => (m.userId === userId ? { ...m, isDefault: m.id === id } : m)));
}
