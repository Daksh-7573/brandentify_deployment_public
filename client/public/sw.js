// Service worker disabled to fix MIME type caching issues
console.log('Service worker disabled - allowing server to handle MIME types correctly');

// Unregister any existing service worker
self.addEventListener('install', () => {
  console.log('SW: Clearing all caches and unregistering');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('SW: Clearing all caches');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('SW: Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('SW: All caches cleared, unregistering service worker');
      return self.registration.unregister();
    })
  );
});

// Don't handle any fetch requests - let the server handle them
self.addEventListener('fetch', (event) => {
  // Do nothing - let network handle all requests
  return;
});