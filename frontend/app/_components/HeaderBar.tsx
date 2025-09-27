"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { isAuthenticated, isAdmin, clearToken } from "@/lib/auth";
import clsx from "clsx";

export default function HeaderBar() {
  const [authed, setAuthed] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [ready, setReady] = useState(false);
  const path = usePathname();

  useEffect(() => {
    setAuthed(isAuthenticated());
    setAdmin(isAdmin());
    setReady(true);
  }, []);

  const onLogout = () => {
    clearToken();
    window.location.href = "/login";
  };

  if (!ready) return null;

  const NavLink = ({ href, label }: { href: string; label: string }) => {
    const active = path.startsWith(href);
    return (
      <Link
        href={href}
        className={clsx(
          "px-3 py-2 rounded-md text-sm font-medium transition-colors",
          active
            ? "bg-brand/10 text-brand"
            : "text-gray-600 hover:text-brand dark:text-gray-300 dark:hover:text-brand"
        )}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="border-b bg-white shadow-sm dark:bg-slate-900 dark:border-slate-800">
      <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-lg font-bold text-brand hover:opacity-90 transition"
        >
          UX Software
        </Link>

        {/* Navegação */}
        <nav className="flex items-center gap-4">
          <NavLink href="/products" label="Produtos" />

          {authed && <NavLink href="/cart" label="Carrinho" />}
          {authed && admin && <NavLink href="/admin/products" label="Admin" />}

          {!authed ? (
            <>
              <NavLink href="/login" label="Login" />
              <NavLink href="/register" label="Cadastro" />
            </>
          ) : (
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-md bg-brand text-white hover:bg-accent transition text-sm font-medium"
              title="Sair"
            >
              Sair
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
