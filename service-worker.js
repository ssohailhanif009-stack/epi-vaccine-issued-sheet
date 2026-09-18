const CACHE_NAME = 'portal-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './consume.html',
  './issued.html',
  './manifest.json'
  // Agar aapke paas koi CSS, JS ya images hain, toh unke paths bhi yahan add kar dein
  // Jaise: './style.css', './script.js'
];

// 1. Install Event: Files ko cache mein save karna
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// 2. Activate Event: Purana cache clear karna (agar version update ho)
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
    })
  );
  self.clientsClaim();
});

// 3. Fetch Event: Internet na hone par cache se data dena
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Agar cache mein mil jaye toh wahan se do, warna network se fetch karo
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
