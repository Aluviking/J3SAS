import { CreditCard, Landmark, Smartphone } from "lucide-react";
import InfoPage from "@/components/InfoPage";

const methods = [
  { icon: CreditCard, title: "Tarjeta de crédito o débito", text: "Visa y Mastercard, pago seguro en el checkout." },
  { icon: Landmark, title: "PSE", text: "Pago directo desde tu banco colombiano." },
  { icon: Smartphone, title: "Nequi", text: "Paga desde la app con tu cuenta Nequi." },
];

export default function Page() {
  return (
    <InfoPage
      title="Métodos de pago"
      subtitle="Todas las formas en que puedes pagar tu pedido."
      icon={CreditCard}
    >
      <div className="space-y-4">
        {methods.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-tl-md bg-brand-soft flex items-center justify-center shrink-0">
              <Icon size={18} className="text-brand" />
            </div>
            <div>
              <p className="font-medium text-ink">{title}</p>
              <p className="text-muted text-sm">{text}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-muted text-xs pt-2 border-t border-border">
        Todos los pagos se procesan de forma encriptada y segura.
      </p>
    </InfoPage>
  );
}
