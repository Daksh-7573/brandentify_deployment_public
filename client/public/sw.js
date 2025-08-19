// Enhanced Service Worker v3 - IFRAME EMBEDDING FIX
const CACHE_NAME = 'brandentifier-v3-iframe-fix';
const STATIC_CACHE_NAME = 'brandentifier-static-v3-iframe-fix';
const API_CACHE_NAME = 'brandentifier-api-v3-iframe-fix';
const RUNTIME_CACHE_NAME = 'brandentifier-runtime-v3-iframe-fix';

// Enhanced critical files for aggressive caching
const STATIC_FILES = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
  '/src/App.tsx',
  '/src/components/ui/skeleton-components.tsx',
  '/src/context/auth-context.tsx',
  '/src/lib/firebase.ts',
  '/src/lib/queryClient.ts',
  '/src/components/layout/header.tsx',
  '/src/pages/landing.tsx',
  '/src/pages/industry-pulse-new.tsx',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Runtime cache patterns for dynamic content
const RUNTIME_CACHE_PATTERNS = [
  /\/src\/pages\/.+\.tsx$/,
  /\/src\/components\/.+\.tsx$/,
  /\/uploads\/.+\.(jpg|jpeg|png|gif|webp)$/,
  /\.js$/, /\.css$/, /\.tsx$/, /\.ts$/
];

// Install event - cache critical files with enhanced strategy
self.addEventListener('install', event => {
  console.log('[SW v3] Installing iframe-compatible service worker...');
  event.waitUntil(
    Promise.all([
      // Cache static files
      caches.open(STATIC_CACHE_NAME).then(cache => {
        console.log('[SW v2] Caching static files...');
        return cache.addAll(STATIC_FILES.map(url => {
          // Add cache-busting for external resources
          if (url.startsWith('http')) {
            return new Request(url, { cache: 'reload' });
          }
          return url;
        }));
      }),
      // Pre-warm runtime cache
      caches.open(RUNTIME_CACHE_NAME),
      caches.open(API_CACHE_NAME),
      self.skipWaiting()
    ])
  );
});

// Activate event - enhanced cleanup and immediate claiming
self.addEventListener('activate', event => {
  console.log('[SW v3] Activating iframe-compatible service worker...');
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!cacheName.includes('v3-iframe-fix')) {
              console.log('[SW v3] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Immediate control claiming for faster activation
      self.clients.claim()
    ])
  );
});

// Enhanced fetch strategy with multiple cache layers
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests and non-http protocols
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }
  
  // Enhanced static file caching (cache-first with network fallback)
  if (STATIC_FILES.some(file => request.url.includes(file))) {
    event.respondWith(
      caches.open(STATIC_CACHE_NAME).then(cache => {
        return cache.match(request).then(response => {
          if (response) {
            console.log('[SW v2] ⚡ Instant cache hit:', request.url);
            
            // Background update for fresh content
            fetch(request).then(networkResponse => {
              if (networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
            }).catch(() => {});
            
            return response;
          }
          
          // Network with caching
          return fetch(request).then(networkResponse => {
            if (networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            return new Response('Resource unavailable offline', {
              status: 503,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
        });
      })
    );
  }
  
  // API caching with stale-while-revalidate strategy
  else if (request.url.includes('/api/')) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then(cache => {
        return cache.match(request).then(cachedResponse => {
          const fetchPromise = fetch(request).then(networkResponse => {
            // Cache successful responses
            if (networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          });
          
          // Return cached version immediately if available, update in background
          if (cachedResponse) {
            console.log('[SW v2] 🔄 Stale-while-revalidate:', request.url);
            return cachedResponse;
          }
          
          return fetchPromise.catch(() => {
            return new Response(JSON.stringify({ error: 'API unavailable offline' }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' }
            });
          });
        });
      })
    );
  }
  
  // Runtime caching for dynamic content
  else if (RUNTIME_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
    event.respondWith(
      caches.open(RUNTIME_CACHE_NAME).then(cache => {
        return cache.match(request).then(response => {
          if (response) {
            console.log('[SW v2] 🚀 Runtime cache hit:', request.url);
            return response;
          }
          
          return fetch(request).then(networkResponse => {
            if (networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
  }
  
  // Default network-first for everything else
  else {
    event.respondWith(
      fetch(request).catch(() => {
        // Try any cache as fallback
        return caches.match(request).then(response => {
          return response || new Response('Content unavailable offline', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      })
    );
  }
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('[SW v2] Background sync:', event.tag);
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync operations
      console.log('[SW v2] Performing background sync operations')
    );
  }
});

// Enhanced message handling
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    caches.keys().then(cacheNames => {
      Promise.all(
        cacheNames.map(cacheName => 
          caches.open(cacheName).then(cache => cache.keys())
        )
      ).then(allKeys => {
        const totalCached = allKeys.reduce((total, keys) => total + keys.length, 0);
        event.ports[0].postMessage({ totalCached });
      });
    });
  }
});