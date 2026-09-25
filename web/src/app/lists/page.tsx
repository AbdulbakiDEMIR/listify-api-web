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
  Layers,
  ArrowRight,
  ListPlus,
  Edit3,
  Copy,
  Check,
  X
} from 'lucide-react';
import {
  getAllLists,
  saveList,
  deleteList,
  saveItem,
  getAllTemplates,
  deleteTemplate
} from '@/lib/indexedDB';
import { List, ListTemplate, ListType } from '@/types';
import TemplateEditorModal from '@/components/TemplateEditorModal';
import { generateUUID } from '@/lib/uuid';

export default function ListsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'lists' | 'templates'>('lists');
  const [lists, setLists] = useState<List[]>([]);
  const [templates, setTemplates] = useState<ListTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Yeni Liste Modalı Durumu
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<ListType>('shopping');
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [showTemplatePicker, setShowTemplatePicker] = useState<boolean>(false);

  // Taslak Düzenleme / Oluşturma Modalı
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState<ListTemplate | null>(null);

  const availableTemplates = templates.filter(t => t.type === newType);

  const totalSelectedItemsCount = selectedTemplateIds.reduce((sum, id) => {
    const tmpl = templates.find(t => t.id === id);
    return sum + (tmpl ? tmpl.items.length : 0);
  }, 0);

  const loadData = async () => {
    try {
      const [listsData, templatesData] = await Promise.all([
        getAllLists(),
        getAllTemplates()
      ]);
      setLists(listsData);
      setTemplates(templatesData);
    } catch (err) {
      console.error('Veriler yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // URL'de ?tab=templates parametresi varsa taslaklar sekmesine geç
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'templates') {
        setActiveTab('templates');
      }
    }
  }, []);

  const handleOpenNewModal = () => {
    setNewTitle('');
    setNewType('shopping');
    setSelectedTemplateIds([]);
    setShowTemplatePicker(false);
    setShowNewModal(true);
  };

  const toggleTemplateSelection = (templateId: string) => {
    setSelectedTemplateIds(prev => {
      const exists = prev.includes(templateId);
      const updated = exists ? prev.filter(id => id !== templateId) : [...prev, templateId];

      if (!exists && updated.length === 1) {
        const first = templates.find(t => t.id === templateId);
        if (first) {
          setNewType(first.type);
          if (!newTitle.trim()) {
            setNewTitle(first.title);
          }
        }
      }
      return updated;
    });
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const listId = generateUUID();
    const newList: List = {
      id: listId,
      title: newTitle.trim(),
      type: newType,
      created_at: Date.now(),
      updated_at: Date.now()
    };

    await saveList(newList);

    // Seçilen TÜM taslaklardaki maddeleri sırayla (order korunarak) listeye aktar
    let currentOrder = 0;
    for (const templateId of selectedTemplateIds) {
      const chosenTemplate = templates.find(t => t.id === templateId);
      if (chosenTemplate) {
        for (const item of chosenTemplate.items) {
          await saveItem({
            id: generateUUID(),
            list_id: listId,
            name: item.name,
            category: item.category || 'Genel',
            is_completed: false,
            updated_at: Date.now(),
            is_deleted: false,
            order: ++currentOrder
          });
        }
      }
    }

    setShowNewModal(false);
    setNewTitle('');
    setSelectedTemplateIds([]);
    setShowTemplatePicker(false);
    router.push(`/lists/${listId}`);
  };

  const handleDeleteList = async (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm(`"${title}" listesini ve içindeki tüm maddeleri silmek istediğinizden emin misiniz?`)) {
      await deleteList(id);
      loadData();
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

  const handleDeleteTemplate = async (templateId: string, title: string) => {
    if (confirm(`"${title}" taslağını silmek istediğinizden emin misiniz?`)) {
      await deleteTemplate(templateId);
      await loadData();
    }
  };

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', paddingTop: '1rem' }}>
      {/* Ana Ekran Sekme Geçişi: Listelerim <-> Taslaklarım */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '0.75rem'
      }}>
        <button
          onClick={() => setActiveTab('lists')}
          className={`btn ${activeTab === 'lists' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.6rem 1.25rem', fontSize: '0.92rem' }}
        >
          <ListPlus size={18} />
          <span>Listelerim ({lists.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`btn ${activeTab === 'templates' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.6rem 1.25rem', fontSize: '0.92rem' }}
        >
          <Sparkles size={18} />
          <span>Taslak Listelerim ({templates.length})</span>
        </button>
      </div>

      {/* ==================== 1. LISTELERİM GÖRÜNÜMÜ ==================== */}
      {activeTab === 'lists' && (
        <>
          {/* Üst Başlık ve Aksiyonlar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
                Listelerim
              </h1>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Cihazınızda yerel olarak saklanan alışveriş ve yapılacaklar listeleriniz.
              </p>
            </div>

            <div>
              <button
                onClick={handleOpenNewModal}
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

          {/* Boş Liste Durumu */}
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
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '450px', margin: '0 auto 1.75rem auto' }}>
                Alışverişe çıkmadan önce sepetinizi planlayın veya yapılacaklar listenizi hemen oluşturun.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={handleOpenNewModal}
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 1.6rem', fontSize: '0.92rem' }}
                >
                  <Plus size={18} />
                  <span>Yeni Liste Oluştur</span>
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
        </>
      )}

      {/* ==================== 2. TASLAKLARIM GÖRÜNÜMÜ ==================== */}
      {activeTab === 'templates' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
                Taslak Listelerim
              </h1>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                İşaretleme kutusu olmadan serbestçe oluşturup düzenleyebileceğiniz hazır liste şablonları.
              </p>
            </div>

            <button
              onClick={() => {
                setTemplateToEdit(null);
                setShowTemplateEditor(true);
              }}
              className="btn btn-primary"
              style={{ fontSize: '0.88rem', padding: '0.65rem 1.25rem' }}
            >
              <Plus size={18} />
              <span>Yeni Taslak Oluştur</span>
            </button>
          </div>

          {/* Taslak Kartları Izgarası */}
          {templates.length === 0 ? (
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
                Tekrar eden alışverişlerinizi veya seyahat çantası gibi görev gruplarınızı taslak olarak saklayabilirsiniz.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {templates.map(tmpl => (
                <div
                  key={tmpl.id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '220px'
                  }}
                >
                  <div>
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
                          onClick={() => {
                            setTemplateToEdit(tmpl);
                            setShowTemplateEditor(true);
                          }}
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
                      onClick={() => {
                        setTemplateToEdit(tmpl);
                        setShowTemplateEditor(true);
                      }}
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
                      <span>Liste Başlat</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ==================== YENİ LİSTE OLUŞTURMA MODALI ==================== */}
      {showNewModal && (
        <div className="modal-backdrop" onClick={() => setShowNewModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '1.75rem', maxWidth: '560px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.25rem' }}>Yeni Liste Oluştur</h3>
            <form onSubmit={handleCreateList}>
              {/* Liste Adı */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  Liste Adı <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  className="input"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Ör. Haftalık Market, Tatil Çantası..."
                  autoFocus
                  required
                />
              </div>

              {/* Liste Türü */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                    Liste Türü
                  </label>
                  {selectedTemplateIds.length > 0 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      🔒 Seçilen taslak türüyle ({newType === 'shopping' ? 'Alışveriş Sepeti' : 'To-Do'}) kilitlendi
                    </span>
                  )}
                </div>

                {selectedTemplateIds.length > 0 ? (
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
                    fontSize: '0.88rem'
                  }}>
                    {newType === 'shopping' ? (
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
                      Taslağa Bağlı Sabit
                    </span>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => setNewType('shopping')}
                      style={{
                        padding: '0.75rem',
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
                        fontSize: '0.85rem'
                      }}
                    >
                      <ShoppingCart size={18} style={{ color: '#6366f1' }} />
                      <span>Alışveriş Sepeti</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewType('todo')}
                      style={{
                        padding: '0.75rem',
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
                        fontSize: '0.85rem'
                      }}
                    >
                      <CheckSquare size={18} style={{ color: '#10b981' }} />
                      <span>Yapılacaklar (To-Do)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* TASLAKLARDAN EKLE BÖLÜMÜ (Birden fazla taslak seçilebilir) */}
              <div style={{
                marginBottom: '1.5rem',
                padding: '1rem',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-strong)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>Taslaklardan Ekle</span>
                      {selectedTemplateIds.length > 0 && (
                        <span className="badge" style={{ background: 'var(--accent-primary)', color: '#fff', fontSize: '0.7rem' }}>
                          {selectedTemplateIds.length} Taslak Seçildi
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px', marginBottom: 0 }}>
                      {selectedTemplateIds.length > 0
                        ? `${selectedTemplateIds.length} taslaktan toplam ${totalSelectedItemsCount} ürün bu listeye eklenecek.`
                        : 'Birden fazla taslak seçip ürünlerini bu listeye dahil edebilirsiniz.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowTemplatePicker(!showTemplatePicker)}
                    className={`btn ${selectedTemplateIds.length > 0 ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem', flexShrink: 0 }}
                  >
                    <Sparkles size={15} />
                    <span>{showTemplatePicker ? 'Listeyi Gizle' : (selectedTemplateIds.length > 0 ? 'Taslakları Değiştir' : 'Taslaklardan Ekle')}</span>
                  </button>
                </div>

                {/* Seçili Taslakların Rozetleri */}
                {selectedTemplateIds.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem' }}>
                    {selectedTemplateIds.map(id => {
                      const tmpl = templates.find(t => t.id === id);
                      if (!tmpl) return null;
                      return (
                        <span
                          key={id}
                          className="badge"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '0.35rem 0.65rem',
                            background: 'rgba(6, 182, 212, 0.15)',
                            color: 'var(--accent-primary)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.78rem',
                            fontWeight: 600
                          }}
                        >
                          <span>{tmpl.type === 'shopping' ? '🛒' : '✅'} {tmpl.title} ({tmpl.items.length} ürün)</span>
                          <button
                            type="button"
                            onClick={() => toggleTemplateSelection(id)}
                            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, display: 'flex' }}
                            title="Taslağı kaldır"
                          >
                            <X size={13} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Çoklu Taslak Seçici Listesi */}
                {showTemplatePicker && (
                  <div style={{ marginTop: '0.85rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Eklenecek taslakları işaretleyin ({availableTemplates.length} taslak):
                      </span>
                    </div>

                    {availableTemplates.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        Bu tür için henüz taslak bulunmuyor.
                      </div>
                    ) : (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                        gap: '0.5rem',
                        maxHeight: '160px',
                        overflowY: 'auto',
                        padding: '2px'
                      }}>
                        {availableTemplates.map(tmpl => {
                          const isSelected = selectedTemplateIds.includes(tmpl.id);
                          return (
                            <button
                              key={tmpl.id}
                              type="button"
                              onClick={() => toggleTemplateSelection(tmpl.id)}
                              style={{
                                padding: '0.65rem 0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                                background: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'var(--bg-surface)',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontFamily: 'inherit',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                              }}
                            >
                              <div style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '4px',
                                border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-strong)',
                                background: isSelected ? 'var(--accent-primary)' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                flexShrink: 0
                              }}>
                                {isSelected && <Check size={12} strokeWidth={3} />}
                              </div>
                              <div style={{ overflow: 'hidden', flex: 1 }}>
                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {tmpl.type === 'shopping' ? '🛒' : '✅'} {tmpl.title}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                  {tmpl.items.length} Madde
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowNewModal(false)} className="btn btn-secondary">
                  İptal
                </button>
                <button type="submit" className="btn btn-primary">
                  {selectedTemplateIds.length > 0 
                    ? `Oluştur ve ${totalSelectedItemsCount} Ürünle Aç` 
                    : 'Oluştur ve Aç'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Taslak Düzenleme / Oluşturma Modalı (İşaretleme yapılmadan) */}
      <TemplateEditorModal
        isOpen={showTemplateEditor}
        onClose={() => setShowTemplateEditor(false)}
        templateToEdit={templateToEdit}
        onSaveSuccess={async () => {
          await loadData();
        }}
      />
    </div>
  );
}
