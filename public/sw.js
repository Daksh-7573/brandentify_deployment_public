// 🚨 SERVICE WORKER KILL-SWITCH v10 - IMMEDIATE CACHE ELIMINATION
const SW_VERSION = 'KILL_SWITCH_v10';

console.log(`🚨 [${SW_VERSION}] SERVICE WORKER KILL-SWITCH ACTIVATED - IMMEDIATE CACHE ELIMINATION`);

// ⚡ IMMEDIATE ACTIVATION - No waiting for user refresh
self.addEventListener('install', event => {
  console.log(`🚨 [${SW_VERSION}] INSTALL: Force immediate activation and cache purge`);
  
  event.waitUntil(
    Promise.all([
      // 1. Force immediate activation
      self.skipWaiting(),
      
      // 2. Delete ALL cache storage immediately
      caches.keys().then(cacheNames => {
        console.log(`🗑️ [${SW_VERSION}] PURGING ALL ${cacheNames.length} CACHES:`, cacheNames);
        return Promise.all(
          cacheNames.map(cacheName => {
            console.log(`🗑️ [${SW_VERSION}] Deleting cache: ${cacheName}`);
            return caches.delete(cacheName);
          })
        );
      }),
      
      // 3. Notify all clients immediately
      self.clients.matchAll().then(clients => {
        console.log(`📢 [${SW_VERSION}] Notifying ${clients.length} clients of cache elimination`);
        clients.forEach(client => {
          client.postMessage({
            type: 'KILL_SWITCH_ACTIVATED',
            version: SW_VERSION,
            message: 'All cache storage eliminated - API requests now fresh'
          });
        });
      })
    ])
  );
});

// ⚡ IMMEDIATE TAKEOVER - Control existing clients immediately
self.addEventListener('activate', event => {
  console.log(`🚨 [${SW_VERSION}] ACTIVATE: Take control of all clients immediately`);
  
  event.waitUntil(
    Promise.all([
      // 1. Take control of all existing clients immediately
      self.clients.claim(),
      
      // 2. Final cache purge to ensure nothing remains
      caches.keys().then(cacheNames => {
        if (cacheNames.length > 0) {
          console.log(`🧹 [${SW_VERSION}] FINAL PURGE: Deleting remaining ${cacheNames.length} caches`);
          return Promise.all(cacheNames.map(name => caches.delete(name)));
        }
        console.log(`✅ [${SW_VERSION}] CONFIRMED: No cache storage remaining`);
      })
    ])
  );
});

// 🚨 CRITICAL: ZERO API INTERFERENCE - Complete bypass for all /api/** requests
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // ABSOLUTE RULE: Never intercept API requests - let browser handle directly
  if (url.pathname.startsWith('/api/')) {
    console.log(`🚫 [${SW_VERSION}] API BYPASS: ${event.request.url}`);
    // Do NOT call event.respondWith() - let browser handle directly
    return;
  }
  
  // For all other requests, provide network-only strategy (no caching)
  event.respondWith(
    fetch(event.request, {
      cache: 'no-store' // Force fresh requests for everything
    }).catch(() => {
      // Simple fallback for offline scenarios
      return new Response('Content unavailable offline', {
        status: 503,
        headers: { 'Content-Type': 'text/plain' }
      });
    })
  );
});

// 📞 Message handling for debugging and status
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'STATUS_CHECK') {
    caches.keys().then(cacheNames => {
      event.ports[0].postMessage({
        version: SW_VERSION,
        cacheCount: cacheNames.length,
        caches: cacheNames,
        message: cacheNames.length === 0 ? 'All caches eliminated successfully' : 'WARNING: Caches still exist'
      });
    });
  }
  
  if (event.data && event.data.type === 'FORCE_PURGE') {
    caches.keys().then(cacheNames => {
      Promise.all(cacheNames.map(name => caches.delete(name))).then(() => {
        event.ports[0].postMessage({
          type: 'PURGE_COMPLETE',
          message: `Manually purged ${cacheNames.length} caches`
        });
      });
    });
  }
});

console.log(`✅ [${SW_VERSION}] SERVICE WORKER KILL-SWITCH READY - Zero API caching guaranteed`);