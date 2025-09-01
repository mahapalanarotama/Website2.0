const CACHE_NAME = 'mpn-offline-standalone-v1';

// Essential files untuk offline functionality
const OFFLINE_ASSETS = [
  '/offline-standalone.html',
  '/favicon.ico',
  '/manifest.json',
  '/OfflineApp.png',
  '/panduan-survival.pdf',
  '/navigasi-darat.pdf',
  '/ppgd.pdf'
];

// Install - cache hanya file yang benar-benar dibutuhkan offline
self.addEventListener('install', event => {
  console.log('[SW] Installing offline-first service worker...');
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      
      // Cache satu per satu dengan error handling
      for (const asset of OFFLINE_ASSETS) {
        try {
          await cache.add(asset);
          console.log('[SW] ✅ Cached:', asset);
        } catch (e) {
          console.error('[SW] ❌ Failed to cache:', asset, e);
        }
      }
      
      console.log('[SW] Installation complete - offline assets ready');
    })()
  );
  self.skipWaiting();
});

// Activate - bersihkan cache lama
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => {
          console.log('[SW] Deleting old cache:', key);
          return caches.delete(key);
        })
      );
      await self.clients.claim();
      console.log('[SW] Activated - ready to serve offline content');
    })()
  );
});

// Fetch - strategi offline-first untuk /offline route
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Skip non-GET dan non-HTTP requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }
  
  event.respondWith(
    (async () => {
      // Skip service worker untuk route /offline - biarkan server handle langsung
      if (url.pathname === '/offline') {
        return fetch(event.request);
      }
      
      // Untuk request lainnya, coba network dulu
      try {
        const response = await fetch(event.request);
        
        // Jika berhasil dari network, cache untuk offline use
        if (response.ok && event.request.method === 'GET') {
          try {
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, response.clone());
          } catch (e) {
            // Ignore cache errors
          }
        }
        
        return response;
      } catch (networkError) {
        // Network gagal, coba dari cache
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);
        
        if (cachedResponse) {
          console.log('[SW] 📦 Served from cache:', url.pathname);
          return cachedResponse;
        }
        
        // Tidak ada di cache - untuk navigation request, redirect ke offline page
        if (event.request.mode === 'navigate') {
          const offlineResponse = await cache.match('/offline-standalone.html');
          if (offlineResponse) {
            console.log('[SW] 🔄 Redirecting to offline page');
            return offlineResponse;
          }
        }
        
        // Untuk assets yang tidak ter-cache, return error
        console.log('[SW] ❌ Asset not available offline:', url.pathname);
        return new Response('Not available offline', { status: 503 });
      }
    })()
  );
});

// Message handler untuk status check
self.addEventListener('message', async event => {
  if (event.data && event.data.type === 'CHECK_CACHE') {
    try {
      const cache = await caches.open(CACHE_NAME);
      
      // Check apakah offline page ter-cache
      const offlinePageCached = await cache.match('/offline-standalone.html');
      
      let status = 'ready';
      let error = null;
      
      if (!offlinePageCached) {
        status = 'error';
        error = 'Offline page belum ter-cache';
      }
      
      event.source.postMessage({ 
        type: 'CACHE_STATUS', 
        status, 
        error 
      });
    } catch (e) {
      event.source.postMessage({ 
        type: 'CACHE_STATUS', 
        status: 'error', 
        error: e.message 
      });
    }
  }
});