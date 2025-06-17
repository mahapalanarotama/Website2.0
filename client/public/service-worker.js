// Service Worker PWA Offline Survival Mahapala Narotama
const CACHE_VERSION = Date.now(); // Ganti setiap build/deploy
const CACHE_NAME = 'offline-survival-mahapala-v' + CACHE_VERSION;
const OFFLINE_URLS = [
  '/',
  '/offline',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/panduan-survival.pdf',
  '/ppgd.pdf',
  '/navigasi-darat.pdf',
  // Semua asset hasil build dari server/public/assets
  '/assets/backsound-BBcioZr7.mp3',
  '/assets/index-14VCckBn.css',
  '/assets/index-BGOrKOQc.js',
  '/assets/index-BJ_22dnw.css',
  '/assets/index-bWXjXQwU.js',
  '/assets/index-CfFcCRyT.css',
  '/assets/index-CVdhqAZu.js',
  '/assets/index-iazrxU6o.css',
  '/assets/index-UbqMtLHe.js',
  // Tambahkan asset lain jika ada
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
  // Paksa reload semua client agar cache sinkron
  self.clients.matchAll({ type: 'window' }).then(clients => {
    clients.forEach(client => client.navigate(client.url));
  });
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;
      // Fallback ke index.html hanya untuk SPA (mode navigate)
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
      // Untuk asset (js/css/png/dll), jangan fallback ke HTML, return error
      return Response.error();
    })
  );
});
