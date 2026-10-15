import React from "react";
import Image from "next/image";
import { Layers3 } from "lucide-react";

interface CategoryIsometricIconProps {
  slug?: string;
  name?: string;
  className?: string;
  size?: number;
  priority?: boolean;
}

const CATEGORY_ICON_MAP: Record<string, string> = {
  // Almacenamiento / Storage / SSD
  "almacenamiento": "/icons/categories/almacenamiento.svg",
  "storage": "/icons/categories/storage.svg",
  "ssd": "/icons/categories/almacenamiento.svg",
  "discos": "/icons/categories/almacenamiento.svg",
  "disco": "/icons/categories/almacenamiento.svg",
  "nvme": "/icons/categories/almacenamiento.svg",

  // Fuentes de Poder / PSU
  "fuentes-de-poder": "/icons/categories/fuentes-de-poder.svg",
  "fuente-de-poder": "/icons/categories/fuentes-de-poder.svg",
  "fuentes": "/icons/categories/fuentes-de-poder.svg",
  "fuente": "/icons/categories/fuentes-de-poder.svg",
  "psu": "/icons/categories/psu.svg",
  "power-supply": "/icons/categories/psu.svg",

  // Gabinetes / Cases
  "gabinetes": "/icons/categories/gabinetes.svg",
  "gabinete": "/icons/categories/gabinetes.svg",
  "cases": "/icons/categories/gabinetes.svg",
  "case": "/icons/categories/gabinetes.svg",
  "chasis": "/icons/categories/gabinetes.svg",

  // Memoria RAM
  "memoria-ram": "/icons/categories/memoria-ram.svg",
  "memorias-ram": "/icons/categories/memoria-ram.svg",
  "ram": "/icons/categories/ram.svg",
  "memoria": "/icons/categories/memoria-ram.svg",

  // Placas Madre / Motherboards
  "placas-madre": "/icons/categories/placas-madre.svg",
  "placa-madre": "/icons/categories/placas-madre.svg",
  "motherboard": "/icons/categories/motherboard.svg",
  "motherboards": "/icons/categories/motherboard.svg",
  "placas": "/icons/categories/placas-madre.svg",
  "placa": "/icons/categories/placas-madre.svg",

  // Procesadores / CPU
  "procesadores": "/icons/categories/procesadores.svg",
  "procesador": "/icons/categories/procesadores.svg",
  "cpu": "/icons/categories/cpu.svg",
  "cpus": "/icons/categories/cpu.svg",

  // Tarjetas Gráficas / GPU
  "tarjetas-graficas": "/icons/categories/tarjetas-graficas.svg",
  "tarjeta-grafica": "/icons/categories/tarjetas-graficas.svg",
  "tarjetas-de-video": "/icons/categories/tarjetas-graficas.svg",
  "gpu": "/icons/categories/gpu.svg",
  "gpus": "/icons/categories/gpu.svg",

  // Refrigeración / Coolers
  "refrigeracion": "/icons/categories/refrigeracion.svg",
  "refrigeración": "/icons/categories/refrigeracion.svg",
  "cooler": "/icons/categories/cooler.svg",
  "coolers": "/icons/categories/cooler.svg",
  "disipador": "/icons/categories/refrigeracion.svg",
  "disipadores": "/icons/categories/refrigeracion.svg",

  // Ventiladores / Case Fans
  "ventiladores": "/icons/categories/ventiladores.svg",
  "ventilador": "/icons/categories/ventiladores.svg",
  "fans": "/icons/categories/fan.svg",
  "fan": "/icons/categories/fan.svg",
  "fan-case": "/icons/categories/ventiladores.svg",
};

export function getCategoryIconPath(slugOrName?: string): string | null {
  if (!slugOrName) return null;
  const normalized = slugOrName
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (CATEGORY_ICON_MAP[normalized]) return CATEGORY_ICON_MAP[normalized];

  // Try partial match
  for (const [key, path] of Object.entries(CATEGORY_ICON_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return path;
    }
  }

  return null;
}

export default function CategoryIsometricIcon({
  slug,
  name,
  className = "",
  size = 56,
  priority = false,
}: CategoryIsometricIconProps) {
  const iconPath = getCategoryIconPath(slug) || getCategoryIconPath(name);

  if (!iconPath) {
    return <Layers3 size={size * 0.4} className={`text-cyan-400 ${className}`} />;
  }

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <Image
        src={iconPath}
        alt={name || slug || "Categoría"}
        width={Math.round(size * 1.45)}
        height={size}
        priority={priority}
        unoptimized
        className="object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1"
      />
    </div>
  );
}
