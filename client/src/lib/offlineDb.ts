/**
 * Zero-dependency native IndexedDB offline storage engine for AYUSH-Care Kiosk.
 * Guarantees 100% offline data retention during hospital network drops.
 */

export interface OfflineSessionRecord {
  sessionId: string;
  patientName: string;
  age: number | string;
  gender: string;
  phone?: string;
  abhaId?: string;
  abhaAddress?: string;
  chiefComplaint: string;
  complaintCategory: string;
  socrates: Record<string, any>;
  prakritiResult: {
    vataScore: number;
    pittaScore: number;
    kaphaScore: number;
    dominantPrakriti: string;
    secondaryPrakriti: string | null;
    confidence: string;
  } | null;
  consentGranted: boolean;
  consentTimestamp: string | null;
  createdAt: string;
  syncStatus: 'pending' | 'synced' | 'failed';
}

const DB_NAME = 'AyushCareKioskDB';
const DB_VERSION = 1;
const STORE_NAME = 'offline_sessions';

class OfflineDatabase {
  private db: IDBDatabase | null = null;

  private async openDb(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not supported on this platform.'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'sessionId' });
          store.createIndex('syncStatus', 'syncStatus', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Save an intake session to local IndexedDB.
   */
  public async saveSession(session: OfflineSessionRecord): Promise<void> {
    const db = await this.openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(session);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Retrieve all pending offline sessions awaiting sync.
   */
  public async getPendingSessions(): Promise<OfflineSessionRecord[]> {
    const db = await this.openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('syncStatus');
      const request = index.getAll('pending');

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Mark a batch of sessions as synced or delete them for DPDP Act 2023 compliance.
   */
  public async purgeSyncedSessions(sessionIds: string[]): Promise<void> {
    const db = await this.openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      sessionIds.forEach((id) => store.delete(id));

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Count total pending offline records.
   */
  public async countPending(): Promise<number> {
    const db = await this.openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('syncStatus');
      const request = index.count('pending');

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export const offlineDb = new OfflineDatabase();
