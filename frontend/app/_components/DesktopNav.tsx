"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { CartIcon } from "@/app/components/Icons";
import ActionIcons from './ActionIcons';

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

      <ActionIcons authed={authed} admin={admin} theme={theme} toggleTheme={toggleTheme} onLogout={onLogout} cartCount={cartCount} badgePulse={badgePulse} />
    </nav>
  );
}
