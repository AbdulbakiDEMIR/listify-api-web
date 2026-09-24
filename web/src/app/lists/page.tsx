'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  ShoppingCart, 
  CheckSquare, 
  Sparkles, 
  Trash2, 
  Share2, 
  Calendar, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { getAllLists, saveList, deleteList, saveItem } from '@/lib/indexedDB';
import { List, ListTemplate, ListType } from '@/types';
import TemplateModal from '@/components/TemplateModal';

export default function ListsPage() {
  const router = useRouter();
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  
  // Yeni Liste Form Durumu
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<ListType>('shopping');

  const loadLists = async () => {
    try {
      const data = await getAllLists();
      setLists(data);
    } catch (err) {
      console.error('Listeler yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLists();
  }, []);

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newList: List = {
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      type: newType,
      created_at: Date.now(),
      updated_at: Date.now()
    };

    await saveList(newList);
    setShowNewModal(false);
    setNewTitle('');
    router.push(`/lists/${newList.id}`);
  };

  const handleSelectTemplate = async (template: ListTemplate) => {
    const listId = crypto.randomUUID();
    const newList: List = {
      id: listId,
      title: template.title,
      type: template.type,
      created_at: Date.now(),
      updated_at: Date.now()
    };

    await saveList(newList);

    // Şablon maddelerini oluştur
    for (const item of template.items) {
      await saveItem({
        id: crypto.randomUUID(),
        list_id: listId,
        name: item.name,
        category: item.category || 'Genel',
        is_completed: false,
        updated_at: Date.now(),
        is_deleted: false
      });
    }

    setShowTemplateModal(false);
    router.push(`/lists/${listId}`);
  };

  const handleDeleteList = async (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm(`"${title}" listesini ve içindeki tüm maddeleri silmek istediğinizden emin misiniz?`)) {
      await deleteList(id);
      loadLists();
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', paddingTop: '1rem' }}>
      {/* Üst Başlık ve Aksiyonlar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Listelerim
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Cihazınızda yerel olarak saklanan alışveriş ve yapılacaklar listeleriniz.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            onClick={() => setShowTemplateModal(true)}
            className="btn btn-secondary"
            style={{ fontSize: '0.88rem', padding: '0.65rem 1.1rem' }}
          >
            <Sparkles size={16} style={{ color: 'var(--accent-primary)' }} />
            <span>Hazır Şablonlar</span>
          </button>
          <button
            onClick={() => setShowNewModal(true)}
            className="btn btn-primary"
            style={{ fontSize: '0.88rem', padding: '0.65rem 1.25rem' }}
          >
            <Plus size={18} />
            <span>Yeni Liste</span>
          </button>
        </div>
      </div>

      {/* Yükleniyor Durumu */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
          <p>Listeler yükleniyor...</p>
        </div>
      )}

      {/* Boş Durum */}
      {!loading && lists.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', borderStyle: 'dashed' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'var(--bg-elevated)',
            color: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            <Layers size={28} />
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Henüz Bir Listeniz Yok</h3>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '450px', margin: '0 auto 2rem auto' }}>
            Alışverişe çıkmadan önce sepetinizi planlayın veya yapılacaklar listenizi hemen oluşturun.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={() => setShowNewModal(true)} className="btn btn-primary">
              <Plus size={18} />
              <span>İlk Listenizi Oluşturun</span>
            </button>
            <button onClick={() => setShowTemplateModal(true)} className="btn btn-secondary">
              <Sparkles size={16} />
              <span>Şablon Kullan</span>
            </button>
          </div>
        </div>
      )}

      {/* Liste Kartları Izgarası */}
      {!loading && lists.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {lists.map(list => (
            <Link
              key={list.id}
              href={`/lists/${list.id}`}
              className="card"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '160px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: list.type === 'shopping' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                    color: list.type === 'shopping' ? '#6366f1' : '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {list.type === 'shopping' ? <ShoppingCart size={17} /> : <CheckSquare size={17} />}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {list.is_synced && (
                      <span className="badge badge-indigo" title="Canlı Senkronizasyon Oturumu Açık">
                        Canlı
                      </span>
                    )}
                    <button
                      onClick={(e) => handleDeleteList(e, list.id, list.title)}
                      className="btn btn-ghost btn-icon"
                      style={{ padding: '0.35rem', color: 'var(--text-muted)' }}
                      title="Listeyi Sil"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem', wordBreak: 'break-word' }}>
                  {list.title}
                </h3>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>{new Date(list.updated_at).toLocaleDateString('tr-TR')}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-primary)', fontWeight: 600 }}>
                  <span>Aç</span>
                  <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Yeni Liste Oluşturma Modalı */}
      {showNewModal && (
        <div className="modal-backdrop" onClick={() => setShowNewModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>Yeni Liste Oluştur</h3>
            <form onSubmit={handleCreateList}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Liste Başlığı
                </label>
                <input
                  type="text"
                  className="input"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Ör. Haftalık Market, Tatil Çantası..."
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Liste Türü
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setNewType('shopping')}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: newType === 'shopping' ? '2px solid var(--accent-primary)' : '1px solid var(--border-strong)',
                      background: newType === 'shopping' ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-elevated)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      color: 'var(--text-primary)',
                      fontFamily: 'inherit',
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }}
                  >
                    <ShoppingCart size={18} style={{ color: '#6366f1' }} />
                    <span>Alışveriş Sepeti</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewType('todo')}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: newType === 'todo' ? '2px solid var(--accent-primary)' : '1px solid var(--border-strong)',
                      background: newType === 'todo' ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-elevated)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      color: 'var(--text-primary)',
                      fontFamily: 'inherit',
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }}
                  >
                    <CheckSquare size={18} style={{ color: '#10b981' }} />
                    <span>Yapılacaklar (To-Do)</span>
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowNewModal(false)} className="btn btn-secondary">
                  İptal
                </button>
                <button type="submit" className="btn btn-primary">
                  Oluştur ve Aç
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Şablon Seçici Modal */}
      <TemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
}
