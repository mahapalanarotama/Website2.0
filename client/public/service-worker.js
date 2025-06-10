// Service Worker PWA Offline Survival Mahapala Narotama
const CACHE_NAME = 'offline-survival-mahapala-v1';
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
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;
      // Fallback ke index.html untuk SPA jika mode navigate
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
      // Fallback ke /offline jika asset tidak ditemukan
      return caches.match('/offline');
    })
  );
});
