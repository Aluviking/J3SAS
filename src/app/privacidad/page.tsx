import { ShieldCheck } from "lucide-react";
import InfoPage from "@/components/InfoPage";

export default function Page() {
  return (
    <InfoPage
      title="Política de privacidad"
      subtitle="Última actualización: agosto de 2026."
      icon={ShieldCheck}
    >
      <p>
        En J3SAS protegemos tus datos personales conforme a la Ley 1581 de
        2012 (Habeas Data) y sus decretos reglamentarios en Colombia.
      </p>
      <div>
        <p className="font-medium text-ink">Qué datos recopilamos</p>
        <p className="text-muted">Nombre, correo electrónico, teléfono, dirección de envío e información de pago necesaria para procesar tus pedidos.</p>
      </div>
      <div>
        <p className="font-medium text-ink">Para qué los usamos</p>
        <p className="text-muted">Procesar compras, gestionar envíos, brindar soporte y, si lo autorizas, enviarte novedades y promociones.</p>
      </div>
      <div>
        <p className="font-medium text-ink">Tus derechos</p>
        <p className="text-muted">Puedes conocer, actualizar, rectificar o solicitar la eliminación de tus datos personales escribiendo a soporte@j3sas.co.</p>
      </div>
    </InfoPage>
  );
}
