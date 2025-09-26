import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import HeaderBar from "./_components/HeaderBar";

export const metadata: Metadata = {
  title: "UX Software",
  description: "Desafio Fullstack",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {/* Header global (client-side) */}
        <HeaderBar />

        {/* Toaster global */}
        <Toaster richColors position="top-right" />

        {/* Conteúdo das páginas */}
        {children}
      </body>
    </html>
  );
}
