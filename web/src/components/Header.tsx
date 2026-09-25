'use client';

import React from 'react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import { ListPlus, Sparkles, Plus } from 'lucide-react';

export default function Header() {
  return (
    <header className="site-header glass-panel">
      <div className="header-container">
        {/* Sol Logo ve Başlık */}
        <Link href="/" className="header-logo-link">
          <div className="header-logo-badge">
            <img
              src="/logo.png"
              alt="Listify Logo"
              width={32}
              height={32}
              style={{ objectFit: 'contain' }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="header-brand-title">
                Listify
              </span>
              <span className="header-brand-tag">
                WEB
              </span>
            </div>
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

      <style jsx>{`
        .site-header {
          position: sticky;
          top: 0;
          z-index: 40;
          width: 100%;
          margin: 0;
          border-radius: 0;
          border-top: none;
          border-left: none;
          border-right: none;
          padding-top: max(0.4rem, var(--safe-top));
          padding-bottom: 0.4rem;
        }

        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.35rem 1rem;
          max-width: 1100px;
          margin: 0 auto;
        }

        .header-logo-link {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          text-decoration: none;
          color: inherit;
        }

        .header-logo-badge {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: var(--bg-elevated);
          border: 1px solid var(--border-glow);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3px;
          box-shadow: var(--accent-glow);
        }

        .header-brand-title {
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          background: var(--accent-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .header-brand-tag {
          font-size: 0.68rem;
          font-weight: 700;
          padding: 2px 5px;
          border-radius: 5px;
          background: var(--bg-elevated);
          color: var(--accent-primary);
          border: 1px solid var(--border-subtle);
        }

        .desktop-nav {
          display: none;
          align-items: center;
          gap: 0.65rem;
        }

        .mobile-header-actions {
          display: flex;
          align-items: center;
        }

        @media (min-width: 768px) {
          .site-header {
            top: 1rem;
            margin: 1rem auto;
            width: calc(100% - 2rem);
            max-width: 1100px;
            border-radius: var(--radius-lg);
            border: 1px solid var(--border-subtle);
            padding-top: 0;
            padding-bottom: 0;
          }

          .header-container {
            padding: 0.75rem 1.5rem;
          }

          .desktop-nav {
            display: flex;
          }

          .mobile-header-actions {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
