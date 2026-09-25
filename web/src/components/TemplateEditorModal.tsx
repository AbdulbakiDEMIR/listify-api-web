'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ShoppingCart, CheckSquare, Sparkles, Layers } from 'lucide-react';
import { ListTemplate, ListType, TemplateItem } from '@/types';
import { saveTemplate } from '@/lib/indexedDB';
import { generateUUID } from '@/lib/uuid';
import { CATEGORIES, detectCategory } from '@/lib/dictionary';

interface TemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateToEdit: ListTemplate | null;
  onSaveSuccess: (savedTemplate: ListTemplate) => void;
}

export default function TemplateEditorModal({
  isOpen,
  onClose,
  templateToEdit,
  onSaveSuccess
}: TemplateEditorModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ListType>('shopping');
  const [items, setItems] = useState<TemplateItem[]>([]);

  // Yeni Madde Ekleme Girdisi
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<string>('Genel');

  useEffect(() => {
    if (templateToEdit) {
      setTitle(templateToEdit.title || '');
      setDescription(templateToEdit.description || '');
      setType(templateToEdit.type || 'shopping');
      setItems(templateToEdit.items || []);
    } else {
      setTitle('');
      setDescription('');
      setType('shopping');
      setItems([]);
    }
    setNewItemName('');
    setNewItemCategory('Genel');
  }, [templateToEdit, isOpen]);

  // Ürün adı değiştikçe alışveriş için kategoriyi otomatik tahmin et
  const handleItemNameChange = (val: string) => {
    setNewItemName(val);
    if (type === 'shopping') {
      const guessed = detectCategory(val);
      setNewItemCategory(guessed);
    }
  };

  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: TemplateItem = {
      id: generateUUID(),
      name: newItemName.trim(),
      category: type === 'shopping' ? newItemCategory || 'Diğer' : undefined
    };

    setItems(prev => [...prev, newItem]);
    setNewItemName('');
    if (type === 'shopping') {
      setNewItemCategory('Genel');
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Lütfen taslak için bir başlık belirleyin.');
      return;
    }

    const templateData: ListTemplate = {
      id: templateToEdit?.id || generateUUID(),
      title: title.trim(),
      description: description.trim() || undefined,
      type: templateToEdit ? templateToEdit.type : type,
      items,
      created_at: templateToEdit?.created_at || Date.now(),
      updated_at: Date.now()
    };

    await saveTemplate(templateData);
    onSaveSuccess(templateData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{ padding: '1.75rem', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', overflowX: 'hidden' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--accent-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)'
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {templateToEdit ? 'Taslağı Düzenle' : 'Yeni Taslak Oluştur'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Tekrar tekrar kullanabileceğiniz hazır bir liste şablonu.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          {/* Başlık */}
          <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Taslak Başlığı <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              type="text"
              className="input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ör. Haftalık Pazar Alışverişi, Kamp Malzemeleri..."
              required
            />
          </div>

          {/* Açıklama */}
          <div style={{ marginBottom: '1.1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Kısa Açıklama (İsteğe Bağlı)
            </label>
            <input
              type="text"
              className="input"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ör. Temel sebze, meyve ve kahvaltılıklar."
            />
          </div>

          {/* Tür Seçimi: Oluşturulduktan sonra güncellenemez */}
          <div style={{ marginBottom: '1.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                Taslak Türü
              </label>
              {templateToEdit && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  🔒 Oluşturulan taslağın türü değiştirilemez
                </span>
              )}
            </div>

            {templateToEdit ? (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-strong)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}>
                {templateToEdit.type === 'shopping' ? (
                  <>
                    <ShoppingCart size={18} style={{ color: '#0f766e' }} />
                    <span>Alışveriş Sepeti (Liste)</span>
                  </>
                ) : (
                  <>
                    <CheckSquare size={18} style={{ color: '#10b981' }} />
                    <span>Yapılacaklar (To-Do)</span>
                  </>
                )}
                <span className="badge" style={{ marginLeft: 'auto', fontSize: '0.72rem' }}>
                  Sabit Tür
                </span>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setType('shopping')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: type === 'shopping' ? '2px solid var(--accent-primary)' : '1px solid var(--border-strong)',
                    background: type === 'shopping' ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-elevated)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    fontWeight: 600,
                    fontSize: '0.88rem'
                  }}
                >
                  <ShoppingCart size={17} style={{ color: '#0f766e' }} />
                  <span>Alışveriş Sepeti (Liste)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType('todo')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: type === 'todo' ? '2px solid var(--accent-primary)' : '1px solid var(--border-strong)',
                    background: type === 'todo' ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-elevated)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    fontWeight: 600,
                    fontSize: '0.88rem'
                  }}
                >
                  <CheckSquare size={17} style={{ color: '#10b981' }} />
                  <span>Yapılacaklar (To-Do)</span>
                </button>
              </div>
            )}
          </div>

          {/* Maddeler Bölümü */}
          <div style={{ marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                Taslak Maddeleri ({items.length})
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                İşaretleme yapılmadan eklenir
              </span>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
              Buradaki maddeler şablon olarak saklanır. Gerçek bir listeye aktarıldığında işaretlenebilir hale gelir.
            </p>

            {/* Yeni Madde Ekleme Satırı */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="text"
                className="input"
                style={{ flex: 1 }}
                value={newItemName}
                onChange={e => handleItemNameChange(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddItem();
                  }
                }}
                placeholder={type === 'shopping' ? 'Ürün adı (Ör. Zeytinyağı, Yumurta)' : 'Görev adı (Ör. Pasaportları kontrol et)'}
              />

              {type === 'shopping' && (
                <select
                  className="input"
                  style={{ width: '150px', fontSize: '0.85rem' }}
                  value={newItemCategory}
                  onChange={e => setNewItemCategory(e.target.value)}
                >
                  <option value="Genel">Genel</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              )}

              <button
                type="button"
                onClick={() => handleAddItem()}
                className="btn btn-secondary"
                style={{ padding: '0.55rem 0.9rem', flexShrink: 0 }}
                title="Madde Ekle"
              >
                <Plus size={18} />
                <span>Ekle</span>
              </button>
            </div>

            {/* Eklenen Maddelerin Listesi (İşaretleme kutusu olmadan) */}
            <div style={{
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              maxHeight: '220px',
              overflowY: 'auto',
              padding: '0.5rem'
            }}>
              {items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Henüz madde eklenmedi. Yukarıdaki alandan taslağa ürün veya görevler ekleyin.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {items.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.55rem 0.75rem',
                        background: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        gap: '0.75rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: 0 }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: 'var(--text-muted)',
                          width: '20px',
                          textAlign: 'center'
                        }}>
                          {idx + 1}.
                        </span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, wordBreak: 'break-word' }}>
                          {item.name}
                        </span>
                        {item.category && item.category !== 'Genel' && (
                          <span className="badge" style={{
                            fontSize: '0.72rem',
                            padding: '2px 6px',
                            background: 'var(--bg-elevated)',
                            color: 'var(--accent-primary)'
                          }}>
                            {item.category}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="btn btn-ghost btn-icon"
                        style={{ padding: '0.3rem', color: 'var(--danger)' }}
                        title="Maddeyi Çıkar"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Modal Alt Aksiyonları */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              İptal
            </button>
            <button type="submit" className="btn btn-primary">
              {templateToEdit ? 'Değişiklikleri Kaydet' : 'Taslağı Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
