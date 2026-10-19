"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { AlertTriangle, ArrowRight, Check, CheckCircle2, ChevronDown, ChevronRight, ChevronUp, CircleHelp, Copy, Cpu, Gauge, HardDrive, Info, Layers, MemoryStick, MonitorCog, Fan, PackageOpen, Plus, RotateCcw, Search, ShieldAlert, Sparkles, X, Zap } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Product } from "@/types/product";
import { BuilderCategory, ComponentePC, ComponentSpecs, validarCompatibilidad } from "@/lib/compatibility/rules";
import { useBuilderStore } from "@/store/builderStore";
import { useCartStore } from "@/store/cartStore";
import { getPriceValue, hasValidPrice } from "@/lib/utils/price";
import { formatPrice } from "@/lib/utils/formatPrice";
import ProductPlaceholder from "@/components/ProductPlaceholder";

const steps: Array<{ key: BuilderCategory; label: string; short: string; help: string; componentType: string; icon: typeof Cpu }> = [
  { key: "cpu", label: "Procesador", short: "CPU", help: "Ejecuta las tareas principales del equipo.", componentType: "procesador", icon: Cpu },
  { key: "motherboard", label: "Placa madre", short: "Placa", help: "Conecta y coordina todos los componentes.", componentType: "placa_madre", icon: MonitorCog },
  { key: "ram", label: "Memoria RAM", short: "RAM", help: "Mantiene abiertas tus aplicaciones y tareas.", componentType: "memoria_ram", icon: MemoryStick },
  { key: "gpu", label: "Tarjeta gráfica", short: "GPU", help: "Procesa imagen, video, diseño y juegos.", componentType: "tarjeta_grafica", icon: Gauge },
  { key: "storage", label: "Almacenamiento", short: "Disco", help: "Guarda el sistema, programas y archivos.", componentType: "almacenamiento", icon: HardDrive },
  { key: "psu", label: "Fuente de poder", short: "Fuente", help: "Entrega energía estable a todo el equipo.", componentType: "fuente_poder", icon: Zap },
  { key: "case", label: "Gabinete", short: "Gabinete", help: "Protege las piezas y define el espacio disponible.", componentType: "gabinete", icon: PackageOpen },
  { key: "cooler", label: "Refrigeración", short: "Cooler", help: "Disipa el calor y mantiene la temperatura óptima del procesador.", componentType: "refrigeracion", icon: Fan },
];

const goals = [
  { id: "first-pc", label: "Mi primera PC" }, { id: "study", label: "Estudio" }, { id: "work", label: "Trabajo" },
  { id: "programming", label: "Programación" }, { id: "creation", label: "Diseño y creación" }, { id: "gaming", label: "Gaming" },
];

const categorySlugMap: Record<string, BuilderCategory> = {
  "procesadores": "cpu",
  "procesador": "cpu",
  "cpu": "cpu",
  "placas-madre": "motherboard",
  "placa-madre": "motherboard",
  "motherboard": "motherboard",
  "memoria-ram": "ram",
  "memorias-ram": "ram",
  "ram": "ram",
  "tarjetas-graficas": "gpu",
  "tarjeta-grafica": "gpu",
  "tarjetas-de-video": "gpu",
  "gpu": "gpu",
  "almacenamiento": "storage",
  "discos": "storage",
  "ssd": "storage",
  "fuentes-de-poder": "psu",
  "fuente-de-poder": "psu",
  "fuentes": "psu",
  "psu": "psu",
  "gabinetes": "case",
  "gabinete": "case",
  "cases": "case",
  "case": "case",
  "refrigeracion": "cooler",
  "refrigeración": "cooler",
  "coolers": "cooler",
  "cooler": "cooler",
};

function productCategory(product: Product): BuilderCategory | undefined {
  if (product.nexopcHardware?.componentTypeSlug) {
    const fromHardware = steps.find((step) => step.componentType === product.nexopcHardware?.componentTypeSlug)?.key;
    if (fromHardware) return fromHardware;
  }
  const categoryNodes = product.productCategories?.nodes ?? [];
  for (const cat of categoryNodes) {
    const slug = cat.slug?.toLowerCase();
    if (slug && categorySlugMap[slug]) return categorySlugMap[slug];
    const name = cat.name?.toLowerCase();
    if (name && categorySlugMap[name]) return categorySlugMap[name];
  }
  return undefined;
}

const socketMap: Record<string, number> = {
  "am4": 1,
  "am5": 2,
  "lga 1700": 3,
  "lga1700": 3,
  "lga 1851": 4,
  "lga1851": 4,
  "lga 1200": 5,
  "lga1200": 5,
  "lga 1151": 6,
  "lga1151": 6,
};

const memoryTypeMap: Record<string, number> = {
  "ddr4": 1,
  "ddr5": 2,
};

function detectBoardFormFactor(text: string): number | undefined {
  if (/\be-?atx\b/i.test(text)) return 4;
  if (/\b(?:micro[- ]?atx|matx|m-atx)\b/i.test(text)) return 2;
  if (/\b(?:mini[- ]?itx|mitx)\b/i.test(text)) return 1;
  if (/\batx\b/i.test(text)) return 3;
  return undefined;
}

function detectCaseSupportedFormFactors(text: string): number[] | undefined {
  const withoutSubtypes = text.replace(/\b(?:micro|mini)[- ]?(?:atx|itx)\b|\b(?:matx|m-atx|mitx)\b/gi, "");
  if (/\be-?atx\b/i.test(text)) return [1, 2, 3, 4];
  if (/\batx\b/i.test(withoutSubtypes)) return [1, 2, 3];
  if (/\b(?:micro[- ]?atx|matx|m-atx)\b/i.test(text)) return [1, 2];
  if (/\b(?:mini[- ]?itx|mitx)\b/i.test(text)) return [1];
  return undefined;
}

