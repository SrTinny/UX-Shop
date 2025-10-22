"use client";

import Link from "next/link";
import { CartIcon } from "@/app/components/Icons";
import clsx from "clsx";

type Props = {
  authed: boolean;
  theme: "light" | "dark";
  toggleTheme: () => void;
  onLogout: () => void;
  cartCount: number;
  badgePulse?: boolean;
};

export default function ActionIcons({ authed, theme, toggleTheme, onLogout, cartCount, badgePulse }: Props) {
  const badge = cartCount > 9 ? '+9' : String(cartCount);

  return (
    <div className="flex items-center gap-2">
      {/* Cart */}
  <Link href="/cart" aria-label="Carrinho" className="relative inline-flex items-center p-2 rounded-md hover:bg-[var(--color-hover)]" style={{ borderColor: 'var(--color-border)' }}>
        <CartIcon className="h-6 w-6" />
        <span className="sr-only">Carrinho</span>
        {cartCount > 0 && (
          <span aria-live="polite" className={clsx("absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-brand text-white text-[10px] leading-none h-5 min-w-[1.25rem] px-1.5 font-medium", badgePulse ? 'scale-110 shadow-md' : '')}>{badge}</span>
        )}
      </Link>

      {/* Admin icon removed - admin link remains in navigation menus */}

      {/* Theme toggle */}
  <button onClick={toggleTheme} title="Alternar tema" className="p-2 rounded-md border" style={{ borderColor: 'var(--color-border)' }}>
        {theme === 'light' ? (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        ) : (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        )}
        <span className="sr-only">Alternar tema</span>
      </button>

      {/* User / Login + Logout */}
      {!authed ? (
  <Link href="/login" aria-label="Login" className="p-2 rounded-md hover:bg-[var(--color-hover)]">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 00-3-3.87" />
            <path d="M4 21v-2a4 4 0 013-3.87" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span className="sr-only">Login</span>
        </Link>
      ) : (
        <>
          <Link href="/account" aria-label="Minha conta" className="p-2 rounded-md hover:bg-[var(--color-hover)]">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-3-3.87" />
              <path d="M4 21v-2a4 4 0 013-3.87" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="sr-only">Conta</span>
          </Link>
          <button onClick={onLogout} title="Sair" className="p-2 rounded-md hover:bg-[var(--color-hover)]">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
            <span className="sr-only">Sair</span>
          </button>
        </>
      )}
    </div>
  );
}
