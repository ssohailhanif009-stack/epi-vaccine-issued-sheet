const CACHE_NAME = 'portal-offline-v1';
const assetsToCache = [
  './',
  './index.html',
  './issued.html',
  './waste.html',
  './consume.html'
  // Agar aapke paas koi CSS, JS ya images hain, toh unke paths bhi yahan add kar sakte hain
];

// Install Service Worker and Cache Files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(assetsToCache);
      })
  );
});

// Fetch Files from Cache when Offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache mil jaye toh wohi return karo, warna internet se fetch karo
        if (response) {
          return response;
        }
        return fetch(event.request);
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
    })
  );
});
