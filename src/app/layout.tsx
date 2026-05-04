import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Notícia PT — Leia mais. Entenda mais.",
  description: "Melhore seu português com artigos reais e perguntas geradas por IA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
