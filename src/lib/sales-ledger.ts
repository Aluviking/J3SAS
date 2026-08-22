export type SaleRecord = {
  id: string;
  date: string;
  fabricanteId: string;
  code: string;
  orderNumber: string;
  items: { productId: string; name: string; qty: number; price: number }[];
};

const KEY = "j3sas_sales_ledger";

export function getSales(): SaleRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SaleRecord[]) : [];
  } catch {
    return [];
  }
}

export function recordSale(record: SaleRecord) {
  const all = getSales();
  all.push(record);
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // storage unavailable (private browsing, quota, blocked)
  }
}

export function getSalesForFabricante(fabricanteId: string): SaleRecord[] {
  return getSales()
    .filter((s) => s.fabricanteId === fabricanteId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
