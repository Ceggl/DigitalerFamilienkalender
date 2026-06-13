// Service Worker for PWA support
// Handles offline caching and background sync

const CACHE_NAME = 'familycalender-v1';
const URLS_TO_CACHE = [
  '/',
  '/my-tasks',
  '/rewards',
  '/login',
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event
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
    })
  );
  self.clients.claim();
});

// Fetch event – Network first, fall back to cache
self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip API calls (let them fail offline)
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        const cache = caches.open(CACHE_NAME);
        cache.then((c) => {
          if (response.status === 200) {
            c.put(event.request, response.clone());
          }
        });
        return response;
      })
      .catch(() => {
        // Offline: return cached version
        return caches.match(event.request);
      })
  );
});
