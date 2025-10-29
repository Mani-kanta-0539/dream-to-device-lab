// Service Worker for PWA offline functionality
const CACHE_NAME = 'ascendfit-v1';
const RUNTIME_CACHE = 'ascendfit-runtime';

// Assets to cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network first, then cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip Supabase API calls - always go to network
  if (event.request.url.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    caches.open(RUNTIME_CACHE).then((cache) => {
      return fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return cache.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
          });
        });
    })
  );
});
