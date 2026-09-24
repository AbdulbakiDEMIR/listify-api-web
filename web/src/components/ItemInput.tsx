'use client';

import React, { useState } from 'react';
import { Plus, Tag } from 'lucide-react';
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
  };

  return (
    <form onSubmit={handleSubmit} style={{ position: 'relative', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            className="input"
            value={name}
            onChange={handleNameChange}
            placeholder={listType === 'shopping' ? 'Yeni ürün ekle (ör. 2 litre süt, domates)...' : 'Yeni görev ekle...'}
            autoFocus
            style={{ paddingRight: listType === 'shopping' ? '140px' : '1rem' }}
          />

          {listType === 'shopping' && name.trim() && (
            <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)' }}>
              <button
                type="button"
                onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                className="badge badge-indigo"
                style={{ cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                title="Kategoriyi Değiştir"
              >
                <Tag size={12} />
                <span>{selectedCategory}</span>
              </button>
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary" style={{ flexShrink: 0, padding: '0.75rem 1.25rem' }}>
          <Plus size={18} />
          <span>Ekle</span>
        </button>
      </div>

      {/* Kategori Seçici Açılır Menü */}
      {showCategoryPicker && listType === 'shopping' && (
        <div className="glass-panel" style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '6px',
          padding: '0.75rem',
          zIndex: 30,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '6px',
          width: '320px',
          boxShadow: 'var(--shadow-xl)'
        }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setSelectedCategory(cat);
                setShowCategoryPicker(false);
              }}
              className="btn btn-ghost"
              style={{
                fontSize: '0.8rem',
                justifyContent: 'flex-start',
                padding: '0.4rem 0.6rem',
                borderRadius: '6px',
                background: selectedCategory === cat ? 'var(--bg-elevated)' : 'transparent',
                fontWeight: selectedCategory === cat ? 700 : 500
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
