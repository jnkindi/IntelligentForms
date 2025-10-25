/**
 * IndexedDB wrapper for offline form storage
 * Provides encrypted storage for form data and responses
 */

const DB_NAME = 'IntelligentFormsOffline';
const DB_VERSION = 1;

export interface OfflineResponse {
  id: string;
  formHash: string;
  formData: Record<string, any>;
  timestamp: number;
  synced: boolean;
  retryCount: number;
  encrypted: string; // Encrypted payload
}

export interface CachedForm {
  hash: string;
  title: string;
  description: string | null;
  fields: any[];
  cachedAt: number;
  lastAccessed: number;
}

class OfflineDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store for offline responses
        if (!db.objectStoreNames.contains('responses')) {
          const responseStore = db.createObjectStore('responses', { keyPath: 'id' });
          responseStore.createIndex('formHash', 'formHash', { unique: false });
          responseStore.createIndex('synced', 'synced', { unique: false });
          responseStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Store for cached forms
        if (!db.objectStoreNames.contains('forms')) {
          const formStore = db.createObjectStore('forms', { keyPath: 'hash' });
          formStore.createIndex('lastAccessed', 'lastAccessed', { unique: false });
        }

        // Store for encryption keys
        if (!db.objectStoreNames.contains('keys')) {
          db.createObjectStore('keys', { keyPath: 'id' });
        }
      };
    });
  }

  async cacheForm(form: Omit<CachedForm, 'cachedAt' | 'lastAccessed'>): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['forms'], 'readwrite');
      const store = transaction.objectStore('forms');

      const cachedForm: CachedForm = {
        ...form,
        cachedAt: Date.now(),
        lastAccessed: Date.now(),
      };

      const request = store.put(cachedForm);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCachedForm(hash: string): Promise<CachedForm | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['forms'], 'readwrite');
      const store = transaction.objectStore('forms');

      const request = store.get(hash);
      request.onsuccess = () => {
        const form = request.result as CachedForm | undefined;

        // Update last accessed time
        if (form) {
          form.lastAccessed = Date.now();
          store.put(form);
        }

        resolve(form || null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveResponse(response: Omit<OfflineResponse, 'id' | 'timestamp'>): Promise<string> {
    if (!this.db) await this.init();

    const id = `response_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['responses'], 'readwrite');
      const store = transaction.objectStore('responses');

      const fullResponse: OfflineResponse = {
        ...response,
        id,
        timestamp: Date.now(),
      };

      const request = store.add(fullResponse);
      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingResponses(): Promise<OfflineResponse[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['responses'], 'readonly');
      const store = transaction.objectStore('responses');
      const index = store.index('synced');

      const request = index.getAll(IDBKeyRange.only(0));
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async markAsSynced(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['responses'], 'readwrite');
      const store = transaction.objectStore('responses');

      const request = store.get(id);
      request.onsuccess = () => {
        const response = request.result as any;
        if (response) {
          response.synced = 1;
          const updateRequest = store.put(response);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteResponse(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['responses'], 'readwrite');
      const store = transaction.objectStore('responses');

      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async incrementRetryCount(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['responses'], 'readwrite');
      const store = transaction.objectStore('responses');

      const request = store.get(id);
      request.onsuccess = () => {
        const response = request.result as OfflineResponse;
        if (response) {
          response.retryCount++;
          const updateRequest = store.put(response);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async cleanOldForms(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['forms'], 'readwrite');
      const store = transaction.objectStore('forms');
      const index = store.index('lastAccessed');

      const cutoffTime = Date.now() - maxAge;
      const request = index.openCursor();

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          const form = cursor.value as CachedForm;
          if (form.lastAccessed < cutoffTime) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getStats(): Promise<{ cachedForms: number; pendingResponses: number; syncedResponses: number }> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction(['forms', 'responses'], 'readonly');

    const formsStore = transaction.objectStore('forms');
    const responsesStore = transaction.objectStore('responses');
    const syncedIndex = responsesStore.index('synced');

    const [cachedForms, allResponses, syncedResponses] = await Promise.all([
      new Promise<number>((resolve) => {
        const request = formsStore.count();
        request.onsuccess = () => resolve(request.result);
      }),
      new Promise<number>((resolve) => {
        const request = responsesStore.count();
        request.onsuccess = () => resolve(request.result);
      }),
      new Promise<number>((resolve) => {
        const request = syncedIndex.count(IDBKeyRange.only(1));
        request.onsuccess = () => resolve(request.result);
      }),
    ]);

    return {
      cachedForms,
      pendingResponses: allResponses - syncedResponses,
      syncedResponses,
    };
  }
}

export const offlineDB = new OfflineDB();
