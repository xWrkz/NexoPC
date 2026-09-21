import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ApolloProvider } from "@/lib/apollo/apollo-provider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NexoPC — E-commerce de Hardware y Ensamblaje Gamer",
  description: "Arma tu PC con validación de compatibilidad en tiempo real.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-950 text-white min-h-screen flex flex-col`}>
        <ApolloProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ApolloProvider>
      </body>
    </html>
  );
}