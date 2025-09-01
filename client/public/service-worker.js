// Debug: Log cache contents after install
self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      try {
        const manifestResponse = await fetch('/assets-manifest.json');
        if (manifestResponse.ok) {
          const manifestAssets = await manifestResponse.json();
          ASSETS = ASSETS.concat(manifestAssets);
        }
      } catch (e) {}
      const cache = await caches.open(CACHE_NAME);
      let loaded = 0;
      for (const asset of ASSETS) {
        let success = false;
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            await cache.add(asset);
            success = true;
            break;
          } catch (e) {
            console.error(`[SW] Failed to cache (attempt ${attempt}):`, asset, e);
          }
        }
        if (!success) {
          console.error('[SW] Asset NOT cached after retry:', asset);
        }
        loaded++;
        const progress = Math.round((loaded / ASSETS.length) * 100);
        const allClients = await self.clients.matchAll();
        for (const client of allClients) {
          client.postMessage({ type: 'CACHE_PROGRESS', progress });
        }
      }

      // --- Tambahan: cek dan recache asset yang size 0 B ---
      const cachedRequests = await cache.keys();
      for (const req of cachedRequests) {
        const response = await cache.match(req);
        if (response) {
          // Cek size 0 B (jika ada header content-length)
          const contentLength = response.headers.get('content-length');
          if (contentLength === '0') {
            await cache.delete(req);
            try {
              await cache.add(new URL(req.url).pathname);
              console.log('[SW] Recached asset with 0 B:', req.url);
            } catch (e) {
              console.error('[SW] Failed to recache asset:', req.url, e);
            }
          }
        }
      }
      // Debug: Log all cached requests
      const cachedRequestsAfterRecache = await cache.keys();
      console.log('[SW] Cached assets:', cachedRequestsAfterRecache.map(r => r.url));
    })()
  );
  self.skipWaiting();
});
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
        error = 'Missing: ' + missing.join(', ');
      } else {
        status = 'error';
        error = 'Beberapa file penting belum tercache.';
      }
      // Debug: Log missing assets
      console.log('[SW] Missing assets:', missing);
    } catch (e) {
      status = 'error';
      error = e.message;
    }
    event.source.postMessage({ type: 'CACHE_STATUS', status, error });
  }
});
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
let ASSETS = [
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
  '/Logo%20Mpn.png'
];

// Dynamically load assets from assets-manifest.json
self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      try {
        const manifestResponse = await fetch('/assets-manifest.json');
        if (manifestResponse.ok) {
          const manifestAssets = await manifestResponse.json();
          ASSETS = ASSETS.concat(manifestAssets);
        }
      } catch (e) {
        // If manifest fetch fails, continue with static ASSETS
      }
      const cache = await caches.open(CACHE_NAME);
      let loaded = 0;
      for (const asset of ASSETS) {
        try {
          await cache.add(asset);
        } catch (e) {}
        loaded++;
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
  // Handle navigation requests (SPA page/document loads)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('/index.html')
      )
    );
    return;
  }
  // Handle asset requests
  if (ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then(response =>
        response || fetch(event.request)
      )
    );
  }
  // For other requests, do nothing
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});
