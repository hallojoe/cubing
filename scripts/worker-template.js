const prefix = 'cubing-app:' + new URL('./', self.location.href).pathname + ':';
const cacheName = prefix + '__VERSION__';
const files = /* PRECACHE */ [];
const urls = new Set(files.map(path => new URL(path, self.location.href).href));
const shell = new URL('app/index.html', self.location.href);
const appPath = new URL('app', self.location.href).pathname;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache =>
    cache.addAll([...urls].map(url => new Request(url, { cache: 'reload' })))
  ));
});
self.addEventListener('message', event => {
  if (event.data === 'ACTIVATE') event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith(prefix) && name !== cacheName) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  const navigation = request.mode === 'navigate' &&
    [appPath, appPath + '/', shell.pathname].includes(url.pathname);
  if (!navigation && !urls.has(url.href)) return;
  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    return (await cache.match(navigation ? shell.href : url.href)) || fetch(request);
  })());
});
