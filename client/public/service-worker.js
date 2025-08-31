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
const CACHE_VERSION = (self && self.registration && self.registration.scope) ? self.registration.scope : '';
const CACHE_NAME = 'offline-cache-v1-' + CACHE_VERSION + '-' + Date.now();
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
          const assetFiles = Object.values(manifest).filter(f => typeof f === 'string' && f.startsWith('assets/'));
          await Promise.all(assetFiles.map(f => cache.add('/' + f)));
        }
      } catch (e) {
        // Jika gagal, abaikan
      }
    })
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // Untuk semua request asset di ASSETS, cache duluan
  if (ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then(response =>
        response || fetch(event.request)
      )
    );
    return;
  }
  // Untuk navigasi (HTML), fallback ke index.html jika gagal agar SPA tetap bisa menampilkan halaman offline
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
  }
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});
