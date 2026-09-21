import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { token, items, customer } = body;

  const auth = Buffer.from(
    `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
  ).toString("base64");

  const orderData = {
    payment_method: "culqi",
    payment_method_title: "Culqi",
    set_paid: true,
    customer_id: 0,
    billing: customer,
    line_items: items.map((item: any) => ({
      product_id: item.productId,
      quantity: item.quantity,
    })),
  };

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3/orders`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify(orderData),
    }
  );

  const order = await response.json();
  return NextResponse.json(order);
}
