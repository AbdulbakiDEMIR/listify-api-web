import { List, ListItem, ShareResponse } from '@/types';
import { getClientId } from './indexedDB';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export async function createShareSession(list: List, items: ListItem[]): Promise<ShareResponse> {
  const clientId = getClientId();

  const response = await fetch(`${API_BASE}/shares`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      local_list_id: list.id,
      owner_client_id: clientId,
      title: list.title,
      title_updated_at: list.title_updated_at || list.updated_at || Date.now(),
      type: list.type,
      items
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Paylaşım bağlantısı oluşturulamadı.');
  }

  return response.json();
}

export async function fetchClonedList(cloneToken: string): Promise<{ title: string; type: 'shopping' | 'todo'; items: ListItem[]; expires_at?: string }> {
  const response = await fetch(`${API_BASE}/shares/clone/${cloneToken}`);

  if (!response.ok) {
    if (response.status === 404 || response.status === 410) {
      throw new Error('Paylaşım bağlantısının süresi dolmuş veya liste bulunamadı.');
    }
    throw new Error('Liste kopyalanamadı.');
  }

  return response.json();
}

export async function fetchSyncState(syncToken: string, currentVersion = 0): Promise<{
  notModified?: boolean;
  id?: string;
  title?: string;
  title_updated_at?: number;
  type?: 'shopping' | 'todo';
  version?: number;
  clone_token?: string;
  items?: ListItem[];
  expires_at?: string;
}> {
  const response = await fetch(`${API_BASE}/shares/sync/${syncToken}`, {
    headers: {
      'If-None-Match': currentVersion.toString()
    }
  });

  if (response.status === 304) {
    return { notModified: true };
  }

  if (!response.ok) {
    if (response.status === 404 || response.status === 410) {
      throw new Error('EXPIRED');
    }
    throw new Error('Senkronizasyon verisi alınamadı.');
  }

  return response.json();
}

export async function pushMutations(
  syncToken: string, 
  items: ListItem[], 
  title?: string, 
  title_updated_at?: number
): Promise<{ version: number; title?: string; title_updated_at?: number; expires_at?: string; items: ListItem[] }> {
  const clientId = getClientId();

  const payload: Record<string, any> = {
    client_id: clientId,
    items
  };

  if (title !== undefined) {
    payload.title = title;
    payload.title_updated_at = title_updated_at || Date.now();
  }

  const response = await fetch(`${API_BASE}/shares/sync/${syncToken}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    if (response.status === 404 || response.status === 410) {
      throw new Error('EXPIRED');
    }
    throw new Error('Değişiklikler sunucuya iletilemedi.');
  }

  return response.json();
}
