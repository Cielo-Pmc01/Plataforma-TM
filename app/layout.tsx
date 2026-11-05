import type { Metadata } from "next";
// Tipografía incluida en el proyecto (no depende de Google Fonts al compilar)
import "@fontsource-variable/instrument-sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plataforma TM — Adventure Center",
  description: "Centro de control de Meta Ads y contenido del área TM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
