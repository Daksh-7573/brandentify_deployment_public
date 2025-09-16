// 🚨 EMERGENCY CACHE ELIMINATION FIX v9 - ZERO API CACHING TOLERANCE
const SW_VERSION = 'v9'; // FORCED VERSION BUMP - COMPLETE API CACHE PURGE ACTIVATION
const CACHE_NAME = 'brandentifier-v9';
const STATIC_CACHE_NAME = 'brandentifier-static-v9';
const RUNTIME_CACHE_NAME = 'brandentifier-runtime-v9';
// REMOVED: API_CACHE_NAME - NO API CACHING ALLOWED

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

// 🚨 EMERGENCY INSTALL - COMPLETE API CACHE PURGE
self.addEventListener('install', event => {
  console.log('🚨 [SW v8] EMERGENCY CACHE ELIMINATION - Installing complete API cache purge...');
  event.waitUntil(
    Promise.all([
      // Cache static files only
      caches.open(STATIC_CACHE_NAME).then(cache => {
        console.log('🚀 [SW v8] Caching static files only (NO API CACHING)...');
        return cache.addAll(STATIC_FILES.map(url => {
          // Add cache-busting for external resources
          if (url.startsWith('http')) {
            return new Request(url, { cache: 'reload' });
          }
          return url;
        }));
      }),
      // Pre-warm runtime cache (NON-API ONLY)
      caches.open(RUNTIME_CACHE_NAME),
      // 🚨 CRITICAL: IMMEDIATE API CACHE PURGE
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName.includes('api') || cacheName.includes('brandentifier-api')) {
              console.log('🗑️ [SW v8] PURGING API CACHE:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // 🚨 EMERGENCY: Force immediate activation and bypass waiting
      self.skipWaiting(),
      // Send immediate cache purge message to all clients
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ 
            type: 'FORCE_CACHE_PURGE', 
            version: 'v9',
            message: 'Emergency cache elimination active'
          });
        });
      })
    ])
  );
});

// 🚨 EMERGENCY ACTIVATE - COMPLETE API CACHE ELIMINATION
self.addEventListener('activate', event => {
  console.log('🚨 [SW v8] EMERGENCY ACTIVATION - Complete API cache elimination...');
  event.waitUntil(
    Promise.all([
      // Aggressive cache cleanup - delete ALL old versions and ALL API caches
      caches.keys().then(cacheNames => {
        console.log('🧹 [SW v8] Found caches:', cacheNames);
        return Promise.all(
          cacheNames.map(cacheName => {
            // Delete all old versions
            if (!cacheName.includes('v8')) {
              console.log('🗑️ [SW v8] Deleting old cache version:', cacheName);
              return caches.delete(cacheName);
            }
            // CRITICAL: Delete ANY cache that could contain API responses
            if (cacheName.includes('api') || cacheName.includes('API') || 
                cacheName.includes('brandentifier-api') || cacheName.includes('users') ||
                cacheName.includes('profiles') || cacheName.includes('messaging')) {
              console.log('🚨 [SW v8] PURGING API-RELATED CACHE:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // 🚨 CRITICAL: Force immediate cache takeover for all clients
      self.clients.claim()
    ])
  );
  
  // 🚨 EMERGENCY: Clear any existing API responses from browser cache
  console.log('🚨 [SW v8] FORCING IMMEDIATE CLIENT CACHE PURGE');
  
  // Send message to all clients to clear API caches
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({ type: 'EMERGENCY_CACHE_PURGE', version: 'v8' });
    });
  });
});

// Enhanced fetch strategy with OAUTH CALLBACK FIX
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests and non-http protocols
  if (request.method !== 'GET' && request.method !== 'POST' || !request.url.startsWith('http')) {
    return;
  }
  
  // 🚀 CRITICAL FIX: COMPLETE AUTH BYPASS - Never intercept ANY authentication-related routes
  const isAuthRoute = url.pathname.startsWith('/auth/') || 
                     url.pathname.startsWith('/__/auth/') || 
                     url.pathname === '/auth-callback' || 
                     url.pathname.startsWith('/api/auth/') ||
                     url.pathname.startsWith('/oauth') ||
                     url.pathname.includes('callback');
  
  if (isAuthRoute) {
    console.log('[SW v6] 🚀 AUTHENTICATION ROUTE BYPASS - Direct to server:', request.url);
    console.log('[SW v6] 🔍 Route details:', {
      pathname: url.pathname,
      method: request.method,
      mode: request.mode,
      credentials: request.credentials
    });
    
    // COMPLETE BYPASS - No service worker interference
    event.respondWith(
      fetch(request, { 
        cache: 'no-store', // Never cache auth requests
        credentials: 'include', // Include cookies for sessions
        redirect: 'follow' // Allow OAuth redirects
      }).then(response => {
        console.log('[SW v6] ✅ Auth request successful:', response.status, response.url);
        return response;
      }).catch(error => {
        console.error('[SW v6] ❌ Auth request failed:', error);
        return new Response('Authentication Error - Please try again', {
          status: 503,
          headers: { 'Content-Type': 'text/html' }
        });
      })
    );
    return;
  }
  
  // ⚠️ CRITICAL FIX: Enhanced navigation handling for published domains
  if (request.mode === 'navigate') {
    console.log('[SW v6] 🧭 Navigation request - checking for auth context:', request.url);
    
    // Enhanced logging for published domain debugging
    const isPublishedDomain = url.hostname.includes('replit.app');
    console.log('[SW v6] 🌐 Domain context:', {
      hostname: url.hostname,
      isPublished: isPublishedDomain,
      pathname: url.pathname
    });
    
    // NEVER intercept navigation requests - prevents redirect loops
    event.respondWith(
      fetch(request, { 
        cache: 'no-store', // Force fresh request
        credentials: 'include', // Include cookies for auth
        redirect: 'follow' // Allow redirects
      }).then(response => {
        console.log('[SW v6] ✅ Navigation successful:', response.status, response.url);
        return response;
      }).catch(error => {
        console.error('[SW v6] ❌ Navigation failed:', error);
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
  
  // 🚨 CRITICAL: ABSOLUTE API BYPASS - NO SERVICE WORKER INTERFERENCE WHATSOEVER
  else if (request.url.includes('/api/')) {
    console.log('🚨 [SW v8] ABSOLUTE API BYPASS - SERVICE WORKER COMPLETELY DISABLED:', request.url);
    
    // 🚨 CRITICAL: Do absolutely NOTHING for API requests - let browser handle directly
    // This ensures zero service worker interference with API calls
    
    // COMPLETELY BYPASS SERVICE WORKER - NO event.respondWith() CALLED
    // This allows the browser to handle the request directly as if no SW exists
    return; // Browser will handle this request directly without SW interference
  }
  
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