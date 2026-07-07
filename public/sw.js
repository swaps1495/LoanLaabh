// LoanLaabh minimal service worker (network-first, enables PWA installability)
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))
self.addEventListener('fetch', (event) => {
  // Network-first passthrough; never cache API or auth requests
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)))
})
