'use client';

import React from 'react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import { ListPlus, Sparkles } from 'lucide-react';

export default function Header() {
  return (
    <header className="site-header glass-panel">
      <div className="header-container">
        {/* Sol Logo ve Başlık: Kesinlikle Tek Satır (Inline Flex & No-Wrap) */}
        <Link
          href="/"
          className="header-logo-link"
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '0.75rem',
            textDecoration: 'none',
            color: 'inherit',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          <div className="header-logo-badge">
            <img
              src="/logo.png"
              alt="Listify Logo"
              width={32}
              height={32}
              style={{ objectFit: 'contain', display: 'block' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
            <span className="header-brand-title">
              Listify
            </span>
            <span className="header-brand-tag">
              WEB
            </span>
          </div>
        </Link>

        {/* Masaüstü Navigasyon (Mobilde Gizlenir, BottomNav devralır) */}
        <nav className="desktop-nav">
          <Link href="/lists" className="btn btn-secondary" style={{ padding: '0.5rem 0.9rem', fontSize: '0.88rem' }}>
            <ListPlus size={17} style={{ color: 'var(--accent-primary)' }} />
            <span>Listelerim</span>
          </Link>
          <Link href="/templates" className="btn btn-secondary" style={{ padding: '0.5rem 0.9rem', fontSize: '0.88rem' }}>
            <Sparkles size={16} style={{ color: 'var(--accent-primary)' }} />
            <span>Taslaklarım</span>
          </Link>
          <ThemeToggle />
        </nav>

        {/* Mobil Sağ Aksiyon (Sadece ThemeToggle) */}
        <div className="mobile-header-actions">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
