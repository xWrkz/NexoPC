import { BuilderCategory, ComponentePC, validarCompatibilidad } from "@/lib/compatibility/rules";

// Armados de ejemplo para la página principal. Todas las piezas existen en el catálogo curado
// (nexopc-backend/scripts/catalog/data) y sus specs usan los mismos IDs que el armador:
// sockets AM5=2 · memoria DDR5=2 · formato mATX=2 · interfaz M.2 NVMe=1.

export type BuildParts = Record<BuilderCategory, ComponentePC | null>;
export type ExampleBuildId = "study" | "creation" | "gaming";
export type ExampleBuild = { id: ExampleBuildId; title: string; tagline: string; parts: BuildParts };
export type HeroCheck = { id: string; label: string; detail: string; ok: boolean };
export type HeroPiece = { key: BuilderCategory; name: string; short: string; icon: string };

const socketNames: Record<number, string> = { 1: "AM4", 2: "AM5", 3: "LGA 1700", 4: "LGA 1851" };
const memoryNames: Record<number, string> = { 1: "DDR4", 2: "DDR5" };

const part = (categoria: BuilderCategory, nombre: string, specs: ComponentePC["specs"]): ComponentePC => ({
  id: `home-${categoria}`,
  productId: 0,
  categoria,
  nombre,
  precio: 0,
  specs,
});

export const heroBuild: BuildParts = {
  cpu: part("cpu", "AMD Ryzen 5 7600", { socketId: 2, memoryTypeId: 2, supportedMemoryTypeIds: [2], tdpWatts: 65, integratedGraphics: true, coolerIncluded: true }),
  motherboard: part("motherboard", "Gigabyte B650M D3HP AX", { socketId: 2, formFactorId: 2, supportedMemoryTypeIds: [2], ramSlots: 4, m2Slots: 2, supportedStorageInterfaceIds: [1, 2, 3, 4] }),
  ram: part("ram", "Kingston FURY Beast DDR5-6000 2×16 GB", { memoryTypeId: 2, modules: 2 }),
  gpu: part("gpu", "ASUS Dual GeForce RTX 5060 8 GB", { gpuLengthMm: 228, tdpWatts: 145, recommendedPsuWatts: 550 }),
  storage: part("storage", "Kingston NV3 1 TB NVMe", { storageInterfaceId: 1, storageInterfaceSlug: "m2_nvme" }),
  psu: part("psu", "DeepCool PL650D V2 650 W", { continuousWatts: 650 }),
  case: part("case", "DeepCool CH260", { supportedFormFactorIds: [1, 2], maxGpuLengthMm: 388, maxCoolerHeightMm: 174 }),
  cooler: part("cooler", "DeepCool AK400 G2", { coolerType: "aire", coolerHeightMm: 156, maxTdpWatts: 240, supportedSocketIds: [1, 2, 3, 4] }),
};

/** Orden de entrada de las piezas en la animación del hero (de atrás hacia adelante). */
export const HERO_PIECE_ORDER: BuilderCategory[] = ["case", "motherboard", "cpu", "ram", "gpu", "cooler", "storage", "psu"];

const pieceMeta: Record<BuilderCategory, { short: string; icon: string }> = {
  cpu: { short: "CPU", icon: "/icons/categories/cpu.svg" },
  motherboard: { short: "Placa", icon: "/icons/categories/motherboard.svg" },
  ram: { short: "RAM", icon: "/icons/categories/ram.svg" },
  gpu: { short: "GPU", icon: "/icons/categories/gpu.svg" },
  storage: { short: "SSD", icon: "/icons/categories/storage.svg" },
  psu: { short: "Fuente", icon: "/icons/categories/psu.svg" },
  case: { short: "Gabinete", icon: "/icons/categories/case.svg" },
  cooler: { short: "Cooler", icon: "/icons/categories/cooler.svg" },
};

