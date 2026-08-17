import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/ProductDetailClient";
import { products } from "@/lib/mock-data";

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);
  if (!product) notFound();

  return <ProductDetailClient product={product} />;
}
