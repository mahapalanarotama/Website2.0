
const CACHE_NAME = 'offline-cache-v1-' + Date.now();
const ASSETS = [
  '/', '/index.html', '/offline', '/favicon.ico', '/manifest.json', '/OfflineApp.png',
  '/panduan-survival.pdf', '/navigasi-darat.pdf', '/ppgd.pdf', '/robots.txt', '/sitemap.xml',
  '/assets/backsound-BBcioZr7.mp3',
  '/assets/index-14VCckBn.css',
  '/assets/index-BGOrKOQc.js',
  '/assets/index-BJ_22dnw.css',
  '/assets/index-bWXjXQwU.js',
  '/assets/index-CfFcCRyT.css',
  '/assets/index-CVdhqAZu.js',
  '/assets/index-iazrxU6o.css',
  '/assets/index-UbqMtLHe.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
      self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response =>
      response || fetch(event.request)
    )
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});
