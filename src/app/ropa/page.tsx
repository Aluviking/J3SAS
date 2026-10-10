"use client";

import CategoryTile from "@/components/CategoryTile";
import ProductGridPage from "@/components/ProductGridPage";
import { HOGAR_TECH_CATEGORIES } from "@/lib/hogar-tech-data";
import { categories, dedupeVariants, products, type Product } from "@/lib/mock-data";

const ALL_ROPA = products.filter((p) => !HOGAR_TECH_CATEGORIES.includes(p.category));

// Bucket exclusivo por producto (a diferencia de los subfiltros de abajo, que
// se superponen a propósito — ej. Buzos cuenta como Hombres y como Dama).
function ropaBucket(p: Product): string {
  if (p.category === "Rescate") return "rescate";
  if (p.category === "Niños") return "ninos";
  if (p.category === "Buzos") return "unisex";
  if (p.audience === "mujer") return "dama";
  return "hombre";
}

// El catálogo está cargado en bloques por audiencia (todos los Hombre
// primero, luego Dama, etc.), así que en orden natural la vista "Todos"
// solo mostraba Hombre en la primera pantalla. Se intercala round-robin
// para que arriba se vea una mezcla real de Hombre/Dama/Niños/Unisex/Rescate.
function interleaveByBucket(list: Product[]): Product[] {
  const order = ["hombre", "dama", "ninos", "unisex", "rescate"];
  const buckets = new Map(order.map((k) => [k, [] as Product[]]));
  for (const p of list) buckets.get(ropaBucket(p))?.push(p);

  const result: Product[] = [];
  let remaining = true;
  while (remaining) {
    remaining = false;
    for (const key of order) {
      const bucket = buckets.get(key)!;
      if (bucket.length) {
        result.push(bucket.shift()!);
        remaining = true;
      }
    }
  }
  return result;
}

const ropaProducts = interleaveByBucket(ALL_ROPA);

export default function RopaPage() {
  return (
    <ProductGridPage
      title="Ropa"
      subtitle={`${dedupeVariants(ropaProducts).length} productos disponibles`}
      products={ropaProducts}
      headerExtra={
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {categories.map(({ id, label, image, images, href }) => (
            <CategoryTile key={id} id={id} label={label} image={image} images={images} href={href} />
          ))}
        </div>
      }
    />
  );
}
