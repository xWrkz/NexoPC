export type BuilderCategory = "cpu" | "motherboard" | "ram" | "gpu" | "storage" | "psu" | "case" | "cooler";
export interface ComponentSpecs {
  socketId?: number;
  memoryTypeId?: number;
  formFactorId?: number;
  storageInterfaceId?: number;
  storageInterfaceSlug?: string;
  supportedMemoryTypeIds?: number[];
  supportedStorageInterfaceIds?: number[];
  supportedFormFactorIds?: number[];
  tdpWatts?: number;
  gpuLengthMm?: number;
  recommendedPsuWatts?: number;
  maxGpuLengthMm?: number;
  maxCoolerHeightMm?: number;
  continuousWatts?: number;
  m2Slots?: number;
  sataPorts?: number;
  bays25?: number;
  bays35?: number;
  integratedGraphics?: boolean | null;
  coolerIncluded?: boolean | null;
  ramSlots?: number;
  modules?: number;
  maxRadiatorMm?: number;
  coolerType?: string | null;
  coolerHeightMm?: number;
  radiatorMm?: number;
  maxTdpWatts?: number;
  supportedSocketIds?: number[];
}
export interface ComponentePC {
  id: string;
  productId: number;
  categoria: BuilderCategory;
  nombre: string;
  precio: number;
  image?: string;
  specs: ComponentSpecs;
}
export interface CompatibilityResult {
  errors: string[];
  warnings: string[];
  estimatedPower: number;
}

function includes(values: number[] | undefined, value: number | undefined) {
  return Boolean(value && values?.includes(value));
}
function missing(message: string, values: unknown[]) {
  return values.some((value) => value === undefined || value === null || value === 0 || (Array.isArray(value) && !value.length))
    ? message
    : null;
}

