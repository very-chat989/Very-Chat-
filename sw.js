// Very Chat service worker: stale-while-revalidate (opens instantly from cache, updates in background)
const CACHE = "verychat-v18", SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(SHELL.map(u => c.add(u)))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(r, { ignoreSearch: r.mode === "navigate" }) || (r.mode === "navigate" ? await c.match("index.html") : null);
    const net = fetch(r, { cache: "no-cache" }).then(res => { if (res && res.ok) c.put(r, res.clone()).catch(() => {}); return res; });
    if (hit) { net.catch(() => {}); return hit; }
    return net.catch(() => Response.error());
  }));
});
self.addEventListener("notificationclick", e => {
  const tag = e.notification.tag; e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(cs => {
    if (!cs.length) return self.clients.openWindow("./");
    cs[0].postMessage({ type: "open", tag }); return cs[0].focus();
  }));
});
