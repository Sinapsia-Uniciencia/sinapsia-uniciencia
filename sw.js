const CACHE_NAME = 'sinapsia-v7';
const STATIC_ASSETS = [
  '/sinapsia-uniciencia/',
  '/sinapsia-uniciencia/index.html',
  '/sinapsia-uniciencia/manifest.json',
  '/sinapsia-uniciencia/icons/icon-192x192.png',
  '/sinapsia-uniciencia/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request)
        .then(cached => cached || caches.match('/sinapsia-uniciencia/index.html')))
  );
});
