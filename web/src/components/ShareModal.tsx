'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Users, CopyCheck, Clock, ShieldCheck } from 'lucide-react';
import { ShareResponse } from '@/types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareData: ShareResponse | null;
  listTitle: string;
}

export default function ShareModal({ isOpen, onClose, shareData, listTitle }: ShareModalProps) {
  const [copiedType, setCopiedType] = useState<'clone' | 'sync' | null>(null);

  if (!isOpen || !shareData) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const cloneUrl = `${origin}/l/clone/${shareData.clone_token}`;
  const syncUrl = `${origin}/l/sync/${shareData.sync_token}`;

  const copyToClipboard = async (text: string, type: 'clone' | 'sync') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    } catch {
      alert('Panoya kopyalanamadı, lütfen linki manuel kopyalayınız.');
    }
  };

  const expiresDate = new Date(shareData.expires_at).toLocaleString('tr-TR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Listeyi Paylaş</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>"{listTitle}" için paylaşım seçenekleri</p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={20} />
          </button>
        </div>

        {/* TTL Bilgilendirmesi */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '1.5rem',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)'
        }}>
          <Clock size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
          <span>Bu bağlantılar <strong>{expiresDate}</strong> tarihine kadar (48 saat) geçerlidir.</span>
        </div>

        {/* Seçenek 1: Canlı Senkronizasyon Linki */}
        <div style={{
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--accent-primary)',
          background: 'rgba(99, 102, 241, 0.04)',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <Users size={18} style={{ color: 'var(--accent-primary)' }} />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Canlı Ortak Çalışma Linki</span>
            <span className="badge badge-indigo" style={{ marginLeft: 'auto' }}>Eşzamanlı</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
            Bu linki açan herkes listeyi anlık olarak birlikte düzenler ve işaretler (Market arkadaşınızla kullanım için idealdir).
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              readOnly
              value={syncUrl}
              className="input"
              style={{ fontSize: '0.82rem', background: 'var(--bg-surface)' }}
            />
            <button
              onClick={() => copyToClipboard(syncUrl, 'sync')}
              className="btn btn-primary"
              style={{ flexShrink: 0, padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              {copiedType === 'sync' ? <Check size={16} /> : <Copy size={16} />}
              <span>{copiedType === 'sync' ? 'Kopyalandı!' : 'Kopyala'}</span>
            </button>
          </div>
        </div>

        {/* Seçenek 2: Bağımsız Kopyalama Linki */}
        <div style={{
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-strong)',
          background: 'var(--bg-elevated)',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <CopyCheck size={18} style={{ color: 'var(--text-primary)' }} />
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Kopyalama Linki</span>
            <span className="badge" style={{ marginLeft: 'auto', background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>Sıfırlanmış</span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
            Linki açan kişi listenin bağımsız bir kopyasını indirir. Tüm onay kutuları temizlenir ve orijinal listeniz etkilenmez.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              readOnly
              value={cloneUrl}
              className="input"
              style={{ fontSize: '0.82rem', background: 'var(--bg-surface)' }}
            />
            <button
              onClick={() => copyToClipboard(cloneUrl, 'clone')}
              className="btn btn-secondary"
              style={{ flexShrink: 0, padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              {copiedType === 'clone' ? <Check size={16} /> : <Copy size={16} />}
              <span>{copiedType === 'clone' ? 'Kopyalandı!' : 'Kopyala'}</span>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-secondary">
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
