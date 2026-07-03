// Service Worker for Push Notifications
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data = {};
  try {
    data = event.data.json();
  } catch {
    data = { body: event.data.text() };
  }

  const title = data.title || 'YAKININIZDA ACIL DURUM VAR';
  const options = {
    body: data.body || 'Yaklasik mesafede acil ilk yardim gerekli!',
    icon: data.icon || '/favicon.ico',
    badge: data.badge || '/favicon.ico',
    tag: data.tag || 'emergency-' + Date.now(),
    requireInteraction: true,
    renotify: true,
    vibrate: [200, 100, 200, 100, 200, 100, 400],
    actions: [
      { action: 'navigate', title: 'Olay Yerine Git' },
      { action: 'dismiss', title: 'Kapat' },
    ],
    data: data.data || {},
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};

  if (action === 'navigate' || action === 'default') {
    const lat = data.lat;
    const lng = data.lng;

    if (lat && lng) {
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      event.waitUntil(self.clients.openWindow(mapsUrl));
    } else {
      event.waitUntil(self.clients.openWindow('/'));
    }
  }
});
