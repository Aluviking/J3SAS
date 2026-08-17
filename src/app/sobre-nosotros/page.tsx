import { Building2 } from "lucide-react";
import InfoPage from "@/components/InfoPage";

export default function Page() {
  return (
    <InfoPage
      title="Sobre nosotros"
      subtitle="Diseño colombiano, directo a tu puerta."
      icon={Building2}
    >
      <p>
        J3SAS es una marca colombiana dedicada al diseño y venta de camisetas,
        pantalonetas, polos y busos de calidad, directo al consumidor.
        Trabajamos con estampados propios y colecciones inspiradas en la
        cultura urbana, deportiva y pop.
      </p>
      <p>
        Nuestro objetivo es ofrecer prendas con diseños únicos, buena
        confección y precios justos, con envíos a todo el territorio
        colombiano.
      </p>
      <p className="text-muted">
        Somos una marca en crecimiento; este catálogo se va a seguir
        ampliando con nuevos diseños y categorías de producto.
      </p>
    </InfoPage>
  );
}
