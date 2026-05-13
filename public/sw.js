// public/sw.js
const CACHE = 'sym-static-v1';
const STATIC_PREFIXES = ['/_next/static/', '/fonts/', '/icons/'];
const STATIC_EXACT = ['/manifest.webmanifest', '/offline.html'];
const PRIVATE_SEGMENTS = ['/api/', '/dashboard', '/settings', '/onboarding', '/plan', '/guidance', '/admin'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.add('/offline.html'))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const path = url.pathname;

  // Never cache private/authenticated routes
  if (PRIVATE_SEGMENTS.some((s) => path.startsWith(s))) return;
  if (req.headers.get('Authorization')) return;

  const isStatic =
    STATIC_PREFIXES.some((p) => path.startsWith(p)) ||
    STATIC_EXACT.includes(path);

  if (isStatic) {
    // Cache-first for static assets
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, clone));
          }
          return res;
        });
      })
    );
    return;
  }

  // Navigation: network-first, offline fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() =>
        caches.match('/offline.html').then((r) => r ?? new Response('Offline', { status: 503 }))
      )
    );
  }
});
