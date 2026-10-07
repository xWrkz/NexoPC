import Image from "next/image";

export default function ProductPlaceholder({ name, compact = false, priority = false }: { name: string; compact?: boolean; priority?: boolean }) {
  const width = compact ? 112 : 180;
  return <div className="product-placeholder" aria-label={`Imagen no disponible para ${name}`}><span className="product-placeholder-ring"/><span className="product-placeholder-ring product-placeholder-ring-two"/><Image src="/brand/icon-mark.webp" alt="" width={width} height={Math.round(width * 422 / 640)} priority={priority} style={{ width, height: "auto" }} className="relative z-10 object-contain opacity-80 drop-shadow-[0_0_24px_rgba(255,106,0,.28)]"/><span className="absolute bottom-4 text-[10px] font-black uppercase tracking-[.2em] text-slate-500">NexoPC selection</span></div>;
}
