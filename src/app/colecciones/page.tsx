import ProductGridPage from "@/components/ProductGridPage";
import { products } from "@/lib/mock-data";

export default function ColeccionesPage() {
  return (
    <ProductGridPage
      title="Colecciones"
      subtitle="Colección Verano 2026: todo el catálogo en un solo lugar."
      products={products}
    />
  );
}
