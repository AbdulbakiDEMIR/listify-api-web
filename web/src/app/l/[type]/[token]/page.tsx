'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { RefreshCw, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { fetchClonedList, fetchSyncState } from '@/lib/apiClient';
import { saveList, saveItem } from '@/lib/indexedDB';
import { List, ListItem } from '@/types';

export default function ShareRouteHandler() {
  const params = useParams();
  const router = useRouter();

  const type = params.type as string; // 'clone' | 'sync'
  const token = params.token as string;

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function processShareLink() {
      if (!token || !type) return;

      try {
        if (type === 'clone') {
          // Klonlama: Listeyi çek, yeni yerel liste oluştur
          const data = await fetchClonedList(token);
          const newListId = crypto.randomUUID();

          const newList: List = {
            id: newListId,
            title: `${data.title} (Kopya)`,
            type: data.type,
            created_at: Date.now(),
            updated_at: Date.now()
          };

          await saveList(newList);

          for (const item of data.items) {
            await saveItem({
              ...item,
              id: crypto.randomUUID(),
              list_id: newListId,
              is_completed: false,
              updated_at: Date.now(),
              is_deleted: false
            });
          }

          setStatus('success');
          router.replace(`/lists/${newListId}`);
        } else if (type === 'sync') {
          // Canlı Eşitleme: Listeyi çek, canlı olarak IndexedDB'ye ekle
          const data = await fetchSyncState(token);

          if (!data.items) {
            throw new Error('Liste verisi alınamadı.');
          }

          const newListId = crypto.randomUUID();
          const newList: List = {
            id: newListId,
            title: data.title || 'Paylaşılan Liste',
            type: data.type || 'shopping',
            is_synced: true,
            sync_token: token,
            version: data.version || 1,
            expires_at: data.expires_at,
            created_at: Date.now(),
            updated_at: Date.now()
          };

          await saveList(newList);

          for (const item of data.items) {
            await saveItem({
              ...item,
              list_id: newListId
            });
          }

          setStatus('success');
          router.replace(`/lists/${newListId}`);
        } else {
          throw new Error('Geçersiz paylaşım türü.');
        }
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(
          err.message === 'EXPIRED'
            ? 'Bu paylaşım bağlantısının süresi dolmuş veya liste bulunamadı.'
            : err.message || 'Liste içe aktarılırken bir sorun oluştu.'
        );
      }
    }

    processShareLink();
  }, [type, token, router]);

  return (
    <div style={{ maxWidth: '480px', margin: '6rem auto 0 auto', textAlign: 'center' }}>
      <div className="card" style={{ padding: '2.5rem 1.5rem' }}>
        {status === 'loading' && (
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
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {type === 'clone' ? 'Liste Kopyalanıyor...' : 'Canlı Eşitlemeye Katılınıyor...'}
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Veriler sunucudan alınıyor ve cihazınıza kaydediliyor. Lütfen bekleyin.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'var(--success-bg)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}>
              <CheckCircle2 size={28} />
            </div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Hazır!
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Liste başarıyla açılıyor...
            </p>
          </div>
        )}

        {status === 'error' && (
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
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Bağlantı Açılamadı
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              {errorMessage}
            </p>
            <Link href="/lists" className="btn btn-primary" style={{ width: '100%' }}>
              <ArrowLeft size={16} />
              <span>Listelerime Dön</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
