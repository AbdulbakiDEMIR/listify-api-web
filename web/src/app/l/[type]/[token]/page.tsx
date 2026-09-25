'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  RefreshCw, 
  AlertCircle, 
  ArrowLeft, 
  ExternalLink, 
  Download, 
  Smartphone, 
  Globe, 
  CheckCircle2, 
  ShoppingCart, 
  CheckSquare 
} from 'lucide-react';
import { fetchClonedList, fetchSyncState } from '@/lib/apiClient';
import { saveList, saveItem } from '@/lib/indexedDB';
import { List, ListItem } from '@/types';
import { generateUUID } from '@/lib/uuid';

export default function ShareRouteHandler() {
  const params = useParams();
  const router = useRouter();

  const type = params.type as string; // 'clone' | 'sync'
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [listData, setListData] = useState<{
    title: string;
    type: 'shopping' | 'todo';
    itemsCount: number;
    rawItems: ListItem[];
    version?: number;
    expires_at?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Paylaşım verilerini önceden çek
  useEffect(() => {
    async function loadShareDetails() {
      if (!token || !type) return;

      try {
        if (type === 'clone') {
          const data = await fetchClonedList(token);
          setListData({
            title: data.title,
            type: data.type,
            itemsCount: (data.items || []).length,
            rawItems: data.items || [],
            expires_at: data.expires_at
          });
        } else if (type === 'sync') {
          const data = await fetchSyncState(token);
          if (!data.items) {
            throw new Error('Liste verisi alınamadı.');
          }
          setListData({
            title: data.title || 'Paylaşılan Liste',
            type: data.type || 'shopping',
            itemsCount: (data.items || []).length,
            rawItems: data.items || [],
            version: data.version || 1,
            expires_at: data.expires_at
          });
        } else {
          throw new Error('Geçersiz paylaşım bağlantısı türü.');
        }
      } catch (err: any) {
        setErrorMessage(
          err.message === 'EXPIRED'
            ? 'Bu paylaşım bağlantısının 48 saatlik süresi dolmuş veya liste kaldırılmış.'
            : err.message || 'Bağlantı açılırken beklenmeyen bir sorun oluştu.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadShareDetails();
  }, [type, token]);

  // 2. Web'de Aç (Yerel IndexedDB'ye aktararak tarayıcıda devam et)
  const handleOpenInWeb = async () => {
    if (!listData || importing) return;
    setImporting(true);

    try {
      const newListId = generateUUID();

      if (type === 'clone') {
        const newList: List = {
          id: newListId,
          title: `${listData.title} (Kopya)`,
          type: listData.type,
          created_at: Date.now(),
          updated_at: Date.now()
        };

        await saveList(newList);

        for (const item of listData.rawItems) {
          await saveItem({
            ...item,
            id: generateUUID(),
            list_id: newListId,
            is_completed: false,
            updated_at: Date.now(),
            is_deleted: false,
            order: item.order !== undefined ? item.order : 0
          });
        }

        router.replace(`/lists/${newListId}`);
      } else {
        const newList: List = {
          id: newListId,
          title: listData.title,
          type: listData.type,
          is_synced: true,
          sync_token: token,
          version: listData.version || 1,
          expires_at: listData.expires_at,
          created_at: Date.now(),
          updated_at: Date.now()
        };

        await saveList(newList);

        for (const item of listData.rawItems) {
          await saveItem({
            ...item,
            list_id: newListId
          });
        }

        router.replace(`/lists/${newListId}`);
      }
    } catch (err: any) {
      alert('Liste içe aktarılırken bir hata oluştu: ' + err.message);
      setImporting(false);
    }
  };

  const deepLinkUrl = `listify://${type}/${token}`;
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.moonksoftware.shoppinglist';
  const appStoreUrl = 'https://apps.apple.com/app/id'; // App Store link

  return (
    <div style={{ maxWidth: '480px', margin: '4rem auto 2rem auto', padding: '0 1rem' }}>
      <div className="card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
        {loading && (
          <div>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.1)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}>
              <RefreshCw size={26} className="animate-spin" />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Bağlantı Kontrol Ediliyor...
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Paylaşılan liste bilgileri doğrulanıyor.
            </p>
          </div>
        )}

        {!loading && errorMessage && (
          <div>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'var(--danger-bg)',
              color: 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}>
              <AlertCircle size={28} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Bağlantı Açılamadı
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              {errorMessage}
            </p>
            <Link href="/lists" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              <ArrowLeft size={16} />
              <span>Listelerime Dön</span>
            </Link>
          </div>
        )}

        {!loading && !errorMessage && listData && (
          <div>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              {listData.type === 'shopping' ? <ShoppingCart size={28} /> : <CheckSquare size={28} />}
            </div>

            <div style={{
              display: 'inline-block',
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              background: type === 'sync' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(16, 185, 129, 0.1)',
              color: type === 'sync' ? 'var(--accent-primary)' : 'var(--success)',
              fontSize: '0.75rem',
              fontWeight: 600,
              marginBottom: '0.75rem'
            }}>
              {type === 'sync' ? '⚡ Canlı Ortak Liste' : '📋 Liste Kopyası'}
            </div>

            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              {listData.title}
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>
              {listData.itemsCount} adet madde içeriyor.
            </p>

            {/* Eylemler */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Listify Mobil Uygulamasında Aç */}
              <a 
                href={deepLinkUrl}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.85rem 1rem' }}
              >
                <Smartphone size={18} />
                <span>Listify Uygulamasında Aç</span>
              </a>

              {/* Web Tarayıcısında Aç */}
              <button 
                onClick={handleOpenInWeb}
                disabled={importing}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.85rem 1rem' }}
              >
                {importing ? <RefreshCw size={18} className="animate-spin" /> : <Globe size={18} />}
                <span>{importing ? 'Hazırlanıyor...' : 'Web Tarayıcısında Devam Et'}</span>
              </button>
            </div>

            {/* Uygulama Yüklü Değilse İndirme Linkleri */}
            <div style={{ 
              marginTop: '2rem', 
              paddingTop: '1.5rem', 
              borderTop: '1px solid var(--border-color)',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.875rem' }}>
                Uygulama henüz yüklü değil mi? Ücretsiz indirin:
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <a 
                  href={playStoreUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-secondary" 
                  style={{ fontSize: '0.8rem', padding: '0.5rem 0.85rem', flex: 1, justifyContent: 'center' }}
                >
                  <Download size={14} />
                  <span>Google Play</span>
                </a>
                <a 
                  href={appStoreUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-secondary" 
                  style={{ fontSize: '0.8rem', padding: '0.5rem 0.85rem', flex: 1, justifyContent: 'center' }}
                >
                  <Download size={14} />
                  <span>App Store</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
