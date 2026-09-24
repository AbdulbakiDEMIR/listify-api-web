import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { List, ListItem, ListTemplate } from '@/types';
import { generateUUID } from './uuid';

interface ListifyDBSchema extends DBSchema {
  lists: {
    key: string;
    value: List;
    indexes: { 'by-updated': number };
  };
  items: {
    key: string;
    value: ListItem;
    indexes: { 'by-list': string; 'by-updated': number };
  };
  templates: {
    key: string;
    value: ListTemplate;
  };
}

const DB_NAME = 'listify_local_vault';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<ListifyDBSchema>> | null = null;

export function getDB(): Promise<IDBPDatabase<ListifyDBSchema>> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB yalnızca tarayıcı ortamında çalışır.'));
  }

  if (!dbPromise) {
    dbPromise = openDB<ListifyDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // 1. Lists Store
        if (!db.objectStoreNames.contains('lists')) {
          const listStore = db.createObjectStore('lists', { keyPath: 'id' });
          listStore.createIndex('by-updated', 'updated_at');
        }

        // 2. Items Store
        if (!db.objectStoreNames.contains('items')) {
          const itemStore = db.createObjectStore('items', { keyPath: 'id' });
          itemStore.createIndex('by-list', 'list_id');
          itemStore.createIndex('by-updated', 'updated_at');
        }

        // 3. Templates Store
        if (!db.objectStoreNames.contains('templates')) {
          db.createObjectStore('templates', { keyPath: 'id' });
        }
      }
    });
  }

  return dbPromise;
}

// ==================== LIST OPERATIONS ====================

export async function getAllLists(): Promise<List[]> {
  const db = await getDB();
  const lists = await db.getAllFromIndex('lists', 'by-updated');
  return lists.reverse(); // En son güncellenen en başta
}

export async function getListById(id: string): Promise<List | undefined> {
  const db = await getDB();
  return db.get('lists', id);
}

export async function saveList(list: List): Promise<void> {
  const db = await getDB();
  await db.put('lists', list);
}

export async function deleteList(id: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['lists', 'items'], 'readwrite');
  await tx.objectStore('lists').delete(id);

  // Bu listeye ait tüm maddeleri de sil
  const itemIndex = tx.objectStore('items').index('by-list');
  let cursor = await itemIndex.openCursor(IDBKeyRange.only(id));
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}

// ==================== ITEM OPERATIONS ====================

export async function getItemsByListId(listId: string): Promise<ListItem[]> {
  const db = await getDB();
  const allItems = await db.getAllFromIndex('items', 'by-list', listId);
  // Soft-deleted olanları liste görünümünde hariç tut
  return allItems.filter(item => !item.is_deleted);
}

export async function getAllRawItemsByListId(listId: string): Promise<ListItem[]> {
  const db = await getDB();
  return db.getAllFromIndex('items', 'by-list', listId);
}

export async function saveItem(item: ListItem): Promise<void> {
  const db = await getDB();
  await db.put('items', item);
  
  // Listenin güncellenme zamanını da güncelle
  const list = await db.get('lists', item.list_id);
  if (list) {
    list.updated_at = Date.now();
    await db.put('lists', list);
  }
}

export async function softDeleteItem(id: string): Promise<void> {
  const db = await getDB();
  const item = await db.get('items', id);
  if (item) {
    item.is_deleted = true;
    item.updated_at = Date.now();
    await db.put('items', item);

    const list = await db.get('lists', item.list_id);
    if (list) {
      list.updated_at = Date.now();
      await db.put('lists', list);
    }
  }
}

// ==================== TEMPLATES ====================

export const DEFAULT_TEMPLATES: ListTemplate[] = [
  {
    id: 'template-market',
    title: 'Haftalık Market Alışverişi',
    type: 'shopping',
    description: 'Süt, ekmek, sebze ve temel gıdalar içeren standart haftalık sepet.',
    items: [
      { name: 'Süt', category: 'Süt & Kahvaltılık' },
      { name: 'Yumurta (15li)', category: 'Süt & Kahvaltılık' },
      { name: 'Ekmek', category: 'Fırın & Unlu Mamüller' },
      { name: 'Peynir', category: 'Süt & Kahvaltılık' },
      { name: 'Domates', category: 'Meyve & Sebze' },
      { name: 'Salatalık', category: 'Meyve & Sebze' },
      { name: 'Zeytinyağı', category: 'Kuru Gıda & Bakliyat' }
    ]
  },
  {
    id: 'template-tatil',
    title: 'Tatil / Seyahat Hazırlığı',
    type: 'todo',
    description: 'Bavul hazırlığı, belgeler ve yola çıkmadan önceki son kontroller.',
    items: [
      { name: 'Kimlik ve Pasaport kontrolü' },
      { name: 'Şarj aletleri ve powerbank' },
      { name: 'Güneş kremi ve gözlük' },
      { name: 'Temel ilaçlar ve ilk yardım' },
      { name: 'Evdeki vanaları ve prizleri kapat' }
    ]
  },
  {
    id: 'template-ev-temizlik',
    title: 'Kapsamlı Ev Temizliği',
    type: 'todo',
    description: 'Oda oda detaylı temizlik ve toparlama kontrol listesi.',
    items: [
      { name: 'Çarşafları ve havluları yıka' },
      { name: 'Mutfak tezgahı ve fırını temizle' },
      { name: 'Banyo ve lavaboları dezenfekte et' },
      { name: 'Tüm odaları süpür ve sil' },
      { name: 'Çöpleri dışarı çıkar' }
    ]
  }
];

// ==================== NO-AUTH CLIENT IDENTIFIER ====================

export function getClientId(): string {
  if (typeof window === 'undefined') return '';
  const KEY = 'listify_client_id';
  let clientId = localStorage.getItem(KEY);
  if (!clientId) {
    clientId = generateUUID();
    localStorage.setItem(KEY, clientId);
  }
  return clientId;
}
