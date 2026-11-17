// Departamentos del Perú con los códigos que usa WooCommerce (WC()->countries->get_states('PE')).
export const PE_REGIONS = [
  { code: "AMA", name: "Amazonas" },
  { code: "ANC", name: "Áncash" },
  { code: "APU", name: "Apurímac" },
  { code: "ARE", name: "Arequipa" },
  { code: "AYA", name: "Ayacucho" },
  { code: "CAJ", name: "Cajamarca" },
  { code: "CAL", name: "Callao" },
  { code: "CUS", name: "Cusco" },
  { code: "HUV", name: "Huancavelica" },
  { code: "HUC", name: "Huánuco" },
  { code: "ICA", name: "Ica" },
  { code: "JUN", name: "Junín" },
  { code: "LAL", name: "La Libertad" },
  { code: "LAM", name: "Lambayeque" },
  { code: "LMA", name: "Lima Metropolitana" },
  { code: "LIM", name: "Lima (provincias)" },
  { code: "LOR", name: "Loreto" },
  { code: "MDD", name: "Madre de Dios" },
  { code: "MOQ", name: "Moquegua" },
  { code: "PAS", name: "Pasco" },
  { code: "PIU", name: "Piura" },
  { code: "PUN", name: "Puno" },
  { code: "SAM", name: "San Martín" },
  { code: "TAC", name: "Tacna" },
  { code: "TUM", name: "Tumbes" },
  { code: "UCA", name: "Ucayali" },
] as const;

export type RegionCode = (typeof PE_REGIONS)[number]["code"];
export const REGION_CODES = PE_REGIONS.map((region) => region.code) as [RegionCode, ...RegionCode[]];
export const DEFAULT_REGION: RegionCode = "LAL";

const plain = (value: string) => value.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();

/** Acepta un código o el nombre (datos guardados antes de usar códigos); devuelve "" si no lo reconoce. */
export function regionCode(value: string | null | undefined): RegionCode | "" {
  if (!value) return "";
  const upper = value.trim().toUpperCase();
  const byCode = PE_REGIONS.find((region) => region.code === upper);
  if (byCode) return byCode.code;
  const wanted = plain(value);
  const byName = PE_REGIONS.find((region) => plain(region.name) === wanted);
  if (byName) return byName.code;
  if (wanted === "lima") return "LMA";
  if (wanted === "el callao") return "CAL";
  return "";
}

export const regionName = (code: string) => PE_REGIONS.find((region) => region.code === code)?.name ?? code;
