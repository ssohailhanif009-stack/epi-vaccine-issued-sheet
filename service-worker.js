const CACHE_NAME = 'portal-offline-v6';
const assetsToCache = [
  './',
  './index.html',
  './issued.html',
  './waste.html',
  './consume.html',
  './epi.png',
  './manifest.json'
];

// Install Event: Sari files ko cache mein save karna
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching all assets');
        return cache.addAll(assetsToCache);
      })
  );
  self.skipWaiting();
});

// Activate Event: Purane caches ko delete karna
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Strategy: Cache First (Calculator ki tarah foran offline chalne ke liye)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Agar file cache mein mojood hai toh foran wahi de do (Bina net ke bhi)
      if (cachedResponse) {
        // Background mein net se fetch karke cache update kar sakte hain (Stale-while-revalidate)
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {/* Ignore network errors when offline */});
        
        return cachedResponse;
      }

      // Agar cache mein nahi hai toh net se laao
      return fetch(event.request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        // Agar net bhi na ho aur file cache mein bhi na mile, toh index.html fallback dikhao
        if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
