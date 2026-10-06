import { z } from "zod";
const text=z.string().trim().min(2,"Completa este campo.").max(120,"El valor es demasiado largo.");
export const orderSchema=z.object({items:z.array(z.object({productId:z.number().int().positive(),variationId:z.number().int().positive().optional(),quantity:z.number().int().min(1).max(20)})).min(1,"Tu carrito está vacío."),paymentMethod:z.enum(["bacs","cod"]),customer:z.object({firstName:text,lastName:text,email:z.string().trim().email("Ingresa un correo válido."),phone:z.string().trim().min(7,"Ingresa un teléfono válido.").max(25),address1:text,city:text,region:text,postcode:z.string().trim().min(3,"Completa el código postal o distrito."),notes:z.string().trim().max(500).optional()})});
export type OrderRequest=z.infer<typeof orderSchema>;
export type OrderResponse={ok:true;orderId:number;orderNumber:string;status:string;paymentMethod:"bacs"|"cod";message:string}|{ok:false;message:string;errors?:Record<string,string[]>};
