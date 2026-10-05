import { getProductBySlug } from "@/lib/catalog/products";
import Image from "next/image";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";
import { formatPrice } from "@/lib/utils/formatPrice";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const priceClean = product.price
    ? parseFloat(
      product.price
        .replace(/&nbsp;/g, "")
        .replace(/S\//g, "")
        .replace(/,/g, "")
        .replace(/[^0-9.]/g, "")
    )
    : 0;

  return (
    <main className="min-h-screen bg-gray-950 py-12 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
        <div className="relative aspect-square bg-gray-900 rounded-lg overflow-hidden">
          {product.image ? (
            <Image
              src={product.image.sourceUrl}
              alt={product.image.altText || product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-600">
              Sin imagen
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold text-white mb-4">{product.name}</h1>
          <p className="text-4xl font-bold text-orange-500 mb-6">
            {formatPrice(product.price)}
          </p>
          <p className="text-sm mb-6">
            {product.stockStatus === "IN_STOCK" ? (
              <span className="text-green-500">✅ En stock</span>
            ) : (
              <span className="text-red-500">❌ Agotado</span>
            )}
          </p>

          {product.shortDescription && (
            <div
              className="prose prose-invert text-gray-300 mb-8"
              dangerouslySetInnerHTML={{ __html: product.shortDescription }}
            />
          )}

          <AddToCartButton
            id={product.id}
            productId={product.databaseId}
            name={product.name}
            price={priceClean}
            image={product.image?.sourceUrl}
            stockStatus={product.stockStatus}
            variations={product.variations?.nodes}
          />
        </div>
      </div>
    </main>
  );
}
