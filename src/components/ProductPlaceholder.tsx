import CategoryIsometricIcon from "@/components/CategoryIsometricIcon";

export default function ProductPlaceholder({ name, category, compact = false, priority = false }: { name: string; category?: { slug: string; name: string }; compact?: boolean; priority?: boolean }) {
  return <div className="product-placeholder" role="img" aria-label={`Imagen no disponible para ${name}`}><CategoryIsometricIcon slug={category?.slug} name={category?.name} size={compact ? 44 : 112} priority={priority}/>{compact ? null : <span className="product-placeholder-label">Imagen en preparación</span>}</div>;
}
