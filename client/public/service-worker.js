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

// Background GPS tracking variables
let gpsTrackingInterval = null;
let isGpsTrackingActive = false;

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification click received:', event.notification.tag);

  event.notification.close();

  if (event.action === 'view' || !event.action) {
    // Open/focus the app
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientList => {
        // Check if app is already open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes('/offline-standalone.html') && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if not found
        if (clients.openWindow) {
          return clients.openWindow('/offline-standalone.html');
        }
      })
    );
  } else if (event.action === 'stop') {
    // Stop GPS tracking
    isGpsTrackingActive = false;
    stopBackgroundGpsTracking();

    // Notify clients to update UI
    clients.matchAll().then(clientList => {
      clientList.forEach(client => {
        client.postMessage({
          type: 'GPS_STOP_FROM_NOTIFICATION'
        });
      });
    });
  }
});

// Background sync for GPS data
self.addEventListener('sync', event => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'gps-background-sync') {
    event.waitUntil(syncOfflineGpsData());
  }
});

async function syncOfflineGpsData() {
  try {
    console.log('[SW] Syncing offline GPS data...');

    // Get offline queue from storage
    const offlineQueue = await getStoredData('gps_offline_queue');
    if (!offlineQueue || offlineQueue.length === 0) {
      console.log('[SW] No offline GPS data to sync');
      return;
    }

    // Try to sync each item
    let syncedCount = 0;
    for (const data of offlineQueue) {
      try {
        await syncGpsToFirestore(data);
        syncedCount++;
      } catch (error) {
        console.error('[SW] Error syncing GPS item:', error);
      }
    }

    if (syncedCount > 0) {
      // Clear synced data
      await storeData('gps_offline_queue', []);
      console.log(`[SW] Synced ${syncedCount} GPS records`);

      // Send success notification
      await self.registration.showNotification('GPS Tracker - Sync Complete', {
        body: `${syncedCount} lokasi berhasil disinkronkan ke server`,
        icon: '/OfflineApp.png',
        badge: '/OfflineApp.png',
        tag: 'sync-complete'
      });
    }
  } catch (error) {
    console.error('[SW] Error during background sync:', error);
  }
}

// Fetch - strategi cache-first untuk /offline dan offline-first untuk lainnya
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET dan non-HTTP requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    (async () => {
      // Untuk route /offline, prioritaskan cache untuk akses offline
      if (url.pathname === '/offline') {
        try {
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match('/offline-standalone.html');

          if (cachedResponse) {
            console.log('[SW] 📦 Serving offline page from cache');
            return cachedResponse;
          }

          // Jika tidak ada di cache, coba network
          const response = await fetch(event.request);
          if (response.ok) {
            cache.put('/offline-standalone.html', response.clone());
          }
          return response;
        } catch (error) {
          // Fallback jika semua gagal
          return new Response(`
            <!DOCTYPE html>
            <html><head><title>Offline Mode</title></head>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
              <h1>🏕️ Mode Offline</h1>
              <p>Aplikasi survival tersedia offline</p>
              <button onclick="location.reload()">Muat Ulang</button>
            </body></html>
          `, { headers: { 'Content-Type': 'text/html' } });
        }
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

// Message handler untuk status check dan GPS background
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

  // Handle GPS background tracking
  if (event.data && event.data.type === 'START_GPS_BACKGROUND') {
    isGpsTrackingActive = true;
    startBackgroundGpsTracking(event.data.userName);
    event.source.postMessage({ type: 'GPS_BACKGROUND_STARTED' });
  }

  if (event.data && event.data.type === 'STOP_GPS_BACKGROUND') {
    isGpsTrackingActive = false;
    stopBackgroundGpsTracking();
    event.source.postMessage({ type: 'GPS_BACKGROUND_STOPPED' });
  }
});

// Background GPS tracking functions
function startBackgroundGpsTracking(userName) {
  console.log('[SW] 🌍 Starting background GPS tracking for:', userName);

  if (gpsTrackingInterval) {
    clearInterval(gpsTrackingInterval);
  }

  gpsTrackingInterval = setInterval(async () => {
    if (!isGpsTrackingActive) return;

    try {
      // Request location in background
      const position = await getCurrentPositionPromise();
      const gpsData = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        time: new Date().toLocaleString(),
        nama: userName,
        online: navigator.onLine,
        background: true
      };

      // Store locally first
      await storeGpsDataLocally(gpsData);

      // Try to sync if online
      if (navigator.onLine) {
        try {
          await syncGpsToFirestore(gpsData);
        } catch (error) {
          console.log('[SW] Will sync GPS data later when online');
        }
      }

      // Send to client if available
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'GPS_UPDATE',
          data: gpsData
        });
      });

    } catch (error) {
      console.error('[SW] Background GPS error:', error);
    }
  }, 30000); // 30 seconds interval untuk background
}

function stopBackgroundGpsTracking() {
  console.log('[SW] 🛑 Stopping background GPS tracking');
  if (gpsTrackingInterval) {
    clearInterval(gpsTrackingInterval);
    gpsTrackingInterval = null;
  }
  isGpsTrackingActive = false;

  // Send stop notification
  try {
    self.registration.showNotification('GPS Tracker - Stopped', {
      body: 'Background GPS tracking telah dihentikan',
      icon: '/OfflineApp.png',
      badge: '/OfflineApp.png',
      tag: 'gps-stopped'
    });
  } catch (error) {
    console.log('[SW] Cannot send stop notification:', error);
  }
}

function getCurrentPositionPromise() {
  return new Promise((resolve, reject) => {
    if (!self.navigator || !self.navigator.geolocation) {
      reject(new Error('Geolocation not supported in service worker context'));
      return;
    }

    self.navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 }
    );
  });
}

async function storeGpsDataLocally(data) {
  try {
    const stored = localStorage.getItem('gps_tracker_queue') || '[]';
    const queue = JSON.parse(stored);
    queue.push(data);
    localStorage.setItem('gps_tracker_queue', JSON.stringify(queue));

    // Also update main GPS track
    const mainTrack = localStorage.getItem('gps_track') || '[]';
    const track = JSON.parse(mainTrack);
    track.push(data);
    localStorage.setItem('gps_track', JSON.stringify(track));
  } catch (error) {
    console.error('[SW] Error storing GPS data locally:', error);
  }
}

async function syncGpsToFirestore(data) {
  // This will be handled by the main app's Firebase functions
  const response = await fetch('/api/gps-tracker', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('Failed to sync GPS data');
  }
}

// Helper functions for local storage (IndexedDB alternative)
async function getStoredData(key) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

async function storeData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error storing data for key "${key}":`, error);
  }
}

// Original handleBackgroundGpsSync function, now replaced by syncOfflineGpsData
// async function handleBackgroundGpsSync() { ... }

// Original getStoredGpsData, now replaced by getStoredData
// async function getStoredGpsData() { ... }

// Original clearStoredGpsData, now replaced by storeData with empty array
// async function clearStoredGpsData() { ... }