function extractHardwareFromDescription(name: string, html?: string, category?: BuilderCategory): ComponentSpecs {
  const text = (name + " " + (html || "")).toLowerCase();

  let socketId: number | undefined;
  for (const [k, v] of Object.entries(socketMap)) {
    if (text.includes(k)) {
      socketId = v;
      break;
    }
  }

  let memoryTypeId: number | undefined;
  for (const [k, v] of Object.entries(memoryTypeMap)) {
    if (text.includes(k)) {
      memoryTypeId = v;
      break;
    }
  }

  const formFactorId = detectBoardFormFactor(text);

  const tdpMatch = text.match(/(?:tdp|consumo)[\s:]*(\d+)\s*w/i);
  const psuWattsMatch = text.match(/\b(\d{3,4})\s*w(?:atts)?\b/i);
  const recPsuMatch = text.match(/(?:fuente recomendada|recomendada)[\s:]*(\d+)\s*w/i);
  const gpuContextLengthMatch = text.match(/(?:gpu|tarjeta|gr[aá]fica|vga|longitud|largo)[^.\n]{0,40}?(\d{3})\s*mm/i);
  const genericLengthMatch = text.match(/\b(\d{3})\s*mm\b/i);

  if (category === "cpu") {
    let sId = socketId;
    if (!sId) {
      if (text.includes("ryzen 7000") || text.includes("ryzen 8000") || text.includes("ryzen 9000") || /ryzen\s+[3579]\s+[789]\d{3}/i.test(text)) {
        sId = 2; // AM5
      } else if (text.includes("ryzen 3000") || text.includes("ryzen 4000") || text.includes("ryzen 5000") || /ryzen\s+[3579]\s+[345]\d{3}/i.test(text)) {
        sId = 1; // AM4
      } else if (/core\s+ultra/i.test(text)) {
        sId = 4; // LGA 1851
      } else if (/i[3579][\s-]*1[234]\d{2,3}/i.test(text)) {
        sId = 3; // LGA 1700
      }
    }
    const mId = memoryTypeId ?? (sId === 1 ? 1 : sId === 2 || sId === 4 ? 2 : undefined);
    return {
      socketId: sId,
      memoryTypeId: mId,
      tdpWatts: tdpMatch ? parseInt(tdpMatch[1], 10) : undefined,
    };
  }

  if (category === "motherboard") {
    let sId = socketId;
    if (!sId) {
      if (/\b(?:b650|x670|a620|x870|b850)[e]?\b/i.test(text)) sId = 2; // AM5
      else if (/\b(?:b550|b450|a520|x570|a320)\b/i.test(text)) sId = 1; // AM4
      else if (/\b(?:b760|z790|h610|b660|z690|h770)\b/i.test(text)) sId = 3; // LGA 1700
      else if (/\b(?:z890|b860|h810)\b/i.test(text)) sId = 4; // LGA 1851
    }
    const supportedMem = memoryTypeId ? [memoryTypeId] : sId === 1 ? [1] : sId === 2 || sId === 4 ? [2] : undefined;
    return {
      socketId: sId,
      formFactorId,
      supportedMemoryTypeIds: supportedMem,
      supportedStorageInterfaceIds: [1, 2, 3, 4],
    };
  }

  if (category === "ram") {
    return {
      memoryTypeId,
    };
  }

  if (category === "gpu") {
    const parsedTdp = tdpMatch ? parseInt(tdpMatch[1], 10) : undefined;
    const rawLen = gpuContextLengthMatch ? parseInt(gpuContextLengthMatch[1], 10) : genericLengthMatch ? parseInt(genericLengthMatch[1], 10) : undefined;
    const gpuLengthMm = rawLen && rawLen >= 140 && rawLen <= 450 ? rawLen : undefined;
    return {
      tdpWatts: parsedTdp,
      gpuLengthMm,
      recommendedPsuWatts: recPsuMatch ? parseInt(recPsuMatch[1], 10) : parsedTdp ? parsedTdp + 300 : undefined,
    };
  }

  if (category === "storage") {
    const isNvme = text.includes("nvme") || text.includes("m.2") || text.includes("pcie");
    const isSata = text.includes("sata") || text.includes("2.5") || text.includes("3.5") || text.includes("hdd");
    if (!isNvme && !isSata) return {};
    return {
      storageInterfaceId: isNvme ? 1 : 3,
      storageInterfaceSlug: isNvme ? "m2_nvme" : text.includes("3.5") ? "sata_3_5" : "sata_2_5",
    };
  }

  if (category === "psu") {
    return {
      continuousWatts: psuWattsMatch ? parseInt(psuWattsMatch[1], 10) : undefined,
    };
  }

  if (category === "case") {
    const supportedFormFactorIds = detectCaseSupportedFormFactors(text);
    const maxGpuLengthMm = gpuContextLengthMatch ? parseInt(gpuContextLengthMatch[1], 10) : undefined;
    return {
      supportedFormFactorIds,
      maxGpuLengthMm,
      bays25: 2,
      bays35: 2,
    };
  }

  return {};
}

