// The phone version: network first, so updates show when online; the cached copy keeps the game opening offline.
const CACHE = 'tenka';
const SHELL = ['./', 'index.html', 'ui.js', 'game.js', 'data/map.js', 'data/game-data.js', 'manifest.webmanifest', 'icon.png', 'icon-180.png', 'icon-512.png',
  'fonts/mincho-400.woff2', 'fonts/mincho-700.woff2', 'fonts/gothic-400.woff2', 'fonts/gothic-500.woff2', 'fonts/brush-400.woff2', 'art/eave.svg', 'art/roof.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true })));
});
