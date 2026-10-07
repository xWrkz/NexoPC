import Image from "next/image";

export default function BrandLogo({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  return compact
    ? <Image src="/brand/icon-mark.webp" width={58} height={38} alt="" aria-hidden priority style={{ width: 44, height: "auto" }} className={`object-contain ${className}`}/>
    : <Image src="/brand/wordmark.webp" width={230} height={49} alt="NexoPC" priority style={{ width: 152, height: "auto" }} className={`object-contain ${className}`}/>;
}