function toComponent(product: Product, category: BuilderCategory): ComponentePC {
  const specs = product.nexopcHardware;
  const descSpecs = extractHardwareFromDescription(product.name, product.description, category);
  const nonZero = (val?: number | null) => (val && val > 0 ? val : undefined);
  const nonEmpty = (arr?: number[] | null) => (arr && arr.length > 0 ? arr : undefined);

  return {
    id: product.id,
    productId: product.databaseId,
    categoria: category,
    nombre: product.name,
    precio: getPriceValue(product.price),
    image: product.image?.sourceUrl,
    specs: {
      socketId: nonZero(specs?.socketId) ?? descSpecs.socketId,
      memoryTypeId: nonZero(specs?.memoryTypeId) ?? descSpecs.memoryTypeId,
      formFactorId: nonZero(specs?.formFactorId) ?? descSpecs.formFactorId,
      storageInterfaceId: nonZero(specs?.storageInterfaceId) ?? descSpecs.storageInterfaceId,
      storageInterfaceSlug: specs?.storageInterfaceSlug || descSpecs.storageInterfaceSlug,
      supportedMemoryTypeIds: nonEmpty(specs?.supportedMemoryTypeIds) ?? descSpecs.supportedMemoryTypeIds,
      supportedStorageInterfaceIds: nonEmpty(specs?.supportedStorageInterfaceIds) ?? descSpecs.supportedStorageInterfaceIds,
      supportedFormFactorIds: nonEmpty(specs?.supportedFormFactorIds) ?? descSpecs.supportedFormFactorIds,
      tdpWatts: nonZero(specs?.tdpWatts) ?? descSpecs.tdpWatts,
      gpuLengthMm: nonZero(specs?.gpuLengthMm) ?? descSpecs.gpuLengthMm,
      recommendedPsuWatts: nonZero(specs?.recommendedPsuWatts) ?? descSpecs.recommendedPsuWatts,
      maxGpuLengthMm: nonZero(specs?.maxGpuLengthMm) ?? descSpecs.maxGpuLengthMm,
      maxCoolerHeightMm: nonZero(specs?.maxCoolerHeightMm) ?? descSpecs.maxCoolerHeightMm,
      continuousWatts: nonZero(specs?.continuousWatts) ?? descSpecs.continuousWatts,
      m2Slots: nonZero(specs?.m2Slots),
      sataPorts: nonZero(specs?.sataPorts),
      bays25: nonZero(specs?.bays25) ?? descSpecs.bays25,
      bays35: nonZero(specs?.bays35) ?? descSpecs.bays35,
    },
  };
}


function getProductRecommendation(
  product: Product,
  category: BuilderCategory,
  goal: string
): { isRecommended: boolean; reason?: string } {
  const name = (product.name || "").toLowerCase();
  const desc = (product.description || "").toLowerCase();

  const isRyzen5or7 = name.includes("ryzen 5") || name.includes("ryzen 7");
  const isRyzen9orCoreI9 = name.includes("ryzen 9") || name.includes("i9") || name.includes("ultra 9");
  const isCoreI5orI7 = name.includes("i5") || name.includes("i7") || name.includes("ultra 5") || name.includes("ultra 7");
  const isCoreI3orEntry = name.includes("i3") || name.includes("3200g") || name.includes("3400g") || name.includes("4600g") || name.includes("5600g");

  const is32Gb = name.includes("32gb") || name.includes("2x16gb");
  const is16Gb = name.includes("16gb") || name.includes("2x8gb");
  const is64Gb = name.includes("64gb") || name.includes("2x32gb");

  const isMidHighGpu = name.includes("4070") || name.includes("4060 ti") || name.includes("7700") || name.includes("7800") || name.includes("6700");
  const isTopGpu = name.includes("4080") || name.includes("4090") || name.includes("7900") || name.includes("5080") || name.includes("5090");
  const isEntryMidGpu = name.includes("4060") || name.includes("3060") || name.includes("7600") || name.includes("6600");

  const isNvme1Tb = (name.includes("1tb") || name.includes("1000gb")) && (name.includes("nvme") || name.includes("m.2"));
  const isNvme2Tb = (name.includes("2tb") || name.includes("2000gb")) && (name.includes("nvme") || name.includes("m.2"));
  const isNvme500Gb = (name.includes("500gb") || name.includes("512gb")) && (name.includes("nvme") || name.includes("m.2"));

  const isPsu650_750 = name.includes("650") || name.includes("750") || desc.includes("650 w") || desc.includes("750 w");
  const isPsu850Plus = name.includes("850") || name.includes("1000") || desc.includes("850 w") || desc.includes("1000 w");
  const isPsu500_600 = name.includes("500") || name.includes("550") || name.includes("600");

  switch (goal) {
    case "gaming":
      if (category === "cpu" && (isRyzen5or7 || isCoreI5orI7)) return { isRecommended: true, reason: "Alto rendimiento por núcleo ideal para gaming" };
      if (category === "gpu" && (isEntryMidGpu || isMidHighGpu)) return { isRecommended: true, reason: "Excelente tasa de FPS y gráficos fluidos" };
      if (category === "ram" && (is16Gb || is32Gb)) return { isRecommended: true, reason: "Capacidad y velocidad óptimas para juegos modernos" };
      if (category === "storage" && (isNvme1Tb || isNvme2Tb)) return { isRecommended: true, reason: "Carga rápida de mapas y texturas pesadas" };
      if (category === "psu" && (isPsu650_750 || isPsu850Plus)) return { isRecommended: true, reason: "Potencia estable con margen para tarjeta gráfica" };
      if (category === "motherboard" && (name.includes("b650") || name.includes("b760") || name.includes("gaming") || name.includes("tuf") || name.includes("aorus"))) return { isRecommended: true, reason: "Chipset balanceado con soporte PCIe veloz" };
      if (category === "case" && (name.includes("mesh") || name.includes("flow") || name.includes("air") || name.includes("rgb"))) return { isRecommended: true, reason: "Flujo de aire optimizado para mantener bajas temperaturas" };
      if (category === "cooler" && (name.includes("liquid") || name.includes("240") || name.includes("360") || name.includes("peerless") || name.includes("ak620"))) return { isRecommended: true, reason: "Disipación térmica constante durante sesiones intensas" };
      break;

    case "creation":
      if (category === "cpu" && (isRyzen9orCoreI9 || isCoreI5orI7 || name.includes("i7"))) return { isRecommended: true, reason: "Muchos núcleos e hilos para renderizado y exportación rápida" };
      if (category === "ram" && (is32Gb || is64Gb)) return { isRecommended: true, reason: "Memoria amplia para Premiere, Blender y multitarea pesada" };
      if (category === "gpu" && (isMidHighGpu || isTopGpu || name.includes("16gb") || name.includes("12gb"))) return { isRecommended: true, reason: "VRAM generosa para aceleración 3D y edición de video" };
      if (category === "storage" && (isNvme2Tb || isNvme1Tb)) return { isRecommended: true, reason: "Transferencia ultra rápida para archivos de video pesados" };
      if (category === "psu" && (isPsu650_750 || isPsu850Plus)) return { isRecommended: true, reason: "Energía continua certificada para cargas de render al 100%" };
      break;

    case "programming":
      if (category === "cpu" && (isCoreI5orI7 || isRyzen5or7)) return { isRecommended: true, reason: "Compilación rápida y soporte ágil de virtualización" };
      if (category === "ram" && is32Gb) return { isRecommended: true, reason: "Capacidad recomendada para Docker, IDEs y máquinas virtuales" };
      if (category === "storage" && isNvme1Tb) return { isRecommended: true, reason: "Lectura/escritura veloz de repositorios y proyectos" };
      if (category === "gpu" && isEntryMidGpu) return { isRecommended: true, reason: "Suficiente para múltiples monitores 4K y aceleración básica" };
      break;

    case "work":
      if (category === "cpu" && (isCoreI5orI7 || isRyzen5or7 || isCoreI3orEntry)) return { isRecommended: true, reason: "Rendimiento eficiente y confiable para oficina y multitarea" };
      if (category === "ram" && (is16Gb || is32Gb)) return { isRecommended: true, reason: "Fluidez constante sin saturación de memoria" };
      if (category === "storage" && (isNvme500Gb || isNvme1Tb)) return { isRecommended: true, reason: "Inicio instantáneo de programas y sistema operativo" };
      if (category === "psu" && isPsu500_600) return { isRecommended: true, reason: "Consumo contenido y alta durabilidad" };
      break;

    case "study":
    case "first-pc":
    default:
      if (category === "cpu" && (isCoreI3orEntry || isRyzen5or7)) return { isRecommended: true, reason: "Excelente relación calidad/precio para empezar" };
      if (category === "ram" && is16Gb) return { isRecommended: true, reason: "El estándar recomendado para todas las tareas cotidianas" };
      if (category === "storage" && (isNvme500Gb || isNvme1Tb)) return { isRecommended: true, reason: "Espacio y velocidad para trabajos, clases y proyectos" };
      if (category === "gpu" && isEntryMidGpu) return { isRecommended: true, reason: "Gráficos dedicados accesibles con gran versatilidad" };
      if (category === "psu" && (isPsu500_600 || isPsu650_750)) return { isRecommended: true, reason: "Fuente confiable con margen para futuras mejoras" };
      break;
  }

  return { isRecommended: false };
}

