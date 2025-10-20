"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { isAuthenticated, isAdmin, clearToken } from "@/lib/auth";
import { CartIcon } from '@/app/components/Icons';
import { api } from '@/lib/api';
import clsx from "clsx";

export default function HeaderBar() {
  const [authed, setAuthed] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [open, setOpen] = useState(false); // menu mobile
  const path = usePathname();
  const [cartCount, setCartCount] = useState<number>(0);

  useEffect(() => {
    setAuthed(isAuthenticated());
    setAdmin(isAdmin());
    setReady(true);

    // Inicializa com tema salvo ou do sistema
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.classList.toggle("dark", saved === "dark");
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setTheme(prefersDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, []);

  // Fecha o menu quando a rota muda
  useEffect(() => {
    setOpen(false);
  }, [path]);

  // Busca a quantidade total do carrinho (somente quando pronto e autenticado)
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    const load = async () => {
      try {
        if (!isAuthenticated()) {
          if (!cancelled) setCartCount(0);
          return;
        }
        const res = await api.get('/cart');
        const total = (res.data?.items ?? []).reduce(
          (acc: number, it: { quantity: number }) => acc + it.quantity,
          0,
        );
        if (!cancelled) setCartCount(total);
      } catch {
        if (!cancelled) setCartCount(0);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [ready, authed, path]);

  const onLogout = () => {
    clearToken();
    window.location.href = "/login";
  };

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
  };

  if (!ready) return null;

  // Esconde HeaderBar na tela de login
  if (path === "/login") return null;

  const NavLink = ({
    href,
    label,
    className,
  }: {
    href: string;
    label: React.ReactNode;
    className?: string;
  }) => {
    const active = path.startsWith(href);
    return (
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={clsx(
          "rounded-md px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-brand/10 text-brand"
            : "text-gray-700 hover:text-brand dark:text-gray-300 dark:hover:text-brand",
          className
        )}
      >
        {label}
      </Link>
    );
  };

  return (
    <header
      className="sticky top-0 z-40 border-b shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-[#0b0f1a]/70"
      style={{
        background: "var(--color-header)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="container mx-auto flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-3">
        {/* Logo */}
        <Link
          href="/"
          className="text-base sm:text-lg font-bold text-brand hover:opacity-90 transition"
        >
          UX Software
        </Link>

        {/* Botões à direita (desktop) */}
        <nav className="hidden md:flex items-center gap-2 sm:gap-3">
          <NavLink href="/products" label="Produtos" />

          {authed && (
            <NavLink
              href="/cart"
              label={
                <span className="inline-flex items-center gap-1">
                  <CartIcon className="h-5 w-5 inline-block" />
                  <span className="sr-only">Carrinho</span>
                  {cartCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-brand text-white text-xs">
                      {cartCount}
                    </span>
                  )}
                </span>
              }
            />
          )}
          {authed && admin && <NavLink href="/admin/products" label="Admin" />}

          {/* Botão de tema */}
          <button
            onClick={toggleTheme}
            className="rounded-md border border-black/10 dark:border-white/10 px-3 py-2 text-sm"
            title="Alternar tema"
          >
            {theme === "light" ? "🌙 Escuro" : "☀️ Claro"}
          </button>

          {!authed ? (
            <>
              <NavLink href="/login" label="Login" />
              <NavLink href="/register" label="Cadastro" />
            </>
          ) : (
            <button
              onClick={onLogout}
              className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-accent"
              title="Sair"
            >
              Sair
            </button>
          )}
        </nav>

        {/* Botão hambúrguer (mobile) */}
        <div className="md:hidden">
          <button
            type="button"
            aria-label="Abrir menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((s) => !s)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-black/10 text-gray-700 transition hover:bg-black/5 dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/10"
          >
            {open ? (
              // Ícone X
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              // Ícone hambúrguer
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      <div
        id="mobile-menu"
        className={clsx("md:hidden border-t", open ? "block" : "hidden")}
        style={{ borderColor: "var(--color-border)" }}
      >
        <nav className="container mx-auto flex flex-col gap-1 px-4 sm:px-6 lg:px-8 py-3">
          <NavLink href="/products" label="Produtos" className="w-full" />
          {authed && (
            <NavLink
              href="/cart"
              label={
                <span className="inline-flex items-center gap-1">
                  <CartIcon className="h-5 w-5 inline-block" />
                  <span className="sr-only">Carrinho</span>
                  {cartCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-brand text-white text-xs">
                      {cartCount}
                    </span>
                  )}
                </span>
              }
              className="w-full"
            />
          )}
          {authed && admin && (
            <NavLink href="/admin/products" label="Admin" className="w-full" />
          )}

          <button
            onClick={toggleTheme}
            className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 text-left text-sm dark:border-white/10"
            title="Alternar tema"
          >
            {theme === "light" ? "🌙 Escuro" : "☀️ Claro"}
          </button>

          {!authed ? (
            <>
              <NavLink href="/login" label="Login" className="w-full" />
              <NavLink href="/register" label="Cadastro" className="w-full" />
            </>
          ) : (
            <button
              onClick={onLogout}
              className="mt-1 w-full rounded-md bg-brand px-4 py-2 text-left text-sm font-medium text-white transition hover:bg-accent"
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
