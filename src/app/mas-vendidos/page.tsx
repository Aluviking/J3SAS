import ProductGridPage from "@/components/ProductGridPage";
import { products } from "@/lib/mock-data";

export default function MasVendidosPage() {
  const bestSellers = [...products].sort((a, b) => b.reviewCount - a.reviewCount);

  return (
    <ProductGridPage
      title="Más vendidos"
      subtitle="Los productos favoritos de nuestros clientes."
      products={bestSellers}
    />
  );
}
