import { beforeEach, describe, expect, it } from "vitest";
import { useBuilderStore, emptySelection } from "./builderStore";
import { ComponentePC } from "@/lib/compatibility/rules";

const mockCpu: ComponentePC = {
  id: "1",
  productId: 101,
  categoria: "cpu",
  nombre: "Intel Core i3 14100",
  precio: 520,
  specs: { socketId: 1, tdpWatts: 65 },
};

const mockGpu: ComponentePC = {
  id: "2",
  productId: 102,
  categoria: "gpu",
  nombre: "RTX 4060",
  precio: 1400,
  specs: { recommendedPsuWatts: 550 },
};

describe("builderStore independent goal configurations", () => {
  beforeEach(() => {
    useBuilderStore.setState({
      seleccion: emptySelection,
      configsByGoal: {},
    });
  });

  it("stores components per active goal independently", () => {
    const store = useBuilderStore.getState();
    store.setComponente("cpu", mockCpu, "study");

    expect(useBuilderStore.getState().seleccion.cpu?.nombre).toBe("Intel Core i3 14100");
    expect(useBuilderStore.getState().configsByGoal["study"]?.cpu?.nombre).toBe("Intel Core i3 14100");
  });

  it("switches goals while keeping previous goal intact and starting clean or restoring target goal", () => {
    const store = useBuilderStore.getState();
    // 1. Pick CPU for study
    store.setComponente("cpu", mockCpu, "study");

    // 2. Load gaming (should be empty initially)
    store.loadGoal("gaming", "study");
    expect(useBuilderStore.getState().seleccion.cpu).toBeNull();
    expect(useBuilderStore.getState().configsByGoal["study"]?.cpu?.nombre).toBe("Intel Core i3 14100");

    // 3. Pick GPU for gaming
    useBuilderStore.getState().setComponente("gpu", mockGpu, "gaming");
    expect(useBuilderStore.getState().seleccion.gpu?.nombre).toBe("RTX 4060");
    expect(useBuilderStore.getState().seleccion.cpu).toBeNull();

    // 4. Switch back to study - cpu should be restored!
    useBuilderStore.getState().loadGoal("study", "gaming");
    expect(useBuilderStore.getState().seleccion.cpu?.nombre).toBe("Intel Core i3 14100");
    expect(useBuilderStore.getState().seleccion.gpu).toBeNull();

    // 5. Switch back to gaming - gpu should be restored!
    useBuilderStore.getState().loadGoal("gaming", "study");
    expect(useBuilderStore.getState().seleccion.gpu?.nombre).toBe("RTX 4060");
    expect(useBuilderStore.getState().seleccion.cpu).toBeNull();
  });

  it("can copy current components to another goal", () => {
    const store = useBuilderStore.getState();
    store.setComponente("cpu", mockCpu, "study");

    // Copy study to gaming
    store.copyCurrentToGoal("gaming", "study");

    expect(useBuilderStore.getState().seleccion.cpu?.nombre).toBe("Intel Core i3 14100");
    expect(useBuilderStore.getState().configsByGoal["gaming"]?.cpu?.nombre).toBe("Intel Core i3 14100");
    expect(useBuilderStore.getState().configsByGoal["study"]?.cpu?.nombre).toBe("Intel Core i3 14100");
  });

  it("resetCurrentGoal clears only the targeted goal", () => {
    const store = useBuilderStore.getState();
    store.setComponente("cpu", mockCpu, "study");
    store.copyCurrentToGoal("gaming", "study");

    // Reset only study
    useBuilderStore.getState().resetCurrentGoal("study");
    expect(useBuilderStore.getState().seleccion.cpu).toBeNull();
    expect(useBuilderStore.getState().configsByGoal["study"]?.cpu).toBeNull();
    expect(useBuilderStore.getState().configsByGoal["gaming"]?.cpu?.nombre).toBe("Intel Core i3 14100");
  });
});
