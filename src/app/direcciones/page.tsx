import { MapPin } from "lucide-react";
import Link from "next/link";
import EmptyState from "@/components/EmptyState";

export default function DireccionesPage() {
  return (
    <div className="px-4 lg:px-8 py-5">
      <div className="text-sm text-muted mb-3">
        <Link href="/" className="hover:text-ink">
          Inicio
        </Link>{" "}
        / <span className="text-ink">Direcciones</span>
      </div>

      <h1 className="text-xl font-semibold text-ink">Direcciones</h1>
      <p className="mt-1 text-sm text-muted">Administra tus direcciones de envío.</p>

      <EmptyState
        icon={MapPin}
        title="No tienes direcciones guardadas"
        description="Agrega una dirección para agilizar tus próximas compras."
      />
    </div>
  );
}
