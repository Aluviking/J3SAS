import { Suspense } from "react";
import ProductGridPage from "@/components/ProductGridPage";
import SearchResults from "@/components/SearchResults";

export default function BuscarPage() {
  return (
    <Suspense
      fallback={
        <ProductGridPage
          title="Buscar"
          subtitle="Escribe algo en el buscador para empezar."
          products={[]}
        />
      }
    >
      <SearchResults />
    </Suspense>
  );
}
