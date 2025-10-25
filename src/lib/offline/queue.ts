/**
 * Offline queue manager
 * Handles storing responses offline and syncing when online
 */

import { offlineDB, OfflineResponse } from './db';
import { OfflineCrypto, keyManager } from './crypto';

export interface QueueStats {
  pending: number;
  failed: number;
  synced: number;
}

class OfflineQueue {
  private syncInProgress = false;
  private listeners: Array<(stats: QueueStats) => void> = [];
  private maxRetries = 5;

  /**
   * Add a response to the queue
   */
  async enqueue(formHash: string, formData: Record<string, any>): Promise<string> {
    try {
      // Get encryption key
      const key = await keyManager.getOrCreateKey();

      // Encrypt the form data
      const encrypted = await OfflineCrypto.encrypt(formData, key);

      // Save to IndexedDB
      const id = await offlineDB.saveResponse({
        formHash,
        formData,
        encrypted,
        synced: 0 as any, // IDB uses 0/1 instead of boolean
        retryCount: 0,
      });

      // Notify listeners
      this.notifyListeners();

      // Try to sync immediately if online
      if (navigator.onLine) {
        this.syncAll().catch(console.error);
      }

      return id;
    } catch (error) {
      console.error('Failed to enqueue response:', error);
      throw new Error('Failed to save response offline');
    }
  }

  /**
   * Sync all pending responses
   */
  async syncAll(): Promise<{ success: number; failed: number }> {
    if (this.syncInProgress) {
      console.log('Sync already in progress');
      return { success: 0, failed: 0 };
    }

    if (!navigator.onLine) {
      console.log('Device is offline, skipping sync');
      return { success: 0, failed: 0 };
    }

    this.syncInProgress = true;
    let successCount = 0;
    let failedCount = 0;

    try {
      const pending = await offlineDB.getPendingResponses();
      console.log(`Syncing ${pending.length} pending responses`);

      // Get decryption key
      const key = await keyManager.getOrCreateKey();

      for (const response of pending) {
        try {
          // Check retry limit
          if (response.retryCount >= this.maxRetries) {
            console.warn(`Response ${response.id} exceeded max retries, skipping`);
            failedCount++;
            continue;
          }

          // Decrypt the data
          const decrypted = await OfflineCrypto.decrypt(response.encrypted, key);

          // Submit to server
          const result = await this.submitToServer(response.formHash, decrypted);

          if (result.success) {
            // Mark as synced
            await offlineDB.markAsSynced(response.id);
            successCount++;
            console.log(`Successfully synced response ${response.id}`);
          } else {
            // Increment retry count
            await offlineDB.incrementRetryCount(response.id);
            failedCount++;
            console.warn(`Failed to sync response ${response.id}:`, result.error);
          }
        } catch (error) {
          // Increment retry count on error
          await offlineDB.incrementRetryCount(response.id);
          failedCount++;
          console.error(`Error syncing response ${response.id}:`, error);
        }

        // Add small delay between requests to avoid overwhelming server
        await this.delay(100);
      }

      // Clean up old synced responses (older than 30 days)
      await this.cleanupOldResponses(30 * 24 * 60 * 60 * 1000);
    } finally {
      this.syncInProgress = false;
      this.notifyListeners();
    }

    return { success: successCount, failed: failedCount };
  }

  /**
   * Submit a response to the server
   */
  private async submitToServer(
    formHash: string,
    formData: Record<string, any>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`/api/public/forms/${formHash}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Offline-Sync': 'true', // Mark as offline sync
        },
        body: JSON.stringify({ answers: formData }),
      });

      if (!response.ok) {
        const data = await response.json();
        return { success: false, error: data.message || 'Server error' };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Network error' };
    }
  }

  /**
   * Get queue statistics
   */
  async getStats(): Promise<QueueStats> {
    const dbStats = await offlineDB.getStats();
    const pending = await offlineDB.getPendingResponses();

    const failed = pending.filter((r) => r.retryCount >= this.maxRetries).length;

    return {
      pending: dbStats.pendingResponses - failed,
      failed,
      synced: dbStats.syncedResponses,
    };
  }

  /**
   * Listen to queue changes
   */
  addListener(listener: (stats: QueueStats) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove listener
   */
  removeListener(listener: (stats: QueueStats) => void): void {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  /**
   * Notify all listeners
   */
  private async notifyListeners(): Promise<void> {
    const stats = await this.getStats();
    this.listeners.forEach((listener) => {
      try {
        listener(stats);
      } catch (error) {
        console.error('Error in queue listener:', error);
      }
    });
  }

  /**
   * Clean up old synced responses
   */
  private async cleanupOldResponses(maxAge: number): Promise<void> {
    const allResponses = await offlineDB.getPendingResponses();
    const cutoff = Date.now() - maxAge;

    for (const response of allResponses) {
      if (response.synced && response.timestamp < cutoff) {
        await offlineDB.deleteResponse(response.id);
      }
    }
  }

  /**
   * Retry failed responses
   */
  async retryFailed(): Promise<void> {
    const pending = await offlineDB.getPendingResponses();
    const failed = pending.filter((r) => r.retryCount >= this.maxRetries);

    // Reset retry count for failed responses
    for (const response of failed) {
      const transaction = (await offlineDB['db'])!.transaction(['responses'], 'readwrite');
      const store = transaction.objectStore('responses');
      const request = store.get(response.id);

      request.onsuccess = () => {
        const resp = request.result as OfflineResponse;
        if (resp) {
          resp.retryCount = 0;
          store.put(resp);
        }
      };
    }

    // Try to sync again
    await this.syncAll();
  }

  /**
   * Clear all queued responses
   */
  async clearAll(): Promise<void> {
    const responses = await offlineDB.getPendingResponses();
    for (const response of responses) {
      await offlineDB.deleteResponse(response.id);
    }
    this.notifyListeners();
  }

  /**
   * Helper to add delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const offlineQueue = new OfflineQueue();
