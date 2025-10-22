import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import HeaderBar from './_components/HeaderBar';
import Footer from './_components/Footer';

export const metadata: Metadata = {
  title: 'UX Software',
  description: 'Desafio Fullstack',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"     // adiciona/remover classe "dark"
          defaultTheme="light"  // tema inicial
          enableSystem={false}  // ignore tema do sistema (opcional)
        >
          {/* Header global (wrapped in Suspense to allow client navigation hooks to hydrate) */}
            <Suspense fallback={null}>
              <HeaderBar />
            </Suspense>

          {/* Toaster global */}
          <Toaster richColors position="top-right" />

          {/* Conteúdo das páginas */}
          {children}

          {/* Footer global (hidden on small screens; BottomNavBar used on mobile) */}
          <div className="hidden md:block">
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
