import { NexoPcHardware } from "@/types/product";

// Mismos IDs que siembra nexopc-hardware.php en las tablas de sockets y tipos de memoria.
const socketNames: Record<number, string> = { 1: "AM4", 2: "AM5", 3: "LGA 1700", 4: "LGA 1851", 5: "LGA 1200" };
const memoryNames: Record<number, string> = { 1: "DDR4", 2: "DDR5", 3: "GDDR6", 4: "GDDR6X", 5: "GDDR7", 6: "GDDR5" };
const interfaceNames: Record<string, string> = { m2_nvme: "M.2 NVMe", m2_sata: "M.2 SATA", sata_2_5: 'SATA 2.5"', sata_3_5: 'SATA 3.5"' };

const MAX_HIGHLIGHTS = 3;

function formatCapacity(gb: number) {
  return gb >= 1000 ? `${Number((gb / 1000).toFixed(1))} TB` : `${gb} GB`;
}

// Las fichas guardan 0 cuando un dato falta, así que 0 nunca se muestra como especificación.
function known(value: number | null | undefined): value is number {
  return typeof value === "number" && value > 0;
}

export function getProductHighlights(hardware?: NexoPcHardware | null): string[] {
  if (!hardware) return [];
  const memoryId = hardware.memoryTypeId ?? hardware.supportedMemoryTypeIds?.[0];
  const memoryName = known(memoryId) ? memoryNames[memoryId] : undefined;
  const highlights = [
    known(hardware.socketId) ? socketNames[hardware.socketId] : undefined,
    known(hardware.capacityGb) ? formatCapacity(hardware.capacityGb) : undefined,
    known(hardware.gpuMemoryGb) ? `${hardware.gpuMemoryGb} GB${memoryName ? ` ${memoryName}` : ""}` : memoryName,
    hardware.storageInterfaceSlug ? interfaceNames[hardware.storageInterfaceSlug] : undefined,
    known(hardware.speedMts) ? `${hardware.speedMts} MT/s` : undefined,
    known(hardware.continuousWatts) ? `${hardware.continuousWatts} W` : undefined,
    known(hardware.tdpWatts) ? `TDP ${hardware.tdpWatts} W` : undefined,
    known(hardware.m2Slots) ? `${hardware.m2Slots} M.2` : undefined,
    known(hardware.coolerHeightMm) ? `${hardware.coolerHeightMm} mm de alto` : undefined,
    known(hardware.radiatorMm) ? `Radiador ${hardware.radiatorMm} mm` : undefined,
    known(hardware.gpuLengthMm) ? `${hardware.gpuLengthMm} mm` : undefined,
    known(hardware.maxGpuLengthMm) ? `GPU hasta ${hardware.maxGpuLengthMm} mm` : undefined,
    known(hardware.maxCoolerHeightMm) ? `Cooler hasta ${hardware.maxCoolerHeightMm} mm` : undefined,
  ];
  return highlights.filter((item): item is string => Boolean(item)).slice(0, MAX_HIGHLIGHTS);
}
