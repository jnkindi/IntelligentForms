/**
 * Hook for managing offline functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { offlineQueue, QueueStats } from '@/lib/offline/queue';
import { offlineDB } from '@/lib/offline/db';

export function useOffline() {
  const [isOnline, setIsOnline] = useState(true);
  const [queueStats, setQueueStats] = useState<QueueStats>({
    pending: 0,
    failed: 0,
    synced: 0,
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // Update online status
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    updateOnlineStatus();

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Listen to queue changes
  useEffect(() => {
    const updateStats = (stats: QueueStats) => {
      setQueueStats(stats);
    };

    offlineQueue.addListener(updateStats);

    // Load initial stats
    offlineQueue.getStats().then(updateStats);

    return () => {
      offlineQueue.removeListener(updateStats);
    };
  }, []);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && queueStats.pending > 0) {
      syncNow();
    }
  }, [isOnline]);

  // Listen for service worker messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SYNC_RESPONSES') {
        syncNow();
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, []);

  const syncNow = useCallback(async () => {
    if (isSyncing || !isOnline) return;

    setIsSyncing(true);
    try {
      const result = await offlineQueue.syncAll();
      console.log('Sync complete:', result);
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, isOnline]);

  const retryFailed = useCallback(async () => {
    setIsSyncing(true);
    try {
      await offlineQueue.retryFailed();
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const clearAll = useCallback(async () => {
    await offlineQueue.clearAll();
  }, []);

  return {
    isOnline,
    queueStats,
    isSyncing,
    syncNow,
    retryFailed,
    clearAll,
  };
}

/**
 * Hook for caching forms
 */
export function useFormCache(formHash: string) {
  const [isCached, setIsCached] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkCache();
  }, [formHash]);

  const checkCache = async () => {
    try {
      const cached = await offlineDB.getCachedForm(formHash);
      setIsCached(!!cached);
    } catch (error) {
      console.error('Error checking cache:', error);
    }
  };

  const cacheForm = async (formData: any) => {
    setIsLoading(true);
    try {
      await offlineDB.cacheForm({
        hash: formHash,
        title: formData.title,
        description: formData.description,
        fields: formData.fields,
      });

      // Also cache via service worker
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CACHE_FORM',
          url: `/api/public/forms/${formHash}`,
        });
      }

      setIsCached(true);
    } catch (error) {
      console.error('Error caching form:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromCache = async () => {
    try {
      return await offlineDB.getCachedForm(formHash);
    } catch (error) {
      console.error('Error loading from cache:', error);
      return null;
    }
  };

  return {
    isCached,
    isLoading,
    cacheForm,
    loadFromCache,
  };
}
