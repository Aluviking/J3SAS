import { CreditCard, Package, Route, ShoppingBag, Truck } from "lucide-react";
import InfoPage from "@/components/InfoPage";

const steps = [
  { icon: ShoppingBag, title: "1. Elige tus productos", text: "Explora el catálogo y agrega camisetas, pantalonetas, polos o buzos a tu carrito." },
  { icon: CreditCard, title: "2. Paga seguro", text: "Finaliza tu compra con Visa, Mastercard, PSE o Nequi." },
  { icon: Package, title: "3. Preparamos tu pedido", text: "Empacamos tu pedido con cuidado en 1-2 días hábiles." },
  { icon: Truck, title: "4. Recíbelo en tu puerta", text: "Envíos a toda Colombia en 3-4 días hábiles." },
];

export default function Page() {
  return (
    <InfoPage title="Cómo funciona" subtitle="Comprar en J3SAS es simple." icon={Route}>
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
    </InfoPage>
  );
}
