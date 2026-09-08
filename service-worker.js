const CACHE_NAME = 'offline-portal-v1';
// Un sabhi files ke naam likhein jo offline chahiye
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  // Agar koi CSS, JS ya Logo images hain to unka path bhi yahan add karein:
  // './style.css',
  // './script.js',
  // './logo.png'
];

// App install hote hi files cache (save) ho jayengi
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Cache ko update rakhne ke liye
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Jab internet na ho to saved files se load kare
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
