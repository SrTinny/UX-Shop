"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
// CartIcon moved to ActionIcons; not used directly here
import ActionIcons from './ActionIcons';
import navigation from '@/lib/navigation';

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
      {navigation.map((item) => (
        item.children ? (
          <div key={item.label} className="relative group">
            <button className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              {item.label}
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"/></svg>
            </button>
            <div className="absolute left-0 mt-2 w-48 rounded-md border shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-opacity"
              style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
              <ul className="py-2">
                {item.children.map((sub) => (
                  <li key={sub.label}>
                    <Link href={sub.href} className="block px-4 py-2 text-sm" style={{ color: 'var(--color-text)' }}>{sub.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <NavLink key={item.label} href={item.href ?? '#'} label={item.label} />
        )
      ))}

      {/* Cart link removed here to avoid duplication with ActionIcons (cart shown in ActionIcons) */}

      {authed && admin && <NavLink href="/admin/products" label="Admin" />}

  <ActionIcons authed={authed} theme={theme} toggleTheme={toggleTheme} onLogout={onLogout} cartCount={cartCount} badgePulse={badgePulse} hideLogout={true} />
    {/* Render logout as the last item in the desktop header when authenticated so it appears last */}
    {authed && (
      <button onClick={onLogout} title="Sair" className="p-2 rounded-md hover:bg-[var(--color-hover)]">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
        <span className="sr-only">Sair</span>
      </button>
    )}
    </nav>
  );
}
