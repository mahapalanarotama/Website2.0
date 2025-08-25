// Service Worker untuk cache hanya halaman /offline dan asset terkait
const CACHE_NAME = 'offline-cache-v1';
const OFFLINE_URL = '/offline';
const ASSETS = [
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
  // Tambahkan asset CSS/JS yang dipakai halaman offline
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // Hanya intercept request ke /offline dan asset terkait
  if (ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then(response =>
        response || fetch(event.request)
      )
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
