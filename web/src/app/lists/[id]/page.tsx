'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Share2, 
  ShoppingCart, 
  CheckSquare, 
  Trash2, 
  Check, 
  Clock, 
  Wifi, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { getListById, getItemsByListId, getAllRawItemsByListId, saveList, saveItem, softDeleteItem } from '@/lib/indexedDB';
import { createShareSession, pushMutations } from '@/lib/apiClient';
import { syncManager } from '@/lib/syncManager';
import { List, ListItem, ShareResponse } from '@/types';
import ItemInput from '@/components/ItemInput';
import ShareModal from '@/components/ShareModal';

export default function SingleListPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.id as string;

  const [list, setList] = useState<List | null>(null);
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Paylaşım Modalı Durumu
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState<ShareResponse | null>(null);
  const [sharingLoading, setSharingLoading] = useState(false);

  // Veriyi IndexedDB'den Yükle
  const loadData = async () => {
    try {
      const currentList = await getListById(listId);
      if (!currentList) {
        router.push('/lists');
        return;
      }
      setList(currentList);

      const activeItems = await getItemsByListId(listId);
      setItems(activeItems);

      // Canlı senkronizasyon oturumu varsa SyncManager'ı başlat
      if (currentList.is_synced && currentList.sync_token) {
        syncManager.start(listId, currentList.sync_token, (updatedList, updatedItems) => {
          setList({ ...updatedList });
          setItems([...updatedItems]);
        });
      }
    } catch (err) {
      console.error('Liste yüklenirken hata:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    return () => {
      syncManager.stop();
    };
  }, [listId]);

  // Yeni Madde Ekleme (Optimistic UI)
  const handleAddItem = async (name: string, category: string) => {
    if (!list) return;

    const newItem: ListItem = {
      id: crypto.randomUUID(),
      list_id: listId,
      name,
      category,
      is_completed: false,
      updated_at: Date.now(),
      is_deleted: false
    };

    // 1. Yerel State Güncellemesi (Anında Tepki)
    setItems(prev => [newItem, ...prev]);

    // 2. IndexedDB'ye Kaydet
    await saveItem(newItem);

    // 3. Canlı Senkronizasyon Varsa Sunucuya İlet
    if (list.is_synced && list.sync_token) {
      try {
        await pushMutations(list.sync_token, [newItem]);
      } catch (err) {
        console.warn('Madde sunucuya iletilemedi (çevrimdışı olabilir):', err);
      }
    }
  };

  // Madde Tamamlandı Durumunu Değiştirme (Optimistic UI)
  const handleToggleComplete = async (item: ListItem) => {
    if (!list) return;

    const updatedItem: ListItem = {
      ...item,
      is_completed: !item.is_completed,
      updated_at: Date.now()
    };

    // Anında State Güncelle
    setItems(prev => prev.map(i => (i.id === item.id ? updatedItem : i)));

    // IndexedDB'ye Yaz
    await saveItem(updatedItem);

    // Senkronize Et
    if (list.is_synced && list.sync_token) {
      try {
        await pushMutations(list.sync_token, [updatedItem]);
      } catch (err) {
        console.warn('Değişiklik sunucuya iletilemedi:', err);
      }
    }
  };

  // Madde Silme (Soft Delete)
  const handleDeleteItem = async (item: ListItem) => {
    if (!list) return;

    const deletedItem: ListItem = {
      ...item,
      is_deleted: true,
      updated_at: Date.now()
    };

    // Anında Listeden Kaldır
    setItems(prev => prev.filter(i => i.id !== item.id));

    // Soft Delete Yap
    await softDeleteItem(item.id);

    // Senkronize Et
    if (list.is_synced && list.sync_token) {
      try {
        await pushMutations(list.sync_token, [deletedItem]);
      } catch (err) {
        console.warn('Silme bilgisi sunucuya iletilemedi:', err);
      }
    }
  };

  // Paylaşım Başlatma
  const handleOpenShare = async () => {
    if (!list) return;

    if (list.is_synced && list.sync_token && list.clone_token && list.expires_at) {
      setShareData({
        sync_token: list.sync_token,
        clone_token: list.clone_token,
        expires_at: list.expires_at
      });
      setShowShareModal(true);
      return;
    }

    setSharingLoading(true);
    try {
      const rawAllItems = await getAllRawItemsByListId(listId);
      const res = await createShareSession(list, rawAllItems);

      const updatedList: List = {
        ...list,
        is_synced: true,
        sync_token: res.sync_token,
        clone_token: res.clone_token,
        expires_at: res.expires_at,
        updated_at: Date.now()
      };

      await saveList(updatedList);
      setList(updatedList);
      setShareData(res);
      setShowShareModal(true);

      // Polling başlat
      syncManager.start(listId, res.sync_token, (l, its) => {
        setList({ ...l });
        setItems([...its]);
      });
    } catch (err: any) {
      alert(`Paylaşım başlatılamadı: ${err.message}`);
    } finally {
      setSharingLoading(false);
    }
  };

  // Alışveriş Listeleri İçin Kategori Bazlı Gruplama
  const groupedItems = useMemo(() => {
    if (!list || list.type !== 'shopping') return null;

    const groups: Record<string, ListItem[]> = {};
    for (const item of items) {
      const cat = item.category || 'Diğer';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    }
    return groups;
  }, [items, list]);

  const completedCount = items.filter(i => i.is_completed).length;

  if (loading || !list) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem', color: 'var(--text-secondary)' }}>
        <p>Liste yükleniyor...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto', paddingTop: '0.5rem' }}>
      {/* Üst Navigasyon ve Butonlar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <Link href="/lists" className="btn btn-ghost" style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem' }}>
          <ArrowLeft size={18} />
          <span>Tüm Listeler</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {list.is_synced && (
            <span className="badge badge-indigo" title="60 saniyede bir akıllı senkronize ediliyor">
              <RefreshCw size={12} className="animate-spin" />
              <span>Canlı Senkronize</span>
            </span>
          )}

          <button
            onClick={handleOpenShare}
            disabled={sharingLoading}
            className="btn btn-primary"
            style={{ fontSize: '0.88rem', padding: '0.55rem 1.1rem' }}
          >
            <Share2 size={16} />
            <span>{sharingLoading ? 'Hazırlanıyor...' : 'Paylaş'}</span>
          </button>
        </div>
      </div>

      {/* Liste Başlık Kartı */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                {list.type === 'shopping' ? 'Alışveriş Sepeti' : 'Yapılacaklar (To-Do)'}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {completedCount} / {items.length} tamamlandı
              </span>
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {list.title}
            </h1>
          </div>

          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: list.type === 'shopping' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(16, 185, 129, 0.12)',
            color: list.type === 'shopping' ? '#6366f1' : '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {list.type === 'shopping' ? <ShoppingCart size={20} /> : <CheckSquare size={20} />}
          </div>
        </div>

        {/* İlerleme Çubuğu */}
        {items.length > 0 && (
          <div style={{ marginTop: '1.25rem', height: '6px', background: 'var(--bg-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${(completedCount / items.length) * 100}%`,
              background: 'var(--accent-gradient)',
              transition: 'width 0.3s ease'
            }} />
          </div>
        )}
      </div>

      {/* Madde Ekleme Girdisi */}
      <ItemInput listType={list.type} onAddItem={handleAddItem} />

      {/* Maddeler Listesi */}
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Bu listede henüz hiçbir madde bulunmuyor.</p>
          <p style={{ fontSize: '0.85rem' }}>Yukarıdaki alana ürün veya görev yazarak başlayabilirsiniz.</p>
        </div>
      ) : list.type === 'shopping' && groupedItems ? (
        // Alışveriş Listesi - Kategori Gruplu Görünüm
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {Object.entries(groupedItems).map(([category, catItems]) => (
            <div key={category}>
              <h3 style={{
                fontSize: '0.82rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--accent-primary)',
                marginBottom: '0.5rem',
                paddingLeft: '4px'
              }}>
                {category} ({catItems.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {catItems.map(item => (
                  <div key={item.id} className={`item-row ${item.is_completed ? 'completed' : ''}`}>
                    <div
                      onClick={() => handleToggleComplete(item)}
                      className={`custom-checkbox ${item.is_completed ? 'checked' : ''}`}
                    >
                      {item.is_completed && <Check size={14} />}
                    </div>

                    <span
                      onClick={() => handleToggleComplete(item)}
                      className="item-text"
                      style={{ flex: 1, fontSize: '0.92rem', cursor: 'pointer' }}
                    >
                      {item.name}
                    </span>

                    <button
                      onClick={() => handleDeleteItem(item)}
                      className="btn btn-ghost btn-icon"
                      style={{ padding: '0.35rem', color: 'var(--text-muted)' }}
                      title="Maddeyi Sil"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // To-Do Listesi - Düz Liste Görünümü
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {items.map(item => (
            <div key={item.id} className={`item-row ${item.is_completed ? 'completed' : ''}`}>
              <div
                onClick={() => handleToggleComplete(item)}
                className={`custom-checkbox ${item.is_completed ? 'checked' : ''}`}
              >
                {item.is_completed && <Check size={14} />}
              </div>

              <span
                onClick={() => handleToggleComplete(item)}
                className="item-text"
                style={{ flex: 1, fontSize: '0.92rem', cursor: 'pointer' }}
              >
                {item.name}
              </span>

              <button
                onClick={() => handleDeleteItem(item)}
                className="btn btn-ghost btn-icon"
                style={{ padding: '0.35rem', color: 'var(--text-muted)' }}
                title="Görevi Sil"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* İkili Paylaşım Modalı */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareData={shareData}
        listTitle={list.title}
      />
    </div>
  );
}
