import { NextResponse } from "next/server";
import { orderSchema, OrderResponse } from "@/lib/checkout/schema";

export const runtime = "nodejs";

type WooProduct = {
  id: number;
  type?: string;
  price: string;
  stock_status: string;
  stock_quantity: number | null;
  manage_stock: boolean;
  name: string;
};

const error = (message: string, errors?: Record<string, string[]>, status = 400) =>
  NextResponse.json<OrderResponse>({ ok: false, message, errors }, { status });

const config = () => {
  const url = process.env.WORDPRESS_URL || process.env.NEXT_PUBLIC_WORDPRESS_URL;
  const key = process.env.WC_CONSUMER_KEY;
  const secret = process.env.WC_CONSUMER_SECRET;

  if (!url || !key || !secret) {
    console.error("[Orders API] Credenciales de WooCommerce incompletas:", {
      hasUrl: Boolean(url),
      hasConsumerKey: Boolean(key),
      hasConsumerSecret: Boolean(secret),
    });
    return null;
  }

  return {
    url: url.replace(/\/$/, ""),
    auth: `Basic ${Buffer.from(`${key}:${secret}`).toString("base64")}`,
  };
};

async function woo(path: string, init: RequestInit = {}) {
  const settings = config();
  if (!settings) {
    throw new Error("El servicio de pedidos no está disponible en este momento.");
  }

  const response = await fetch(`${settings.url}/wp-json/wc/v3/${path}`, {
    ...init,
    headers: {
      Authorization: settings.auth,
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || "No pudimos procesar tu solicitud en este momento.");
  }
  return data;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return error("No pudimos leer los datos del pedido.");
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    const fields = parsed.error.flatten().fieldErrors as Record<string, string[]>;
    return error("Revisa los campos marcados antes de continuar.", fields, 422);
  }

  try {
    const aggregatedMap = new Map<string, { productId: number; variationId?: number; quantity: number }>();
    for (const item of parsed.data.items) {
      const key = `${item.productId}:${item.variationId ?? 0}`;
      const existing = aggregatedMap.get(key);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        aggregatedMap.set(key, { ...item });
      }
    }

    const uniqueItems = Array.from(aggregatedMap.values());
    for (const item of uniqueItems) {
      if (item.quantity > 20) {
        return error("No puedes solicitar más de 20 unidades de un mismo producto.", { items: ["No puedes solicitar más de 20 unidades de un mismo producto."] }, 422);
      }
    }

    const fetchedProducts = await Promise.all(
      uniqueItems.map(async (item) => {
        const path = item.variationId
          ? `products/${item.productId}/variations/${item.variationId}`
          : `products/${item.productId}`;
        const product = (await woo(path)) as WooProduct;
        return { item, product };
      })
    );

    const items = [];
    for (const { item, product } of fetchedProducts) {
      if (!item.variationId && product.type === "variable") {
        return error(`Selecciona una variante válida para ${product.name}.`, undefined, 422);
      }

      if (product.stock_status !== "instock") {
        return error(`${product.name} ya no está disponible.`, undefined, 409);
      }

      if (product.manage_stock && product.stock_quantity !== null && product.stock_quantity < item.quantity) {
        return error(`Solo quedan ${product.stock_quantity} unidades de ${product.name}.`, undefined, 409);
      }

      items.push({
        product_id: item.productId,
        ...(item.variationId ? { variation_id: item.variationId } : {}),
        quantity: item.quantity,
      });
    }

    const { customer, paymentMethod } = parsed.data;
    const order = (await woo("orders", {
      method: "POST",
      body: JSON.stringify({
        payment_method: paymentMethod,
        payment_method_title:
          paymentMethod === "bacs" ? "Transferencia bancaria" : "Pago contraentrega",
        set_paid: false,
        status: "on-hold",
        billing: {
          first_name: customer.firstName,
          last_name: customer.lastName,
          email: customer.email,
          phone: customer.phone,
          address_1: customer.address1,
          city: customer.city,
          state: customer.region,
          postcode: customer.postcode,
          country: "PE",
        },
        shipping: {
          first_name: customer.firstName,
          last_name: customer.lastName,
          address_1: customer.address1,
          city: customer.city,
          state: customer.region,
          postcode: customer.postcode,
          country: "PE",
        },
        customer_note: customer.notes ?? "",
        line_items: items,
      }),
    })) as { id: number; number: string; status: string };

    return NextResponse.json<OrderResponse>(
      {
        ok: true,
        orderId: order.id,
        orderNumber: order.number,
        status: order.status,
        paymentMethod,
        message: "Tu pedido fue registrado correctamente.",
      },
      { status: 201 }
    );
  } catch (cause) {
    console.error("[Orders API] Error al registrar pedido:", cause);
    let message = cause instanceof Error ? cause.message : "No pudimos registrar el pedido.";
    if (message.includes("fetch failed")) {
      message = "No pudimos conectar con el servidor de la tienda. Inténtalo nuevamente en unos minutos.";
    }
    return error(message, undefined, message.includes("no está disponible") ? 503 : 502);
  }
}
