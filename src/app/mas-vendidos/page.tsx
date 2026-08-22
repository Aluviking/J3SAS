import ProductGridPage from "@/components/ProductGridPage";
import { getBestSellers } from "@/lib/mock-data";

export default function MasVendidosPage() {
  const bestSellers = getBestSellers();

  return (
    <ProductGridPage
      title="Más vendidos"
      subtitle="Los productos favoritos de nuestros clientes."
      products={bestSellers}
    />
  );
}
