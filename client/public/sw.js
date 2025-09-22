// Enhanced Service Worker v7 - COMPLETE API CACHING BYPASS FIX  
const SW_VERSION = 'v8'; // Force complete cache refresh for cross-domain fix
const CACHE_NAME = 'brandentifier-v8';
const STATIC_CACHE_NAME = 'brandentifier-static-v8';
const API_CACHE_NAME = 'brandentifier-api-v8';
const RUNTIME_CACHE_NAME = 'brandentifier-runtime-v8';

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
  console.log('[SW v6] Installing complete OAuth authentication fix...');
  event.waitUntil(
    Promise.all([
      // Cache static files
      caches.open(STATIC_CACHE_NAME).then(cache => {
        console.log('[SW v5] Caching static files...');
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
  console.log('[SW v6] Activating complete OAuth authentication fix...');
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!cacheName.includes('v8')) {
              console.log('[SW v8] Deleting old cache:', cacheName);
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

// Enhanced fetch strategy with OAUTH CALLBACK FIX
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests and non-http protocols
  if (request.method !== 'GET' && request.method !== 'POST' || !request.url.startsWith('http')) {
    return;
  }
  
  // 🚀 CRITICAL FIX: COMPLETE API BYPASS - Never intercept ANY /api/* requests 
  const isApiRoute = url.pathname.startsWith('/api/');
  
  if (isApiRoute) {
    console.log('[SW v8] 🚀 API ROUTE BYPASS - Direct to server:', request.url);
    console.log('[SW v8] 🔍 Route details:', {
      pathname: url.pathname,
      method: request.method,
      mode: request.mode,
      credentials: request.credentials
    });
    
    // COMPLETE BYPASS - No service worker interference whatsoever
    return; // Let the request go directly to network with zero SW interference
  }
  
  // ⚠️ CRITICAL FIX: Enhanced navigation handling - NEVER intercept /api/* navigations
  if (request.mode === 'navigate') {
    // CRITICAL: If navigation is to /api/* route, let it pass directly to server
    if (url.pathname.startsWith('/api/')) {
      console.log('[SW v8] 🚀 API NAVIGATION BYPASS - Direct to server:', request.url);
      return; // Complete bypass for API routes
    }
    
    console.log('[SW v8] 🧭 Navigation request - checking for auth context:', request.url);
    
    // Enhanced logging for published domain debugging
    const isPublishedDomain = url.hostname.includes('replit.app');
    console.log('[SW v8] 🌐 Domain context:', {
      hostname: url.hostname,
      isPublished: isPublishedDomain,
      pathname: url.pathname
    });
    
    // For non-API navigations, handle normally
    event.respondWith(
      fetch(request, { 
        cache: 'no-store', // Force fresh request
        credentials: 'include', // Include cookies for auth
        redirect: 'follow' // Allow redirects
      }).then(response => {
        console.log('[SW v8] ✅ Navigation successful:', response.status, response.url);
        return response;
      }).catch(error => {
        console.error('[SW v8] ❌ Navigation failed:', error);
        return new Response('<!DOCTYPE html><html><body><h1>Network Error</h1><p>Please check your connection and try again.</p></body></html>', {
          status: 503,
          headers: { 'Content-Type': 'text/html' }
        });
      })
    );
    return;
  }
  
  // Enhanced static file caching (cache-first with network fallback)
  if (STATIC_FILES.some(file => request.url.includes(file))) {
    event.respondWith(
      caches.open(STATIC_CACHE_NAME).then(cache => {
        return cache.match(request).then(response => {
          if (response) {
            console.log('[SW v4] ⚡ Instant cache hit:', request.url);
            
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
  
  // API routes are already handled by the bypass above, no need for additional handling
  
  // Runtime caching for dynamic content
  else if (RUNTIME_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
    event.respondWith(
      caches.open(RUNTIME_CACHE_NAME).then(cache => {
        return cache.match(request).then(response => {
          if (response) {
            console.log('[SW v4] 🚀 Runtime cache hit:', request.url);
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
  console.log('[SW v4] Background sync:', event.tag);
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync operations
      console.log('[SW v4] Performing background sync operations')
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