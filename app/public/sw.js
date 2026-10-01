const CACHE_NAME = 'en-yakin-oed-v2';

const APP_SHELL = [
  '/',
  '/manifest.json',
  '/launchericon-192x192.png',
  '/launchericon-512x512.png'
];

// Service Worker kurulumu
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );

  self.skipWaiting();
});

// Service Worker aktifleşmesi
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );

  self.clients.claim();
});

// Cache / Network stratejisi
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Başarılı cevapları cache'e al
        if (response && response.status === 200) {
          const responseClone = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }

        return response;
      })
      .catch(() => {
        // İnternet yoksa cache'den getir
        return caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || caches.match('/');
        });
      })
  );
});

// ============================================
// PUSH NOTIFICATIONS
// ============================================

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data = {};

  try {
    data = event.data.json();
  } catch {
    data = {
      body: event.data.text()
    };
  }

  const title = data.title || 'YAKININIZDA ACIL DURUM VAR';

  const options = {
    body:
      data.body ||
      'Yaklasik mesafede acil ilk yardim gerekli!',

    icon:
      data.icon ||
      '/launchericon-192x192.png',

    badge:
      data.badge ||
      '/launchericon-192x192.png',

    tag:
      data.tag ||
      'emergency-' + Date.now(),

    requireInteraction: true,

    renotify: true,

    vibrate: [
      200,
      100,
      200,
      100,
      200,
      100,
      400
    ],

    actions: [
      {
        action: 'navigate',
        title: 'Olay Yerine Git'
      },
      {
        action: 'dismiss',
        title: 'Kapat'
      }
    ],

    data: data.data || {}
  };

  event.waitUntil(
    self.registration.showNotification(
      title,
      options
    )
  );
});

// ============================================
// NOTIFICATION CLICK
// ============================================

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;

  const data =
    event.notification.data || {};

  if (
    action === 'navigate' ||
    action === 'default'
  ) {
    const lat = data.lat;
    const lng = data.lng;

    if (lat && lng) {
      const mapsUrl =
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

      event.waitUntil(
        self.clients.openWindow(mapsUrl)
      );
    } else {
      event.waitUntil(
        self.clients.openWindow('/')
      );
    }
  }
});
