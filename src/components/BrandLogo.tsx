import Image from "next/image";

export default function BrandLogo({ compact = false, className = "", light = false }: { compact?: boolean; className?: string; light?: boolean }) {
  return compact
    ? <Image src="/brand/icon-mark.webp" width={44} height={29} alt="" aria-hidden priority className={`object-contain ${className}`}/>
    : <span className={`brand-wordmark ${light ? "brand-wordmark-light" : ""} ${className}`}>
      <Image src="/brand/wordmark.webp" width={230} height={49} alt="NexoPC" priority className="brand-wordmark-base"/>
      {light ? <span className="brand-wordmark-nexo" aria-hidden><Image src="/brand/wordmark.webp" width={230} height={49} alt="" priority/></span> : null}
    </span>;
}
