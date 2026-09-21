import { create } from "zustand";
import { ComponentePC, validarCompatibilidad } from "@/lib/compatibility/rules";

interface BuilderState {
  seleccion: Record<string, ComponentePC | null>;
  errores: string[];
  setComponente: (categoria: string, componente: ComponentePC | null) => void;
  getTotal: () => number;
  reset: () => void;
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  seleccion: {
    cpu: null, motherboard: null, ram: null, gpu: null,
    psu: null, case: null, storage: null,
  },
  errores: [],
  setComponente: (categoria, componente) => {
    const nuevaSeleccion = { ...get().seleccion, [categoria]: componente };
    set({
      seleccion: nuevaSeleccion,
      errores: validarCompatibilidad(nuevaSeleccion),
    });
  },
  getTotal: () => Object.values(get().seleccion)
    .filter(Boolean)
    .reduce((sum, c) => sum + (c?.precio || 0), 0),
  reset: () => set({
    seleccion: { cpu: null, motherboard: null, ram: null, gpu: null, psu: null, case: null, storage: null },
    errores: [],
  }),
}));
