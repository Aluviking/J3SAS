import ProductGridPage from "@/components/ProductGridPage";
import { products } from "@/lib/mock-data";

export default function NuevosPage() {
  return (
    <ProductGridPage
      title="Nuevos ingresos"
      subtitle="Lo último que llegó al catálogo de J3SAS."
      products={[...products].reverse()}
    />
  );
}
