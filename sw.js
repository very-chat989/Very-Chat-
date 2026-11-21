// Very Chat service worker: stale-while-revalidate (opens instantly from cache, updates in background)
const CACHE = "verychat-v21", SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png"];
const FB = ["app", "auth", "firestore", "app-check"].map(n => "https://www.gstatic.com/firebasejs/10.12.2/firebase-" + n + "-compat.js");
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled([...SHELL.map(u => c.add(u)), ...FB.map(u => fetch(u, { mode: "no-cors" }).then(r => c.put(u, r)))])).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  const ext = u.hostname === "www.gstatic.com" && u.pathname.startsWith("/firebasejs/");
  if (r.method !== "GET" || (u.origin !== location.origin && !ext)) return;
  if (ext) { e.respondWith(caches.match(r.url).then(h => h || fetch(r).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r.url, cp)).catch(() => {}); return res; }))); return; }
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
