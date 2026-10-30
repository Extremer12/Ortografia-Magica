// Ortografía Mágica - Service Worker para soporte PWA Offline 100% autónomo

const CACHE_NAME = 'ortografia-magica-v1';

const STATIC_PRECACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
  '/assets/fox_mascot.jpg',
  '/assets/fox_celebrating.jpg',
  '/assets/world_bosque.jpg',
  '/assets/world_castillo.jpg',
  '/assets/world_montana.jpg',
  '/assets/world_biblioteca.jpg'
];

// Instalación: Cachear shell crítico
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_PRECACHE).catch((err) => {
        console.warn('[SW] Aviso al precachear algunos recursos iniciales:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activación: Limpieza de versiones antiguas
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
  self.clients.claim();
});

// Fetch: Stale-While-Revalidate para máxima velocidad y funcionamiento sin conexión
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignorar peticiones no HTTP/HTTPS (extensiones, etc.)
  if (!request.url.startsWith('http')) return;

  // Manejo de navegación (HTML)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match('/index.html');
        return cachedResponse || new Response('Offline', { status: 503, statusText: 'Offline' });
      })
    );
    return;
  }

  // Manejo de recursos estáticos (JS, CSS, imágenes, fuentes)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // En offline, si no hay red, cachedResponse se usará
      });

      return cachedResponse || fetchPromise;
    })
  );
});
