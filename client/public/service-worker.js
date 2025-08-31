// Listen for messages from client to report cache status and progress
self.addEventListener('message', async event => {
  if (event.data && event.data.type === 'CHECK_CACHE') {
    let status = 'checking';
    let error = null;
    try {
      const cache = await caches.open(CACHE_NAME);
      const cachedRequests = await cache.keys();
      const cachedPaths = cachedRequests.map(req => new URL(req.url).pathname);
      const missing = ASSETS.filter(asset => !cachedPaths.includes(asset));
      if (missing.length === 0) {
        status = 'ready';
      } else if (missing.length < ASSETS.length) {
        status = 'caching';
      } else {
        status = 'error';
        error = 'Beberapa file penting belum tercache.';
      }
    } catch (e) {
      status = 'error';
      error = e.message;
    }
    event.source.postMessage({ type: 'CACHE_STATUS', status, error });
  }
});

const CACHE_NAME = 'offline-cache-v1-' + Date.now();
const ASSETS = [
  '/',
  '/index.html',
  '/offline',
  '/favicon.ico',
  '/manifest.json',
  '/OfflineApp.png',
  '/panduan-survival.pdf',
  '/navigasi-darat.pdf',
  '/ppgd.pdf',
  '/robots.txt',
  '/sitemap.xml',
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
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      let loaded = 0;
      for (const asset of ASSETS) {
        try {
          await cache.add(asset);
        } catch (e) {
          // Ignore failed asset
        }
        loaded++;
        // Send progress to all clients
        const progress = Math.round((loaded / ASSETS.length) * 100);
        const allClients = await self.clients.matchAll();
        for (const client of allClients) {
          client.postMessage({ type: 'CACHE_PROGRESS', progress });
        }
      }
    })()
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
  const url = new URL(event.request.url);
  if (ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then(response =>
        response || fetch(event.request)
      )
    );
  }
  // For other requests, do nothing (do not call event.respondWith)
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});
