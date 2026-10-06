import { create } from "zustand";
import { BuilderCategory, ComponentePC, CompatibilityResult, validarCompatibilidad } from "@/lib/compatibility/rules";
const empty: Record<BuilderCategory,ComponentePC|null>={cpu:null,motherboard:null,ram:null,gpu:null,storage:null,psu:null,case:null};
interface BuilderState { seleccion:Record<BuilderCategory,ComponentePC|null>; result:CompatibilityResult; setComponente:(category:BuilderCategory,component:ComponentePC|null)=>void; getTotal:()=>number; reset:()=>void; }
export const useBuilderStore=create<BuilderState>((set,get)=>({seleccion:empty,result:validarCompatibilidad(empty),setComponente:(category,component)=>{const seleccion={...get().seleccion,[category]:component};set({seleccion,result:validarCompatibilidad(seleccion)});},getTotal:()=>Object.values(get().seleccion).filter(Boolean).reduce((sum,item)=>sum+(item?.precio??0),0),reset:()=>set({seleccion:empty,result:validarCompatibilidad(empty)})}));
