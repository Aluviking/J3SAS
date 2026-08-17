import ProductGridPage from "@/components/ProductGridPage";
import { products } from "@/lib/mock-data";

export default function OfertasPage() {
  const onSale = [...products]
    .filter((p) => p.originalPrice)
    .sort((a, b) => {
      const discA = 1 - a.price / (a.originalPrice ?? a.price);
      const discB = 1 - b.price / (b.originalPrice ?? b.price);
      return discB - discA;
    });

  return (
    <ProductGridPage
      title="Ofertas"
      subtitle="Los mejores descuentos del catálogo, actualizados todos los días."
      products={onSale}
    />
  );
}
