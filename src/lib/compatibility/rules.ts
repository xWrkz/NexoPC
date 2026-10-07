export type BuilderCategory = "cpu" | "motherboard" | "ram" | "gpu" | "storage" | "psu" | "case";
export interface ComponentSpecs {
  socketId?: number; memoryTypeId?: number; formFactorId?: number; storageInterfaceId?: number; storageInterfaceSlug?: string;
  supportedMemoryTypeIds?: number[]; supportedStorageInterfaceIds?: number[]; supportedFormFactorIds?: number[];
  tdpWatts?: number; gpuLengthMm?: number; recommendedPsuWatts?: number; maxGpuLengthMm?: number;
  continuousWatts?: number; m2Slots?: number; sataPorts?: number; bays25?: number; bays35?: number;
}
export interface ComponentePC { id: string; productId: number; categoria: BuilderCategory; nombre: string; precio: number; image?: string; specs: ComponentSpecs; }
export interface CompatibilityResult { errors:string[]; warnings:string[]; estimatedPower:number; }

function includes(values: number[] | undefined, value: number | undefined) { return Boolean(value && values?.includes(value)); }
function missing(message: string, values: unknown[]) { return values.some((value) => value === undefined || value === null || value === 0 || (Array.isArray(value) && !value.length)) ? message : null; }

export function validarCompatibilidad(componentes: Record<BuilderCategory,ComponentePC|null>): CompatibilityResult {
 const errors:string[]=[]; const warnings:string[]=[]; const {cpu,motherboard,ram,gpu,storage,psu,case:gabinete}=componentes;
 if(cpu&&motherboard){
   const incomplete=missing("No pudimos confirmar el socket entre CPU y placa madre.",[cpu.specs.socketId,motherboard.specs.socketId]);
   if(incomplete) warnings.push(incomplete); else if(cpu.specs.socketId!==motherboard.specs.socketId) errors.push("El socket del procesador no coincide con el de la placa madre.");
 }
 if(ram&&motherboard){
   const incomplete=missing("No pudimos confirmar el tipo de memoria entre RAM y placa madre.",[ram.specs.memoryTypeId,motherboard.specs.supportedMemoryTypeIds]);
   if(incomplete) warnings.push(incomplete); else if(!includes(motherboard.specs.supportedMemoryTypeIds,ram.specs.memoryTypeId)) errors.push("El tipo de memoria RAM no es compatible con la placa madre.");
 }
 if(motherboard&&gabinete){
   const incomplete=missing("No pudimos confirmar si el formato de la placa cabe en el gabinete.",[motherboard.specs.formFactorId,gabinete.specs.supportedFormFactorIds]);
   if(incomplete) warnings.push(incomplete); else if(!includes(gabinete.specs.supportedFormFactorIds,motherboard.specs.formFactorId)) errors.push("El formato de la placa madre no está admitido por el gabinete.");
 }
 if(gpu&&gabinete){
   const incomplete=missing("No pudimos verificar si la GPU cabe en el gabinete.",[gpu.specs.gpuLengthMm,gabinete.specs.maxGpuLengthMm]);
   if(incomplete) warnings.push(incomplete); else if((gpu.specs.gpuLengthMm || 0) > (gabinete.specs.maxGpuLengthMm || 0)) errors.push(`La GPU mide ${gpu.specs.gpuLengthMm} mm y supera los ${gabinete.specs.maxGpuLengthMm} mm del gabinete.`);
 }
 if(storage&&motherboard){
   const incomplete=missing("No pudimos confirmar la interfaz del almacenamiento en la placa madre.",[storage.specs.storageInterfaceId,motherboard.specs.supportedStorageInterfaceIds]);
   if(incomplete) warnings.push(incomplete); else if(!includes(motherboard.specs.supportedStorageInterfaceIds,storage.specs.storageInterfaceId)) errors.push("La interfaz del almacenamiento no está admitida por la placa madre.");
 }
 if(storage&&gabinete&&["sata_2_5","sata_3_5"].includes(storage.specs.storageInterfaceSlug || "")){
   const bays=storage.specs.storageInterfaceSlug === "sata_2_5" ? gabinete.specs.bays25 : gabinete.specs.bays35;
   if (!bays) warnings.push("No pudimos confirmar una bahía compatible para el almacenamiento SATA en el gabinete.");
 }
 const knownTdp=[cpu?.specs.tdpWatts,gpu?.specs.tdpWatts].filter((value): value is number => typeof value === "number" && value > 0);
 const estimatedPower=knownTdp.reduce((total,value)=>total+value,0);
 if(psu&&gpu){
   const incomplete=missing("No pudimos comparar la fuente con la recomendación documentada de la GPU.",[psu.specs.continuousWatts,gpu.specs.recommendedPsuWatts]);
   if(incomplete) warnings.push(incomplete); else if((psu.specs.continuousWatts || 0) < (gpu.specs.recommendedPsuWatts || 0)) errors.push(`La GPU requiere una fuente recomendada de ${gpu.specs.recommendedPsuWatts} W y la fuente seleccionada entrega ${psu.specs.continuousWatts} W.`);
 } else if(gpu&&!psu) warnings.push("Añade una fuente para contrastarla con la recomendación documentada de la GPU.");
 return {errors:[...new Set(errors)],warnings:[...new Set(warnings)],estimatedPower};
}
