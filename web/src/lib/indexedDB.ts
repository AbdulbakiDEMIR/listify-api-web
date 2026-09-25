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

// ==================== TEMPLATES (KULLANICI TASLAKLARI) ====================

export async function getAllTemplates(): Promise<ListTemplate[]> {
  const db = await getDB();
  const templates = await db.getAll('templates');
  
  // Eski hazır şablonları hariç tut, yalnızca kullanıcının oluşturduğu taslakları getir
  const userTemplates = templates.filter(t => !t.id.startsWith('template-'));
  return userTemplates.sort((a, b) => (b.updated_at || 0) - (a.updated_at || 0));
}


export async function getTemplateById(id: string): Promise<ListTemplate | undefined> {
  const db = await getDB();
  return db.get('templates', id);
}

export async function saveTemplate(template: ListTemplate): Promise<void> {
  const db = await getDB();
  const now = Date.now();
  const preparedTemplate: ListTemplate = {
    ...template,
    id: template.id || generateUUID(),
    created_at: template.created_at || now,
    updated_at: now,
    items: template.items.map(item => ({
      ...item,
      id: item.id || generateUUID()
    }))
  };
  await db.put('templates', preparedTemplate);
}

export async function deleteTemplate(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('templates', id);
}

export async function appendTemplateItemsToList(
  listId: string, 
  templateItems: Array<{ name: string; category?: string }>
): Promise<ListItem[]> {
  const db = await getDB();
  const now = Date.now();
  const newItems: ListItem[] = [];

  for (const item of templateItems) {
    const newItem: ListItem = {
      id: generateUUID(),
      list_id: listId,
      name: item.name,
      category: item.category || 'Genel',
      is_completed: false,
      updated_at: now,
      is_deleted: false
    };
    newItems.push(newItem);
    await saveItem(newItem);
  }

  return newItems;
}


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
