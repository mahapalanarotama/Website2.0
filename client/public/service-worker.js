const CACHE_NAME = 'mpn-offline-v5';

// Critical assets yang harus di-cache
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/offline',
  '/offline-standalone.html',
  '/favicon.ico',
  '/manifest.json',
  '/OfflineApp.png',
  '/panduan-survival.pdf',
  '/navigasi-darat.pdf',
  '/ppgd.pdf'
];

// Install - cache semua assets
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      
      // Cache critical assets first
      for (const asset of CRITICAL_ASSETS) {
        try {
          await cache.add(asset);
          console.log('[SW] Cached:', asset);
        } catch (e) {
          console.warn('[SW] Failed to cache:', asset);
        }
      }

      // Try to cache additional assets from manifest
      try {
        const manifestResponse = await fetch('/assets-manifest.json');
        if (manifestResponse.ok) {
          const additionalAssets = await manifestResponse.json();
          for (const asset of additionalAssets) {
            try {
              await cache.add(asset);
              console.log('[SW] Cached additional:', asset);
            } catch (e) {
              console.warn('[SW] Failed to cache additional:', asset);
            }
          }
        }
      } catch (e) {
        console.warn('[SW] Could not load assets manifest');
      }

      console.log('[SW] Installation complete');
    })()
  );
  self.skipWaiting();
});

// Activate - clean old caches
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
      console.log('[SW] Activated');
    })()
  );
});

// Fetch - serve from cache when offline
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) return;
  
  event.respondWith(
    (async () => {
      try {
        // Try network first
        const response = await fetch(event.request);
        
        // Cache successful responses for future offline use
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          try {
            cache.put(event.request, response.clone());
          } catch (e) {
            // Ignore cache errors
          }
        }
        
        return response;
      } catch (networkError) {
        // Network failed, try cache
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);
        
        if (cachedResponse) {
          console.log('[SW] Served from cache:', event.request.url);
          return cachedResponse;
        }
        
        // No cache hit - handle based on request type
        const url = new URL(event.request.url);
        
        // For navigation requests, serve appropriate page
        if (event.request.mode === 'navigate') {
          // If requesting /offline specifically, serve standalone offline page
          if (url.pathname === '/offline') {
            const offlineResponse = await cache.match('/offline-standalone.html');
            if (offlineResponse) {
              console.log('[SW] Served offline-standalone.html');
              return offlineResponse;
            }
          }
          
          // For other navigation, try index.html first
          const indexResponse = await cache.match('/index.html');
          if (indexResponse) {
            console.log('[SW] Served index.html for navigation:', url.pathname);
            return indexResponse;
          }
          
          // Fallback to standalone offline page
          const offlineResponse = await cache.match('/offline-standalone.html');
          if (offlineResponse) {
            console.log('[SW] Served offline-standalone.html as fallback');
            return offlineResponse;
          }
        }
        
        // For assets, return appropriate fallbacks
        if (url.pathname.endsWith('.css')) {
          return new Response(`
            /* Offline fallback CSS */
            body { 
              font-family: Arial, sans-serif; 
              background: linear-gradient(135deg, #f3f4f6 0%, #e5f3e5 100%);
              margin: 0;
              padding: 20px;
            }
            .offline-message {
              text-align: center;
              padding: 40px;
              background: white;
              border-radius: 15px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
              max-width: 500px;
              margin: 50px auto;
            }
          `, {
            headers: { 'Content-Type': 'text/css' }
          });
        }
        
        if (url.pathname.endsWith('.js')) {
          return new Response(`
            console.log('Offline mode - limited functionality');
            // Fallback for offline
            if (typeof window !== 'undefined') {
              window.addEventListener('load', function() {
                if (!navigator.onLine) {
                  document.body.innerHTML = '<div class="offline-message"><h1>Mode Offline</h1><p>Beberapa fitur mungkin terbatas saat offline.</p><button onclick="window.location.reload()">Coba Lagi</button></div>';
                }
              });
            }
          `, {
            headers: { 'Content-Type': 'text/javascript' }
          });
        }
        
        // Last resort - return error
        return new Response('Offline - Resource not available', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      }
    })()
  );
});

// Message handler
self.addEventListener('message', async event => {
  if (event.data && event.data.type === 'CHECK_CACHE') {
    try {
      const cache = await caches.open(CACHE_NAME);
      const cachedRequests = await cache.keys();
      
      let status = 'ready';
      let error = null;
      
      // Check if critical assets are cached
      const criticalMissing = [];
      for (const asset of CRITICAL_ASSETS) {
        const cached = await cache.match(asset);
        if (!cached) {
          criticalMissing.push(asset);
        }
      }
      
      if (criticalMissing.length > 0) {
        status = 'error';
        error = `Missing critical assets: ${criticalMissing.join(', ')}`;
      }
      
      event.source.postMessage({ 
        type: 'CACHE_STATUS', 
        status, 
        error,
        cachedCount: cachedRequests.length 
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