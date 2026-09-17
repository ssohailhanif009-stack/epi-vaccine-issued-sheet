const CACHE_NAME = 'portal-offline-v3';
const assetsToCache = [
  './',
  './index.html',
  './issued.html',
  './waste.html',
  './consume.html',
  './epi.png',
  './manifest.json'
];

// Install Service Worker and Cache All Core Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache v3');
        return cache.addAll(assetsToCache);
      })
  );
  self.skipWaiting();
});

// Fetch Files: Serve from Cache, Fallback to Network
self.addEventListener('fetch', (event) => {
  // Sirf GET requests handle karein
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request)
          .then((networkResponse) => {
            return networkResponse;
          })
          .catch(() => {
            // Agar internet bhi nahi hai aur file cache mein bhi nahi, 
            // toh index.html dikha dein taaki app crash na ho
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('./index.html');
            }
          });
      })
  );
});

// Activate and Clean Old Caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});
