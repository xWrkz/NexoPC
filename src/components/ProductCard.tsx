import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { formatPrice } from "@/lib/utils/formatPrice";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/producto/${product.slug}`} className="group">
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-orange-500 transition-colors">
        <div className="relative aspect-square bg-gray-800">
          {product.image ? (
            <Image
              src={product.image.sourceUrl}
              alt={product.image.altText || product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-600">
              Sin imagen
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-orange-500 font-bold text-lg">
            {formatPrice(product.price)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {product.stockStatus === "IN_STOCK" ? "✅ En stock" : "❌ Agotado"}
          </p>
        </div>
      </div>
    </Link>
  );
}