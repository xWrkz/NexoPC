import Image from "next/image";

export default function BrandLogo({ compact = false, className = "" }: { compact?: boolean; className?: string; light?: boolean }) {
  return compact
    ? <Image src="/brand/icon-mark.webp" width={44} height={29} alt="" aria-hidden priority style={{ width: 44, height: "auto" }} className={`object-contain ${className}`}/>
    : <span className={`brand-wordmark ${className}`}>
      <Image src="/brand/Titulo.png" width={214} height={74} alt="NexoPC" priority className="brand-wordmark-base"/>
    </span>;
}

