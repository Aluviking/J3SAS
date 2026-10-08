import Link from "next/link";
import CategoryTile from "@/components/CategoryTile";
import { categories } from "@/lib/mock-data";

export default function RopaPage() {
  return (
    <div className="px-4 lg:px-8 py-5">
      <div className="text-sm text-muted mb-3">
        <Link href="/" className="hover:text-ink">
          Inicio
        </Link>{" "}
        / <span className="text-ink">Ropa</span>
      </div>

      <h1 className="text-xl font-semibold text-ink">Ropa</h1>
      <p className="mt-1 text-sm text-muted">Elige por quién estás comprando.</p>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {categories.map(({ id, label, image, images, href }) => (
          <CategoryTile key={id} id={id} label={label} image={image} images={images} href={href} />
        ))}
      </div>
    </div>
  );
}
