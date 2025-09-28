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
          {/* Header global */}
          <HeaderBar />

          {/* Toaster global */}
          <Toaster richColors position="top-right" />

          {/* Conteúdo das páginas */}
          {children}

          {/* Footer global */}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
