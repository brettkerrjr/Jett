// Jett Service Worker
// Increment VERSION on every deploy — triggers update banner in the app
const VERSION = 'jett-8.4';
const CACHE   = 'jett-cache-' + VERSION;

// ── Install: cache the app shell ─────────────────────────────────────────────
self.addEventListener('install', e => {
  // Cache app shell — do NOT skipWaiting here so the update banner
  // stays visible until the user taps APPLY
  e.waitUntil(caches.open(CACHE).then(c => c.add('./')));
});

// ── Activate: delete stale caches, claim clients ─────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

// ── Fetch: network-first, fall back to cache (offline resilience) ─────────────
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Update cache with fresh response
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// ── Message: allow page to trigger skipWaiting ────────────────────────────────
self.addEventListener('message', e => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
