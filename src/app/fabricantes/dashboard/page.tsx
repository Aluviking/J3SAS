"use client";

import {
  BadgeCheck,
  Boxes,
  Check,
  Copy,
  Factory,
  LogOut,
  Package,
  ShoppingBag,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFabricanteAuth } from "@/lib/fabricante-auth-context";
import { currency, products } from "@/lib/mock-data";
import { getSalesForFabricante, type SaleRecord } from "@/lib/sales-ledger";

const TRANSIT_DAYS = 4;

// Reparto del valor de venta según "Proyecto D2C" (convocatoria nacional de
// fabricantes, sep. 2026): de cada venta, 50% es para el fabricante/proveedor
// que produce, y el otro 50% se reparte entre operación de J3 (10%), el
// aliado que vendió (20%) y utilidad de J3 (20%). 50+10+20+20 = 100%.
const FABRICANTE_SHARE = 0.5;
const OPERACION_J3_SHARE = 0.1;
const ALIADO_VENDEDOR_SHARE = 0.2;
const UTILIDAD_J3_SHARE = 0.2;

// Cifras compactas (ej. "$480K", "$1,3M") para que la tabla de productos no
// se vea amontonada con números largos — el valor exacto queda disponible al
// pasar el cursor (title).
function compactCurrency(n: number) {
  if (n >= 1_000_000) {
    return "$" + (n / 1_000_000).toLocaleString("es-CO", { maximumFractionDigits: 1 }) + "M";
  }
  if (n >= 1_000) {
    return "$" + Math.round(n / 1000).toLocaleString("es-CO") + "K";
  }
  return currency.format(n);
}

function isInTransit(dateIso: string) {
  const daysSince = (Date.now() - new Date(dateIso).getTime()) / (1000 * 60 * 60 * 24);
  return daysSince < TRANSIT_DAYS;
}