export function validarCompatibilidad(componentes: Record<BuilderCategory, ComponentePC | null>): CompatibilityResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const { cpu, motherboard, ram, gpu, storage, psu, case: gabinete, cooler } = componentes;

  if (cpu && motherboard) {
    const incomplete = missing("No pudimos confirmar el socket entre CPU y placa madre.", [cpu.specs.socketId, motherboard.specs.socketId]);
    if (incomplete) warnings.push(incomplete);
    else if (cpu.specs.socketId !== motherboard.specs.socketId) errors.push("El socket del procesador no coincide con el de la placa madre.");
  }

  if (ram && motherboard) {
    const incomplete = missing("No pudimos confirmar el tipo de memoria entre RAM y placa madre.", [ram.specs.memoryTypeId, motherboard.specs.supportedMemoryTypeIds]);
    if (incomplete) warnings.push(incomplete);
    else if (!includes(motherboard.specs.supportedMemoryTypeIds, ram.specs.memoryTypeId)) errors.push("El tipo de memoria RAM no es compatible con la placa madre.");
  }

  if (cpu && ram && ram.specs.memoryTypeId) {
    const supported = cpu.specs.supportedMemoryTypeIds?.length ? cpu.specs.supportedMemoryTypeIds : cpu.specs.memoryTypeId ? [cpu.specs.memoryTypeId] : [];
    if (supported.length && !supported.includes(ram.specs.memoryTypeId)) {
      errors.push("El tipo de memoria RAM no es compatible con el controlador de memoria del procesador.");
    }
  }

  if (ram && motherboard && ram.specs.modules && motherboard.specs.ramSlots && ram.specs.modules > motherboard.specs.ramSlots) {
    errors.push(`La memoria trae ${ram.specs.modules} módulos y la placa madre solo tiene ${motherboard.specs.ramSlots} ranuras.`);
  }

  if (cpu && !gpu && cpu.specs.integratedGraphics === false) {
    warnings.push("Este procesador no tiene gráficos integrados: necesitas una tarjeta gráfica para tener video.");
  }

  if (cpu && !cooler && cpu.specs.coolerIncluded === false) {
    warnings.push("Este procesador no incluye disipador: añade refrigeración.");
  }

  if (cooler && cpu) {
    const incomplete = missing("No pudimos confirmar el socket entre la refrigeración y el procesador.", [cooler.specs.supportedSocketIds, cpu.specs.socketId]);
    if (incomplete) warnings.push(incomplete);
    else if (!includes(cooler.specs.supportedSocketIds, cpu.specs.socketId)) errors.push("La refrigeración no es compatible con el socket del procesador.");

    if (cooler.specs.maxTdpWatts && cpu.specs.tdpWatts && cpu.specs.tdpWatts > cooler.specs.maxTdpWatts) {
      warnings.push(`El procesador tiene ${cpu.specs.tdpWatts} W de TDP y esta refrigeración declara hasta ${cooler.specs.maxTdpWatts} W.`);
    }
  }

  if (cooler && gabinete) {
    if (cooler.specs.coolerType === "liquido") {
      const incomplete = missing("No pudimos confirmar si el radiador cabe en el gabinete.", [cooler.specs.radiatorMm, gabinete.specs.maxRadiatorMm]);
      if (incomplete) warnings.push(incomplete);
      else if ((cooler.specs.radiatorMm || 0) > (gabinete.specs.maxRadiatorMm || 0))
        errors.push(`El radiador de ${cooler.specs.radiatorMm} mm supera los ${gabinete.specs.maxRadiatorMm} mm que admite el gabinete.`);
    } else {
      const incomplete = missing("No pudimos confirmar si el disipador cabe en el gabinete.", [cooler.specs.coolerHeightMm, gabinete.specs.maxCoolerHeightMm]);
      if (incomplete) warnings.push(incomplete);
      else if ((cooler.specs.coolerHeightMm || 0) > (gabinete.specs.maxCoolerHeightMm || 0))
        errors.push(`El disipador mide ${cooler.specs.coolerHeightMm} mm y supera los ${gabinete.specs.maxCoolerHeightMm} mm del gabinete.`);
    }
  }

  if (motherboard && gabinete) {
    const incomplete = missing("No pudimos confirmar si el formato de la placa cabe en el gabinete.", [motherboard.specs.formFactorId, gabinete.specs.supportedFormFactorIds]);
    if (incomplete) warnings.push(incomplete);
    else if (!includes(gabinete.specs.supportedFormFactorIds, motherboard.specs.formFactorId)) errors.push("El formato de la placa madre no está admitido por el gabinete.");
  }

  if (gpu && gabinete) {
    const incomplete = missing("No pudimos verificar si la GPU cabe en el gabinete.", [gpu.specs.gpuLengthMm, gabinete.specs.maxGpuLengthMm]);
    if (incomplete) warnings.push(incomplete);
    else if ((gpu.specs.gpuLengthMm || 0) > (gabinete.specs.maxGpuLengthMm || 0))
      errors.push(`La GPU mide ${gpu.specs.gpuLengthMm} mm y supera los ${gabinete.specs.maxGpuLengthMm} mm del gabinete.`);
  }

  if (storage && motherboard) {
    const incomplete = missing("No pudimos confirmar la interfaz del almacenamiento en la placa madre.", [storage.specs.storageInterfaceId, motherboard.specs.supportedStorageInterfaceIds]);
    if (incomplete) warnings.push(incomplete);
    else if (!includes(motherboard.specs.supportedStorageInterfaceIds, storage.specs.storageInterfaceId)) errors.push("La interfaz del almacenamiento no está admitida por la placa madre.");
  }

  if (storage && gabinete && ["sata_2_5", "sata_3_5"].includes(storage.specs.storageInterfaceSlug || "")) {
    const bays = storage.specs.storageInterfaceSlug === "sata_2_5" ? gabinete.specs.bays25 : gabinete.specs.bays35;
    if (!bays) warnings.push("No pudimos confirmar una bahía compatible para el almacenamiento SATA en el gabinete.");
  }

  const knownTdp = [cpu?.specs.tdpWatts, gpu?.specs.tdpWatts].filter((value): value is number => typeof value === "number" && value > 0);
  const estimatedPower = knownTdp.reduce((total, value) => total + value, 0);

  if (psu && gpu) {
    const incomplete = missing("No pudimos comparar la fuente con la recomendación documentada de la GPU.", [psu.specs.continuousWatts, gpu.specs.recommendedPsuWatts]);
    if (incomplete) warnings.push(incomplete);
    else if ((psu.specs.continuousWatts || 0) < (gpu.specs.recommendedPsuWatts || 0))
      errors.push(`La GPU requiere una fuente recomendada de ${gpu.specs.recommendedPsuWatts} W y la fuente seleccionada entrega ${psu.specs.continuousWatts} W.`);
  } else if (gpu && !psu) {
    warnings.push("Añade una fuente para contrastarla con la recomendación documentada de la GPU.");
  }

  if (psu?.specs.continuousWatts && psu.specs.continuousWatts < estimatedPower) {
    errors.push(`El consumo estimado de ${estimatedPower} W supera los ${psu.specs.continuousWatts} W de la fuente.`);
  }

  return { errors: [...new Set(errors)], warnings: [...new Set(warnings)], estimatedPower };
}
