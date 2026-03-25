const CACHE_NAME = 'sinapsia-v10';
const STATIC_ASSETS = [
  '/sinapsia-uniciencia/',
  '/sinapsia-uniciencia/index.html',
  '/sinapsia-uniciencia/manifest.json',
  '/sinapsia-uniciencia/icons/icon-192x192.png',
  '/sinapsia-uniciencia/icons/icon-512x512.png'
];

// Instalar y cachear assets estáticos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Limpiar caches antiguas
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

// Estrategia: Network First con fallback a caché
self.addEventListener('fetch', event => {
  // Solo manejar peticiones GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Guardar copia en caché si es válida
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseClone));
        }
        return response;
      })
      .catch(() => {
        // Sin red: servir desde caché
        return caches.match(event.request)
          .then(cached => cached || caches.match('/sinapsia-uniciencia/index.html'));
      })
  );
});

// Notificación push (preparado para futuras notificaciones)
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  self.registration.showNotification(data.title || 'SINAPSIA', {
    body: data.body || 'Tienes actividades pendientes hoy',
    icon: '/sinapsia-uniciencia/icons/icon-192x192.png',
    badge: '/sinapsia-uniciencia/icons/icon-72x72.png'
  });
});
