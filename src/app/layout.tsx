import type { Metadata } from "next";
import { Oswald, Raleway } from "next/font/google";

import { Encabezado } from "@/components/layout/encabezado";
import { PieDePagina } from "@/components/layout/pie-de-pagina";
import { SITIO } from "@/lib/sitio";

import "./globals.css";

const oswald = Oswald({
  variable: "--fuente-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const raleway = Raleway({
  variable: "--fuente-raleway",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITIO.url),
  title: {
    default: "Tenemos Filo | Experiencias gastronómicas en Colombia",
    // Las páginas ponen solo su nombre y aquí se completa la marca.
    template: "%s | Tenemos Filo",
  },
  description:
    "Catas, clases de cocina, recorridos culinarios y experiencias para " +
    "equipos, de la mano de anfitriones apasionados.",
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "Tenemos Filo",
  },
  robots: {
    // Las previews de rama no deben competir con el dominio real.
    index: SITIO.esProduccion,
    follow: SITIO.esProduccion,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CO" className={`${oswald.variable} ${raleway.variable}`}>
      <body className="flex min-h-screen flex-col">
        <Encabezado />
        <main className="flex-1">{children}</main>
        <PieDePagina />
      </body>
    </html>
  );
}
