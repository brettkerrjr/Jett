// Jett Service Worker
// Increment VERSION on every deploy — triggers update banner in the app
const VERSION = 'jett-5.6';
const CACHE   = 'jett-cache-' + VERSION;

// ── Install: cache the app shell ─────────────────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.add('./'))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: delete stale caches, claim clients ─────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
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
