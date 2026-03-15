// Service Worker dla powiadomień push
const CACHE_NAME = "kursy-app-v1";
const urlsToCache = [
  "/",
  "/courses",
  "/dashboard",
  "/static/js/bundle.js",
  "/static/css/main.css",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

// Obsługa powiadomień push
self.addEventListener("push", (event) => {
  const options = {
    body: event.data?.text(),
    icon: "/icon-192x192.png",
    badge: "/badge-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "Otwórz kurs",
        icon: "/images/checkmark.png",
      },
      {
        action: "close",
        title: "Zamknij",
        icon: "/images/xmark.png",
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification("Kursy App", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  if (event.action === "explore") {
    event.waitUntil(
      clients.openWindow("/dashboard")
    );
  }
  
  event.notification.close();
});
