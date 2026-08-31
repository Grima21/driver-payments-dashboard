import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Taxi Fleet Management | Panel de Contro Operativo",
  description:
    "Sistema de gestion de pagos de conductores, control de deudas y seguimiento de alertas de documentacion vehicular.",
  openGraph: {
    title: "Taxi Fleet Management Dashboard",
    description:
      "Plataforma Full-Stack para el monitoreo en tiempo real de ingresos diarios y alertas de mantenimiento vehicular.",
    siteName: "Fleet Dashboard",
    locale: "es_PA",
    type: "website",
    images: [
      {
        url: "/dashboard.png",
        width: 1200,
        height: 630,
        alt: "vista previa del Dashboard Operativo",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
