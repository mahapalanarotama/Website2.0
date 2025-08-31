// Service Worker: Pokedex.org style offline support
const CACHE_NAME = 'offline-cache-v1';
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
  '/src/index.css',
  // Semua file di /assets akan dicache otomatis
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(ASSETS);
    try {
      const assetsResp = await fetch('/assets-manifest.json');
      if (assetsResp.ok) {
        const manifest = await assetsResp.json();
        const assetFiles = Array.isArray(manifest) ? manifest : Object.values(manifest);
        await Promise.all(assetFiles.map(f => cache.add(f)));
      }
    } catch (e) {}
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // Cache first untuk semua asset (JS, CSS, PDF, audio, gambar, dll)
  if (
    url.pathname.startsWith('/assets/') ||
    ASSETS.includes(url.pathname) ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.pdf') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.mp3')
  ) {
    event.respondWith(
      caches.match(event.request).then(response => {
        if (response) return response;
        // Fallback ke cache lain jika ada
        return caches.keys().then(keys => {
          return Promise.any(keys.map(k => caches.open(k).then(c => c.match(event.request)))).catch(() => fetch(event.request));
        });
      })
    );
    return;
  }
  // Untuk navigasi SPA, fallback ke /index.html jika gagal
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/index.html'))
    );
    return;
  }
});
