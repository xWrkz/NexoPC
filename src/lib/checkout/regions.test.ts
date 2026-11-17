import { describe, expect, it } from "vitest";
import { PE_REGIONS, regionCode, regionName } from "./regions";

describe("regionCode", () => {
  it("acepta códigos y nombres, con o sin tildes", () => {
    expect(regionCode("LAL")).toBe("LAL");
    expect(regionCode("lal")).toBe("LAL");
    expect(regionCode("La Libertad")).toBe("LAL");
    expect(regionCode(" apurimac ")).toBe("APU");
    expect(regionCode("Lima")).toBe("LMA");
    expect(regionCode("El Callao")).toBe("CAL");
  });

  it("devuelve vacío si no reconoce la región", () => {
    expect(regionCode("Trujillo")).toBe("");
    expect(regionCode("")).toBe("");
    expect(regionCode(null)).toBe("");
  });
});

describe("PE_REGIONS", () => {
  it("cubre los 26 códigos de WooCommerce sin repetir", () => {
    expect(new Set(PE_REGIONS.map((region) => region.code)).size).toBe(26);
    expect(regionName("UCA")).toBe("Ucayali");
  });
});
