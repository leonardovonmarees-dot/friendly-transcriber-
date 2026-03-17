import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Friendly Transcriber",
  description: "Transcreva arquivos de audio e video em uma interface amigavel e pronta para deploy."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