export default function PcBuilder({ products }: { products: Product[] }) {
  const params = useSearchParams();
  const reduce = useReducedMotion();
  const initialMode = params.get("modo") === "guiado" ? "guided" : "advanced";
  const urlGoal = params.get("uso");
  const {
    activeGoal,
    seleccion,
    configsByGoal,
    result,
    setActiveGoal,
    setComponente,
    loadGoal,
    copyCurrentToGoal,
    resetCurrentGoal,
    getTotal,
  } = useBuilderStore();
  const [mode, setMode] = useState<"guided" | "advanced">(initialMode);
  const goal = activeGoal || "first-pc";
  const [budget, setBudget] = useState<number | undefined>();
  const [activeCategory, setActiveCategory] = useState<BuilderCategory | null>(null);
  const [search, setSearch] = useState("");
  const [onlyCompatible, setOnlyCompatible] = useState(true);
  const [onlyRecommended, setOnlyRecommended] = useState(false);
  const [pendingGoalChange, setPendingGoalChange] = useState<{
    targetGoalId: string;
    targetLabel: string;
  } | null>(null);

  useEffect(() => {
    if (urlGoal && goals.some((g) => g.id === urlGoal) && urlGoal !== activeGoal) {
      loadGoal(urlGoal, activeGoal);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlGoal]);

  useEffect(() => {
    if (activeCategory || pendingGoalChange) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          if (pendingGoalChange) setPendingGoalChange(null);
          else if (activeCategory) setActiveCategory(null);
        }
      };
      window.addEventListener("keydown", onKeyDown);
      return () => {
        document.body.style.overflow = original;
        window.removeEventListener("keydown", onKeyDown);
      };
    }
  }, [activeCategory, pendingGoalChange]);
  const addItem = useCartStore((state) => state.addItem);
  const selected = Object.values(seleccion).filter(Boolean) as ComponentePC[];
  const progress = Math.round((selected.length / steps.length) * 100);
  const total = getTotal();
  const optionsByCategory = useMemo(() => Object.fromEntries(steps.map((step) => [step.key, products.filter((product) => productCategory(product) === step.key)])) as Record<BuilderCategory, Product[]>, [products]);
  const activeStep = steps.find((step) => step.key === activeCategory);
  const options = useMemo(() => {
    if (!activeCategory) return [];
    const query = search.toLowerCase();
    return optionsByCategory[activeCategory].filter((product) =>
      `${product.name} ${product.sku ?? ""}`.toLowerCase().includes(query)
    );
  }, [activeCategory, optionsByCategory, search]);

  const checkCompatibility = useCallback((product: Product) => {
    if (!activeCategory) return { isCompatible: true, error: null };
    const candidate = toComponent(product, activeCategory);

    // Evaluate base errors without the active category to avoid false conflicts
    const baseWithoutCategory = { ...seleccion, [activeCategory]: null };
    const baseRes = validarCompatibilidad(baseWithoutCategory);

    // Evaluate hypothetical errors with candidate
    const hypothetical = { ...seleccion, [activeCategory]: candidate };
    const res = validarCompatibilidad(hypothetical);

    // Only errors caused specifically by this candidate
    const specificErrors = res.errors.filter((err) => !baseRes.errors.includes(err));

    return { isCompatible: specificErrors.length === 0, error: specificErrors[0] ?? null };
  }, [activeCategory, seleccion]);

  const displayedOptions = useMemo(() => {
    if (!activeCategory) return [];
    let list = onlyCompatible ? options.filter((p) => checkCompatibility(p).isCompatible) : options;

    if (onlyRecommended && (mode === "guided" || goal)) {
      const recs = list.filter((p) => getProductRecommendation(p, activeCategory, goal).isRecommended);
      if (recs.length > 0) list = recs;
    }

    // Sort: currently selected first, then recommended for goal, then normal
    return [...list].sort((a, b) => {
      const aSel = seleccion[activeCategory]?.id === a.id;
      const bSel = seleccion[activeCategory]?.id === b.id;
      if (aSel !== bSel) return aSel ? -1 : 1;

      if (mode === "guided" || goal) {
        const aRec = getProductRecommendation(a, activeCategory, goal).isRecommended;
        const bRec = getProductRecommendation(b, activeCategory, goal).isRecommended;
        if (aRec !== bRec) return aRec ? -1 : 1;
      }

      return 0;
    });
  }, [options, activeCategory, onlyCompatible, onlyRecommended, checkCompatibility, seleccion, mode, goal]);
  const unclassified = products.filter((product) => !productCategory(product)).length;
  const pendingPrices = selected.filter((item) => item.precio <= 0).length;

  const choose = (product: Product) => {
    if (!activeCategory || !hasValidPrice(product.price)) return;
    const current = seleccion[activeCategory];
    if (current && current.id === product.id) {
      setComponente(activeCategory, null, goal);
      return;
    }
    setComponente(activeCategory, toComponent(product, activeCategory), goal);
    const next = steps.find((step) => !seleccion[step.key] && step.key !== activeCategory);
    setActiveCategory(next?.key ?? null);
    setSearch("");
  };

  const handleGoalClick = (targetGoalId: string) => {
    if (targetGoalId === goal) return;
    const currentPieces = selected.length;
    if (currentPieces > 0) {
      const targetLabel = goals.find((g) => g.id === targetGoalId)?.label ?? targetGoalId;
      setPendingGoalChange({
        targetGoalId,
        targetLabel,
      });
      return;
    }
    loadGoal(targetGoalId, goal);
    setActiveGoal(targetGoalId);
  };
  const addBuild = () => {
    if (!selected.length || result.errors.length || pendingPrices) return;
    const buildId = `build-${Date.now()}`;
    const goalLabel = goals.find((g) => g.id === goal)?.label ?? "Personalizada";
    selected.forEach((item) =>
      addItem({
        id: `${buildId}-${item.id}`,
        productId: item.productId,
        name: item.nombre,
        price: item.precio,
        quantity: 1,
        image: item.image,
        category: item.categoria,
        buildId,
        buildName: `PC ${goalLabel} NexoPC`,
      })
    );
    resetCurrentGoal(goal);
  };
  const resetBuild = () => {
    const goalLabel = goals.find((g) => g.id === goal)?.label ?? "este ensamble";
    if (!selected.length || window.confirm(`¿Quieres quitar todas las piezas seleccionadas de ${goalLabel}?`)) {
      resetCurrentGoal(goal);
    }
  };

  return (
    <div className="builder-shell"><div className="builder-modebar"><div><p className="eyebrow">Elige cómo avanzar</p><h2 className="mt-1 text-xl font-bold">Tú decides cuánto acompañamiento necesitas</h2></div><div className="builder-mode-switch" role="group" aria-label="Modo del armador"><button type="button" onClick={() => setMode("guided")} aria-pressed={mode === "guided"} className={mode === "guided" ? "active" : ""}><Sparkles size={16}/>Guíame paso a paso</button><button type="button" onClick={() => setMode("advanced")} aria-pressed={mode === "advanced"} className={mode === "advanced" ? "active" : ""}><Cpu size={16}/>Sé qué componentes quiero</button></div></div>

    <AnimatePresence initial={false}>{mode === "guided" ? <m.section initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="builder-guide"><div><p className="filter-title">1. ¿Cuál es tu objetivo principal?</p><div className="mt-3 flex flex-wrap gap-2">
                {goals.map((item) => {
                  const savedInGoal = configsByGoal[item.id]
                    ? Object.values(configsByGoal[item.id]).filter(Boolean).length
                    : 0;
                  const pieceCount = item.id === goal ? selected.length : savedInGoal;

                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => handleGoalClick(item.id)}
                      className={`filter-chip relative transition-all ${goal === item.id ? "filter-chip-active" : ""}`}
                    >
                      <span>{item.label}</span>
                      {pieceCount > 0 ? (
                        <span
                          className={`ml-1.5 inline-flex items-center justify-center rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                            goal === item.id
                              ? "bg-orange-500/30 text-orange-200"
                              : "bg-white/10 text-slate-300"
                          }`}
                        >
                          {pieceCount}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div></div><label className="builder-budget"><span>2. Presupuesto aproximado</span><div className="builder-budget-wrap"><span>S/</span><input type="number" min="0" step="100" value={budget ?? ""} onChange={(event) => setBudget(event.target.value ? Number(event.target.value) : undefined)} placeholder="Ej. 3000"/><div className="price-stepper-actions"><button type="button" onClick={() => setBudget((b) => Math.max(0, (b ?? 3000) + 100))} className="stepper-arrow-btn" aria-label="Aumentar presupuesto en 100"><ChevronUp size={12}/></button><button type="button" onClick={() => setBudget((b) => Math.max(0, (b ?? 3000) - 100))} className="stepper-arrow-btn" aria-label="Disminuir presupuesto en 100"><ChevronDown size={12}/></button></div></div><small>Lo usaremos como referencia; no ocultaremos piezas por precio.</small></label></m.section> : null}</AnimatePresence>

    <div className="builder-workspace"><aside className="builder-steps"><div className="mb-4 flex items-center justify-between"><span className="text-xs font-black uppercase tracking-[.16em] text-slate-500">Componentes</span><strong className="text-sm text-cyan-200">{selected.length}/{steps.length}</strong></div>{steps.map((step, index) => { const current = seleccion[step.key]; const available = optionsByCategory[step.key].length; const Icon = step.icon; return <button type="button" key={step.key} onClick={() => setActiveCategory(step.key)} className={`builder-step focus-ring ${current ? "builder-step-complete" : ""} ${activeCategory === step.key ? "builder-step-active" : ""}`}><span className="builder-step-number">{current ? <Check size={14}/> : index + 1}</span><Icon size={17}/><span className="min-w-0 flex-1 text-left"><strong>{step.label}</strong><small>{current ? current.nombre : available ? `${available} ${available === 1 ? "opción" : "opciones"}` : "Sin ficha técnica"}</small></span><ChevronRight size={15}/></button>; })}{unclassified ? <p className="mt-4 flex gap-2 rounded-xl border border-amber-300/12 bg-amber-300/5 p-3 text-[11px] leading-5 text-amber-100/70"><Info size={14} className="mt-0.5 shrink-0"/>{unclassified} {unclassified === 1 ? "producto aún no tiene" : "productos aún no tienen"} tipo de componente y ficha técnica; no aparecerán en el armador hasta completarlos.</p> : null}</aside>

      <section className="builder-stage"><div className="builder-stage-header"><div><p className="eyebrow">Vista de tu configuración</p><h2 className="font-display mt-2 text-3xl font-bold">Tu equipo toma forma aquí.</h2></div><div className="builder-progress-ring" style={{ "--progress": `${progress * 3.6}deg` } as React.CSSProperties}><span>{progress}%</span></div></div><div className="pc-chassis"><div className="tech-grid absolute inset-0 opacity-50"/><span className="pc-energy-line"/><Image src="/brand/icon-mark.webp" width={110} height={73} alt="" className="pc-brand-mark"/><div className="pc-slot-grid">{steps.map((step, index) => { const item = seleccion[step.key]; const Icon = step.icon; return <m.button type="button" layout key={step.key} onClick={() => setActiveCategory(step.key)} className={`pc-slot focus-ring ${item ? "pc-slot-filled" : ""}`} initial={false} animate={item && !reduce ? { scale: [1, 1.06, 1] } : {}} transition={{ duration: .45 }}><span className="pc-slot-icon"><Icon size={18}/></span><span><small>{step.short}</small><strong>{item ? item.nombre : "Pendiente"}</strong></span>{item ? <CheckCircle2 size={16} className="ml-auto text-emerald-300"/> : <Plus size={15} className="ml-auto text-slate-600"/>}<span className="pc-slot-order">0{index + 1}</span></m.button>; })}</div></div><div className="builder-stage-tip"><CircleHelp size={17}/><span><strong>{mode === "guided" ? `Modo guiado: ${goals.find((item) => item.id === goal)?.label}` : "Modo avanzado"}.</strong> Selecciona cualquier módulo para comparar componentes del catálogo.</span></div></section>


      <aside className="builder-summary"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Tu configuración</p><h2 className="font-display mt-2 text-3xl font-bold">{selected.length}/{steps.length} piezas</h2></div><div className="builder-summary-icon"><Cpu size={21}/></div></div><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/8"><m.div className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-300 to-cyan-300" animate={{ width: `${progress}%` }}/></div><div className="mt-6 max-h-56 space-y-2 overflow-auto pr-1">{selected.length ? selected.map((item) => <div key={item.categoria} className="builder-summary-item flex items-center justify-between gap-2 group"><span className="min-w-0 flex-1 truncate">{item.nombre}</span><div className="flex items-center gap-2 shrink-0"><strong>{formatPrice(String(item.precio))}</strong><button type="button" onClick={() => setComponente(item.categoria, null, goal)} className="rounded p-1 text-slate-500 hover:bg-white/10 hover:text-rose-400 transition" title={`Quitar ${item.nombre}`} aria-label={`Quitar ${item.nombre}`}><X size={14}/></button></div></div>) : <div className="builder-empty"><Sparkles size={18}/>Elige un módulo del gabinete para comenzar.</div>}</div><div className="builder-power"><span><Zap size={16}/>Consumo estimado</span><strong>{result.estimatedPower ? `${result.estimatedPower} W` : "—"}</strong><small>{result.estimatedPower ? "Referencia basada en la información disponible." : "Aparecerá cuando selecciones componentes con consumo registrado."}</small></div>{result.errors.length ? <div className="builder-alert builder-alert-error"><p><ShieldAlert size={16}/>Incompatibilidad comprobada</p><ul>{result.errors.map((error) => <li key={error}>{error}</li>)}</ul></div> : null}{result.warnings.length ? <div className="builder-alert builder-alert-warning"><p><AlertTriangle size={16}/>Información por confirmar</p><ul>{result.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></div> : null}<div className="mt-6 border-t border-white/8 pt-5"><div className="flex items-end justify-between"><span className="font-bold text-slate-300">Total estimado</span><span className="price text-2xl">S/ {total.toFixed(2)}</span></div>{budget ? <div className={`mt-2 text-right text-xs font-bold ${total > budget ? "text-amber-300" : "text-slate-500"}`}>{total > budget ? `Supera tu referencia por S/ ${(total - budget).toFixed(2)}` : `Restan S/ ${(budget - total).toFixed(2)} de tu referencia`}</div> : null}<button onClick={addBuild} disabled={!selected.length || Boolean(result.errors.length)} className="btn-primary focus-ring mt-5 w-full disabled:cursor-not-allowed disabled:opacity-40"><Plus size={18}/>Añadir configuración</button><button onClick={resetBuild} className="focus-ring mt-3 flex w-full items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-white"><RotateCcw size={15}/>Reiniciar selección</button></div></aside>

    </div>

    <AnimatePresence>
      {activeStep ? (
        <m.div className="fixed inset-0 z-[90]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setActiveCategory(null)} aria-label="Cerrar selector" />
          <m.aside
            role="dialog"
            aria-modal="true"
            aria-label={`Elige ${activeStep.label.toLowerCase()}`}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 260 }}
            className="component-drawer flex flex-col"
          >
            <div className="component-drawer-head shrink-0">
              <div>
                <p className="eyebrow">Paso {steps.findIndex((step) => step.key === activeStep.key) + 1}</p>
                <h2 className="font-display mt-1 text-2xl sm:text-3xl font-bold">Elige {activeStep.label.toLowerCase()}</h2>
                <p className="mt-2 text-sm text-slate-400">{activeStep.help}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                className="focus-ring shrink-0 rounded-xl border border-white/10 p-2 text-slate-300 hover:text-white hover:bg-white/5"
                aria-label="Cerrar panel"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative mt-6 shrink-0">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-300/60" size={16} />
              <input
                className="field field-search !pl-10 w-full"
                style={{ paddingLeft: "2.6rem" }}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={`Buscar ${activeStep.label.toLowerCase()}…`}
              />
            </div>

            {mode === "guided" ? (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/5 px-3 py-2 text-xs text-amber-200">
                <Sparkles size={14} className="shrink-0 text-amber-400" />
                <span>
                  Opciones recomendadas para <strong>{goals.find((g) => g.id === goal)?.label ?? "tu objetivo"}</strong> priorizadas al inicio.
                </span>
              </div>
            ) : null}
            <div className="mt-3 flex flex-wrap shrink-0 items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 select-none">
                  <input
                    type="checkbox"
                    checked={onlyCompatible}
                    onChange={(e) => setOnlyCompatible(e.target.checked)}
                    className="rounded border-white/20 bg-slate-800 text-orange-500"
                  />
                  <span className="font-medium text-slate-300">Solo compatibles</span>
                </label>
                {mode === "guided" ? (
                  <label className="flex cursor-pointer items-center gap-2 select-none">
                    <input
                      type="checkbox"
                      checked={onlyRecommended}
                      onChange={(e) => setOnlyRecommended(e.target.checked)}
                      className="rounded border-white/20 bg-slate-800 text-amber-500"
                    />
                    <span className="font-medium text-amber-300">⭐ Solo recomendados</span>
                  </label>
                ) : null}
              </div>
              <span className="text-slate-500 text-[11px]">{displayedOptions.length} de {options.length} opciones</span>
            </div>

            <div className="mt-4 flex flex-col gap-3 pb-10 w-full min-w-0">
              {displayedOptions.length ? (
                displayedOptions.map((product) => {
                  const compat = checkCompatibility(product);
const rec = activeCategory ? getProductRecommendation(product, activeCategory, goal) : { isRecommended: false };
                  const selectedProduct = seleccion[activeStep.key]?.id === product.id;
                  const priced = hasValidPrice(product.price);
                  return (
                    <button
                      type="button"
                      key={product.id}
                      onClick={() => choose(product)}
                      disabled={!priced}
                      className={`component-choice focus-ring w-full min-w-0 text-left ${selectedProduct ? "component-choice-selected" : ""} ${!priced ? "component-choice-disabled" : ""} ${rec.isRecommended && !selectedProduct ? "border-amber-400/40 bg-amber-400/[0.02]" : ""}`}
                    >
                      <div className="component-choice-media shrink-0">
                        {product.image ? (
                          <Image src={product.image.sourceUrl} alt="" fill className="object-contain p-2" sizes="(max-width: 520px) 70px, 88px" />
                        ) : (
                          <ProductPlaceholder name={product.name} compact />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 text-left">
                        <span className="block truncate text-xs font-bold text-slate-500">
                          {product.sku ? `SKU ${product.sku}` : activeStep.label}
                        </span>
                        <h3 className="mt-1 line-clamp-2 text-sm sm:text-base font-bold leading-snug text-slate-100">
                          {product.name}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          {selectedProduct ? (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                              <Check size={12} className="shrink-0" />
                              <span>Seleccionado • Clic para quitar</span>
                            </span>
                          ) : compat.isCompatible ? (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                              <Check size={12} className="shrink-0" />
                              <span>Compatible</span>
                            </span>
                          ) : (
                            <span className="flex items-start gap-1 text-[11px] font-semibold text-rose-400">
                              <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                              <span className="line-clamp-2 leading-tight">Incompatible: {compat.error}</span>
                            </span>
                          )}
                          {rec.isRecommended ? (
                            <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                              <Sparkles size={11} className="text-amber-400" />
                              <span>Recomendado ({goals.find((g) => g.id === goal)?.label ?? "Sugerido"})</span>
                            </span>
                          ) : null}
                        </div>
                        {rec.isRecommended && rec.reason ? (
                          <p className="mt-1 text-[11px] text-amber-200/80 italic">{rec.reason}</p>
                        ) : null}
                        <p className={`mt-2 text-base sm:text-lg font-black ${priced ? "text-orange-300" : "text-amber-200"}`}>
                          {formatPrice(product.price)}
                        </p>
                        {!priced ? (
                          <small className="mt-1 block text-xs text-slate-500">Disponible para consulta en su ficha.</small>
                        ) : null}
                      </div>
                      <span className={`component-choice-action shrink-0 ${selectedProduct ? "bg-emerald-400 text-slate-950" : ""}`}>
                        {selectedProduct ? <Check size={17} /> : priced ? <Plus size={17} /> : <CircleHelp size={17} />}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="catalog-state">
                  <PackageOpen className="text-slate-500" />
                  <h2>No hay opciones disponibles</h2>
                  <p>Prueba otra búsqueda o vuelve más tarde.</p>
                </div>
              )}
            </div>
          </m.aside>
        </m.div>
      ) : null}
    </AnimatePresence>

      {/* Modal de confirmación al cambiar de modo con piezas activas */}
      <AnimatePresence>
        {pendingGoalChange ? (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Fondo con desenfoque */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPendingGoalChange(null)}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
            />

            {/* Diálogo emergente */}
            <m.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl"
              role="dialog"
              aria-modal="true"
            >
              {/* Botón de cerrar */}
              <button
                type="button"
                onClick={() => setPendingGoalChange(null)}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white focus-ring transition"
                aria-label="Cerrar modal"
              >
                <X size={18} />
              </button>

              {/* Encabezado */}
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/30">
                  <Layers size={22} />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400">
                    Cambiar objetivo de ensamble
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    ¿Cómo deseas continuar en {pendingGoalChange.targetLabel}?
                  </h3>
                </div>
              </div>

              {/* Mensaje contextual */}
              <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.03] p-3 text-xs leading-relaxed text-slate-300">
                <p>
                  Tienes <strong className="text-orange-300 font-semibold">{selected.length} de 8 componentes</strong> configurados para <strong className="text-white font-semibold">{goals.find((g) => g.id === goal)?.label ?? goal}</strong>. Cada objetivo mantiene su configuración de forma independiente sin perder piezas.
                </p>
              </div>

              {/* Opciones interactivas */}
              <div className="mt-5 space-y-3">
                {/* Opción 1: Nuevo ensamble o cargar ensamble guardado */}
                {(() => {
                  const targetSavedCount = configsByGoal[pendingGoalChange.targetGoalId]
                    ? Object.values(configsByGoal[pendingGoalChange.targetGoalId]).filter(Boolean).length
                    : 0;

                  return (
                    <button
                      type="button"
                      onClick={() => {
                        loadGoal(pendingGoalChange.targetGoalId, goal);
                        setPendingGoalChange(null);
                      }}
                      className="group relative flex w-full items-start gap-3.5 rounded-xl border border-amber-400/40 bg-amber-400/5 p-4 text-left transition hover:border-amber-400 hover:bg-amber-400/10 focus-ring"
                    >
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400/20 text-amber-300">
                        <Sparkles size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white group-hover:text-amber-200">
                            {targetSavedCount > 0
                              ? `Cargar ensamble guardado (${targetSavedCount} piezas)`
                              : `Nuevo ensamble para ${pendingGoalChange.targetLabel}`}
                          </span>
                          <span className="rounded-md bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                            Recomendado
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400 leading-normal">
                          {targetSavedCount > 0
                            ? `Tu ensamble actual de ${goals.find((g) => g.id === goal)?.label} queda guardado y recuperas las ${targetSavedCount} piezas de ${pendingGoalChange.targetLabel}.`
                            : `Guarda tu ensamble de ${goals.find((g) => g.id === goal)?.label} y empieza en blanco con recomendaciones personalizadas para ${pendingGoalChange.targetLabel}.`}
                        </p>
                      </div>
                      <ArrowRight size={16} className="mt-1 shrink-0 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-amber-300" />
                    </button>
                  );
                })()}

                {/* Opción 2: Conservar piezas y traspasar */}
                <button
                  type="button"
                  onClick={() => {
                    copyCurrentToGoal(pendingGoalChange.targetGoalId, goal);
                    setPendingGoalChange(null);
                  }}
                  className="group relative flex w-full items-start gap-3.5 rounded-xl border border-white/10 bg-slate-800/40 p-4 text-left transition hover:border-white/20 hover:bg-slate-800/80 focus-ring"
                >
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-700/50 text-slate-300">
                    <Copy size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-white group-hover:text-slate-100">
                      Conservar componentes actuales
                    </span>
                    <p className="mt-1 text-xs text-slate-400 leading-normal">
                      Traspasa tus {selected.length} componentes actuales hacia {pendingGoalChange.targetLabel} y adapta las sugerencias y compatibilidad.
                    </p>
                  </div>
                  <ArrowRight size={16} className="mt-1 shrink-0 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-white" />
                </button>
              </div>

              {/* Botón secundario para cancelar */}
              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setPendingGoalChange(null)}
                  className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white"
                >
                  Permanecer en {goals.find((g) => g.id === goal)?.label ?? "el modo actual"}
                </button>
              </div>
            </m.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
