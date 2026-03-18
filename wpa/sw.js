/* sw.js — Budget App Service Worker
 *
 * IMPORTANT: bump CACHE_VERSION whenever you deploy changed files.
 * The old cache is deleted automatically on activate.
 */
const CACHE_VERSION = 'budget-v1';

const ASSETS = [
  '/',
  '/index.html',
  '/app.html',
  '/theme.css',
  '/app.css',
  '/data.js',
  '/render.js',
  '/sheets.js',
  '/main.js',
  // Google Fonts are fetched at runtime and cached on first load —
  // no need to list them here, the fetch handler below covers them.
];

// ── Install: pre-cache all app shell assets ───────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ── Activate: delete stale caches ────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: cache-first for app shell, network-first for everything else ───────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Cache-first strategy for same-origin assets and Google Fonts
  const isSameOrigin = url.origin === self.location.origin;
  const isFonts = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';

  if (isSameOrigin || isFonts) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          // Only cache valid responses
          if (!response || response.status !== 200 || response.type === 'error') return response;
          const clone = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(event.request, clone));
          return response;
        });
      }).catch(() => caches.match('/index.html')) // offline fallback
    );
  }
  // All other origins (e.g. CDNs): network only
});
