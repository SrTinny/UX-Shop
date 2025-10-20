"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { isAuthenticated, isAdmin, clearToken } from "@/lib/auth";
import { CartIcon } from '@/app/components/Icons';
import { api } from '@/lib/api';
import clsx from "clsx";
import MegaMenu from './MegaMenu';

export default function HeaderBar() {
  const [authed, setAuthed] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [open, setOpen] = useState(false); // menu mobile
  const path = usePathname();
  const [cartCount, setCartCount] = useState<number>(0);
  const [badgePulse, setBadgePulse] = useState(false);
  const pulseTimeout = useRef<number | null>(null);

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

  // Escuta eventos de atualização do carrinho para atualizar badge reativamente
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent;
      const d = ce?.detail as { delta?: number; fullCount?: number } | undefined;
      if (!d) return;
      if (typeof d.fullCount === 'number') {
        setCartCount(d.fullCount);
        return;
      }
      if (d.delta !== undefined && typeof d.delta === 'number') {
        const delta = d.delta;
        setCartCount((prev) => Math.max(0, prev + delta));
        // animação somente quando incrementa
        if (delta > 0) {
          setBadgePulse(true);
          if (pulseTimeout.current) window.clearTimeout(pulseTimeout.current);
          pulseTimeout.current = window.setTimeout(() => setBadgePulse(false), 260);
        }
      }
    };
    window.addEventListener('cart:updated', handler as EventListener);
    return () => window.removeEventListener('cart:updated', handler as EventListener);
  }, []);

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
          <div className="group relative">
            <NavLink href="/products" label={<>Produtos</>} />
            <MegaMenu
              columns={[
                { title: 'Notebooks', links: [{ label: 'Gamer', href: '/products/notebooks/gamer' }, { label: 'Ultrabook', href: '/products/notebooks/ultrabook' }] },
                { title: 'Periféricos', links: [{ label: 'Teclados', href: '/products/perifericos/teclados' }, { label: 'Mouses', href: '/products/perifericos/mouses' }] },
                { title: 'Monitores', links: [{ label: '144Hz', href: '/products/monitores/144hz' }, { label: '4K', href: '/products/monitores/4k' }] },
              ]}
              highlight={{ title: 'Promo do mês', href: '/promocoes', image: '/placeholder.png' }}
            />
          </div>

          {authed && (
            <NavLink
              href="/cart"
              label={
                <span className="inline-flex items-center gap-1">
                  <CartIcon className="h-5 w-5 inline-block" />
                  <span className="sr-only">Carrinho</span>
                  {cartCount > 0 && (
                    <span
                      className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-brand text-white text-xs transform transition-transform ${badgePulse ? 'scale-110 shadow-md' : ''}`}
                    >
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </span>
              }
            />
          )}
          {authed && admin && <NavLink href="/admin/products" label="Admin" />}

          {/* Botão de tema (ícone) */}
          <button
            onClick={toggleTheme}
            className="rounded-md border border-black/10 dark:border-white/10 px-3 py-2 text-sm"
            title="Alternar tema"
          >
            {theme === 'light' ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            )}
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

        {/* Botão do carrinho (mobile) - colocado ao lado do hambúrguer */}
        <Link
          href="/cart"
          className="md:hidden inline-flex items-center gap-2 mr-2 px-2 py-1 rounded-md border border-black/10 text-gray-700 transition hover:bg-black/5 dark:border-white/10 dark:text-gray-200"
          aria-label="Ir para o carrinho"
        >
          <CartIcon className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span
                      className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-brand text-white text-xs transform transition-transform ${badgePulse ? 'scale-110 shadow-md' : ''}`}
                    >
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
          <span className="sr-only">Carrinho</span>
        </Link>

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
