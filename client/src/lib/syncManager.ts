/**
 * Background Synchronization Manager for AYUSH-Care Kiosk.
 * Automatically flushes buffered intakes to the FastAPI server when connectivity is restored.
 */

import { offlineDb, OfflineSessionRecord } from './offlineDb';
import { API_BASE_URL } from './config';

class SyncManager {
  private isSyncing = false;
  private syncListeners: Array<(pendingCount: number) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('[SyncManager] Network online detected. Initiating background sync...');
        this.flushQueue();
      });
    }
  }

  /**
   * Subscribe to pending sync count updates (for kiosk header badge).
   */
  public onPendingCountChange(callback: (count: number) => void): () => void {
    this.syncListeners.push(callback);
    this.notifyCount();
    return () => {
      this.syncListeners = this.syncListeners.filter((cb) => cb !== callback);
    };
  }

  private async notifyCount() {
    try {
      const count = await offlineDb.countPending();
      this.syncListeners.forEach((cb) => cb(count));
    } catch {
      // Ignore in non-browser environments
    }
  }

  /**
   * Enqueue an active session to offline storage and attempt immediate sync if online.
   */
  public async enqueueSession(session: Omit<OfflineSessionRecord, 'syncStatus'>): Promise<void> {
    const record: OfflineSessionRecord = {
      ...session,
      syncStatus: 'pending',
    };

    await offlineDb.saveSession(record);
    await this.notifyCount();

    if (navigator.onLine) {
      this.flushQueue();
    }
  }

  /**
   * Flush all pending sessions to the backend API.
   */
  public async flushQueue(): Promise<{ syncedCount: number; errors: number }> {
    if (this.isSyncing) return { syncedCount: 0, errors: 0 };
    this.isSyncing = true;

    try {
      const pendingSessions = await offlineDb.getPendingSessions();
      if (pendingSessions.length === 0) {
        this.isSyncing = false;
        return { syncedCount: 0, errors: 0 };
      }

      // Send batch to backend
      const response = await fetch(`${API_BASE_URL}/api/sessions/sync-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessions: pendingSessions }),
      });

      if (response.ok) {
        const syncedIds = pendingSessions.map((s) => s.sessionId);
        await offlineDb.purgeSyncedSessions(syncedIds);
        await this.notifyCount();
        this.isSyncing = false;
        return { syncedCount: syncedIds.length, errors: 0 };
      } else {
        console.warn('[SyncManager] Backend sync returned non-200 status:', response.status);
        this.isSyncing = false;
        return { syncedCount: 0, errors: pendingSessions.length };
      }
    } catch (err) {
      console.warn('[SyncManager] Sync failed (likely still offline):', err);
      this.isSyncing = false;
      return { syncedCount: 0, errors: 1 };
    }
  }
}

export const syncManager = new SyncManager();
