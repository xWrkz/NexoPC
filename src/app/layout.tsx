import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ApolloProvider } from "@/lib/apollo/apollo-provider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MotionProvider from "@/components/MotionProvider";

const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["500"], variable: "--font-mono" });
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
export const viewport: Viewport = { themeColor: "#04060b" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es" data-scroll-behavior="smooth"><body className={`${body.variable} ${display.variable} ${mono.variable} site-shell min-h-screen`}><a href="#contenido" className="skip-link">Saltar al contenido</a><ApolloProvider><MotionProvider><Header/><main id="contenido" className="flex-1">{children}</main><Footer/></MotionProvider></ApolloProvider></body></html>;
}
