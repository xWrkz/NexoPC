import { beforeEach, describe, expect, it } from "vitest";
import { useBuilderStore, emptySelection } from "./builderStore";
import { ComponentePC } from "@/lib/compatibility/rules";

const mockCpu: ComponentePC = {
  id: "1",
  productId: 101,
  categoria: "cpu",
  nombre: "Intel Core i3 14100",
  precio: 520,
  specs: { socketId: 3, tdpWatts: 65 },
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
      activeGoal: "first-pc",
      seleccion: emptySelection,
      configsByGoal: {},
    });
  });

  it("stores components per active goal independently and updates activeGoal", () => {
    const store = useBuilderStore.getState();
    store.setComponente("cpu", mockCpu, "study");

    expect(useBuilderStore.getState().activeGoal).toBe("study");
    expect(useBuilderStore.getState().seleccion.cpu?.nombre).toBe("Intel Core i3 14100");
    expect(useBuilderStore.getState().configsByGoal["study"]?.cpu?.nombre).toBe("Intel Core i3 14100");
  });

  it("switches goals while keeping previous goal intact and starting clean or restoring target goal", () => {
    const store = useBuilderStore.getState();
    store.setComponente("cpu", mockCpu, "study");

    store.loadGoal("gaming", "study");
    expect(useBuilderStore.getState().activeGoal).toBe("gaming");
    expect(useBuilderStore.getState().seleccion.cpu).toBeNull();
    expect(useBuilderStore.getState().configsByGoal["study"]?.cpu?.nombre).toBe("Intel Core i3 14100");

    useBuilderStore.getState().setComponente("gpu", mockGpu, "gaming");
    expect(useBuilderStore.getState().seleccion.gpu?.nombre).toBe("RTX 4060");
    expect(useBuilderStore.getState().seleccion.cpu).toBeNull();

    useBuilderStore.getState().loadGoal("study", "gaming");
    expect(useBuilderStore.getState().activeGoal).toBe("study");
    expect(useBuilderStore.getState().seleccion.cpu?.nombre).toBe("Intel Core i3 14100");
    expect(useBuilderStore.getState().seleccion.gpu).toBeNull();

    useBuilderStore.getState().loadGoal("gaming", "study");
    expect(useBuilderStore.getState().activeGoal).toBe("gaming");
    expect(useBuilderStore.getState().seleccion.gpu?.nombre).toBe("RTX 4060");
    expect(useBuilderStore.getState().seleccion.cpu).toBeNull();
  });

  it("can copy current components to another goal", () => {
    const store = useBuilderStore.getState();
    store.setComponente("cpu", mockCpu, "study");

    store.copyCurrentToGoal("gaming", "study");

    expect(useBuilderStore.getState().activeGoal).toBe("gaming");
    expect(useBuilderStore.getState().seleccion.cpu?.nombre).toBe("Intel Core i3 14100");
    expect(useBuilderStore.getState().configsByGoal["gaming"]?.cpu?.nombre).toBe("Intel Core i3 14100");
    expect(useBuilderStore.getState().configsByGoal["study"]?.cpu?.nombre).toBe("Intel Core i3 14100");
  });

  it("resetCurrentGoal clears only the targeted goal", () => {
    const store = useBuilderStore.getState();
    store.setComponente("cpu", mockCpu, "study");
    store.copyCurrentToGoal("gaming", "study");

    useBuilderStore.getState().resetCurrentGoal("study");
    expect(useBuilderStore.getState().seleccion.cpu).toBeNull();
    expect(useBuilderStore.getState().configsByGoal["study"]?.cpu).toBeNull();
    expect(useBuilderStore.getState().configsByGoal["gaming"]?.cpu?.nombre).toBe("Intel Core i3 14100");
  });
});
