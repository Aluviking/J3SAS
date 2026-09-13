import type { Order } from "@/lib/orders";

export type DeliveryStatus =
  | "pendiente_programar"
  | "programado"
  | "en_ruta"
  | "entregado"
  | "no_entregado";

export type DeliveryChatMessage = {
  id: string;
  from: "driver" | "customer";
  text: string;
  presetKey?: string;
  createdAt: string;
};

export type LocationSharing = {
  driverConsent: boolean;
  customerConsent: boolean;
  driverLastLocation?: { lat: number; lng: number; updatedAt: string };
};

export type Delivery = {
  id: string;
  orderNumber: string;
  orderLineIndex: number;
  productId: string;
  productName: string;
  productImage: string;
  qty: number;
  customerId: string;
  customerName: string;
  customerPhone: string;
  destination: { addressLine: string; lat: number; lng: number };
  driverId: string | null;
  status: DeliveryStatus;
  sequence: number | null;
  chat: DeliveryChatMessage[];
  locationSharing: LocationSharing;
  createdAt: string;
  updatedAt: string;
  deliveredAt: string | null;
};

// Punto fijo de bodega/salida del repartidor. Las coordenadas se resuelven
// una sola vez (geocoding manual) — mientras tanto el mapa las trata como
// "sin resolver" y no dibuja el pin de origen.
export const WAREHOUSE_ORIGIN = {
  label: "Cra 72b #42-58, Comercializadora J3",
  lat: 4.6389,
  lng: -74.0839,
};

// Único repartidor activo hoy — createDeliveriesForOrder auto-asigna aquí.
// Cuando existan varios repartidores, esto debe volverse un paso de
// asignación/reclamo en vez de una constante.
const DEFAULT_DRIVER_ID = "rep-demo";

const KEY = "j3sas_deliveries";

export function getDeliveries(): Delivery[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Delivery[]) : [];
  } catch {
    return [];
  }
}

function saveAll(all: Delivery[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // storage unavailable (privado/bloqueado) — el cambio queda solo en memoria
  }
}

export function createDeliveriesForOrder(order: Order) {
  const all = getDeliveries();
  const now = new Date().toISOString();
  const addressLine = `${order.address.line}, ${order.address.city}, ${order.address.department}`;

  let changed = false;
  order.lines.forEach((line, index) => {
    const id = `del-${order.orderNumber}-${index}`;
    if (all.some((d) => d.id === id)) return; // idempotente

    all.push({
      id,
      orderNumber: order.orderNumber,
      orderLineIndex: index,
      productId: line.productId,
      productName: line.name,
      productImage: line.image,
      qty: line.qty,
      customerId: order.userId,
      customerName: order.address.fullName,
      customerPhone: order.address.phone,
      destination: {
        addressLine,
        lat: order.address.lat ?? 0,
        lng: order.address.lng ?? 0,
      },
      driverId: DEFAULT_DRIVER_ID,
      status: "pendiente_programar",
      sequence: null,
      chat: [],
      locationSharing: { driverConsent: false, customerConsent: false },
      createdAt: now,
      updatedAt: now,
      deliveredAt: null,
    });
    changed = true;
  });

  if (changed) saveAll(all);
}

