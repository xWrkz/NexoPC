export interface ComponentePC {
  id: string;
  categoria: "cpu" | "motherboard" | "ram" | "gpu" | "psu" | "case" | "storage";
  nombre: string;
  precio: number;
  specs: {
    socket?: string;
    tipoRAM?: string;
    tdp?: number;
    formato?: string;
    longitudGPU?: number;
    vatios?: number;
    [key: string]: any;
  };
}

export function validarCompatibilidad(
  componentes: Record<string, ComponentePC | null>
): string[] {
  const errores: string[] = [];
  const { cpu, motherboard, ram, gpu, psu, case: gabinete } = componentes;

  if (cpu && motherboard && cpu.specs.socket !== motherboard.specs.socket) {
    errores.push(`El socket del CPU (${cpu.specs.socket}) no coincide con el de la placa madre (${motherboard.specs.socket}).`);
  }

  if (ram && motherboard && ram.specs.tipoRAM !== motherboard.specs.tipoRAM) {
    errores.push(`La RAM es ${ram.specs.tipoRAM} pero la placa madre soporta ${motherboard.specs.tipoRAM}.`);
  }

  if (gpu && gabinete && gpu.specs.longitudGPU && gabinete.specs.longitudGPU) {
    if (gpu.specs.longitudGPU > gabinete.specs.longitudGPU) {
      errores.push(`La GPU (${gpu.specs.longitudGPU}mm) no cabe en el gabinete (${gabinete.specs.longitudGPU}mm).`);
    }
  }

  if (psu && cpu && gpu && psu.specs.vatios) {
    const consumoEstimado = (cpu.specs.tdp || 65) + (gpu.specs.tdp || 150) + 100;
    if (psu.specs.vatios < consumoEstimado) {
      errores.push(`La fuente (${psu.specs.vatios}W) es insuficiente. Se recomienda al menos ${consumoEstimado}W.`);
    }
  }

  return errores;
}
