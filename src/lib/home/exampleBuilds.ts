import { BuilderCategory, ComponentePC, validarCompatibilidad } from "@/lib/compatibility/rules";

// Armados de ejemplo para la página principal. Todas las piezas existen en el catálogo curado
// (nexopc-backend/scripts/catalog/data) y sus specs usan los mismos IDs que el armador:
// sockets AM5=2 · memoria DDR5=2 · formato mATX=2 · interfaz M.2 NVMe=1.

export type BuildParts = Record<BuilderCategory, ComponentePC | null>;
export type ExampleBuildId = "study" | "creation" | "gaming";
export type BuildSlugs = Record<BuilderCategory, string | null>;
export type ExampleBuild = { id: ExampleBuildId; title: string; tagline: string; slugs: BuildSlugs };
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

/** Chips técnicos cortos para las tarjetas de armado, solo con datos que trae la ficha. */
export function getBuildChips(build: BuildParts): string[] {
  const { cpu, ram, gpu, psu } = build;
  const chips: string[] = [];
  if (cpu?.specs.socketId && socketNames[cpu.specs.socketId]) chips.push(socketNames[cpu.specs.socketId]);
  if (ram?.specs.memoryTypeId && memoryNames[ram.specs.memoryTypeId]) chips.push(memoryNames[ram.specs.memoryTypeId]);
  if (gpu?.specs.gpuLengthMm) chips.push(`GPU ${gpu.specs.gpuLengthMm} mm`);
  else if (!gpu && cpu?.specs.integratedGraphics) chips.push("Gráficos integrados");
  if (psu?.specs.continuousWatts) chips.push(`${psu.specs.continuousWatts} W`);
  return chips;
}

const studySlugs: BuildSlugs = {
  cpu: "amd-ryzen-5-8500g", motherboard: "asus-prime-a620m-k", ram: "kingston-fury-beast-ddr5-5600-16gb", gpu: null,
  storage: "kingston-nv3-500gb", psu: "deepcool-pl650d-v2", case: "teros-te-1323g", cooler: "deepcool-ag400-g2",
};
const gamingSlugs: BuildSlugs = {
  cpu: "amd-ryzen-5-7600", motherboard: "gigabyte-b650m-d3hp-ax", ram: "kingston-fury-beast-ddr5-6000-16gb", gpu: "gigabyte-geforce-rtx-5060-windforce-max-oc-8g",
  storage: "kingston-nv3-1tb", psu: "msi-mag-a750bn-pcie5", case: "deepcool-ch260", cooler: "deepcool-ak400-g2",
};
const creationSlugs: BuildSlugs = {
  cpu: "amd-ryzen-7-9700x", motherboard: "gigabyte-b650m-d3hp-ax", ram: "kingston-fury-beast-ddr5-5600-32gb", gpu: "gigabyte-geforce-rtx-5060-ti-eagle-oc-8g",
  storage: "kingston-nv3-2tb", psu: "msi-mag-a750gls-pcie5", case: "deepcool-cg580", cooler: "deepcool-ak500-zero-dark",
};

// Piezas reales del catálogo curado, por slug de WooCommerce. El precio, las specs y la
// compatibilidad se leen del backend al mostrar la home (ver resolveBuild).
export const exampleBuilds: ExampleBuild[] = [
  { id: "study", title: "Estudio", tagline: "Ryzen 5 8500G con gráficos integrados: clases, ofimática y videollamadas sin tarjeta de video.", slugs: studySlugs },
  { id: "gaming", title: "Gaming 1080p", tagline: "Ryzen 5 7600 y RTX 5060 para jugar en 1080p, con fuente de 750 W para mejorar después.", slugs: gamingSlugs },
  { id: "creation", title: "Creación", tagline: "Ryzen 7 9700X, 32 GB y RTX 5060 Ti para editar, diseñar y renderizar sin esperas.", slugs: creationSlugs },
];