export function getDeliveriesForCustomer(customerId: string): Delivery[] {
  return getDeliveries()
    .filter((d) => d.customerId === customerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getDeliveriesForDriver(driverId: string): Delivery[] {
  return getDeliveries()
    .filter((d) => d.driverId === driverId)
    .sort((a, b) => (a.sequence ?? 999) - (b.sequence ?? 999));
}

export function getDeliveryById(id: string): Delivery | undefined {
  return getDeliveries().find((d) => d.id === id);
}

export function updateDelivery(id: string, patch: Partial<Delivery>) {
  const all = getDeliveries();
  const index = all.findIndex((d) => d.id === id);
  if (index === -1) return;
  all[index] = { ...all[index], ...patch, updatedAt: new Date().toISOString() };
  saveAll(all);
}

export function setDeliverySequence(driverId: string, orderedIds: string[]) {
  const all = getDeliveries();
  orderedIds.forEach((id, i) => {
    const index = all.findIndex((d) => d.id === id && d.driverId === driverId);
    if (index !== -1) all[index] = { ...all[index], sequence: i, updatedAt: new Date().toISOString() };
  });
  saveAll(all);
}

export function appendChatMessage(id: string, msg: Omit<DeliveryChatMessage, "id" | "createdAt">) {
  const all = getDeliveries();
  const index = all.findIndex((d) => d.id === id);
  if (index === -1) return;
  const chatMessage: DeliveryChatMessage = {
    ...msg,
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  all[index] = {
    ...all[index],
    chat: [...all[index].chat, chatMessage],
    updatedAt: new Date().toISOString(),
  };
  saveAll(all);
}

export function setLocationConsent(id: string, who: "driver" | "customer", value: boolean) {
  const all = getDeliveries();
  const index = all.findIndex((d) => d.id === id);
  if (index === -1) return;
  const key = who === "driver" ? "driverConsent" : "customerConsent";
  all[index] = {
    ...all[index],
    locationSharing: { ...all[index].locationSharing, [key]: value },
    updatedAt: new Date().toISOString(),
  };
  saveAll(all);
}

const DEMO_IDS = ["demo-1", "demo-2", "demo-3"];
const DEMO_VERSION = "2";
const DEMO_VERSION_KEY = "j3sas_demo_deliveries_version";

// Paquetes de ejemplo para poder ver el panel del repartidor con contenido
// sin tener que completar una compra real primero. No interfieren con
// pedidos reales: usan un customerId ficticio que ningún cliente real puede
// tener, así que nunca aparecen en "Mis pedidos" de nadie. Se reinsertan en
// su estado original cada vez que DEMO_VERSION cambia (para poder "resetear"
// el ejercicio de demo), y de ahí en adelante se dejan tal cual el
// repartidor los va gestionando (no se pisan en cada carga).
export function seedDemoDeliveries() {
  let storedVersion: string | null = null;
  try {
    storedVersion = localStorage.getItem(DEMO_VERSION_KEY);
  } catch {
    // storage unavailable
  }

  if (storedVersion === DEMO_VERSION) {
    const all = getDeliveries();
    if (DEMO_IDS.some((id) => all.some((d) => d.id === id))) return;
  } else {
    const withoutOldDemo = getDeliveries().filter((d) => !DEMO_IDS.includes(d.id));
    saveAll(withoutOldDemo);
    try {
      localStorage.setItem(DEMO_VERSION_KEY, DEMO_VERSION);
    } catch {
      // storage unavailable
    }
  }

  const all = getDeliveries();

  const now = new Date().toISOString();
  const demo: Delivery[] = [
    {
      id: "demo-1",
      orderNumber: "DEMO-0001",
      orderLineIndex: 0,
      productId: "brooklyn",
      productName: "Camiseta Brooklyn Limited Edition",
      productImage:
        "/products/hombre/Camiseta Hombre Oversize/brooklyn - Camiseta Hombre Oversize/brooklyn - Camiseta Hombre Oversize modelo.webp",
      qty: 1,
      customerId: "demo-cliente-1",
      customerName: "Laura Gómez",
      customerPhone: "3011234567",
      destination: { addressLine: "Cra 15 #85-20, Bogotá, Cundinamarca", lat: 4.667, lng: -74.053 },
      driverId: DEFAULT_DRIVER_ID,
      status: "pendiente_programar",
      sequence: null,
      chat: [],
      locationSharing: { driverConsent: false, customerConsent: false },
      createdAt: now,
      updatedAt: now,
      deliveredAt: null,
    },
    {
      id: "demo-2",
      orderNumber: "DEMO-0002",
      orderLineIndex: 0,
      productId: "california",
      productName: "Camiseta California Street",
      productImage:
        "/products/hombre/Camiseta Hombre Oversize/Camisa California - Camiseta Hombre Oversize/Camisa California - Camiseta Hombre Oversize modelo.webp",
      qty: 2,
      customerId: "demo-cliente-2",
      customerName: "Andrés Torres",
      customerPhone: "3157654321",
      destination: { addressLine: "Calle 72 #10-34, Bogotá, Cundinamarca", lat: 4.6533, lng: -74.0576 },
      driverId: DEFAULT_DRIVER_ID,
      status: "pendiente_programar",
      sequence: null,
      chat: [],
      locationSharing: { driverConsent: false, customerConsent: false },
      createdAt: now,
      updatedAt: now,
      deliveredAt: null,
    },
    {
      id: "demo-3",
      orderNumber: "DEMO-0003",
      orderLineIndex: 0,
      productId: "denim",
      productName: "Camiseta Denim Patchwork",
      productImage:
        "/products/hombre/Camiseta Hombre Oversize/Camisa Dennim - Camiseta Hombre Oversize/Camisa Dennim - Camiseta Hombre Oversize modelo.webp",
      qty: 1,
      customerId: "demo-cliente-3",
      customerName: "Camilo Ruiz",
      customerPhone: "3209876543",
      destination: { addressLine: "Av. Suba #114-50, Bogotá, Cundinamarca", lat: 4.7398, lng: -74.0935 },
      driverId: DEFAULT_DRIVER_ID,
      status: "pendiente_programar",
      sequence: null,
      chat: [],
      locationSharing: { driverConsent: false, customerConsent: false },
      createdAt: now,
      updatedAt: now,
      deliveredAt: null,
    },
  ];

  saveAll([...all, ...demo]);
}

export function updateDriverLocation(id: string, lat: number, lng: number) {
  const all = getDeliveries();
  const index = all.findIndex((d) => d.id === id);
  if (index === -1) return;
  const sharing = all[index].locationSharing;
  // Defensa en profundidad: sin ambos consentimientos, no se guarda ninguna
  // posición aunque el navegador siga entregando actualizaciones de GPS.
  if (!sharing.driverConsent || !sharing.customerConsent) return;
  all[index] = {
    ...all[index],
    locationSharing: {
      ...sharing,
      driverLastLocation: { lat, lng, updatedAt: new Date().toISOString() },
    },
    updatedAt: new Date().toISOString(),
  };
  saveAll(all);
}
