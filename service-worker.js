const CACHE_NAME = "multi-materia-v1";
const urlsToCache = [
  "index.html",
  "style.css",
  "manifest.json",
  "/", // importante para suportar refresh via rota
];

// Instala o cache
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Intercepta requisições
self.addEventListener("fetch", event => {
  const request = event.request;

  // Apenas lida com requisições GET
  if (request.method !== "GET") return;

  // Ignora chamadas para APIs dinâmicas
  const url = new URL(request.url);
  if (url.pathname.startsWith("/gemini-api") || url.pathname.startsWith("/youtube-api")) return;

  event.respondWith(
    caches.match(request).then(response => {
      return response || fetch(request);
    })
  );
});
