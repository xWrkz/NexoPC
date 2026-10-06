export type BuilderCategory = "cpu" | "motherboard" | "ram" | "gpu" | "storage" | "psu" | "case";
export interface ComponentePC { id: string; productId: number; categoria: BuilderCategory; nombre: string; precio: number; image?: string; specs: { socket?:string; tipoRAM?:string; tdp?:number; formato?:string; longitudGPU?:number; vatios?:number; [key:string]:unknown }; }
export interface CompatibilityResult { errors:string[]; warnings:string[]; estimatedPower:number; }
export function validarCompatibilidad(componentes: Record<BuilderCategory,ComponentePC|null>): CompatibilityResult {
 const errors:string[]=[]; const warnings:string[]=[]; const {cpu,motherboard,ram,gpu,psu,case:gabinete}=componentes;
 if(cpu&&motherboard){ if(cpu.specs.socket&&motherboard.specs.socket&&cpu.specs.socket!==motherboard.specs.socket) errors.push(`El socket del CPU (${cpu.specs.socket}) no coincide con la placa madre (${motherboard.specs.socket}).`); else if(!cpu.specs.socket||!motherboard.specs.socket) warnings.push("No pudimos confirmar el socket entre CPU y placa madre."); }
 if(ram&&motherboard){ if(ram.specs.tipoRAM&&motherboard.specs.tipoRAM&&ram.specs.tipoRAM!==motherboard.specs.tipoRAM) errors.push(`La RAM es ${ram.specs.tipoRAM}, pero la placa madre usa ${motherboard.specs.tipoRAM}.`); else if(!ram.specs.tipoRAM||!motherboard.specs.tipoRAM) warnings.push("No pudimos confirmar el tipo de RAM de la placa madre."); }
 if(gpu&&gabinete){ if(gpu.specs.longitudGPU&&gabinete.specs.longitudGPU&&gpu.specs.longitudGPU>gabinete.specs.longitudGPU) errors.push(`La GPU mide ${gpu.specs.longitudGPU} mm y supera los ${gabinete.specs.longitudGPU} mm del gabinete.`); else if(!gpu.specs.longitudGPU||!gabinete.specs.longitudGPU) warnings.push("No pudimos verificar si la GPU cabe en el gabinete."); }
 const estimatedPower=(cpu?.specs.tdp as number||65)+(gpu?.specs.tdp as number||0)+(gpu?100:55);
 if(psu){ if(psu.specs.vatios && psu.specs.vatios < estimatedPower) errors.push(`La fuente de ${psu.specs.vatios} W es insuficiente; recomendamos al menos ${estimatedPower} W.`); else if(!psu.specs.vatios) warnings.push("No pudimos comprobar la potencia de la fuente."); } else if(cpu||gpu) warnings.push("Añade una fuente para validar la potencia estimada.");
 return {errors:[...new Set(errors)],warnings:[...new Set(warnings)],estimatedPower};
}
