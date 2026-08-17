import { Ticket } from "lucide-react";
import Link from "next/link";

const coupons = [
  {
    code: "BIENVENIDA10",
    description: "10% de descuento en tu primera compra",
    minPurchase: "Sin mínimo de compra",
  },
  {
    code: "ENVIOGRATIS",
    description: "Envío gratis en compras superiores a $150.000",
    minPurchase: "Compras +$150.000",
  },
  {
    code: "FLASH70",
    description: "Hasta 70% en productos seleccionados de Venta Flash",
    minPurchase: "Válido mientras dure la promoción",
  },
];

export default function CuponesPage() {
  return (
    <div className="px-4 lg:px-8 py-5">
      <div className="text-sm text-muted mb-3">
        <Link href="/" className="hover:text-ink">
          Inicio
        </Link>{" "}
        / <span className="text-ink">Cupones</span>
      </div>

      <h1 className="text-xl font-semibold text-ink">Cupones</h1>
      <p className="mt-1 text-sm text-muted">Códigos activos que puedes usar en tu compra.</p>

      <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl">
        {coupons.map((c) => (
          <div
            key={c.code}
            className="relative overflow-hidden bg-surface border border-border rounded-tl-2xl p-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-tl-md bg-brand-soft flex items-center justify-center shrink-0">
                <Ticket size={16} className="text-brand" />
              </div>
              <span className="font-mono font-semibold text-ink tracking-wide">{c.code}</span>
            </div>
            <p className="mt-3 text-sm text-ink">{c.description}</p>
            <p className="mt-1 text-xs text-muted">{c.minPurchase}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
