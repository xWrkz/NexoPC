import { describe, expect, it } from "vitest";
import { getProductHighlights } from "@/lib/catalog/highlights";
import { NexoPcHardware } from "@/types/product";

const hardware = (values: Partial<NexoPcHardware>): NexoPcHardware => ({ componentTypeSlug: "x", componentTypeName: "X", ...values });

describe("getProductHighlights", () => {
  it("devuelve una lista vacía sin ficha técnica", () => {
    expect(getProductHighlights(null)).toEqual([]);
    expect(getProductHighlights(undefined)).toEqual([]);
  });

  it("resume socket y memoria de una placa", () => {
    expect(getProductHighlights(hardware({ socketId: 2, supportedMemoryTypeIds: [2], m2Slots: 2 }))).toEqual(["AM5", "DDR5", "2 M.2"]);
  });

  it("une la memoria de video con su tipo", () => {
    expect(getProductHighlights(hardware({ memoryTypeId: 3, gpuMemoryGb: 8, gpuLengthMm: 201, tdpWatts: 115 }))).toEqual(["8 GB GDDR6", "TDP 115 W", "201 mm"]);
  });

  it("expresa en TB las capacidades grandes", () => {
    expect(getProductHighlights(hardware({ capacityGb: 2000, storageInterfaceSlug: "m2_nvme" }))).toEqual(["2 TB", "M.2 NVMe"]);
    expect(getProductHighlights(hardware({ capacityGb: 500 }))).toEqual(["500 GB"]);
  });

  it("ignora los datos en cero de fichas incompletas", () => {
    expect(getProductHighlights(hardware({ memoryTypeId: 2, capacityGb: 32, speedMts: 0, modules: 0, tdpWatts: 0 }))).toEqual(["32 GB", "DDR5"]);
  });

  it("no inventa nombres para IDs desconocidos", () => {
    expect(getProductHighlights(hardware({ socketId: 99, memoryTypeId: 99 }))).toEqual([]);
  });

  it("muestra como máximo tres datos", () => {
    expect(getProductHighlights(hardware({ socketId: 1, memoryTypeId: 1, capacityGb: 16, speedMts: 3200, tdpWatts: 65 }))).toHaveLength(3);
  });
});
