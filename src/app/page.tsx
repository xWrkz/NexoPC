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

export default async function Home() {
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-gray-950">
      <section className="bg-gradient-to-br from-gray-900 via-gray-950 to-black py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Arma tu PC con <span className="text-orange-500">compatibilidad garantizada</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Configurador inteligente, ensamblaje profesional y certificado de rendimiento en video.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/arma-tu-pc" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg transition">
              Arma tu PC
            </a>
            <a href="/tienda" className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition">
              Ver componentes
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto py-16 px-6">
        <h2 className="text-3xl font-bold text-white mb-8">Componentes destacados</h2>
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
      </section>
    </main>
  );
}