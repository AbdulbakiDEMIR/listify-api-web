'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ThemeToggle from './ThemeToggle';
import { ListPlus, Sparkles } from 'lucide-react';

export default function Header() {
  return (
    <header className="glass-panel" style={{ position: 'sticky', top: '1rem', margin: '1rem auto', zIndex: 40, width: 'calc(100% - 2rem)', maxWidth: '1100px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.5rem' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'inherit' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3px',
            boxShadow: 'var(--accent-glow)'
          }}>
            <img
              src="/logo.png"
              alt="Listify Logo"
              width={34}
              height={34}
              style={{ objectFit: 'contain' }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Listify
              </span>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '6px', background: 'var(--bg-elevated)', color: 'var(--accent-primary)', border: '1px solid var(--border-subtle)' }}>
                WEB
              </span>
            </div>
          </div>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
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
      </div>
    </header>
  );
}
