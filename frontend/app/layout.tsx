import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "UX Software",
  description: "Desafio Fullstack",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {/* Toaster global para toda a app */}
        <Toaster richColors position="top-right" />
        {children}
      </body>
    </html>
  );
}
