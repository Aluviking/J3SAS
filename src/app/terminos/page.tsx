import { FileText } from "lucide-react";
import InfoPage from "@/components/InfoPage";

export default function Page() {
  return (
    <InfoPage
      title="Términos y condiciones"
      subtitle="Última actualización: agosto de 2026."
      icon={FileText}
    >
      <p>
        Al usar el sitio y realizar compras en J3SAS aceptas estos términos.
        J3SAS opera como comercio electrónico bajo la legislación colombiana,
        en cumplimiento del Estatuto del Consumidor (Ley 1480 de 2011).
      </p>
      <div>
        <p className="font-medium text-ink">Precios y disponibilidad</p>
        <p className="text-muted">Los precios están expresados en pesos colombianos (COP) e incluyen IVA cuando aplica. La disponibilidad de producto puede cambiar sin previo aviso.</p>
      </div>
      <div>
        <p className="font-medium text-ink">Derecho de retracto</p>
        <p className="text-muted">Tienes hasta 5 días hábiles después de recibir tu pedido para solicitar la devolución, siempre que el producto esté sin uso y con sus etiquetas originales.</p>
      </div>
      <div>
        <p className="font-medium text-ink">Propiedad intelectual</p>
        <p className="text-muted">Los diseños, marca y contenido del sitio son propiedad de J3SAS y no pueden ser reproducidos sin autorización.</p>
      </div>
    </InfoPage>
  );
}
