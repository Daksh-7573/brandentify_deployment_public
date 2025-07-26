// Service Worker for App Shell Caching
const CACHE_NAME = 'brandentifier-shell-v2';
const SHELL_FILES = [
  '/',
  '/src/main.tsx',
  '/src/index.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install event - cache shell files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker v2...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching shell files');
        return cache.addAll(SHELL_FILES).catch(err => {
          console.log('[SW] Cache addAll failed:', err);
          // Cache files individually if batch fails
          return Promise.all(
            SHELL_FILES.map(url => {
              return cache.add(url).catch(err => {
                console.log(`[SW] Failed to cache ${url}:`, err);
              });
            })
          );
        });
      })
      .then(() => {
        console.log('[SW] Installation complete');
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
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache first for static resources
self.addEventListener('fetch', (event) => {
  // Only handle GET requests for static resources
  if (event.request.method === 'GET') {
    const url = new URL(event.request.url);
    
    // Cache strategy for static resources
    if (url.pathname.includes('.js') || 
        url.pathname.includes('.css') || 
        url.pathname.includes('.tsx') || 
        url.hostname.includes('fonts.googleapis.com') ||
        url.hostname.includes('cdnjs.cloudflare.com')) {
      
      event.respondWith(
        caches.match(event.request)
          .then((response) => {
            if (response) {
              console.log('[SW] Serving from cache:', event.request.url);
              return response;
            }
            
            console.log('[SW] Fetching from network:', event.request.url);
            return fetch(event.request).then((response) => {
              // Cache successful responses
              if (response && response.status === 200) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, responseClone);
                });
              }
              return response;
            });
          })
          .catch(() => {
            console.log('[SW] Network and cache failed for:', event.request.url);
          })
      );
    }
  }
});