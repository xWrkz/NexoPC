import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tu carrito" };

export default function CarritoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
