import { Clock, Headset, Mail, MessageCircle } from "lucide-react";
import InfoPage from "@/components/InfoPage";

export default function Page() {
  return (
    <InfoPage title="Soporte al cliente" subtitle="Estamos para ayudarte." icon={Headset}>
      <div className="flex items-start gap-3">
        <Mail size={18} className="text-brand shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-ink">Correo</p>
          <p className="text-muted">soporte@j3sas.co · respondemos en menos de 24 horas hábiles</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <MessageCircle size={18} className="text-brand shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-ink">Chat / WhatsApp</p>
          <p className="text-muted">Disponible desde el botón de WhatsApp en la esquina inferior del sitio</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <Clock size={18} className="text-brand shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-ink">Horario de atención</p>
          <p className="text-muted">Lunes a sábado, 8:00 a.m. – 6:00 p.m. (hora Colombia)</p>
        </div>
      </div>
    </InfoPage>
  );
}
