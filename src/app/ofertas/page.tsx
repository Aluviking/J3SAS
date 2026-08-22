import ProductGridPage from "@/components/ProductGridPage";
import { getOnSaleProducts } from "@/lib/mock-data";

export default function OfertasPage() {
  const onSale = getOnSaleProducts();

  return (
    <ProductGridPage
      title="Ofertas"
      subtitle="Los mejores descuentos del catálogo, actualizados todos los días."
      products={onSale}
    />
  );
}
