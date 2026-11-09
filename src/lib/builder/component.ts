import { Product } from "@/types/product";
import { BuilderCategory, ComponentePC, ComponentSpecs } from "@/lib/compatibility/rules";
import { getPriceValue } from "@/lib/utils/price";

// Convierte productos del catálogo en piezas del armador. Vive fuera de PcBuilder para que
// el servidor (armados de la home) use exactamente la misma lectura de specs que el cliente.

const componentTypes: Record<string, BuilderCategory> = {
  procesador: "cpu", placa_madre: "motherboard", memoria_ram: "ram", tarjeta_grafica: "gpu",
  almacenamiento: "storage", fuente_poder: "psu", gabinete: "case", refrigeracion: "cooler",
};

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

export function productCategory(product: Product): BuilderCategory | undefined {
  if (product.nexopcHardware?.componentTypeSlug) {
    const fromHardware = componentTypes[product.nexopcHardware.componentTypeSlug];
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

export function extractHardwareFromDescription(name: string, html?: string, category?: BuilderCategory): ComponentSpecs {
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
      recommendedPsuWatts: recPsuMatch ? parseInt(recPsuMatch[1], 10) : undefined,
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
    };
  }

  return {};
}

export function toComponent(product: Product, category: BuilderCategory): ComponentePC {
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
      integratedGraphics: specs?.integratedGraphics ?? undefined,
      coolerIncluded: specs?.coolerIncluded ?? undefined,
      ramSlots: nonZero(specs?.ramSlots),
      modules: nonZero(specs?.modules),
      maxRadiatorMm: nonZero(specs?.maxRadiatorMm),
      coolerType: specs?.coolerType ?? undefined,
      coolerHeightMm: nonZero(specs?.coolerHeightMm),
      radiatorMm: nonZero(specs?.radiatorMm),
      maxTdpWatts: nonZero(specs?.maxTdpWatts),
      supportedSocketIds: nonEmpty(specs?.supportedSocketIds),
    },
  };
}
