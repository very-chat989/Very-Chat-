/* Very Chat — service worker
 * الاستراتيجية: الملفات بتتفتح فورًا من الكاش وبتتحدّث في الخلفية (stale-while-revalidate)،
 * ومكتبات Firebase (نسخة ثابتة) بتتخزّن مرة واحدة وتتقدّم من الكاش.
 * لما تعدّل أي ملف: غيّر رقم BUILD هنا وفي index.html (meta vc-build و ?v= و التعليق الأخير). */
"use strict";
const BUILD = "20261122-13";
const PREFIX = "verychat-";
const CACHE = PREFIX + BUILD;
const V = "?v=" + BUILD;
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "style.css" + V, "app.js" + V];
const FB = ["app", "auth", "firestore", "app-check"].map(n => "https://www.gstatic.com/firebasejs/10.12.2/firebase-" + n + "-compat.js");

const isFirebaseSDK = u => u.hostname === "www.gstatic.com" && u.pathname.startsWith("/firebasejs/");

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.allSettled([
      // cache:"reload" علشان ما نخزّنش نسخة قديمة من كاش المتصفح
      ...SHELL.map(u => c.add(new Request(u, { cache: "reload" }))),
      ...FB.map(u => fetch(u, { mode: "no-cors" }).then(r => c.put(u, r)))
    ]);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    // نمسح كاشات Very Chat القديمة بس، ومنلمسش أي كاش تاني على نفس الدومين
    const ks = await caches.keys();
    await Promise.all(ks.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  const ext = isFirebaseSDK(u);
  if (r.method !== "GET" || (u.origin !== location.origin && !ext)) return;
  if (r.headers.has("range")) return;            // الفيديو/الصوت: خلّي المتصفح يتعامل معاها
  if (u.origin === location.origin && u.pathname.endsWith("/sw.js")) return;

  // مكتبات Firebase: من الكاش الأول (الرابط فيه رقم النسخة)
  if (ext) {
    e.respondWith((async () => {
      const hit = await caches.match(r.url);
      if (hit) return hit;
      const res = await fetch(r);
      if (res && (res.ok || res.type === "opaque")) {
        const cp = res.clone();
        e.waitUntil(caches.open(CACHE).then(c => c.put(r.url, cp)).catch(() => {}));
      }
      return res;
    })());
    return;
  }

  // باقي الملفات: من الكاش فورًا + تحديث في الخلفية
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const nav = r.mode === "navigate";
    const hit = (await c.match(r, { ignoreSearch: nav })) || (nav ? await c.match("index.html") : null);
    const net = fetch(r, { cache: "no-cache" }).then(res => {
      if (res && res.ok && res.type === "basic") return c.put(r, res.clone()).then(() => res, () => res);
      return res;
    });
    if (hit) {
      e.waitUntil(net.catch(() => {}));          // يخلّي الـ SW شغّال لحد ما التحديث يخلص
      return hit;
    }
    try { return await net; }
    catch (_) {
      return nav ? new Response("مفيش اتصال بالنت — افتح التطبيق تاني لما النت يرجع.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }) : Response.error();
    }
  })());
});

self.addEventListener("notificationclick", e => {
  const tag = e.notification.tag; e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(cs => {
    if (!cs.length) return self.clients.openWindow("./");
    const c = cs.find(x => x.visibilityState === "visible") || cs[0];
    c.postMessage({ type: "open", tag });
    return c.focus();
  }));
});
