'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('listify_theme') as 'light' | 'dark' | null;
    const initial = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('listify_theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-ghost btn-icon"
      aria-label="Tema Değiştir"
      title={theme === 'dark' ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}
    >
      {theme === 'dark' ? <Sun size={19} className="text-amber-400" /> : <Moon size={19} />}
    </button>
  );
}
