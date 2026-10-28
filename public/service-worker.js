const CACHE_NAME = 'explain-ai-static-v2';

self.addEventListener('install', (event) => {
  const appShell = new URL('./', self.registration.scope).toString();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        await cache.add(appShell);
        const manifestUrl = new URL('./precache-manifest.json', self.registration.scope).toString();
        const manifestResponse = await fetch(manifestUrl);
        if (!manifestResponse.ok) return;
        const assets = await manifestResponse.json();
        if (!Array.isArray(assets)) throw new Error('Offline asset manifest must contain a list.');
        const urls = assets.map((asset) => new URL(asset, self.registration.scope).toString());
        await cache.addAll(urls);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names
        .filter((name) => name.startsWith('explain-ai-static-') && name !== CACHE_NAME)
        .map((name) => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  const scopePath = new URL(self.registration.scope).pathname;
  if (request.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith(scopePath)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    } catch {
      const cached = await cache.match(request);
      if (cached) return cached;
      if (request.mode === 'navigate') {
        const appShell = await cache.match(new URL('./', self.registration.scope).toString());
        if (appShell) return appShell;
      }
      return Response.error();
    }
  })());
});
