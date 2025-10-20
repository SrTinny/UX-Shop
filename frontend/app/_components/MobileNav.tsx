"use client";

import Link from "next/link";
import clsx from "clsx";

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  authed: boolean;
  admin: boolean;
  theme: "light" | "dark";
  toggleTheme: () => void;
  onLogout: () => void;
  // cartCount and badgePulse intentionally omitted because ActionIcons is shown in header on mobile
};

import navigation from '@/lib/navigation';

export default function MobileNav({ open, setOpen, authed, admin, theme, toggleTheme, onLogout }: Props) {
  return (
    <>
      {/* Top cart left in header now - ActionIcons will show cart */}

      {/* Button hamburger */}
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
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu panel */}
      <div id="mobile-menu" className={clsx("md:hidden border-t", open ? "block" : "hidden")} style={{ borderColor: "var(--color-border)" }}>
        <nav className="container mx-auto flex flex-col gap-1 px-4 sm:px-6 lg:px-8 py-3">
          {navigation.map((item) => (
            item.children ? (
              <div key={item.label} className="w-full">
                <div className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300">{item.label}</div>
                <div className="pl-4">
                  {item.children.map((sub) => (
                    <Link key={sub.label} href={sub.href} className="block w-full rounded-md px-3 py-2 text-sm text-gray-700 hover:text-brand">{sub.label}</Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link key={item.label} href={item.href ?? '#'} className="w-full rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-brand">{item.label}</Link>
            )
          ))}

          {authed && admin && <Link href="/admin/products" className="w-full rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-brand">Admin</Link>}

          {/* Theme toggle and account actions */}
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
              <Link href="/login" className="w-full rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-brand">Login</Link>
              <Link href="/register" className="w-full rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-brand">Cadastro</Link>
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
    </>
  );
}
