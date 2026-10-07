import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ApolloProvider } from "@/lib/apollo/apollo-provider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MotionProvider from "@/components/MotionProvider";
import AmbientPointer from "@/components/AmbientPointer";

const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
export const metadata: Metadata = {
  metadataBase: new URL("https://nexopc.wrkz.net"),
  title: { default: "NexoPC — Tu próxima PC empieza aquí", template: "%s · NexoPC" },
  description: "Componentes, PCs armadas y acompañamiento para estudiar, trabajar, crear y jugar.",
  icons: { icon: "/brand/favicon-32.png", apple: "/brand/apple-touch-icon.png" },
  openGraph: { title: "NexoPC — Tu próxima PC empieza aquí", description: "Elige componentes reales o construye tu PC paso a paso.", images: ["/brand/app-icon-512.png"], locale: "es_PE", type: "website" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es" data-scroll-behavior="smooth"><body className={`${body.variable} ${display.variable} site-shell min-h-screen`}><ApolloProvider><MotionProvider><AmbientPointer/><Header/><main className="flex-1">{children}</main><Footer/></MotionProvider></ApolloProvider></body></html>;
}
