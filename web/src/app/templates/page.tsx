'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Plus, 
  ShoppingCart, 
  CheckSquare, 
  Edit3, 
  Trash2, 
  ArrowRight, 
  Layers, 
  ListPlus,
  Copy
} from 'lucide-react';
import { getAllTemplates, deleteTemplate, saveList, saveItem } from '@/lib/indexedDB';
import { ListTemplate, List } from '@/types';
import { generateUUID } from '@/lib/uuid';
import TemplateEditorModal from '@/components/TemplateEditorModal';

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<ListTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState<ListTemplate | null>(null);

  const loadTemplates = async () => {
    try {
      const data = await getAllTemplates();
      setTemplates(data);
    } catch (err) {
      console.error('Taslaklar yüklenirken hata:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleOpenNewModal = () => {
    setTemplateToEdit(null);
    setShowEditorModal(true);
  };

  const handleOpenEditModal = (template: ListTemplate) => {
    setTemplateToEdit(template);
    setShowEditorModal(true);
  };

  const handleDeleteTemplate = async (templateId: string, title: string) => {
    if (confirm(`"${title}" taslağını silmek istediğinizden emin misiniz?`)) {
      await deleteTemplate(templateId);
      await loadTemplates();
    }
  };

  const handleCreateListFromTemplate = async (template: ListTemplate) => {
    const listId = generateUUID();
    const newList: List = {
      id: listId,
      title: template.title,
      type: template.type,
      created_at: Date.now(),
      updated_at: Date.now()
    };

    await saveList(newList);

    for (const item of template.items) {
      await saveItem({
        id: generateUUID(),
        list_id: listId,
        name: item.name,
        category: item.category || 'Genel',
        is_completed: false,
        updated_at: Date.now(),
        is_deleted: false
      });
    }

    router.push(`/lists/${listId}`);
  };

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', paddingTop: '1rem' }}>
      {/* Mobile-First Segmented Control (Listelerim <-> Taslaklarım) */}
      <div className="segmented-control" style={{ marginBottom: '1.5rem' }}>
        <Link
          href="/lists"
          className="segmented-control-btn"
          style={{ textDecoration: 'none' }}
        >
          <ListPlus size={18} />
          <span>Listelerim</span>
        </Link>
        <button
          type="button"
          className="segmented-control-btn active"
        >
          <Sparkles size={18} />
          <span>Taslaklarım ({templates.length})</span>
        </button>
      </div>

      {/* Başlık ve Aksiyon */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
            Taslak Listelerim
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            İşaretleme kutusu olmadan serbestçe oluşturup düzenleyebileceğiniz hazır liste şablonları.
          </p>
        </div>

        <button
          onClick={handleOpenNewModal}
          className="btn btn-primary"
          style={{ fontSize: '0.88rem', padding: '0.65rem 1.25rem' }}
        >
          <Plus size={18} />
          <span>Yeni Taslak Oluştur</span>
        </button>
      </div>

      {/* Yükleniyor Durumu */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
          <p>Taslaklar yükleniyor...</p>
        </div>
      )}

      {/* Boş Durum */}
      {!loading && templates.length === 0 && (
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
            <Sparkles size={28} />
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Henüz Bir Taslağınız Yok</h3>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '450px', margin: '0 auto' }}>
            Sık sık aldığınız malzemeleri veya tekrarlayan görevlerinizi taslak haline getirerek tek tıkla yeni listelere aktarabilirsiniz.
          </p>
        </div>
      )}

      {/* Taslak Kartları Izgarası */}
      {!loading && templates.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {templates.map(tmpl => (
            <div
              key={tmpl.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '220px',
                position: 'relative'
              }}
            >
              <div>
                {/* Üst İkon ve Rozetler */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: tmpl.type === 'shopping' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                    color: tmpl.type === 'shopping' ? '#6366f1' : '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {tmpl.type === 'shopping' ? <ShoppingCart size={18} /> : <CheckSquare size={18} />}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span className="badge badge-indigo">
                      {tmpl.items.length} Madde
                    </span>
                    <button
                      onClick={() => handleOpenEditModal(tmpl)}
                      className="btn btn-ghost btn-icon"
                      style={{ padding: '0.35rem', color: 'var(--text-secondary)' }}
                      title="Taslağı Düzenle"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(tmpl.id, tmpl.title)}
                      className="btn btn-ghost btn-icon"
                      style={{ padding: '0.35rem', color: 'var(--danger)' }}
                      title="Taslağı Sil"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Başlık ve Açıklama */}
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                  {tmpl.title}
                </h3>
                {tmpl.description && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.85rem', lineHeight: 1.4 }}>
                    {tmpl.description}
                  </p>
                )}

                {/* Madde Önizleme Hapları */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.65rem' }}>
                  {tmpl.items.slice(0, 4).map((it, idx) => (
                    <span
                      key={it.id || idx}
                      style={{
                        fontSize: '0.75rem',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--bg-elevated)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      {it.name}
                    </span>
                  ))}
                  {tmpl.items.length > 4 && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--bg-elevated)',
                        color: 'var(--accent-primary)',
                        fontWeight: 600
                      }}
                    >
                      +{tmpl.items.length - 4} daha
                    </span>
                  )}
                </div>
              </div>

              {/* Kart Alt Aksiyonları */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-subtle)',
                marginTop: '1.25rem',
                gap: '0.5rem'
              }}>
                <button
                  onClick={() => handleOpenEditModal(tmpl)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '0.45rem 0.8rem', flex: 1 }}
                >
                  <Edit3 size={14} />
                  <span>Düzenle</span>
                </button>

                <button
                  onClick={() => handleCreateListFromTemplate(tmpl)}
                  className="btn btn-primary"
                  style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', flex: 1.2 }}
                  title="Bu taslaktaki maddelerle yeni bir liste başlat"
                >
                  <Copy size={14} />
                  <span>Liste Oluştur</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mobil Floating Action Button */}
      <button
        type="button"
        onClick={handleOpenNewModal}
        className="mobile-fab"
        aria-label="Yeni Taslak Oluştur"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {/* Taslak Düzenleme / Oluşturma Modalı */}
      <TemplateEditorModal
        isOpen={showEditorModal}
        onClose={() => setShowEditorModal(false)}
        templateToEdit={templateToEdit}
        onSaveSuccess={async () => {
          await loadTemplates();
        }}
      />
    </div>
  );
}
