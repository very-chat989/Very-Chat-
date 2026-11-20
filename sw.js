// Very Chat service worker: network-first (always the newest page), cached copy only when offline
const CACHE = "verychat-v4";
self.addEventListener("install", e => { self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(fetch(r, { cache: "no-cache" }).then(res => { if (res && res.ok) { const c = res.clone(); caches.open(CACHE).then(k => k.put(r, c)).catch(() => {}); } return res; }).catch(() => caches.match(r).then(m => m || caches.match("index.html"))));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(cs => cs.length ? cs[0].focus() : self.clients.openWindow("./")));
});
