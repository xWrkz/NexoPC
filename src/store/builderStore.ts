import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  BuilderCategory,
  ComponentePC,
  CompatibilityResult,
  validarCompatibilidad,
} from "@/lib/compatibility/rules";

export const emptySelection: Record<BuilderCategory, ComponentePC | null> = {
  cpu: null,
  motherboard: null,
  ram: null,
  gpu: null,
  storage: null,
  psu: null,
  case: null,
  cooler: null,
};

export interface BuilderState {
  activeGoal: string;
  seleccion: Record<BuilderCategory, ComponentePC | null>;
  configsByGoal: Record<string, Record<BuilderCategory, ComponentePC | null>>;
  result: CompatibilityResult;
  setActiveGoal: (goalId: string) => void;
  setComponente: (
    category: BuilderCategory,
    component: ComponentePC | null,
    currentGoal?: string
  ) => void;
  setSeleccion: (
    seleccion: Record<BuilderCategory, ComponentePC | null>,
    currentGoal?: string
  ) => void;
  saveCurrentGoal: (goalId: string) => void;
  loadGoal: (targetGoalId: string, currentGoalId?: string) => void;
  copyCurrentToGoal: (targetGoalId: string, currentGoalId?: string) => void;
  resetCurrentGoal: (currentGoalId?: string) => void;
  getTotal: () => number;
  reset: () => void;
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      activeGoal: "first-pc",
      seleccion: emptySelection,
      configsByGoal: {},
      result: validarCompatibilidad(emptySelection),

      setActiveGoal: (goalId) => set({ activeGoal: goalId }),

      setComponente: (category, component, currentGoal) => {
        const effectiveGoal = currentGoal || get().activeGoal;
        const seleccion = { ...get().seleccion, [category]: component };
        const configsByGoal = effectiveGoal
          ? {
              ...get().configsByGoal,
              [effectiveGoal]: { ...(get().configsByGoal[effectiveGoal] || {}), ...seleccion },
            }
          : get().configsByGoal;
        set({
          activeGoal: effectiveGoal,
          seleccion,
          configsByGoal,
          result: validarCompatibilidad(seleccion),
        });
      },

      setSeleccion: (seleccion, currentGoal) => {
        const effectiveGoal = currentGoal || get().activeGoal;
        const configsByGoal = effectiveGoal
          ? { ...get().configsByGoal, [effectiveGoal]: { ...seleccion } }
          : get().configsByGoal;
        set({
          activeGoal: effectiveGoal,
          seleccion,
          configsByGoal,
          result: validarCompatibilidad(seleccion),
        });
      },

      saveCurrentGoal: (goalId) => {
        if (!goalId) return;
        const current = get().seleccion;
        set({
          configsByGoal: {
            ...get().configsByGoal,
            [goalId]: { ...current },
          },
        });
      },

      loadGoal: (targetGoalId, currentGoalId) => {
        const state = get();
        const updatedConfigs = { ...state.configsByGoal };
        const fromGoal = currentGoalId || state.activeGoal;
        if (fromGoal) {
          updatedConfigs[fromGoal] = { ...state.seleccion };
        }
        const targetSelection = updatedConfigs[targetGoalId] || emptySelection;
        set({
          activeGoal: targetGoalId,
          configsByGoal: updatedConfigs,
          seleccion: { ...targetSelection },
          result: validarCompatibilidad(targetSelection),
        });
      },

      copyCurrentToGoal: (targetGoalId, currentGoalId) => {
        const state = get();
        const current = { ...state.seleccion };
        const fromGoal = currentGoalId || state.activeGoal;
        const updatedConfigs = {
          ...state.configsByGoal,
          ...(fromGoal ? { [fromGoal]: { ...current } } : {}),
          [targetGoalId]: { ...current },
        };
        set({
          activeGoal: targetGoalId,
          configsByGoal: updatedConfigs,
          seleccion: { ...current },
          result: validarCompatibilidad(current),
        });
      },

      resetCurrentGoal: (currentGoalId) => {
        const state = get();
        const updatedConfigs = { ...state.configsByGoal };
        const target = currentGoalId || state.activeGoal;
        if (target) {
          updatedConfigs[target] = { ...emptySelection };
        }
        set({
          configsByGoal: updatedConfigs,
          seleccion: emptySelection,
          result: validarCompatibilidad(emptySelection),
        });
      },

      getTotal: () =>
        Object.values(get().seleccion)
          .filter(Boolean)
          .reduce((sum, item) => sum + (item?.precio ?? 0), 0),

      reset: () =>
        set({
          seleccion: emptySelection,
          result: validarCompatibilidad(emptySelection),
        }),
    }),
    {
      name: "nexopc-builder",
      partialize: (state) => ({
        activeGoal: state.activeGoal,
        seleccion: state.seleccion,
        configsByGoal: state.configsByGoal,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.seleccion) {
          state.result = validarCompatibilidad(state.seleccion);
        }
      },
    }
  )
);
