import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jornada do Livro | SENAI",
  description:
    "Acompanhe a jornada dos livros pelo Brasil. Escaneie o QR Code, registre sua localização e compartilhe o que aprendeu.",
  keywords: [
    "livros",
    "leitura",
    "SENAI",
    "compartilhamento",
    "educação",
    "jornada do livro",
  ],
  authors: [{ name: "SENAI" }],
  openGraph: {
    title: "Jornada do Livro | SENAI",
    description:
      "Acompanhe a jornada dos livros pelo Brasil. Escaneie, registre e compartilhe.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
