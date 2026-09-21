import { getClient } from "@/lib/apollo/apollo-client";
import { GET_PRODUCTS } from "@/lib/graphql/queries";
import { Product } from "@/types/product";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

async function getProducts(): Promise<Product[]> {
    try {
        const { data } = (await getClient().query({ query: GET_PRODUCTS })) as any;
        return data?.products?.nodes || [];
    } catch (error) {
        console.error("Error al obtener productos:", error);
        return [];
    }
}

export default async function Tienda() {
    const products = await getProducts();

    return (
        <main className="min-h-screen bg-gray-950 py-12 px-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-2">Tienda</h1>
                <p className="text-gray-400 mb-8">Todos los componentes disponibles</p>

                {products.length === 0 ? (
                    <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
                        <p className="text-gray-400">No hay productos disponibles.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}