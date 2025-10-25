/**
 * Service Worker for Intelligent Forms
 * Handles offline caching of forms and assets
 */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `intelligentforms-${CACHE_VERSION}`;
const FORM_CACHE = `intelligentforms-forms-${CACHE_VERSION}`;
const RUNTIME_CACHE = `intelligentforms-runtime-${CACHE_VERSION}`;

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
];

// Form API pattern
const FORM_API_PATTERN = /\/api\/public\/forms\/[a-f0-9]+$/;

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name.startsWith('intelligentforms-') &&
                   name !== CACHE_NAME &&
                   name !== FORM_CACHE &&
                   name !== RUNTIME_CACHE;
          })
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle form API requests
  if (FORM_API_PATTERN.test(url.pathname)) {
    event.respondWith(handleFormRequest(request));
    return;
  }

  // Handle other requests with network-first strategy
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone the response before caching
        const responseToCache = response.clone();

        // Cache successful responses
        if (response.status === 200) {
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
        }

        return response;
      })
      .catch(() => {
        // If fetch fails, try cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // Return offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/offline');
          }

          // Return a basic response for other requests
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain',
            }),
          });
        });
      })
  );
});

/**
 * Handle form API requests with cache-first strategy
 */
async function handleFormRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      console.log('[SW] Serving form from cache:', request.url);

      // Try to fetch and update cache in background
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            caches.open(FORM_CACHE).then((cache) => {
              cache.put(request, response.clone());
            });
          }
        })
        .catch(() => {
          // Ignore errors in background fetch
        });

      return cachedResponse;
    }

    // If not in cache, fetch from network
    const response = await fetch(request);

    // Cache successful responses
    if (response.status === 200) {
      const cache = await caches.open(FORM_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[SW] Error handling form request:', error);

    // Try cache as fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return error response
    return new Response(
      JSON.stringify({ error: 'Form not available offline' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_FORM') {
    const { url } = event.data;
    caches.open(FORM_CACHE).then((cache) => {
      return fetch(url).then((response) => {
        if (response.status === 200) {
          return cache.put(url, response);
        }
      });
    });
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => caches.delete(name))
        );
      })
    );
  }
});

// Background sync for form submissions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'sync-form-responses') {
    event.waitUntil(syncFormResponses());
  }
});

/**
 * Sync pending form responses
 */
async function syncFormResponses() {
  console.log('[SW] Syncing form responses...');

  try {
    // Notify all clients to sync
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: 'SYNC_RESPONSES',
      });
    });
  } catch (error) {
    console.error('[SW] Error syncing responses:', error);
  }
}

console.log('[SW] Service worker script loaded');
