'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, ShoppingCart, CheckSquare, Plus, Check } from 'lucide-react';
import { ListTemplate, TemplateItem } from '@/types';
import { getAllTemplates } from '@/lib/indexedDB';

interface QuickAddTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentListTitle: string;
  onAddItems: (items: TemplateItem[]) => Promise<void>;
}

export default function QuickAddTemplateModal({
  isOpen,
  onClose,
  currentListTitle,
  onAddItems
}: QuickAddTemplateModalProps) {
  const [templates, setTemplates] = useState<ListTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ListTemplate | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const data = await getAllTemplates();
        setTemplates(data);
        if (data.length > 0) {
          setSelectedTemplate(data[0]);
          setSelectedItemIds(new Set(data[0].items.map((it, idx) => it.id || String(idx))));
        }
      } catch (err) {
        console.error('Şablonlar yüklenirken hata:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, [isOpen]);

  const handleSelectTemplate = (template: ListTemplate) => {
    setSelectedTemplate(template);
    setSelectedItemIds(new Set(template.items.map((it, idx) => it.id || String(idx))));
  };

  const handleToggleItem = (itemId: string) => {
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (!selectedTemplate) return;
    setSelectedItemIds(new Set(selectedTemplate.items.map((it, idx) => it.id || String(idx))));
  };

  const handleDeselectAll = () => {
    setSelectedItemIds(new Set());
  };

  const handleConfirmAdd = async () => {
    if (!selectedTemplate) return;
    const itemsToAdd = selectedTemplate.items.filter((it, idx) => {
      const id = it.id || String(idx);
      return selectedItemIds.has(id);
    });

    if (itemsToAdd.length === 0) {
      alert('Lütfen eklenecek en az bir madde seçin.');
      return;
    }

    setAdding(true);
    try {
      await onAddItems(itemsToAdd);
      onClose();
    } catch (err) {
      console.error('Maddeler eklenemedi:', err);
      alert('Maddeler eklenirken bir hata oluştu.');
    } finally {
      setAdding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
      >
        {/* Mobile Drag Handle */}
        <div className="sheet-drag-handle" />

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
              color: 'var(--accent-primary)',
              flexShrink: 0
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Listeye Taslak Ekle</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <strong>&quot;{currentListTitle}&quot;</strong> için hazır maddeler aktarın
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
            Taslaklar yükleniyor...
          </div>
        ) : templates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
            Kayıtlı bir taslak bulunamadı. Taslaklar sekmesinden yeni taslak oluşturabilirsiniz.
          </div>
        ) : (
          <div>
            {/* Taslak Seçici Buton Grubu */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.45rem' }}>
                Taslak Seçin:
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '0.5rem'
              }}>
                {templates.map(tmpl => {
                  const isSelected = selectedTemplate?.id === tmpl.id;
                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => handleSelectTemplate(tmpl)}
                      style={{
                        padding: '0.65rem',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                        background: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'var(--bg-elevated)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: 'inherit',
                        transition: 'var(--transition)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '3px' }}>
                        {tmpl.type === 'shopping' ? (
                          <ShoppingCart size={14} style={{ color: '#6366f1', flexShrink: 0 }} />
                        ) : (
                          <CheckSquare size={14} style={{ color: '#10b981', flexShrink: 0 }} />
                        )}
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {tmpl.title}
                        </span>
                      </div>
                      <span className="badge" style={{ fontSize: '0.68rem', padding: '1px 5px' }}>
                        {tmpl.items.length} Madde
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seçilen Taslağın Maddeleri */}
            {selectedTemplate && (
              <div style={{
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                padding: '0.85rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                    {selectedTemplate.title} ({selectedItemIds.size}/{selectedTemplate.items.length})
                  </div>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="btn btn-ghost"
                      style={{ fontSize: '0.72rem', padding: '0.2rem 0.45rem', minHeight: '30px' }}
                    >
                      Tümünü Seç
                    </button>
                    <button
                      type="button"
                      onClick={handleDeselectAll}
                      className="btn btn-ghost"
                      style={{ fontSize: '0.72rem', padding: '0.2rem 0.45rem', minHeight: '30px' }}
                    >
                      Temizle
                    </button>
                  </div>
                </div>

                <div style={{
                  maxHeight: '220px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  paddingRight: '2px'
                }}>
                  {selectedTemplate.items.map((item, idx) => {
                    const id = item.id || String(idx);
                    const isChecked = selectedItemIds.has(id);
                    return (
                      <div
                        key={id}
                        onClick={() => handleToggleItem(id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          padding: '0.55rem 0.65rem',
                          minHeight: '44px',
                          background: isChecked ? 'var(--bg-surface)' : 'transparent',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          border: isChecked ? '1px solid var(--border-strong)' : '1px solid transparent',
                          opacity: isChecked ? 1 : 0.65
                        }}
                      >
                        <div
                          className={`custom-checkbox ${isChecked ? 'checked' : ''}`}
                          style={{ width: '22px', height: '22px' }}
                        >
                          {isChecked && <Check size={14} strokeWidth={3} />}
                        </div>
                        <span style={{ fontSize: '0.88rem', fontWeight: 500, flex: 1, wordBreak: 'break-word' }}>
                          {item.name}
                        </span>
                        {item.category && item.category !== 'Genel' && (
                          <span className="badge" style={{ fontSize: '0.68rem', padding: '1px 5px' }}>
                            {item.category}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Aksiyon Butonları */}
            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                disabled={adding}
                style={{ flex: 1, minHeight: '44px' }}
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleConfirmAdd}
                className="btn btn-primary"
                disabled={adding || selectedItemIds.size === 0}
                style={{ flex: 2, minHeight: '44px' }}
              >
                <Plus size={18} />
                <span>{adding ? 'Ekleniyor...' : `${selectedItemIds.size} Maddeyi Ekle`}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
