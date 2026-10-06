import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ApolloProvider } from "@/lib/apollo/apollo-provider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MotionProvider from "@/components/MotionProvider";

const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });
export const metadata: Metadata = { title: "NexoPC — Hardware que se siente", description: "Componentes, PCs armadas y asesoría para llevar tu setup más lejos." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es" data-scroll-behavior="smooth"><body className={`${body.variable} ${display.variable} site-shell min-h-screen`}><ApolloProvider><MotionProvider><Header /><main className="flex-1">{children}</main><Footer /></MotionProvider></ApolloProvider></body></html>;
}
