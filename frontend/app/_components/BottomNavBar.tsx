"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNavBar() {
  const path = usePathname();

  const NavItem = ({ href, label, icon, badge }: { href: string; label: string; icon: React.ReactNode; badge?: number | null }) => {
    const active = path === href;
    return (
      <Link href={href} className={`flex flex-col items-center justify-center text-xs ${active ? 'text-brand' : 'text-gray-600 dark:text-gray-300'}`}>
        <div className="relative">
          {icon}
          {badge && badge > 0 ? (
            <span className="absolute -top-1 -right-2 inline-flex items-center justify-center rounded-full bg-brand text-white text-[11px] h-5 min-w-[1.25rem] px-1.5 font-medium">{badge > 9 ? '+9' : badge}</span>
          ) : null}
        </div>
        <span className="mt-1">{label}</span>
      </Link>
    );
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t" style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-sm font-bold text-brand">UX Shop</div>
        </div>
        <div className="flex items-center gap-6">
          <NavItem href="/products" label="Home" icon={<svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11.5L12 4l9 7.5"/><path d="M9 21V12h6v9"/></svg>} />
          <NavItem href="/account" label="Conta" icon={<svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} />
          <NavItem href="/notifications" label="Notifs" icon={<svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>} badge={3} />
          <NavItem href="/chat" label="Chats" icon={<svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>} />
        </div>
      </div>
    </nav>
  );
}
