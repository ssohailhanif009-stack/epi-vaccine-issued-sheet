const CACHE_NAME = 'portal-offline-v5';
const assetsToCache = [
  './',
  './index.html',
  './issued.html',
  './waste.html',
  './consume.html',
  './epi.png',
  './manifest.json'
];

// Install Service Worker and Force Cache All Core Assets Immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching all assets');
        return cache.addAll(assetsToCache);
      })
  );
  self.skipWaiting(); // Fauran active karay taaki wait na karna paray
});

// Activate and Clean Old Caches
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

// Fetch Strategy: Network First with Instant Fallback to Cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Agar net chal raha hai toh naya version cache mein save kar lo
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // Agar internet nahi hai, toh foran cache se utha kar de do (Offline Mode)
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Agar file cache mein bhi na mile aur net bhi na ho, toh index.html dikhao
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('./index.html');
          }
        });
      })
  );
});
