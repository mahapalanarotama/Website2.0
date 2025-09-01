const CACHE_NAME = 'offline-cache-v3';
let ASSETS = [
  '/',
  '/index.html',
  '/offline',
  '/offline-static.html',
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

// Install event - cache all assets
self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      try {
        // Load dynamic assets from manifest
        const manifestResponse = await fetch('/assets-manifest.json');
        if (manifestResponse.ok) {
          const manifestAssets = await manifestResponse.json();
          ASSETS = ASSETS.concat(manifestAssets);
        }
      } catch (e) {
        console.log('[SW] Could not load assets manifest, using static assets only');
      }

      // Cache the main page first to get all linked assets
      const cache = await caches.open(CACHE_NAME);
      
      // First cache the index.html to discover all linked assets
      try {
        await cache.add('/');
        const indexResponse = await cache.match('/');
        if (indexResponse) {
          const htmlText = await indexResponse.text();
          
          // Extract CSS and JS links from HTML
          const cssMatches = htmlText.match(/href="([^"]*\.css[^"]*)"/g) || [];
          const jsMatches = htmlText.match(/src="([^"]*\.js[^"]*)"/g) || [];
          
          cssMatches.forEach(match => {
            const url = match.match(/href="([^"]*)"/)?.[1];
            if (url && !ASSETS.includes(url)) {
              ASSETS.push(url);
            }
          });
          
          jsMatches.forEach(match => {
            const url = match.match(/src="([^"]*)"/)?.[1];
            if (url && !ASSETS.includes(url)) {
              ASSETS.push(url);
            }
          });
        }
      } catch (e) {
        console.warn('[SW] Failed to analyze index.html for assets');
      }
      
      let loaded = 0;
      
      for (const asset of ASSETS) {
        try {
          await cache.add(asset);
        } catch (e) {
          console.warn('[SW] Failed to cache asset:', asset, e);
        }
        loaded++;
        
        // Send progress to clients
        const progress = Math.round((loaded / ASSETS.length) * 100);
        const allClients = await self.clients.matchAll();
        for (const client of allClients) {
          client.postMessage({ type: 'CACHE_PROGRESS', progress });
        }
      }
      
      console.log('[SW] All assets cached successfully, total:', ASSETS.length);
    })()
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Handle navigation requests (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          
          // Always serve index.html for SPA routing when offline
          // This allows React Router to handle the /offline route properly
          const indexResponse = await cache.match('/index.html');
          if (indexResponse) {
            return indexResponse;
          }
          
          // Fallback to static offline page if index.html not cached
          const offlineResponse = await cache.match('/offline-static.html');
          if (offlineResponse) {
            return offlineResponse;
          }
          
          // Last resort fallback
          return new Response('Aplikasi tidak tersedia offline', { 
            status: 503,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        })
    );
    return;
  }
  
  // Handle asset requests
  event.respondWith(
    caches.match(event.request)
      .then(async response => {
        if (response) {
          return response;
        }
        
        // Try to find similar assets in cache if exact match fails
        const cache = await caches.open(CACHE_NAME);
        const cachedRequests = await cache.keys();
        
        // For CSS files, try to find any cached CSS file
        if (url.pathname.includes('.css')) {
          for (const req of cachedRequests) {
            if (req.url.includes('.css')) {
              const cachedResponse = await cache.match(req);
              if (cachedResponse) return cachedResponse;
            }
          }
        }
        
        // For JS files, try to find any cached JS file
        if (url.pathname.includes('.js')) {
          for (const req of cachedRequests) {
            if (req.url.includes('.js') && !req.url.includes('service-worker')) {
              const cachedResponse = await cache.match(req);
              if (cachedResponse) return cachedResponse;
            }
          }
        }
        
        return fetch(event.request);
      })
      .catch(() => {
        // If it's an asset and we can't fetch it, return a minimal fallback
        if (event.request.destination === 'style') {
          return new Response('/* Offline fallback CSS */', { 
            headers: { 'Content-Type': 'text/css' }
          });
        }
        if (event.request.destination === 'script') {
          return new Response('console.log("Offline fallback JS");', { 
            headers: { 'Content-Type': 'text/javascript' }
          });
        }
        if (event.request.destination === 'image') {
          return new Response('', { status: 404 });
        }
        return new Response('Offline', { status: 503 });
      })
  );
});

// Message handler for cache status checks
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
        error = `Missing: ${missing.slice(0, 3).join(', ')}${missing.length > 3 ? '...' : ''}`;
      } else {
        status = 'error';
        error = 'Cache belum siap';
      }
    } catch (e) {
      status = 'error';
      error = e.message;
    }
    
    event.source.postMessage({ type: 'CACHE_STATUS', status, error });
  }
});