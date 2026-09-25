'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ListPlus, Sparkles, Plus, Moon, Sun } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const [theme, setTheme] = React.useState<'dark' | 'light'>('dark');

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('listify-theme') as 'dark' | 'light' | null;
    const initialTheme = savedTheme || 'dark';
    setTheme(initialTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('listify-theme', nextTheme);
  };

  const isHome = pathname === '/';
  const isLists = pathname === '/lists' || pathname?.startsWith('/lists/');
  const isTemplates = pathname === '/templates';

  return (
    <nav
      className="mobile-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'var(--bg-surface-glass)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '0.45rem 0.5rem calc(0.5rem + var(--safe-bottom)) 0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.08)'
      }}
    >
      {/* 1. Ana Sayfa */}
      <Link
        href="/"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          textDecoration: 'none',
          color: isHome ? 'var(--accent-primary)' : 'var(--text-secondary)',
          flex: 1,
          padding: '4px 0',
          transition: 'var(--transition)'
        }}
      >
        <Home size={21} strokeWidth={isHome ? 2.5 : 2} />
        <span style={{ fontSize: '0.68rem', fontWeight: isHome ? 700 : 500 }}>Ana Sayfa</span>
      </Link>

      {/* 2. Listelerim */}
      <Link
        href="/lists"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          textDecoration: 'none',
          color: isLists && !isTemplates ? 'var(--accent-primary)' : 'var(--text-secondary)',
          flex: 1,
          padding: '4px 0',
          transition: 'var(--transition)'
        }}
      >
        <ListPlus size={22} strokeWidth={isLists && !isTemplates ? 2.5 : 2} />
        <span style={{ fontSize: '0.68rem', fontWeight: isLists && !isTemplates ? 700 : 500 }}>Listeler</span>
      </Link>

      {/* 3. Orta Aksiyon Butonu: + Yeni Liste */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <Link
          href="/lists?action=new"
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: 'var(--accent-gradient-btn)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--accent-glow), 0 4px 14px rgba(0, 0, 0, 0.25)',
            textDecoration: 'none',
            marginTop: '-16px',
            border: '3px solid var(--bg-surface)'
          }}
          aria-label="Yeni Liste Oluştur"
        >
          <Plus size={24} strokeWidth={2.8} />
        </Link>
      </div>

      {/* 4. Taslaklarım */}
      <Link
        href="/templates"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          textDecoration: 'none',
          color: isTemplates ? 'var(--accent-primary)' : 'var(--text-secondary)',
          flex: 1,
          padding: '4px 0',
          transition: 'var(--transition)'
        }}
      >
        <Sparkles size={21} strokeWidth={isTemplates ? 2.5 : 2} />
        <span style={{ fontSize: '0.68rem', fontWeight: isTemplates ? 700 : 500 }}>Taslaklar</span>
      </Link>

      {/* 5. Tema Değiştirici */}
      <button
        type="button"
        onClick={toggleTheme}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          flex: 1,
          padding: '4px 0',
          cursor: 'pointer',
          fontFamily: 'inherit'
        }}
        aria-label="Temayı Değiştir"
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        <span style={{ fontSize: '0.68rem', fontWeight: 500 }}>Tema</span>
      </button>

      <style jsx>{`
        @media (min-width: 768px) {
          .mobile-bottom-nav {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}
