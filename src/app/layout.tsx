import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ApolloProvider } from "@/lib/apollo/apollo-provider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MotionProvider from "@/components/MotionProvider";

// Archivo cubre texto y titulares (estos en su ancho condensado); Plex Mono, datos y precios.
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex-mono" });
export const metadata: Metadata = {
  metadataBase: new URL("https://nexopc.wrkz.net"),
  title: { default: "NexoPC — Tu próxima PC empieza aquí", template: "%s · NexoPC" },
  description: "Componentes, PCs armadas y acompañamiento para estudiar, trabajar, crear y jugar.",
  icons: {
    icon: "/brand/Icon.png",
    shortcut: "/brand/Icon.png",
    apple: "/brand/Icon.png",
  },
  openGraph: { title: "NexoPC — Tu próxima PC empieza aquí", description: "Elige componentes reales o construye tu PC paso a paso.", images: ["/brand/app-icon-512.png"], locale: "es_PE", type: "website" },
};
export const viewport: Viewport = { themeColor: "#0c0c0b" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es" data-scroll-behavior="smooth"><body className={`${archivo.variable} ${mono.variable} site-shell min-h-screen`}><a href="#contenido" className="skip-link">Saltar al contenido</a><ApolloProvider><MotionProvider><Header/><main id="contenido" className="flex-1">{children}</main><Footer/></MotionProvider></ApolloProvider></body></html>;
}
