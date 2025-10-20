"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { isAuthenticated, isAdmin, clearToken } from "@/lib/auth";
import { api } from '@/lib/api';
import { CartIcon } from '@/app/components/Icons';
import clsx from "clsx";
import { useRouter, useSearchParams } from 'next/navigation';

export default function HeaderBar() {
  const [authed, setAuthed] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [open, setOpen] = useState(false); // menu mobile
  const path = usePathname();
  const [cartCount, setCartCount] = useState<number>(0);
  // global search
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get('search') ?? '';
  const [query, setQuery] = useState(initialQuery);
  const searchDebounceRef = useRef<number | null>(null);

  const navigateWithQuery = (v: string) => {
    const params = new URLSearchParams();
    if (v.trim()) params.set('search', v.trim());
    const qs = params.toString();
    router.push(qs ? `/products?${qs}` : '/products');
  };

  // keep input in sync when user navigates back/forward or when searchParams change
  useEffect(() => {
    const s = searchParams?.get('search') ?? '';
    setQuery(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams?.toString()]);

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

  // busca quantidade do carrinho quando o header monta
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        if (!isAuthenticated()) {
          setCartCount(0);
          return;
        }
        const res = await api.get('/cart');
        if (!mounted) return;
        const data = res.data;
        const total = (data?.items ?? []).reduce((acc: number, it: { quantity: number }) => acc + it.quantity, 0);
        setCartCount(total ?? 0);
      } catch {
        if (mounted) setCartCount(0);
      }
    }
    void load();

    const onCartUpdated = () => void load();
    window.addEventListener('cart:updated', onCartUpdated as EventListener);
    const onFocus = () => void load();
    window.addEventListener('focus', onFocus);
    return () => {
      mounted = false;
      window.removeEventListener('cart:updated', onCartUpdated as EventListener);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  // Fecha o menu quando a rota muda
  useEffect(() => {
    setOpen(false);
  }, [path]);

  // cleanup debounce timers when unmounting
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current);
    };
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

  // keep ready guard as before
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

  // compute badge text
  const cartBadge = cartCount > 9 ? '+9' : String(cartCount);

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

        {/* Search input placed in the header (desktop) */}
        <div className="hidden md:block flex-1 px-4">
          <div className="relative">
            <input
              id="header-search-input"
              data-header-search="true"
              className="w-80 pl-9 pr-3 py-2 rounded-md border border-gray-200 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand shadow-sm dark:bg-[#071022] dark:border-white/10 dark:text-gray-200"
              style={theme === 'light' ? { backgroundColor: '#ffffff', color: '#0f172a' } : undefined}
              placeholder="Buscar produtos..."
              value={query}
              onChange={(e) => {
                const v = e.target.value;
                setQuery(v);
                if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current);
                searchDebounceRef.current = window.setTimeout(() => {
                  navigateWithQuery(v);
                  searchDebounceRef.current = null;
                }, 450);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current);
                  navigateWithQuery(query);
                }
              }}
              aria-label="Buscar produtos"
            />
              <svg aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387a1 1 0 01-1.414 1.414l-4.387-4.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Botões à direita (desktop) */}
        <nav className="hidden md:flex items-center gap-2 sm:gap-3">
          <NavLink href="/products" label="Produtos" />

          {authed && (
            <Link href="/cart" className="relative inline-flex items-center p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5">
              <CartIcon className="h-5 w-5 text-current" />
              <span className="sr-only">Carrinho</span>
              <span aria-live="polite" className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-brand text-white text-[10px] leading-none h-5 min-w-[1.25rem] px-1.5 font-medium">{cartBadge}</span>
            </Link>
          )}
          {authed && admin && <NavLink href="/admin/products" label="Admin" />}

          {/* Botão de tema (ícone apenas) */}
          <button
            onClick={toggleTheme}
            className="rounded-md border border-black/10 dark:border-white/10 p-2"
            title="Alternar tema"
          >
            {theme === "light" ? '🌙' : '☀️'}
            <span className="sr-only">Alternar tema</span>
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
          {/* Mobile search */}
          <div className="mb-2">
            <div className="relative">
              <input
                className="input-base w-full pl-9 border border-gray-200 rounded-md"
                style={theme === 'light' ? { backgroundColor: '#ffffff', color: '#0f172a' } : undefined}
                placeholder="Buscar produtos..."
                value={query}
                onChange={(e) => {
                  const v = e.target.value;
                  setQuery(v);
                  if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current);
                  searchDebounceRef.current = window.setTimeout(() => {
                    navigateWithQuery(v);
                    searchDebounceRef.current = null;
                  }, 450);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current);
                    navigateWithQuery(query);
                    setOpen(false);
                  }
                }}
                aria-label="Buscar produtos"
              />
              <svg aria-hidden className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387a1 1 0 01-1.414 1.414l-4.387-4.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <NavLink href="/products" label="Produtos" className="w-full" />
          {authed && (
            <Link href="/cart" className="relative flex items-center gap-3 p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 w-full">
              <CartIcon className="h-5 w-5 text-current" />
              <span className="sr-only">Carrinho</span>
              <span className="absolute -top-1 -right-3 inline-flex items-center justify-center rounded-full bg-brand text-white text-[10px] leading-none h-5 min-w-[1.25rem] px-1.5 font-medium">{cartBadge}</span>
            </Link>
          )}
          {authed && admin && (
            <NavLink href="/admin/products" label="Admin" className="w-full" />
          )}

          <button
            onClick={toggleTheme}
            className="mt-1 w-full rounded-md border border-black/10 px-3 py-2 text-left text-sm dark:border-white/10 flex items-center gap-2"
            title="Alternar tema"
          >
            <span className="text-lg">{theme === "light" ? '🌙' : '☀️'}</span>
            <span className="sr-only">Alternar tema</span>
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
