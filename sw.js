const CACHE = 'l3-tracker-v1';
const ASSETS = [
  '/l3-tracker/',
  '/l3-tracker/index.html'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // Only cache GET requests for same origin
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('supabase') || e.request.url.includes('resend') || e.request.url.includes('fonts.googleapis')) return;

  e.respondWith(
    fetch(e.request).then(function(response) {
      // Update cache with fresh response
      var clone = response.clone();
      caches.open(CACHE).then(function(cache) { cache.put(e.request, clone); });
      return response;
    }).catch(function() {
      // Fallback to cache when offline
      return caches.match(e.request).then(function(cached) {
        return cached || caches.match('/l3-tracker/index.html');
      });
    })
  );
});
