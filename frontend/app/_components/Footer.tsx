"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="mt-10 border-t"
      style={{ background: "var(--color-header)", borderColor: "var(--color-border)" }}
    >
      <div className="mx-auto max-w-6xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Marca */}
        <p className="text-sm text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} UX Shop. Todos os direitos reservados.
        </p>

        {/* Links úteis */}
        <nav className="flex gap-4 text-sm">
          <Link
            href="/about"
            className="hover:text-brand transition-colors text-gray-600 dark:text-gray-300"
          >
            Sobre
          </Link>
          <Link
            href="/privacy"
            className="hover:text-brand transition-colors text-gray-600 dark:text-gray-300"
          >
            Privacidade
          </Link>
          <Link
            href="/contact"
            className="hover:text-brand transition-colors text-gray-600 dark:text-gray-300"
          >
            Contato
          </Link>
        </nav>
      </div>
    </footer>
  );
}
