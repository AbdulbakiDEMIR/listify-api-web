'use client';

import React from 'react';
import { X, Sparkles, ShoppingCart, CheckSquare } from 'lucide-react';
import { DEFAULT_TEMPLATES } from '@/lib/indexedDB';
import { ListTemplate } from '@/types';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: ListTemplate) => void;
}

export default function TemplateModal({ isOpen, onClose, onSelectTemplate }: TemplateModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Hazır Şablonlar</h3>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Sık kullanılan listelerden birini seçerek anında bağımsız bir liste oluşturabilirsiniz:
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
          {DEFAULT_TEMPLATES.map(template => (
            <div
              key={template.id}
              onClick={() => onSelectTemplate(template)}
              className="card"
              style={{
                cursor: 'pointer',
                padding: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: template.type === 'shopping' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                  color: template.type === 'shopping' ? '#6366f1' : '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {template.type === 'shopping' ? <ShoppingCart size={18} /> : <CheckSquare size={18} />}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '2px' }}>{template.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{template.description}</p>
                </div>
              </div>
              <span className="badge badge-indigo" style={{ flexShrink: 0 }}>
                {template.items.length} Madde
              </span>
            </div>
          ))}
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
