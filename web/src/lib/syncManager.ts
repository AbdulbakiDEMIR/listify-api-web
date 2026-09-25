import { List, ListItem } from '@/types';
import { fetchSyncState, pushMutations } from './apiClient';
import { getListById, saveList, getAllRawItemsByListId, saveItem } from './indexedDB';

type SyncCallback = (updatedList: List, updatedItems: ListItem[]) => void;

class SyncManager {
  private activeInterval: any = null;
  private currentSyncToken: string | null = null;
  private currentListId: string | null = null;
  private listeners: Set<SyncCallback> = new Set();
  private isSyncing = false;

  public start(listId: string, syncToken: string, callback?: SyncCallback) {
    if (callback) {
      this.listeners.add(callback);
    }

    if (this.currentSyncToken === syncToken && this.activeInterval) {
      return;
    }

    this.stop();
    this.currentListId = listId;
    this.currentSyncToken = syncToken;

    // İlk senkronizasyonu hemen yap
    this.triggerSync();

    // 60 saniyelik yoklama döngüsünü başlat
    this.schedulePolling();

    // Tarayıcı Olay Dinleyicileri (Page Visibility API, Focus, Online)
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
      window.addEventListener('focus', this.handleFocus);
      window.addEventListener('online', this.handleOnline);
    }
  }

  public stop() {
    if (this.activeInterval) {
      clearInterval(this.activeInterval);
      this.activeInterval = null;
    }
    this.currentSyncToken = null;
    this.currentListId = null;

    if (typeof window !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
      window.removeEventListener('focus', this.handleFocus);
      window.removeEventListener('online', this.handleOnline);
    }
  }

  public subscribe(callback: SyncCallback) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private schedulePolling() {
    if (this.activeInterval) clearInterval(this.activeInterval);
    this.activeInterval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        this.triggerSync();
      }
    }, 60000); // 60 saniye
  }

  private handleVisibilityChange = () => {
    if (typeof document === 'undefined') return;

    if (document.visibilityState === 'hidden') {
      // Sekme arka planda: Polling durdurulur (Tasarruf)
      if (this.activeInterval) {
        clearInterval(this.activeInterval);
        this.activeInterval = null;
      }
    } else if (document.visibilityState === 'visible') {
      // Sekmeye geri dönüldü: Anında tıkla ve döngüyü yeniden kur
      this.triggerSync();
      this.schedulePolling();
    }
  };

  private handleFocus = () => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      this.triggerSync();
    }
  };

  private handleOnline = () => {
    this.triggerSync();
  };

  public async triggerSync() {
    if (this.isSyncing || !this.currentSyncToken || !this.currentListId) return;
    this.isSyncing = true;

    try {
      const list = await getListById(this.currentListId);
      if (!list) return;

      const syncResult = await fetchSyncState(this.currentSyncToken, list.version || 0);

      // 304 Değişiklik Yok
      if (syncResult.notModified) {
        return;
      }

      if (syncResult.items) {
        const rawLocalItems = await getAllRawItemsByListId(this.currentListId);
        const localMap = new Map(rawLocalItems.map(i => [i.id, i]));
        const pendingMutations: ListItem[] = [];

        // Sunucudan gelen maddeleri Item-Level LWW ile birleştir
        for (const serverItem of syncResult.items) {
          const local = localMap.get(serverItem.id);
          if (!local) {
            // Yerelde yoksa sunucudakini kaydet
            await saveItem({ ...serverItem, list_id: this.currentListId });
          } else {
            if (serverItem.updated_at >= local.updated_at) {
              // Sunucu daha yeni: Yereli güncelle
              await saveItem({ ...serverItem, list_id: this.currentListId });
            } else {
              // Yerel daha yeni (bekleyen mutasyon): Sunucuya iletilmeli
              pendingMutations.push(local);
            }
          }
        }

        // Yerelde olup sunucuda hiç olmayan yeni maddeler varsa onları da sunucuya ilet
        const serverIds = new Set(syncResult.items.map(i => i.id));
        for (const local of rawLocalItems) {
          if (!serverIds.has(local.id)) {
            pendingMutations.push(local);
          }
        }

        // Bekleyen mutasyonlar varsa sunucuya gönder
        if (pendingMutations.length > 0) {
          const pushRes = await pushMutations(this.currentSyncToken, pendingMutations);
          list.version = pushRes.version;
        } else {
          list.version = syncResult.version;
        }

        // Başlık (Title) LWW Senkronizasyonu
        if (syncResult.title) {
          const serverTitleTime = syncResult.title_updated_at || 0;
          const localTitleTime = list.title_updated_at || 0;
          if (serverTitleTime >= localTitleTime) {
            list.title = syncResult.title;
            list.title_updated_at = serverTitleTime;
          }
        }

        if (syncResult.clone_token && !list.clone_token) {
          list.clone_token = syncResult.clone_token;
        }

        if (syncResult.expires_at) {
          list.expires_at = syncResult.expires_at;
        }

        list.updated_at = Date.now();
        await saveList(list);

        // Dinleyicilere güncel veriyi ilet
        const updatedRaw = await getAllRawItemsByListId(this.currentListId);
        const activeItems = updatedRaw.filter(i => !i.is_deleted);
        this.listeners.forEach(cb => cb(list, activeItems));
      }
    } catch (err: any) {
      if (err.message === 'EXPIRED') {
        // TTL doldu: Canlı senkronizasyonu durdur, yerel listeye dönüştür
        if (this.currentListId) {
          const list = await getListById(this.currentListId);
          if (list) {
            list.is_synced = false;
            list.sync_token = undefined;
            await saveList(list);
          }
        }
        this.stop();
      } else {
        console.warn('[SyncManager] Geçici senkronizasyon uyarısı:', err.message);
      }
    } finally {
      this.isSyncing = false;
    }
  }
}

export const syncManager = new SyncManager();
