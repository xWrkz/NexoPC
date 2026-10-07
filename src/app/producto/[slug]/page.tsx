import Link from "next/link";
import { CheckCircle2, ChevronRight, Package, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { notFound } from "next/navigation";
import { getCatalog, getProductBySlug } from "@/lib/catalog/products";
import { formatPrice } from "@/lib/utils/formatPrice";
import AddToCartButton from "@/components/AddToCartButton";
import ProductCard from "@/components/ProductCard";
import ProductGallery from "@/components/ProductGallery";
import SpecLabel from "@/components/SpecLabel";

const usageLabels: Record<string, string> = { estudio: "Estudio", estudiantes: "Estudio", trabajo: "Trabajo", productividad: "Productividad", programacion: "Programación", desarrollo: "Programación", gaming: "Gaming", juegos: "Gaming", creacion: "Creación", diseno: "Diseño" };

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const gallery = [product.image, ...(product.galleryImages?.nodes ?? [])].filter((image): image is NonNullable<typeof product.image> => Boolean(image)).filter((image, index, all) => all.findIndex((item) => item.sourceUrl === image.sourceUrl) === index);
  const primaryCategory = product.productCategories?.nodes[0];
  const relatedCatalog = primaryCategory ? await getCatalog({ categories: [primaryCategory.slug] }) : null;
  const related = (relatedCatalog?.products ?? []).filter((item) => item.slug !== product.slug).slice(0, 4);
  const uses = [...new Set((product.productTags?.nodes ?? []).map((tag) => usageLabels[tag.slug]).filter(Boolean))];
  const services = [{ Icon: Truck, title: "Envío coordinado", text: "Acordamos contigo los detalles" }, { Icon: ShieldCheck, title: "Compra informada", text: "Variante y disponibilidad validadas" }, { Icon: Package, title: "Soporte NexoPC", text: "Antes y después de comprar" }];

  return <div className="mx-auto max-w-7xl px-6 py-9 sm:py-12"><nav className="flex items-center gap-1.5 text-sm text-slate-500"><Link href="/tienda" className="hover:text-orange-300">Tienda</Link><ChevronRight size={14}/><span className="truncate text-slate-300">{product.name}</span></nav><div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_.95fr]"><ProductGallery name={product.name} images={gallery}/><div className="lg:pt-3"><p className="eyebrow">{primaryCategory?.name ?? "Hardware NexoPC"}</p><h1 className="font-display mt-3 text-4xl font-bold leading-tight sm:text-5xl">{product.name}</h1>{product.sku ? <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-500">SKU · {product.sku}</p> : null}{uses.length ? <div className="mt-4 flex flex-wrap gap-2">{uses.map((use) => <span className="signal-chip" key={use}><Sparkles size={12}/>{use}</span>)}</div> : null}<div className="mt-6 flex flex-wrap items-baseline gap-3"><p className="price text-4xl">{formatPrice(product.price)}</p>{product.salePrice && product.regularPrice ? <p className="text-lg text-slate-500 line-through">{formatPrice(product.regularPrice)}</p> : null}</div><p className={`mt-4 flex items-center gap-2 text-sm font-bold ${product.stockStatus === "IN_STOCK" ? "text-emerald-300" : "text-rose-300"}`}><CheckCircle2 size={17}/>{product.stockStatus === "IN_STOCK" ? "Disponible" : "Temporalmente agotado"}</p>{product.shortDescription ? <div className="product-copy mt-6 max-w-xl text-sm leading-7 text-slate-300" dangerouslySetInnerHTML={{ __html: product.shortDescription }}/> : null}<div className="mt-8 border-y border-white/10 py-7"><AddToCartButton product={product}/></div><div className="mt-6 grid gap-3 sm:grid-cols-3">{services.map(({ Icon, title, text }) => <div className="service-tile" key={title}><Icon size={17} className="text-orange-300"/><p>{title}</p><small>{text}</small></div>)}</div></div></div>

    <section className="mt-16 grid gap-8 lg:grid-cols-[.7fr_1.3fr]"><div><p className="eyebrow">Detalles técnicos</p><h2 className="font-display mt-3 text-3xl font-bold">Lo esencial y el dato completo.</h2><p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">Pasa por los iconos de ayuda para entender las especificaciones más importantes.</p></div><div className="panel overflow-visible">{product.attributes?.nodes.length ? product.attributes.nodes.map((attribute) => <div key={attribute.name} className="grid gap-1 border-b border-white/8 p-4 last:border-0 sm:grid-cols-[.38fr_1fr]"><span className="text-sm font-bold text-slate-400"><SpecLabel label={attribute.label || attribute.name}/></span><span className="text-sm text-slate-100">{attribute.options.join(", ") || "No especificado"}</span></div>) : <p className="p-5 text-sm leading-6 text-slate-400">Este producto todavía no tiene una ficha técnica detallada. Consulta con nuestro equipo si necesitas confirmar una especificación antes de comprar.</p>}</div></section>

    {related.length ? <section className="mt-16"><div className="flex items-end justify-between"><div><p className="eyebrow">Sigue explorando</p><h2 className="font-display mt-3 text-3xl font-bold">También puede interesarte</h2></div><Link href="/tienda" className="text-sm font-bold text-orange-300">Ver catálogo</Link></div><div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{related.map((item) => <ProductCard product={item} key={item.id}/>)}</div></section> : null}
  </div>;
}
