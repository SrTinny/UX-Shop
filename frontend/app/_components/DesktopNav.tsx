"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { CartIcon } from "@/app/components/Icons";

type Props = {
  authed: boolean;
  admin: boolean;
  theme: "light" | "dark";
  toggleTheme: () => void;
  onLogout: () => void;
  cartCount: number;
  badgePulse: boolean;
};

export default function DesktopNav({ authed, admin, theme, toggleTheme, onLogout, cartCount, badgePulse }: Props) {
  const path = usePathname();

  const NavLink = ({ href, label, className }: { href: string; label: React.ReactNode; className?: string }) => {
    const active = path.startsWith(href);
    return (
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={clsx(
          "rounded-md px-3 py-2 text-sm font-medium transition-colors",
          active ? "bg-brand/10 text-brand" : "text-gray-700 hover:text-brand dark:text-gray-300 dark:hover:text-brand",
          className,
        )}
      >
        {label}
      </Link>
    );
  };

  return (
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
                <span className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-brand text-white text-xs transform transition-transform ${badgePulse ? 'scale-110 shadow-md' : ''}`}>
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </span>
          }
        />
      )}

      {authed && admin && <NavLink href="/admin/products" label="Admin" />}

      {/* theme toggle */}
      <button onClick={toggleTheme} className="rounded-md border border-black/10 dark:border-white/10 px-3 py-2 text-sm" title="Alternar tema">
        {theme === "light" ? (
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
        <button onClick={onLogout} className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-accent" title="Sair">
          Sair
        </button>
      )}
    </nav>
  );
}
