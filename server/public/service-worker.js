// Service Worker PWA Offline Survival Mahapala Narotama
const CACHE_NAME = 'offline-survival-mahapala-v1';
const OFFLINE_URLS = [
  '/',
  '/offline',
  '/index.html',
  '/offline-survival-app.js', // pastikan bundle utama offline
  '/src/pages/OfflineSurvivalApp.tsx', // untuk dev, abaikan di prod
  '/favicon.ico',
  '/manifest.json',
  '/navigasi-darat.pdf',
  '/panduan-survival.pdf',
  '/ppgd.pdf',
  // tambahkan asset penting lain jika perlu
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(response => {
      // Jika request ke /offline, fallback ke /offline (SPA)
      if (!response && event.request.url.endsWith('/offline')) {
        return caches.match('/offline');
      }
      return response || fetch(event.request).catch(() => caches.match('/offline'));
    })
  );
});
