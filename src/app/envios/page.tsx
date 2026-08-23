import { Truck } from "lucide-react";
import InfoPage from "@/components/InfoPage";

export default function Page() {
  return (
    <InfoPage
      title="Detalles de envío"
      subtitle="Todo lo que necesitas saber sobre tu pedido."
      icon={Truck}
    >
      <div>
        <p className="font-medium text-ink">Cobertura</p>
        <p className="text-muted">Enviamos a todas las ciudades y municipios de Colombia.</p>
      </div>
      <div>
        <p className="font-medium text-ink">Tiempos de entrega</p>
        <p className="text-muted">3 a 4 días hábiles en ciudades principales. 5 a 7 días hábiles en otras zonas del país.</p>
      </div>
      <div>
        <p className="font-medium text-ink">Costo de envío</p>
        <p className="text-muted">Gratis al llevar más de 3 artículos. Por debajo de esa cantidad, el costo se calcula según tu ciudad al finalizar la compra.</p>
      </div>
      <div>
        <p className="font-medium text-ink">Seguimiento</p>
        <p className="text-muted">Una vez despachado tu pedido, vas a recibir un número de guía para seguir el estado del envío desde &quot;Mis pedidos&quot;.</p>
      </div>
    </InfoPage>
  );
}