export function getHeroPieces(build: BuildParts = heroBuild): HeroPiece[] {
  return HERO_PIECE_ORDER.flatMap((key) => {
    const item = build[key];
    return item ? [{ key, name: item.nombre, ...pieceMeta[key] }] : [];
  });
}

/**
 * Chequeos que muestra el hero. El texto sale de los specs reales del armado y el estado `ok`
 * de validarCompatibilidad(): un chequeo falla si algún error o aviso del validador coincide
 * con su patrón. El test unitario protege el acoplamiento con los mensajes del validador.
 */
export function getHeroChecks(build: BuildParts = heroBuild): HeroCheck[] {
  const { cpu, motherboard, ram, gpu, case: gabinete, cooler, psu } = build;
  const result = validarCompatibilidad(build);
  const issues = [...result.errors, ...result.warnings];
  const ok = (pattern: RegExp) => !issues.some((message) => pattern.test(message));
  const name = (table: Record<number, string>, id?: number) => (id && table[id]) || "—";

  return [
    { id: "socket", label: "Socket", detail: `${name(socketNames, cpu?.specs.socketId)} ↔ ${name(socketNames, motherboard?.specs.socketId)}`, ok: ok(/socket/i) },
    { id: "memory", label: "Memoria", detail: `${name(memoryNames, ram?.specs.memoryTypeId)} · ${ram?.specs.modules ?? "—"} de ${motherboard?.specs.ramSlots ?? "—"} ranuras`, ok: ok(/memoria|módulos/i) },
    { id: "gpu", label: "Tarjeta gráfica", detail: `${gpu?.specs.gpuLengthMm ?? "—"} mm ≤ ${gabinete?.specs.maxGpuLengthMm ?? "—"} mm`, ok: ok(/GPU/) },
    { id: "cooler", label: "Refrigeración", detail: `${cooler?.specs.coolerHeightMm ?? "—"} mm ≤ ${gabinete?.specs.maxCoolerHeightMm ?? "—"} mm`, ok: ok(/disipador|radiador|refrigeraci/i) },
    { id: "psu", label: "Fuente", detail: `${psu?.specs.continuousWatts ?? "—"} W ≥ ${gpu?.specs.recommendedPsuWatts ?? "—"} W`, ok: ok(/fuente/i) },
    { id: "power", label: "Consumo estimado", detail: `~${result.estimatedPower} W`, ok: ok(/consumo/i) },
  ];
}

/** Chips técnicos cortos para las tarjetas de armado. */
export function getBuildChips(build: BuildParts): string[] {
  const { cpu, ram, gpu, storage, psu } = build;
  const chips: string[] = [];
  if (cpu?.specs.socketId) chips.push(socketNames[cpu.specs.socketId]);
  if (ram?.specs.memoryTypeId) chips.push(`${memoryNames[ram.specs.memoryTypeId]} ${ram.specs.modules === 2 ? "32 GB" : "16 GB"}`);
  if (gpu) chips.push(`${gpu.specs.gpuLengthMm} mm`);
  if (storage?.specs.storageInterfaceSlug === "m2_nvme") chips.push("1 TB NVMe");
  if (psu?.specs.continuousWatts) chips.push(`${psu.specs.continuousWatts} W`);
  return chips;
}

export const exampleBuilds: ExampleBuild[] = [
  {
    id: "study",
    title: "Estudio",
    tagline: "Clases, videollamadas y proyectos sin esperas. Los gráficos integrados del Ryzen bastan.",
    parts: { ...heroBuild, gpu: null, cooler: null },
  },
  {
    id: "creation",
    title: "Creación",
    tagline: "32 GB de RAM y NVMe para editar, diseñar y renderizar sin que la PC se quede corta.",
    parts: heroBuild,
  },
  {
    id: "gaming",
    title: "Gaming 1080p",
    tagline: "RTX 5060 con fuente de sobra y aire fresco: juega hoy y deja espacio para mejorar.",
    parts: heroBuild,
  },
];
