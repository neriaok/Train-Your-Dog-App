// Minimal service worker: exists mainly to satisfy the browser's PWA
// "installable" criteria (Add to Home Screen) and give the app a basic
// offline fallback. Deliberately network-first (not cache-first) for every
// request, so a fresh deploy is never masked by a stale cached JS bundle -
// the cache is only a fallback for when the network is unavailable.
const CACHE_NAME = 'dog-training-app-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
