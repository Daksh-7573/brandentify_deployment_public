// Service Worker for App Shell Caching
const CACHE_NAME = 'brandentifier-shell-v1';
const SHELL_FILES = [
  '/',
  '/src/main.tsx',
  '/src/index.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install event - cache shell files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching shell files');
        return cache.addAll(SHELL_FILES);
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

// Fetch event - serve from cache first, then network
self.addEventListener('fetch', (event) => {
  // Only handle GET requests for shell files
  if (event.request.method === 'GET' && 
      (event.request.url.includes('.js') || 
       event.request.url.includes('.css') || 
       event.request.url.includes('fonts.googleapis.com') ||
       event.request.url === self.registration.scope)) {
    
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
          // Return a basic response for HTML requests
          if (event.request.destination === 'document') {
            return new Response('App temporarily offline', {
              headers: { 'Content-Type': 'text/html' }
            });
          }
        })
    );
  }
});