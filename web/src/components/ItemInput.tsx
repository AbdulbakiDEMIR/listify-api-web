'use client';

import React, { useState, useRef } from 'react';
import { Plus, Tag, Check } from 'lucide-react';
import { detectCategory, CATEGORIES, CategoryName } from '@/lib/dictionary';
import { ListType } from '@/types';

interface ItemInputProps {
  listType: ListType;
  onAddItem: (name: string, category: string) => void;
}

export default function ItemInput({ listType, onAddItem }: ItemInputProps) {
  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Diğer');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (listType === 'shopping') {
      const detected = detectCategory(val);
      setSelectedCategory(detected);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddItem(name.trim(), listType === 'shopping' ? selectedCategory : 'Genel');
    setName('');
    setSelectedCategory('Diğer');
    setShowCategoryPicker(false);
    // Keep focus for rapid mobile typing
    inputRef.current?.focus();
  };

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            ref={inputRef}
            type="text"
            className="input"
            value={name}
            onChange={handleNameChange}
            placeholder={listType === 'shopping' ? 'Yeni ürün yazın (ör. 2 lt süt, yumurta)...' : 'Yeni görev yazın...'}
            autoComplete="off"
            autoCorrect="on"
            enterKeyHint="done"
            style={{
              paddingRight: listType === 'shopping' && name.trim() ? '2.5rem' : '1rem'
            }}
          />

          {listType === 'shopping' && name.trim() && (
            <button
              type="button"
              onClick={() => setShowCategoryPicker(!showCategoryPicker)}
              className="btn btn-ghost btn-icon"
              style={{
                position: 'absolute',
                right: '4px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--accent-primary)',
                padding: '0.4rem'
              }}
              title="Kategori Seç"
            >
              <Tag size={17} />
            </button>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          style={{
            flexShrink: 0,
            padding: '0.75rem 1.25rem',
            minHeight: '46px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
        >
          <Plus size={19} strokeWidth={2.5} />
          <span>Ekle</span>
        </button>
      </form>

      {/* Alışveriş Listelerinde Aktif / Algılanan Kategori Bilgisi & Hızlı Çipler */}
      {listType === 'shopping' && (
        <div style={{ marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Reyon: <strong style={{ color: 'var(--accent-primary)' }}>{selectedCategory}</strong>
            </span>
            <button
              type="button"
              onClick={() => setShowCategoryPicker(!showCategoryPicker)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '0.75rem',
                color: 'var(--accent-primary)',
                cursor: 'pointer',
                fontWeight: 600,
                padding: '2px 4px'
              }}
            >
              {showCategoryPicker ? 'Kapat' : 'Değiştir'}
            </button>
          </div>

          {/* Yatay Kaydırılabilir Hızlı Kategori Çipleri (Mobilde Tek Tıkla Seçim) */}
          <div className="chips-scroll">
            {CATEGORIES.map(cat => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.3rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                    background: isSelected ? 'rgba(6, 182, 212, 0.16)' : 'var(--bg-elevated)',
                    color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'var(--transition)'
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
