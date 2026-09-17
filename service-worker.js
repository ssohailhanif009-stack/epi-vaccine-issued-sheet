const CACHE_NAME = 'portal-offline-v4';
const assetsToCache = [
  './',
  './index.html',
  './issued.html',
  './waste.html',
  './consume.html',
  './epi.png',
  './manifest.json'
];

// Install Service Worker and Cache Core Assets Immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(assetsToCache);
      })
  );
  self.skipWaiting();
});

// Activate and Clean Old Caches Instantly
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Files: Stale-While-Revalidate / Cache First for Instant Offline Access
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Agar cache mein mojood hai toh foran wahi se de do (bina internet ke bhi)
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Warna network se fetch karo
      return fetch(event.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // Agar net bhi nahi hai aur file cache mein bhi nahi, toh fallback ke tor par index.html dikhao
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('./index.html');
          }
        });
    })
  );
});
