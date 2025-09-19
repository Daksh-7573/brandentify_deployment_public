// Service Worker for App Shell Caching
const CACHE_NAME = 'brandentifier-shell-v8'; // Force complete cache refresh for cross-domain fix
const SHELL_FILES = [];

// Install event - skip caching to fix frontend
self.addEventListener('install', (event) => {
  console.log('[SW] Installing with no caching...');
  event.waitUntil(
    Promise.resolve().then(() => {
      console.log('[SW] Installation complete - no caching');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete ALL old caches to force fresh assets
          console.log('[SW] Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('[SW] Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - bypass all caching, only handle PUT bypass
self.addEventListener('fetch', (event) => {
  // CRITICAL FIX: Skip service worker for ALL PUT requests to prevent interference
  if (event.request.method === 'PUT') {
    console.log(`[SW] *** BYPASSING SERVICE WORKER FOR PUT REQUEST ***`);
    console.log(`[SW] URL: ${event.request.url}`);
    console.log(`[SW] Method: ${event.request.method}`);
    return; // Let request go directly to network without any service worker interference
  }
  
  // Let all other requests pass through to network without caching
  // This prevents service worker from interfering with frontend loading
  console.log(`[SW] Passing through to network: ${event.request.method} ${event.request.url}`);
  return;
});