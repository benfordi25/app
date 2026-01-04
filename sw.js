self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("fps-report-v1").then((cache) =>
      cache.addAll(["./", "./index.html", "./app.js", "./manifest.webmanifest"])
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
