// Handler untuk progress bar offline status
self.addEventListener('message', async event => {
  if (event.data && event.data.type === 'CHECK_CACHE') {
    let status = 'checking';
    let error = null;
    try {
      const cache = await caches.open(CACHE_NAME);
      // Cek semua asset utama
      const allAssets = [...ASSETS];
      try {
        const assetsResp = await fetch('/assets-manifest.json');
        if (assetsResp.ok) {
          const manifest = await assetsResp.json();
          const assetFiles = Object.values(manifest).filter(f => typeof f === 'string' && f.startsWith('assets/'));
          allAssets.push(...assetFiles.map(f => '/' + f));
        }
      } catch (e) {}
      let cachedCount = 0;
      for (const asset of allAssets) {
        const res = await cache.match(asset);
        if (res) cachedCount++;
      }
      if (cachedCount === allAssets.length) {
        status = 'ready';
      } else if (cachedCount > 0) {
        status = 'caching';
      } else {
        status = 'error';
        error = 'Tidak ada file yang tercache.';
      }
    } catch (e) {
      status = 'error';
      error = e.message || 'Gagal cek cache.';
    }
    event.source && event.source.postMessage({ type: 'CACHE_STATUS', status, error });
  }
});
// Service Worker untuk cache hanya halaman /offline dan asset terkait
const CACHE_NAME = 'offline-cache-v1';
const OFFLINE_URL = '/offline';
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
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      // Cache semua asset statis
      await cache.addAll(ASSETS);
      // Cache semua file di /assets (JS/CSS hasil build)
      try {
        const assetsResp = await fetch('/assets-manifest.json');
        if (assetsResp.ok) {
          const manifest = await assetsResp.json();
          const assetFiles = Array.isArray(manifest) ? manifest : Object.values(manifest);
          await Promise.all(assetFiles.map(f => cache.add(f)));
        }
      } catch (e) {
        // Jika gagal, abaikan
      }
    })
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // Serve semua file dari cache jika offline
  event.respondWith(
    caches.match(event.request).then(response => {
      // Jika ada di cache, return cache
      if (response) return response;
      // Jika online, fetch dari network
      return fetch(event.request).catch(() => {
        // Jika offline dan tidak ada di cache, fallback ke index.html untuk navigasi SPA
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        // Jika offline dan file tidak ada di cache, return undefined
        return undefined;
      });
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});
