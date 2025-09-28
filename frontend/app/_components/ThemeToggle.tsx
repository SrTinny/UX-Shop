'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // evita “hydration mismatch”
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isLight = theme === 'light';

  return (
    <button
      type="button"
      onClick={() => setTheme(isLight ? 'dark' : 'light')}
      className="btn border border-black/10 dark:border-white/10"
      title="Alternar tema"
      aria-label="Alternar tema"
    >
      {isLight ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