export default function FabricanteDashboardPage() {
  const { fabricante, loading, logout } = useFabricanteAuth();
  const router = useRouter();
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!fabricante) return;
    const load = () => setSales(getSalesForFabricante(fabricante.id));
    load();
    const id = setInterval(load, 3000);
    window.addEventListener("storage", load);
    return () => {
      clearInterval(id);
      window.removeEventListener("storage", load);
    };
  }, [fabricante]);

  useEffect(() => {
    if (!loading && !fabricante) router.replace("/fabricantes/login");
  }, [loading, fabricante, router]);

  if (loading || !fabricante) return null;

  const myProducts = products.filter((p) => fabricante.productIds.includes(p.id));

  const soldByProduct = new Map<string, number>();
  const inTransitByProduct = new Map<string, number>();
  let totalRevenue = 0;
  for (const sale of sales) {
    const transit = isInTransit(sale.date);
    for (const item of sale.items) {
      soldByProduct.set(item.productId, (soldByProduct.get(item.productId) ?? 0) + item.qty);
      if (transit) {
        inTransitByProduct.set(item.productId, (inTransitByProduct.get(item.productId) ?? 0) + item.qty);
      }
      totalRevenue += item.price * item.qty;
    }
  }

  const totalStock = myProducts.reduce((sum, p) => sum + p.stock, 0);
  const totalSold = Array.from(soldByProduct.values()).reduce((a, b) => a + b, 0);
  const totalInTransit = Array.from(inTransitByProduct.values()).reduce((a, b) => a + b, 0);
  const totalRemaining = totalStock - totalSold;

  // Margen que corresponde al fabricante/proveedor: 50% del valor de venta
  // ya registrado (precio detal x unidades vendidas), según el reparto de
  // "Proyecto D2C". Se calcula solo sobre ventas reales — nunca se inventa,
  // por eso da $0 mientras no haya ventas.
  const totalMargin = totalRevenue * FABRICANTE_SHARE;
  const operacionJ3 = totalRevenue * OPERACION_J3_SHARE;
  const aliadoVendedor = totalRevenue * ALIADO_VENDEDOR_SHARE;
  const utilidadJ3 = totalRevenue * UTILIDAD_J3_SHARE;

  const stats = [
    { icon: Boxes, label: "En stock", value: totalStock.toLocaleString("es-CO") },
    { icon: ShoppingBag, label: "Vendidos", value: totalSold.toLocaleString("es-CO") },
    { icon: Truck, label: "En tránsito", value: totalInTransit.toLocaleString("es-CO") },
    { icon: Package, label: "Disponibles", value: totalRemaining.toLocaleString("es-CO") },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(fabricante.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="px-4 lg:px-8 py-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-tl-lg bg-brand flex items-center justify-center shrink-0">
            <Factory size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-ink flex items-center gap-1">
              {fabricante.businessName}
              <BadgeCheck size={15} className="text-brand" />
            </h1>
            <p className="text-sm text-muted">{fabricante.contactName}</p>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            router.push("/fabricantes/login");
          }}
          className="flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
        >
          <LogOut size={14} />
          Cerrar sesión
        </button>
      </div>

      {/* Code card */}
      <div className="mt-5 bg-ink rounded-tl-2xl p-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs text-white/60">Tu código promocional</p>
          <p className="text-2xl font-semibold text-white tracking-wide mt-0.5">
            {fabricante.code}
          </p>
          <p className="text-xs text-white/60 mt-1">
            Pídeles a tus clientes que lo ingresen al pagar: el precio no cambia, pero así cada
            venta queda registrada automáticamente en este panel.
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 bg-white text-ink text-sm font-semibold px-4 py-2 rounded-tl-md hover:bg-white/90 transition-colors shrink-0"
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? "Copiado" : "Copiar código"}
        </button>
      </div>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-surface border border-border rounded-tl-2xl p-4">
            <Icon size={18} className="text-brand" />
            <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
            <p className="text-xs text-muted">{label}</p>
          </div>
        ))}
      </div>

      {/* Casilla principal: unidades vendidas y su equivalente en $, según el
          reparto de Proyecto D2C (50% para el fabricante/proveedor). */}
      <div className="mt-5 bg-ink rounded-tl-2xl px-5 py-4">
        <p className="text-xs text-white/60">Se han vendido</p>
        <p className="mt-0.5 text-2xl font-semibold text-white">
          {totalSold.toLocaleString("es-CO")} {totalSold === 1 ? "unidad" : "unidades"}
        </p>
        <p className="mt-1.5 text-sm text-white/80">
          Esto equivale a{" "}
          <span className="font-semibold text-white">{currency.format(totalMargin)}</span> que te
          corresponden (50% del valor de venta, según el reparto de Proyecto D2C).
        </p>
        <p className="mt-1 text-xs text-white/40">
          Se calcula solo con ventas ya registradas — si todavía no hay ventas, este valor es $0.
        </p>
      </div>

      {/* Desglose del reparto, con la misma transparencia del Proyecto D2C
          (ver "Una prenda de $20.000: el valor se reparte con claridad"). */}
      <div className="mt-3 bg-surface border border-border rounded-tl-md overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border">
          <p className="text-xs font-semibold text-ink">Cómo se reparte el valor vendido</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border">
          {[
            { label: "Para ti (fabricante)", pct: "50%", value: totalMargin, highlight: true },
            { label: "Operación J3", pct: "10%", value: operacionJ3 },
            { label: "Aliado vendedor", pct: "20%", value: aliadoVendedor },
            { label: "Utilidad J3", pct: "20%", value: utilidadJ3 },
          ].map((row) => (
            <div key={row.label} className="px-4 py-3">
              <p className="text-[11px] text-muted">
                {row.label} · {row.pct}
              </p>
              <p className={`mt-0.5 text-sm font-semibold ${row.highlight ? "text-brand" : "text-ink"}`}>
                {currency.format(row.value)}
              </p>
            </div>
          ))}
        </div>
        <div className="px-4 py-2 border-t border-border">
          <p className="text-xs text-muted">
            Ingresos totales vendidos con tu código:{" "}
            <span className="font-semibold text-ink">{currency.format(totalRevenue)}</span>
          </p>
        </div>
      </div>

      {/* Products */}
      <section className="mt-6 bg-surface border border-border rounded-tl-2xl p-5">
        <h2 className="font-semibold text-ink mb-4">Tus productos</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted border-b border-border">
                <th className="pb-2 pr-4 font-medium whitespace-nowrap">Producto</th>
                <th className="pb-2 px-3 font-medium text-right whitespace-nowrap">Precio mayorista</th>
                <th className="pb-2 px-3 font-medium text-right whitespace-nowrap">Precio detal</th>
                <th className="pb-2 px-3 font-medium text-right whitespace-nowrap">Stock inicial</th>
                <th className="pb-2 px-3 font-medium text-right whitespace-nowrap">Vendidos</th>
                <th className="pb-2 px-3 font-medium text-right whitespace-nowrap">En tránsito</th>
                <th className="pb-2 px-3 font-medium text-right whitespace-nowrap">Disponibles</th>
                <th className="pb-2 px-3 font-medium text-right whitespace-nowrap">Valor vendido</th>
                <th className="pb-2 pl-3 font-medium text-right whitespace-nowrap">Margen (50%)</th>
              </tr>
            </thead>
            <tbody>
              {myProducts.map((p) => {
                const sold = soldByProduct.get(p.id) ?? 0;
                const inTransit = inTransitByProduct.get(p.id) ?? 0;
                const remaining = p.stock - sold;
                return (
                  <tr key={p.id} className="border-b border-border last:border-0">
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2.5 min-w-[180px]">
                        <div className="relative w-9 h-9 rounded-tl-sm overflow-hidden bg-surface-alt shrink-0">
                          <Image src={p.image} alt={p.name} fill className="object-cover" />
                        </div>
                        <span className="text-ink line-clamp-1">{p.name}</span>
                      </div>
                    </td>
                    <td
                      className="py-2.5 px-3 text-right text-muted whitespace-nowrap"
                      title={p.wholesalePrice ? currency.format(p.wholesalePrice) : undefined}
                    >
                      {p.wholesalePrice ? compactCurrency(p.wholesalePrice) : "—"}
                    </td>
                    <td
                      className="py-2.5 px-3 text-right text-ink whitespace-nowrap"
                      title={currency.format(p.price)}
                    >
                      {compactCurrency(p.price)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-muted whitespace-nowrap">{p.stock}</td>
                    <td className="py-2.5 px-3 text-right text-ink font-medium whitespace-nowrap">{sold}</td>
                    <td className="py-2.5 px-3 text-right text-brand whitespace-nowrap">{inTransit}</td>
                    <td className="py-2.5 px-3 text-right text-muted whitespace-nowrap">{remaining}</td>
                    <td
                      className="py-2.5 px-3 text-right text-ink whitespace-nowrap"
                      title={currency.format(p.price * sold)}
                    >
                      {compactCurrency(p.price * sold)}
                    </td>
                    <td
                      className="py-2.5 pl-3 text-right text-brand font-semibold whitespace-nowrap"
                      title={currency.format(p.price * sold * FABRICANTE_SHARE)}
                    >
                      {compactCurrency(p.price * sold * FABRICANTE_SHARE)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent sales */}
      <section className="mt-5 bg-surface border border-border rounded-tl-2xl p-5">
        <h2 className="font-semibold text-ink mb-4">Ventas recientes</h2>
        {sales.length === 0 ? (
          <p className="text-sm text-muted">
            Todavía no se han registrado ventas con tu código. Apenas un cliente compre usando{" "}
            <span className="font-semibold text-ink">{fabricante.code}</span>, va a aparecer aquí
            automáticamente.
          </p>
        ) : (
          <div className="space-y-3">
            {sales.map((sale) => {
              const transit = isInTransit(sale.date);
              return (
                <div
                  key={sale.id}
                  className="flex items-center justify-between gap-3 border border-border rounded-tl-md px-3 py-2.5 flex-wrap"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">Pedido {sale.orderNumber}</p>
                    <p className="text-xs text-muted">
                      {new Date(sale.date).toLocaleString("es-CO")}
                    </p>
                  </div>
                  <div className="text-xs text-muted">
                    {sale.items.map((i) => `${i.qty}x ${i.name}`).join(", ")}
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-1 rounded-tl-sm shrink-0 ${
                      transit ? "bg-brand-soft text-brand" : "bg-surface-alt text-ink"
                    }`}
                  >
                    {transit ? "En tránsito" : "Entregado"}
                  </span>
                  <p className="text-sm font-semibold text-ink">
                    {currency.format(sale.items.reduce((s, i) => s + i.price * i.qty, 0))}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <p className="mt-4 text-xs text-muted">
        <Link href="/" className="hover:text-ink underline">
          ← Volver a la tienda
        </Link>
      </p>
    </div>
  );
}
