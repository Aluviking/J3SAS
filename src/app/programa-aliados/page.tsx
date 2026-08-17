import { Factory, Hash, ShoppingBag, TrendingUp } from "lucide-react";
import Link from "next/link";
import InfoPage from "@/components/InfoPage";

const steps = [
  { icon: Factory, title: "Pagas tu mensualidad", text: "Con ella publicamos tus productos en el catálogo de J3SAS." },
  { icon: Hash, title: "Recibes tu código único", text: "Identifica tus productos y le permite a tus clientes usarlo al pagar." },
  { icon: ShoppingBag, title: "Tus clientes lo ingresan al pagar", text: "El precio es el mismo con o sin código; solo sirve para registrar la venta a tu nombre, así todo queda en orden." },
  { icon: TrendingUp, title: "Tú ves todo en tiempo real", text: "Stock, unidades vendidas, en tránsito y disponibles desde tu propio panel." },
];

export default function Page() {
  return (
    <InfoPage
      title="Programa de aliados"
      subtitle="Para fabricantes que quieren vender sus productos a través de J3SAS."
      icon={Factory}
    >
      <div className="grid sm:grid-cols-2 gap-4">
        {steps.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex gap-3">
            <div className="w-10 h-10 rounded-tl-md bg-brand-soft flex items-center justify-center shrink-0">
              <Icon size={18} className="text-brand" />
            </div>
            <div>
              <p className="font-medium text-ink text-sm">{title}</p>
              <p className="text-muted text-sm mt-0.5">{text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-border flex flex-col sm:flex-row gap-3">
        <Link
          href="/fabricantes/login"
          className="inline-block text-center text-sm font-semibold bg-ink text-white px-5 py-2.5 rounded-tl-md hover:bg-cta transition-colors"
        >
          Ya soy fabricante, iniciar sesión
        </Link>
        <Link
          href="/soporte"
          className="inline-block text-center text-sm font-semibold border border-border text-ink px-5 py-2.5 rounded-tl-md hover:border-ink transition-colors"
        >
          Quiero unirme como fabricante
        </Link>
      </div>
    </InfoPage>
  );
}
