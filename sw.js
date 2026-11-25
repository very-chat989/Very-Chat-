/* Very Chat — service worker
 * الاستراتيجية: الملفات بتتفتح فورًا من الكاش وبتتحدّث في الخلفية (stale-while-revalidate)،
 * ومكتبات Firebase (نسخة ثابتة) بتتخزّن مرة واحدة وتتقدّم من الكاش.
 * لما تعدّل أي ملف: غيّر رقم BUILD هنا وفي index.html (meta vc-build و ?v= و التعليق الأخير). */
"use strict";
const BUILD = "20261125-114";
const PREFIX = "verychat-";
const CACHE = PREFIX + BUILD;
const V = "?v=" + BUILD;
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "style.css" + V, "core.js" + V, "rooms.js" + V, "media.js" + V, "app.js" + V];
const FB = ["app", "auth", "firestore", "messaging"].map(n => "https://www.gstatic.com/firebasejs/10.12.2/firebase-" + n + "-compat.js");

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
  if (u.origin === location.origin && u.searchParams.has("_")) return;   // فحص التحديث: يروح للنت مباشرة ومايتخزّنش في الكاش

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

// الاسم اللي إنت مسجّله لصاحبك (مش اسمه الأصلي): الإشعار بييجي باسم المُرسِل نفسه، فبنبدّله من الأسماء المحفوظة على الجهاز (IndexedDB)
async function dmNick(tag) {
  try {
    if (!/^dm_/.test(tag)) return "";
    const mem = tag.slice(3).split("_");
    const db = await new Promise(res => { try { const q = indexedDB.open("vc-media"); q.onupgradeneeded = () => { try { q.transaction.abort(); } catch (_) {} }; q.onsuccess = () => res(q.result); q.onerror = q.onblocked = () => res(null); } catch (_) { res(null); } });
    if (!db) return "";
    if (!db.objectStoreNames.contains("m")) { db.close(); return ""; }
    const val = k => new Promise(res => { try { const r = db.transaction("m").objectStore("m").get(k); r.onsuccess = () => res(r.result); r.onerror = () => res(null); } catch (_) { res(null); } });
    let nick = "";
    for (const me of mem) {
      const r = await val("nick:" + me), peer = mem.find(x => x !== me);
      if (r && r.s && peer) { try { const m = JSON.parse(r.s); if (m && m[peer]) { nick = String(m[peer]); break; } } catch (_) {} }
    }
    db.close(); return nick;
  } catch (_) { return ""; }
}
// بدّل الاسم الأصلي اللي جوه نص الإشعار باسمك المعدّل (خريطة saveNickByName في التطبيق)
async function nickSwap(text) {
  try {
    const db = await new Promise(res => { try { const q = indexedDB.open("vc-media"); q.onupgradeneeded = () => { try { q.transaction.abort(); } catch (_) {} }; q.onsuccess = () => res(q.result); q.onerror = q.onblocked = () => res(null); } catch (_) { res(null); } });
    if (!db) return text;
    if (!db.objectStoreNames.contains("m")) { db.close(); return text; }
    const all = await new Promise(res => { try { const r = db.transaction("m").objectStore("m").getAll(IDBKeyRange.bound("nick:~orig:", "nick:~orig:\uffff")); r.onsuccess = () => res(r.result || []); r.onerror = () => res([]); } catch (_) { res([]); } });
    db.close();
    const by = {}; all.forEach(r => { try { Object.assign(by, JSON.parse(r.s)); } catch (_) {} });
    for (const o of Object.keys(by).sort((a, b) => b.length - a.length)) if (o && text.includes(o)) { text = text.replace(o, by[o]); break; }
    return text;
  } catch (_) { return text; }
}
// إشعارات الـ Push (من Firebase Cloud Messaging): بتوصل والتطبيق مقفول
self.addEventListener("push", e => {
  let p = {}; try { p = e.data ? e.data.json() : {}; } catch (_) { try { p = { data: { body: e.data.text() } }; } catch (__) {} }
  const d = p.data || p.notification || p || {};
  let title = String(d.title || "Very Chat"); let body = String(d.body || ""), tag = String(d.tag || "vc");
  e.waitUntil((async () => {
    const cs = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    if (cs.some(c => c.visibilityState === "visible")) return;
    { const nk = await dmNick(tag); if (nk) title = "💬 " + nk; else { body = await nickSwap(body); } }          // التطبيق مفتوح قدامك، مش محتاج إشعار
    const ex = await self.registration.getNotifications({ tag });
    const bt = n => (n.data && n.data.title) || n.title, bb = n => (n.data && n.data.body) || n.body;
    if (ex.some(n => bt(n) === title && bb(n) === body && Date.now() - n.timestamp < 20000)) return;   // نفس الإشعار اتعرض لسه من التطبيق نفسه
    // زي واتساب: أول رسالة بتنبّه، والباقي بيتحدّث في نفس الإشعار من غير صوت (مع عدد الرسايل) لحد ما تفتح المحادثة
    const count = ex.length ? ex.reduce((m, n) => Math.max(m, (n.data && n.data.count) || 1), 0) + 1 : 1;
    await self.registration.showNotification(count > 1 ? title + " (" + count + ")" : title, { body, tag, renotify: false, icon: "icon-192.png", badge: "icon-192.png", dir: "auto", lang: "ar", data: { tag, title, body, count } });
  })());
});

self.addEventListener("notificationclick", e => {
  const tag = e.notification.tag; e.notification.close(); if (tag === "vc-up") { e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(cs => cs.length ? (cs.find(x => x.visibilityState === "visible") || cs[0]).focus() : self.clients.openWindow("./"))); return; }
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(cs => {
    if (!cs.length) return self.clients.openWindow("./?open=" + encodeURIComponent(tag || ""));
    const c = cs.find(x => x.visibilityState === "visible") || cs[0];
    c.postMessage({ type: "open", tag });
    return c.focus();
  }));
});
