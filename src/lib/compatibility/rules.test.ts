import { describe, expect, it } from "vitest";
import { validarCompatibilidad } from "./rules";
const base={cpu:null,motherboard:null,ram:null,gpu:null,storage:null,psu:null,case:null} as const;
describe("validarCompatibilidad",()=>{it("bloquea sockets incompatibles",()=>{const result=validarCompatibilidad({...base,cpu:{id:"cpu",productId:1,categoria:"cpu",nombre:"CPU",precio:1,specs:{socket:"AM5"}},motherboard:{id:"board",productId:2,categoria:"motherboard",nombre:"Board",precio:1,specs:{socket:"LGA1700"}}});expect(result.errors[0]).toContain("socket");});it("advierte cuando faltan especificaciones",()=>{const result=validarCompatibilidad({...base,cpu:{id:"cpu",productId:1,categoria:"cpu",nombre:"CPU",precio:1,specs:{}}});expect(result.warnings.length).toBeGreaterThan(0);});});
