/* Very Chat — 1/4: الأساسيات (إعدادات Firebase، الدردشة الخاصة، القوايم، الرسايل، الأعضاء، الإشعارات) */
// ═══ إعدادات Firebase: الصق هنا القيم من Firebase Console ← Project settings ← Your apps ← Web app ═══
// App Check: حط مفتاح reCAPTCHA v3 هنا بعد ما تفعّله من Firebase → App Check (فاضي = متوقف)
// الإشعارات (Push): الصق هنا رابط الـ Worker ومفتاح VAPID (Firebase ← Project settings ← Cloud Messaging ← Web Push certificates). فاضي = متوقفة
const PUSH_URL = "https://verychat-push.adhamemaad14.workers.dev";
const VAPID_KEY = "BLUhjxf71Ma_N_REq1eyVUo1-Pwl6j96_Cmkh05pvz2l_K3fnXeyPTsKp6AiL0xsbfHPKu1vzpVtr0OGDPk1iu0";
const APPCHECK_KEY = "";
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyA2G05p10GHyhFR8hOfdx0f__pYRw8fG9s",
  authDomain: "very-chat-c7e65.firebaseapp.com",
  projectId: "very-chat-c7e65",
  messagingSenderId: "351423421163",
  appId: "1:351423421163:web:f61b829b9b65deb38abcae"
};
const $ = id => document.getElementById(id);
// ───── انتقال ناعم عند القفل/الرجوع: بدل ما الشاشة تختفي فجأة بتتحرّك وتتلاشى ثم تتقفل ─────
(() => {
  const HS = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "hidden"); if (!HS || !HS.set) return;
  const mq = window.matchMedia ? matchMedia("(prefers-reduced-motion:reduce)") : { matches: false };
  ["sheet", "msheet", "drawer", "rinfo", "reqView", "pview", "lb"].forEach(id => {
    const el = document.getElementById(id); if (!el) return; let t = 0;
    const fin = () => { t = 0; el.classList.remove("vc-out"); HS.set.call(el, true); };
    Object.defineProperty(el, "hidden", {
      configurable: true,
      get() { return HS.get.call(el) || !!t; },
      set(v) {
        if (v) { if (HS.get.call(el) || t) return; if (mq.matches || !el.isConnected) { HS.set.call(el, true); return; } el.classList.add("vc-out"); t = setTimeout(fin, 230); }
        else { clearTimeout(t); t = 0; el.classList.remove("vc-out"); HS.set.call(el, false); }
      }
    });
  });
})();
// أرقام عربية — لازم تكون عامة: كانت معرّفة جوه محرر الوسائط بس، فالاستطلاع والمستندات والتثبيت المتعدد كانوا بيفشلوا في الرسم
const arN = n => String(n).replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[d]);
// ─── تحقّق صارم من أي مصدر ميديا/لون جاي من مستخدم تاني (بيمنع SVG وحقن CSS وتسريب الـ IP عبر url()) ───
const BAD_CH = /[()"'\\\s<>]/;
const okSrc = (u, k) => { u = String(u || ""); if (u.length > 3e7 || BAD_CH.test(u)) return false; if (u.startsWith("blob:")) return true; if (!u.startsWith("data:" + k + "/")) return false; return !(k === "image" && /^data:image\/svg/i.test(u)); };
const safeCol = c => { c = String(c || "").trim(); return /^#[0-9a-fA-F]{3,8}$/.test(c) || /^(rgb|hsl)a?\([0-9.,%\s\/-]{1,40}\)$/i.test(c) ? c : ""; };
const CHAR_URLS = new Set();   // روابط شخصيات الشلة الجاهزة (SVG من صنع التطبيق نفسه): مسموحة بالمطابقة التامة بس
const okPhoto = u => { u = String(u || ""); if (CHAR_URLS.has(u)) return true; if (u.length > 3e6 || BAD_CH.test(u)) return false; return /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(u) || /^https:\/\/[a-z0-9.-]+\.googleusercontent\.com\//i.test(u); };
const logo = id => `<svg viewBox='0 0 100 100'><defs><linearGradient id='${id}' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#2cc4a9'/><stop offset='1' stop-color='#0f8f7a'/></linearGradient></defs><rect width='100' height='100' rx='26' fill='url(#${id})'/><path d='M50 18c-18 0-32 12-32 28 0 8 4 15 10 20l-3 14 15-7c3 1 6 1 10 1 18 0 32-12 32-28S68 18 50 18z' fill='#fff'/><path d='M36 38l14 22 14-22' fill='none' stroke='#0f8f7a' stroke-width='8' stroke-linecap='round' stroke-linejoin='round'/></svg>`;
$("sLogo").innerHTML = logo("lgS"); $("dLogo").innerHTML = logo("lgD");
const draftKey = r => "vc_draft_" + r;
$("inp").addEventListener("input", () => { try { if (editingId) return; const v = $("inp").value; v ? localStorage.setItem(draftKey(room), v) : localStorage.removeItem(draftKey(room)); } catch (_) {} });
$("f").addEventListener("submit", () => setTimeout(() => { try { if (!$("inp").value) localStorage.removeItem(draftKey(room)); } catch (_) {} }, 50));
const SVG_MIC = '<svg viewBox="0 0 24 24"><path d="M12 15a3.5 3.5 0 0 0 3.5-3.5v-6a3.5 3.5 0 0 0-7 0v6A3.5 3.5 0 0 0 12 15zm6-3.5a.9.9 0 0 0-1.8 0 4.2 4.2 0 0 1-8.4 0 .9.9 0 0 0-1.8 0 6 6 0 0 0 5.1 5.9V20H9.9a.9.9 0 0 0 0 1.8h4.2a.9.9 0 0 0 0-1.8h-1.2v-2.6a6 6 0 0 0 5.1-5.9z"/></svg>',
  SVG_SEND = '<svg viewBox="0 0 24 24"><path d="M3.4 20.4l17.5-7.5a1 1 0 0 0 0-1.8L3.4 3.6a1 1 0 0 0-1.4 1.2L4 10.5l9 1.5-9 1.5-2 5.7a1 1 0 0 0 1.4 1.2z"/></svg>',
  SVG_CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  SVG_SMILE = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5"/><path d="M8 14.2c1 1.6 2.4 2.3 4 2.3s3-.7 4-2.3"/><circle cx="9" cy="9.8" r=".7" fill="currentColor"/><circle cx="15" cy="9.8" r=".7" fill="currentColor"/></svg>',
  SVG_KB = '<svg viewBox="0 0 24 24"><rect x="2.5" y="5.5" width="19" height="13" rx="3"/><path d="M6.5 10h.01M10 10h.01M14 10h.01M17.5 10h.01M7.5 14.5h9"/></svg>',
  SVG_CLIP = '<svg viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>',
  SVG_CLOCK = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/></svg>',
  SVG_CAM = '<svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>';
$("emoBtn").innerHTML = SVG_SMILE; $("plusBtn").innerHTML = SVG_CLIP; $("camBtn").innerHTML = SVG_CAM; $("micBtn").innerHTML = SVG_MIC; $("sendBtn").innerHTML = SVG_SEND;
const DI = {
  inbox: '<svg viewBox="0 0 24 24"><path d="M3 13l2.6-7.2A2 2 0 0 1 7.5 4.5h9a2 2 0 0 1 1.9 1.3L21 13v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 13h5l1 2.5h6l1-2.5h5"/></svg>',
  key: '<svg viewBox="0 0 24 24"><circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3M14 9l2 2"/></svg>',
  invite: '<svg viewBox="0 0 24 24"><circle cx="9.5" cy="8" r="3.8"/><path d="M2.5 20c.8-3.6 3.5-5.5 7-5.5s6.2 1.9 7 5.5M19 8v6M16 11h6"/></svg>',
  spk: '<svg viewBox="0 0 24 24"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>',
  spkoff: '<svg viewBox="0 0 24 24"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></svg>',
  bell: '<svg viewBox="0 0 24 24"><path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15z"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>',
  belloff: '<svg viewBox="0 0 24 24"><path d="M6 17V11a6 6 0 0 1 9.5-4.9M18 11v6l1.5 2H8M10 21a2 2 0 0 0 4 0M3 3l18 18"/></svg>'
};
$("dReq").firstChild.innerHTML = DI.inbox; $("dFind").firstChild.innerHTML = DI.key; $("dInvite").firstChild.innerHTML = DI.invite;
let _dtT = 0; function dtoast(t) { const e = $("dToast"); e.textContent = t; e.hidden = false; clearTimeout(_dtT); _dtT = setTimeout(() => { e.hidden = true; }, 1800); }
$("dClose").onclick = () => closeDrawer();
var _spMin = false, _spMsg = false;
function hideSplash() { const s = $("splash"); if (!s || s._h) return; s._h = 1; s.classList.add("out"); setTimeout(() => s.remove(), 450); }
setTimeout(() => { _spMin = true; if (_spMsg) hideSplash(); }, 350); setTimeout(hideSplash, 6000);
const EMOJIS = ["😀","😎","🤓","🥳","😍","🤩","😂","🥹","😴","🤠","👻","🤖","👽","💀","🐱","🐶","🦁","🐼","🦊","🐯","🐸","🐵","🦄","🐧","🦅","🐢","🐬","🦋","🚀","⚽","🏀","🎮","🎧","🎸","🌶️","🍕","🍔","🔥","⭐","👑","💎","❤️","🌹","🌙"];
const COLORS = ["#0f8f7a","#2f6fed","#8a4fe0","#e0507a","#e08a2f","#c9a400","#3f8f3f","#5b6b78"];
let confirmDel = false;
async function delRoom() {
  const id = room;
  try {
    const s = await db.collection("msgs").where("room", "==", id).get();
    await Promise.all(s.docs.map(d => db.collection("msgs").doc(d.id).delete()));
    await dropCode(rooms.find(x => x.id === id)); await db.collection("rooms").doc(id).delete();
    openRoom("general");
  } catch (e) { setStatus("ماقدرتش أحذف الغرفة."); }
}
let db = null, myId = null, room = "general", rooms = [], profiles = {}, unsub = null, creating = false, lastList = [], draft = null, loaded = false;
/* Very Chat — الدردشة الخاصة (DM) */
// ───── الدردشة الخاصة (DM): كل اتنين ليهم محادثة واحدة id ثابت، وبيستخدموا بروفايلهم الحقيقي ─────
let dms = {}, dmFirst = true; const dmDone = {};
const isDM = id => typeof id === "string" && id.startsWith("dm_");
const dmKey = (a, b) => "dm_" + [a, b].sort().join("_");
const dmMembers = id => id.slice(3).split("_");
const dmPeerOf = id => dmMembers(id).find(u => u !== myId) || null;
const msgCol = rid => db.collection(isDM(rid) ? "dmsgs" : "msgs");
const mBase = rid => isDM(rid) ? { room: rid, members: dmMembers(rid) } : { room: rid };
const dmRoom = id => { const p = profiles[dmPeerOf(id)] || {}; return { id, dm: true, name: pname(dmPeerOf(id)), emoji: p.emoji, color: p.color, photo: p.photo, blocked: (dms[id] || {}).blockedBy || [], pinned: (dms[id] || {}).pinned, pins: (dms[id] || {}).pins }; };
function flash(t) { flashSnd(t); setStatus(t); setTimeout(() => { if ($("status").textContent === t) setStatus(""); }, 3500); }
const dmEstablished = d => !!d && (!!d.acc || (!!d.last && !d.req));
function sendDoc(doc) { const p = sendDoc0(doc); p.then(() => pushMsg(doc), () => {}); return p; }
async function sendDoc0(doc) {
  if (!isDM(doc.room)) return db.collection("msgs").add(doc);
  { const g = dms[doc.room]; if (!dmEstablished(g) && !(g && g.req && g.req !== myId && !dmCancelled(g))) { const x = new Error("⏳ مينفعش تبعت رسايل لحد ما يوافق على طلب المحادثة"); x.custom = true; throw x; } }
  const rp = db.collection("dmsgs").add(doc), r = navigator.onLine === false ? rp : await rp, d0 = dms[doc.room], ex = !d0 && !dmFirst ? { req: myId } : d0 && d0.req && d0.req !== myId && !d0.acc ? { acc: true } : {};
  db.collection("dms").doc(doc.room).set({ members: doc.members, ...ex, last: { uid: myId, ts: doc.ts, text: mtext(doc).slice(0, 60) }, unread: { [dmPeerOf(doc.room)]: FV().increment(1) } }, { merge: true }).catch(() => {});
  return r;
}
// في الغرف اللي فيها شخصيات مستعارة مينفعش نكشف الهوية الحقيقية؛ العام والخاص بس
const canDMFrom = (u, rid) => { rid = rid || room; if (rid === "general" || isDM(rid)) return true; const rp = (rprofiles[u] || {})[rid]; return !(rp && !rp.skip); };
function peerTap(u, rid) {
  if (!u || u === myId || selMode) return;
  if (!canDMFrom(u, rid)) { flash("🎭 ده بشخصية مستعارة في الغرفة دي، مينفعش تكلمه خاص من هنا"); return; }
  openPeer(u);
}
async function openDM(u) {
  if (!db || !u || u === myId) return; closeDrawer(); closeInfo(); $("msheet").hidden = true;
  const key = dmKey(myId, u), d = dms[key];
  if (dmEstablished(d)) { openRoom(key); return; }
  if (dmFirst) { flash("استنى لحظة وجرّب تاني"); return; }
  if (pendingIn(d)) { openReqs(); return; }
  if (d && d.req === myId && !d.acc && d.last && ((d.cleared || {})[u] || 0) < d.last.ts && dmClearedAt(d) < d.last.ts) { flash("⏳ طلبك لسه معلّق، استنى موافقته"); return; }
  try {
    await db.collection("dms").doc(key).set({ members: [myId, u].sort(), req: myId, last: { uid: myId, ts: Date.now(), text: "👋 طلب محادثة" }, unread: { [u]: FV().increment(1) } }, { merge: true });
    pushTo(u, "dm_req", myName(), "");
    reqFlash("✓ اتبعت طلب المحادثة، هيوصلك إشعار أول ما يوافق");
  } catch (e) { flash(errMsg(e)); }
}
function openPeer(u) {
  if (!u || u === myId) return;
  const p = profiles[u] || {}, key = dmKey(myId, u), blocked = ((dms[key] || {}).blockedBy || []).includes(myId), c = $("mcard"); c.textContent = "";
  const head = el("div", "mprev"); head.style.cssText += ";display:flex;align-items:center;gap:12px";
  const a = avatar(p); a.style.cssText += ";width:56px;height:56px;font-size:28px";
  const t = el("div"), nm = el("b", "", pname(u)); nm.style.display = "block"; t.append(nm); head.append(a, t); c.append(head);
  const go = el("button", "send", "💬 دردشة خاصة"); go.type = "button"; go.style.padding = "13px"; go.onclick = () => openDM(u);
  const bl = el("button", "ghost", blocked ? "✅ إلغاء الحظر" : "🚫 حظر (مايقدرش يكلمك خاص)"); bl.type = "button";
  bl.onclick = async () => {
    if (!blocked && !bl.dataset.ok) { bl.dataset.ok = "1"; bl.textContent = "اضغط تاني للتأكيد"; return; }
    try { await db.collection("dms").doc(key).set({ members: [myId, u].sort(), blockedBy: blocked ? AR(myId) : AU(myId) }, { merge: true }); $("msheet").hidden = true; flash(blocked ? "✓ اتلغى الحظر" : "🚫 اتحظر"); } catch (e) { flash(errMsg(e)); }
  };
  c.append(go, bl); $("msheet").hidden = false;
}
function dmRow(d) {
  const u = dmPeerOf(d.id), p = profiles[u] || {}, row = el("button", "rrow" + (d.id === room ? " on" : "")); row.type = "button"; row.style.setProperty("--rc", safeCol(p.color) || "#5b6b78");
  const tx = el("div", "rt"), sb = el("small"); sb.dir = "rtl";
  const hid = !!d.last && d.last.ts <= dmClearedAt(d); if (hid) row.classList.add("hid");
  sb.textContent = hid ? "🧹 مخفية من القائمة · اضغط للمراسلة" : ((d.blockedBy || []).length ? "🚫 " : "") + (d.req === myId && !d.acc ? "⏳ " : "") + (d.last ? (d.last.uid === myId ? "أنت: " : "") + d.last.text : "");
  tx.append(el("b", "", pname(u)), sb); row.append(avatar(p), tx);
  const un = unreadOf(d.id); if (un) row.append(el("span", "bdg", un > 99 ? "99+" : String(un)));
  let tm, fired = false;
  row.onclick = () => { if (fired) { fired = false; return; } openDM(u); };
  const go = () => { fired = false; tm = setTimeout(() => { fired = true; openDMMenu(d); }, 500); }, stop = () => clearTimeout(tm);
  ["touchstart", "mousedown"].forEach(ev => row.addEventListener(ev, go, { passive: true }));
  ["touchmove", "touchend", "touchcancel", "mouseup", "mouseleave"].forEach(ev => row.addEventListener(ev, stop, { passive: true }));
  row.addEventListener("contextmenu", e => { e.preventDefault(); stop(); fired = true; openDMMenu(d); });
  return row;
}
const dmWipeAt = d => (d && d.wipeTs) || 0;   // وقت «حذف المحادثة للطرفين»: أي رسالة قبله مخفية عند الاتنين
const dmClearedAt = d => Math.max(((d && d.cleared) || {})[myId] || 0, dmWipeAt(d));
// ───── ✏️ تعديل الاسم: اسم خاص بيك انت بس (زي واتساب وتليجرام)، متخزن على جهازك ومبيوصلش لصاحبك ─────
let _nk = null, _nkFor = null;
const nickMap = () => { if (_nkFor !== myId || !_nk) { _nkFor = myId; try { _nk = JSON.parse(localStorage.getItem("vc_nick_" + myId) || "{}") || {}; } catch (_) { _nk = {}; } } return _nk; };
const nickOf = u => (u && u !== myId && nickMap()[u]) || "";
// بنحفظ الأسماء في 3 أماكن: localStorage + IndexedDB + Firestore (مستند خاص بيك: nicks/{uid}) علشان ماترجعش تاني
const saveNicks = () => {
  const uid = myId; if (!uid) return; const m = nickMap(), str = JSON.stringify(m), ts = Date.now();
  try { localStorage.setItem("vc_nick_" + uid, str); localStorage.setItem("vc_nickts_" + uid, String(ts)); } catch (_) {}
  try { idbTx("readwrite", st => st.put({ s: str, ts }, "nick:" + uid)).catch(() => {}); } catch (_) {}
  saveNickByName();
  try { if (db) db.collection("nicks").doc(uid).set({ m, ts }).catch(e => console.warn("nicks sync:", e && e.code)); } catch (_) {}
};
// خريطة «الاسم الأصلي ← اسمك المعدّل» للـ service worker: إشعارات الـ Push بتيجي باسم المُرسِل الأصلي فبنبدّله هناك
const saveNickByName = () => {
  try {
    const m = nickMap(), by = {}, bad = new Set();
    Object.keys(m).forEach(u => { const o = ((profiles[u] || {}).name || "").trim(); if (!o) return; if (by[o] && by[o] !== m[u]) bad.add(o); by[o] = m[u]; });
    bad.forEach(o => delete by[o]);
    // أي شخص بنفس الاسم الأصلي ومالوش اسم معدّل = لبس، فمنبدّلش اسمه
    Object.keys(profiles).forEach(u => { if (u !== myId && !m[u]) { const o = ((profiles[u] || {}).name || "").trim(); if (o) delete by[o]; } });
    if (myId) idbTx("readwrite", st => st.put({ s: JSON.stringify(by), ts: Date.now() }, "nick:~orig:" + myId)).catch(() => {});
  } catch (_) {}
};
const setNick = (u, v) => { const m = nickMap(); v = String(v || "").replace(/\s+/g, " ").trim().slice(0, 30); if (v && v !== ((profiles[u] || {}).name || "")) m[u] = v; else delete m[u]; saveNicks(); };
// بيتنادى بعد تسجيل الدخول: بيرجّع الأسماء من IndexedDB / Firestore لو localStorage اتمسح
async function syncNicks() {
  const uid = myId; if (!uid) return;
  let lts = 0; try { lts = +localStorage.getItem("vc_nickts_" + uid) || 0; } catch (_) {}
  let best = null, bts = lts;
  try { const r = await idbGet("nick:" + uid); if (r && r.s && r.ts > bts) { best = JSON.parse(r.s); bts = r.ts; } } catch (_) {}
  try { const d = await db.collection("nicks").doc(uid).get(); const x = d.exists ? d.data() : null; if (x && x.m && x.ts > bts) { best = x.m; bts = x.ts; } else if (!x && Object.keys(nickMap()).length) saveNicks(); } catch (_) {}
  if (best && myId === uid) { _nk = best; _nkFor = uid; try { localStorage.setItem("vc_nick_" + uid, JSON.stringify(best)); localStorage.setItem("vc_nickts_" + uid, String(bts)); } catch (_) {} repaintNames(); }
}
const pname = u => nickOf(u) || (profiles[u] || {}).name || "مجهول";
const repaintNames = () => { saveNickByName(); try { buildChips(); } catch (_) {} try { refreshMe(); } catch (_) {} try { if (lastList.length) render(lastList); } catch (_) {} };
function openNickEdit(d) {
  const u = dmPeerOf(d.id), p = profiles[u] || {}, c = $("mcard"); c.textContent = ""; const close = () => { $("msheet").hidden = true; };
  const head = el("div", "mprev"); head.style.cssText += ";display:flex;align-items:center;gap:10px";
  const ic = avatar(p); ic.style.cssText += ";width:42px;height:42px;font-size:22px";
  const t = el("span", "", "✏️ تعديل الاسم"); t.style.fontWeight = "700"; head.append(ic, t); c.append(head);
  const box = el("div", "acts"); box.style.cssText += ";display:flex;flex-direction:column;gap:10px;align-items:stretch";
  const orig = el("small", "", "الاسم الأصلي: " + (p.name || "مجهول")); orig.dir = "rtl"; orig.style.cssText = "opacity:.75;text-align:center";
  const inp = el("input"); inp.type = "text"; inp.maxLength = 30; inp.value = nickOf(u); inp.placeholder = p.name || "اكتب الاسم"; inp.autocomplete = "off"; inp.enterKeyHint = "done"; inp.dir = "auto";
  inp.style.cssText = "width:100%;box-sizing:border-box;padding:13px 14px;border-radius:14px;border:1px solid var(--line);background:var(--bg);text-align:center;font-size:16px";
  const note = el("small", "", "الاسم ده بيظهر ليك انت بس، صاحبك مش هيشوفه."); note.dir = "rtl"; note.style.cssText = "opacity:.65;text-align:center";
  const save = el("button", "send", "حفظ"); save.type = "button"; save.style.padding = "13px";
  const done = v => { setNick(u, v); close(); repaintNames(); flash(nickOf(u) ? "✓ اتغيّر الاسم" : "✓ رجع الاسم الأصلي"); };
  save.onclick = () => done(inp.value); inp.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); done(inp.value); } };
  box.append(orig, inp, note, save);
  if (nickOf(u)) { const rs = el("button", "ghost", "↩ رجّع الاسم الأصلي"); rs.type = "button"; rs.onclick = () => done(""); box.append(rs); }
  c.append(box); $("msheet").hidden = false; setTimeout(() => { try { inp.focus(); inp.select(); } catch (_) {} }, 120);
}
// ───── 🗑 حذف المحادثة: بيمسح كل حاجة، رسايلك ورسايل صاحبك، عند الاتنين (زي «حذف للطرفين» في تليجرام) ─────
async function deleteDmChat(id) {
  const peer = dmPeerOf(id), s = await db.collection("dmsgs").where("room", "==", id).where("members", "array-contains", myId).get();
  const docs = s.docs, mine = docs.filter(x => x.data().uid === myId), others = docs.filter(x => x.data().uid !== myId);
  const wipeTs = Math.max(Date.now(), ...docs.map(x => (x.data().ts || 0) + 1), (((dms[id] || {}).last || {}).ts || 0) + 1);
  let hidden = true;   // الإخفاء عند الطرفين بيتم بعلامة على المحادثة نفسها، فبيشتغل حتى لو قواعد Firebase منعت مسح رسايل صاحبك
  try { await db.collection("dms").doc(id).update({ wipeTs, last: FV().delete(), pinned: FV().delete(), pins: FV().delete(), ["unread." + myId]: 0, ["unread." + peer]: 0 }); }
  catch (e) { try { await db.collection("dms").doc(id).update({ wipeTs }); } catch (e2) { hidden = false; } }
  for (let i = 0; i < mine.length; i += 400) { const b = db.batch(); mine.slice(i, i + 400).forEach(x => b.delete(x.ref)); await b.commit(); }
  let gone = 0, left = 0;
  for (let i = 0; i < others.length; i += 25) { const r = await Promise.allSettled(others.slice(i, i + 25).map(x => x.ref.delete())); r.forEach(x => x.status === "fulfilled" ? gone++ : left++); }
  return { mine: mine.length, gone, left, hidden };
}
async function wipeMyDm(id) {
  const s = await db.collection("dmsgs").where("room", "==", id).where("members", "array-contains", myId).get();
  const mine = s.docs.filter(x => x.data().uid === myId), rest = s.docs.filter(x => x.data().uid !== myId).map(x => x.data()).sort((a, b) => b.ts - a.ts);
  for (let i = 0; i < mine.length; i += 400) { const b = db.batch(); mine.slice(i, i + 400).forEach(x => b.delete(x.ref)); await b.commit(); }
  syncDmMeta(id);
  return mine.length;
}
function openDMMenu(d) {
  const u = dmPeerOf(d.id), p = profiles[u] || {}, c = $("mcard"); c.textContent = ""; const close = () => { $("msheet").hidden = true; };
  const head = el("div", "mprev"); head.style.cssText += ";display:flex;align-items:center;gap:10px";
  const ic = avatar(p); ic.style.cssText += ";width:42px;height:42px;font-size:22px";
  const nm = el("span", "", pname(u)); nm.style.fontWeight = "700"; head.append(ic, nm); c.append(head);
  const acts = el("div", "acts"), blocked = (d.blockedBy || []).includes(myId);
  const act = (ico, label, grad, fn) => { const b = el("button", "act"); b.type = "button"; const i = el("i", "", ico); i.style.background = grad; const sp = el("span", "", label); b.append(i, sp); b.onclick = () => fn(b, sp); acts.append(b); };
  const sure = (b, sp) => { if (!b.dataset.ok) { b.dataset.ok = "1"; sp.textContent = "تأكيد؟"; return false; } return true; };
  act("✏️", "تعديل الاسم", "linear-gradient(135deg,#5aa9ff,#2f6fed)", () => openNickEdit(d));
  act("🗑", "حذف المحادثة", "linear-gradient(135deg,#ff7a7a,#d64545)", async (b, sp) => {
    if (!sure(b, sp)) return; close();
    try {
      if (room === d.id) openRoom("general");   // نخرج من المحادثة فورًا، مش بعد ما الحذف يخلص (لو فتحتها تاني أثناء الحذف كان بيرجّعك للعام)
      const r = await deleteDmChat(d.id);
      flash(r.hidden || !r.left ? "🗑 اتحذفت المحادثة بالكامل عند الطرفين" : "⚠️ اتحذفت رسايلك بس، رسايل صاحبك مش بتتمسح (قواعد Firebase)");
    } catch (e) { flash(errMsg(e)); }
  });;
  act(blocked ? "✅" : "🚫", blocked ? "إلغاء الحظر" : "حظر", "linear-gradient(135deg,#a07cff,#6b46e0)", async () => {
    close();
    try { await db.collection("dms").doc(d.id).set({ members: [myId, u].sort(), blockedBy: blocked ? AR(myId) : AU(myId) }, { merge: true }); flash(blocked ? "✓ اتلغى الحظر" : "🚫 اتحظر"); } catch (e) { flash(errMsg(e)); }
  });
  acts.style.gridTemplateColumns = "repeat(4,1fr)"; c.append(acts); $("msheet").hidden = false;
}
function buildDMs(q) {
  const box = $("dmList"), sub = $("dmSub"), qn = nzq(q), qc = normFCode(q); box.textContent = "";
  const list = Object.values(dms).filter(d => d.last && (q ? dmEstablished(d) : d.last.ts > dmClearedAt(d)) && !pendingIn(d) && !dmCancelled(d) && !(d.req === myId && !d.acc)).sort((a, b) => b.last.ts - a.last.ts).filter(d => { if (!q) return true; const p = profiles[dmPeerOf(d.id)] || {}; return nzq(p.name).includes(qn) || nzq(nickOf(dmPeerOf(d.id))).includes(qn) || (qc.length >= 2 && String(p.fcode || "").includes(qc)); });
  list.forEach(d => box.appendChild(dmRow(d)));
  const pu = qc.length === 8 ? Object.keys(profiles).find(u => u !== myId && profiles[u] && profiles[u].fcode === qc) : null;
  if (pu && !list.some(d => dmPeerOf(d.id) === pu)) {
    const p = profiles[pu], row = el("button", "rrow"), tx = el("div", "rt"); row.type = "button";
    tx.append(el("b", "", nickOf(pu) || p.name || "مجهول"), el("small", "", "اضغط للمراسلة")); row.append(avatar(p), tx);
    row.onclick = () => { closeDrawer(); openPeer(pu); }; box.appendChild(row);
  }
  sub.hidden = false;
}
function notifyDM(d) {
  vcSnd(d.id === room ? "in" : "ping");
  if (!document.hidden || !("Notification" in window) || Notification.permission !== "granted") return;
  pushLocal("💬 " + (nickOf(dmPeerOf(d.id)) || (profiles[dmPeerOf(d.id)] || {}).name || "رسالة خاصة"), d.last.text, d.id);
}

/* Very Chat — الحالة والأفاتار وقائمة الغرف */
const ERR_RE = /ماقدرتش|ماتبعتتش|مش بيدعم|لازم تسمح|كبير|قصيرة|فشل|ممنوع|مينفعش|متوقفة/;
function flashSnd(t) { try { t = String(t || ""); vcSnd(/اتبعت/.test(t) ? "req" : /اتقبل|قبل/.test(t) ? "ok" : /^✕|اترفض/.test(t) ? "no" : /^✓/.test(t) ? "ok" : ERR_RE.test(t) ? "err" : ""); } catch (_) {} }
function setStatus(t) { try { if (t && ERR_RE.test(t)) vcSnd("err"); } catch (_) {} $("status").textContent = t; $("status").hidden = !t; }
function avatar(p, big) {
  const d = document.createElement("div"); d.className = "av"; d.dataset.name = (p && p.name) || "";
  if (p && p.photo) { d._photo = p.photo; }
  if (p && okPhoto(p.photo)) { const i = document.createElement("img"); i.src = p.photo; i.alt = ""; d.appendChild(i); }
  else { d.style.background = safeCol(p && p.color) || "var(--line)"; d.textContent = (p && p.emoji) || "👤"; }
  return d;
}
function setAvatar(el, p) { el._photo = p && p.photo || ""; el.dataset.name = (p && p.name) || ""; el.replaceChildren(...avatar(p).childNodes); el.style.background = safeCol(p && !p.photo && p.color) || "var(--line)"; }

function closeDrawer() { $("drawer").hidden = true; }
const nzq = t => String(t || "").toLowerCase().replace(/[\u064B-\u0652\u0640]/g, "").replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/\s+/g, " ").trim();
const nzc = t => String(t || "").toLowerCase().replace(/[^a-z0-9]/g, "");
function roomMatches(r, q) {
  if (!q) return true;
  const n = nzq(r.name), qq = nzq(q), qc = nzc(q);
  return n.includes(qq) || (qc.length >= 2 && nzc(r.code).includes(qc));
}
function roomRow(r) {
  const row = document.createElement("button"); row.className = "rrow" + (r.id === room ? " on" : ""); row.style.setProperty("--rc", safeCol(r.color) || "#5b6b78");
  const ic = avatar(r.id === "general" || r.emoji || r.photo ? r : { emoji: "💬", color: "#5b6b78" });
  const tx = document.createElement("div"); tx.className = "rt";
  const nm = document.createElement("b"); nm.textContent = r.name;
  const last = recent.find(m => m.room === r.id), un = unreadOf(r.id);
  const sb = document.createElement("small"); sb.dir = "rtl";
  sb.textContent = (r.by === myId ? "👑 " : "") + (r.private ? "🔒 " : "") + (r.onlyAdmins ? "📢 " : "") + (last ? nameOf(last.uid, r.id) + ": " + mtext(last).slice(0, 28) : "أنت: " + ((profileFor(myId, r.id) || {}).name || "—"));
  tx.append(nm, sb); row.append(ic, tx);
  if (un) { const bd = document.createElement("span"); bd.className = "bdg"; bd.textContent = un > 99 ? "99+" : un; row.append(bd); }
  let tm, fired = false;
  row.onclick = () => { if (fired) { fired = false; return; } closeDrawer(); openRoom(r.id); };
  if (r.id !== "general") {
    const go = () => { fired = false; tm = setTimeout(() => { fired = true; openRoomMenu(r); }, 500); }, stop = () => clearTimeout(tm);
    ["touchstart", "mousedown"].forEach(ev => row.addEventListener(ev, go, { passive: true }));
    ["touchmove", "touchend", "touchcancel", "mouseup", "mouseleave"].forEach(ev => row.addEventListener(ev, stop, { passive: true }));
    row.addEventListener("contextmenu", e => { e.preventDefault(); stop(); fired = true; openRoomMenu(r); });
  }
  return row;
}
function buildChips() {
  const box = $("dlist"), pin = $("dpin"), q = $("dSearch").value.trim();
  box.textContent = ""; pin.textContent = "";
  pin.appendChild(roomRow(generalRoom())); buildDMs(q);
  const list = rooms.filter(canSee).filter(r => roomMatches(r, q));
  list.forEach(r => box.appendChild(roomRow(r)));
  if (q && !list.length && !$("dmList").children.length) {
    const nn = document.createElement("div"); nn.className = "dnone"; nn.textContent = "مفيش غرفة بالاسم أو الكود ده في غرفك.";
    const fb = document.createElement("button"); fb.className = "ghost"; fb.type = "button"; fb.textContent = "🔑 انضم بكود";
    fb.onclick = () => { closeDrawer(); openDiscover(); }; nn.append(document.createElement("br"), fb); box.appendChild(nn);
  }
  refreshMe(); updateTotal(); applyFold();
}

// ───── تبويبين جنب بعض: «الخاص» و«الغرف» (آخر تبويب بتختاره بيتحفظ، والسحب يمين/شمال بيبدّل بينهم) ─────
let dTab = ""; try { dTab = localStorage.getItem("vc_dtab") || ""; } catch (e) {}
const rowUnread = box => [...box.querySelectorAll(".rrow .bdg")].reduce((n, b) => n + (parseInt(b.textContent, 10) || 0), 0);
function applyFold() {
  const q = $("dSearch").value.trim(), dmL = $("dmList"), rmL = $("dlist");
  const nDm = dmL.querySelectorAll(".rrow").length, nRm = rmL.querySelectorAll(".rrow").length;
  let k = dTab === "dm" || dTab === "rooms" ? dTab : (nDm ? "dm" : "rooms");
  if (q && ((k === "dm" && !nDm && nRm) || (k === "rooms" && !nRm && nDm))) k = k === "dm" ? "rooms" : "dm";   // أثناء البحث بنروح للتبويب اللي فيه نتايج
  [["dm", "dmSub", nDm, dmL], ["rooms", "rmSub", nRm, rmL]].forEach(([key, sid, n, box]) => {
    const t = $(sid), on = key === k, un = rowUnread(box);
    t.classList.toggle("on", on); t.setAttribute("aria-selected", String(on));
    t.querySelector(".cnt").textContent = n || "";
    const u = t.querySelector(".ubd"); u.hidden = !un || on; u.textContent = un > 99 ? "99+" : un || "";
  });
  dmL.style.display = k === "dm" ? "flex" : "none"; rmL.style.display = k === "rooms" ? "" : "none";
  $("dHint").textContent = k === "dm" ? "اضغط مطوّلاً على المحادثة للخيارات" : "اضغط مطوّلاً على الغرفة للتعديل";
  const em = $("dEmpty"), cur = k === "dm" ? nDm : nRm;
  em.hidden = !!(cur || q);
  if (!em.hidden) em.textContent = k === "dm" ? "💬 مفيش محادثات خاصة لسه. اضغط الزرار اللي تحت وابدأ محادثة" : "🏠 مفيش غرف لسه. اضغط «غرفة جديدة» أو انضم بكود";
  $("dTabs").dataset.on = k;
}
function setTab(k, save) {
  dTab = k; if (save !== false) { try { localStorage.setItem("vc_dtab", k); } catch (e) {} }
  applyFold(); try { vcSnd("tap"); } catch (e) {}
}
["dmSub", "rmSub"].forEach(id => { const h = $(id); h.addEventListener("click", () => setTab(h.dataset.k)); });
(() => {   // سحب أفقي على القايمة يبدّل التبويب
  const sc = $("dScroll"); let x0 = 0, y0 = 0, on = false;
  sc.addEventListener("touchstart", e => { const t = e.touches[0]; x0 = t.clientX; y0 = t.clientY; on = e.touches.length === 1; }, { passive: true });
  sc.addEventListener("touchend", e => {
    if (!on) return; on = false; const t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0;
    if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.6) return;
    const cur = $("dTabs").dataset.on || "dm", want = dx < 0 ? "rooms" : "dm";   // RTL: السحب لشمال = الغرف، لليمين = الخاص
    if (want !== cur) setTab(want);
  }, { passive: true });
})();
$("dSearch").addEventListener("input", buildChips);
$("menuBtn").onclick = () => { $("dSearch").value = ""; buildChips(); $("dNotif").hidden = !("Notification" in window) || pushReady; $("drawer").hidden = false; };
$("drawer").onclick = e => { if (e.target === $("drawer")) closeDrawer(); };
$("dAdd").onclick = () => { closeDrawer(); openSheet("room"); };
$("hRoom").onclick = () => { if (isDM(room)) openPeer(dmPeerOf(room)); else if (curR()) openInfo(room); else $("meBtn").click(); };

// ───── آخر قراية + سهم الرسايل الفايتة ─────
const getSeen = r => { try { return +localStorage.getItem("vc_seen_" + r) || 0; } catch (_) { return 0; } };
const setSeen = (r, ts) => { try { if (ts > getSeen(r)) localStorage.setItem("vc_seen_" + r, ts); } catch (_) {} };
function boxScrolled() {
  const box = $("msgs"), fab = $("toBottom"); if (!box || !fab) return;
  const gap = box.scrollHeight - box.scrollTop - box.clientHeight, bt = box.getBoundingClientRect().bottom - 8; let ts = 0;
  for (let i = box.children.length - 1; i >= 0; i--) { const r = box.children[i]; if (r.dataset && r.dataset.ts && r.getBoundingClientRect().top < bt) { ts = +r.dataset.ts; break; } }
  if (gap < 90 && lastList.length) ts = Math.max(ts, lastList[lastList.length - 1].ts);
  if (ts && !document.hidden) setSeen(room, ts);
  const s = getSeen(room), n = s ? lastList.filter(m => m.uid !== myId && m.ts > s).length : 0, tb = $("tbN");
  tb.textContent = n > 99 ? "99+" : n; tb.hidden = !n; fab.hidden = gap < 160;
  const a = !$("emoPanel").hidden ? $("emoPanel") : $("f"); fab.style.bottom = Math.round(innerHeight - a.getBoundingClientRect().top + 12) + "px";
}
$("msgs").addEventListener("scroll", () => { if (!boxScrolled._r) boxScrolled._r = requestAnimationFrame(() => { boxScrolled._r = 0; boxScrolled(); }); }, { passive: true });
try { new ResizeObserver(() => boxScrolled()).observe($("msgs")); } catch (_) {}
function jumpBottom(smooth) {
  const b = $("msgs"), end = () => b.scrollHeight - b.clientHeight, gap = end() - b.scrollTop;
  if (!smooth || gap < b.clientHeight * 0.6) { b.scrollTop = end(); return; }
  if (gap > b.clientHeight * 1.5) b.scrollTo({ top: end() - b.clientHeight * 1.2, behavior: "instant" });
  requestAnimationFrame(() => b.scrollTo({ top: end(), behavior: "smooth" }));
}
// ───── السكرول يلزق في آخر رسالة زي واتساب: لو إنت تحت، أي حاجة جديدة (رسالة، فقاعة رفع، صورة بتحمّل، كيبورد) تنزّلك لآخر القايمة؛ ولو طلعت فوق تقرا، ماحدش يسحبك ─────
{ const b = $("msgs"); let stick = true, raf = 0;
  const atEnd = () => b.scrollHeight - b.scrollTop - b.clientHeight < 48;
  const down = () => { raf = 0; if (stick) b.scrollTop = b.scrollHeight; };
  const later = () => { if (!stick) return; b.scrollTop = b.scrollHeight; if (!raf) raf = requestAnimationFrame(down); };
  b.addEventListener("scroll", () => { stick = atEnd(); }, { passive: true });
  try { new MutationObserver(later).observe(b, { childList: true, subtree: true }); } catch (_) {}
  try { new ResizeObserver(later).observe(b); } catch (_) {}
  ["load", "loadedmetadata", "loadeddata"].forEach(ev => b.addEventListener(ev, later, true));
  b._stickDown = () => { stick = true; later(); };   // بعد ما تبعت إنت أو تفتح غرفة
}
$("toBottom").onclick = () => { jumpBottom(true); if (lastList.length) setSeen(room, lastList[lastList.length - 1].ts); setTimeout(boxScrolled, 350); };
["touchstart", "wheel", "mousedown"].forEach(ev => $("msgs").addEventListener(ev, () => { $("msgs")._pin = 0; }, { passive: true }));
/* Very Chat — رسم الرسايل والتفاعلات والتحديد */
// توقيع الرسالة: لو ما اتغيرش نسيب العنصر في مكانه، فالفيديوهات والصور ما بتترعشش
const sgs = o => { try { return JSON.stringify(o, (k, x) => typeof x === "string" && x.length > 160 ? x.length + ":" + x.slice(0, 40) + x.slice(-40) : x); } catch (_) { return "r" + Math.random(); } };
function render(list) {
  lastList = list;
  const box = $("msgs");
  const fresh = box._room !== room;
  if (fresh) { box._room = room; box._unr = 0; const s0 = getSeen(room); if (s0) { const f0 = list.find(m => m.uid !== myId && !m.del && m.ts > s0); if (f0) box._unr = f0.ts; } else if (list.length) setSeen(room, list[list.length - 1].ts); }
  // لو في فيديو شغّال، نأجّل إعادة الرسم علشان ما يقفلش في وشك
  if ([...box.querySelectorAll("video")].some(v => !v.paused && !v.ended)) { clearTimeout(render._t); render._t = setTimeout(() => render(lastList), 1500); return; }
  const near = box.scrollHeight - box.scrollTop - box.clientHeight < 90;
  const nodes = [], oldIds = !fresh && box._ids ? box._ids : null, RC = fresh || !box._rc ? (box._rc = new Map()) : box._rc, keep = new Set();   // RC: الرسايل اللي ما اتغيرتش بنسيبها زي ما هي (من غير إعادة رسم)
  { const hs = hidSet(room); if (hs.size) list = list.filter(m => !(m.del && hs.has(m.id))); } if (UNDO.size) list = list.filter(m => !UNDO.has(m.id));
  list.forEach((m, i) => { try {
    const prev = list[i - 1], mine = m.uid === myId, p = profileFor(m.uid);
    const newDay = !prev || new Date(prev.ts).toDateString() !== new Date(m.ts).toDateString();
    if (newDay) { const dv = document.createElement("div"), d0 = new Date(m.ts); dv.className = "day"; dv.textContent = d0.toDateString() === new Date().toDateString() ? "اليوم" : d0.toLocaleDateString("ar-EG", { day: "numeric", month: "long" }); nodes.push(dv); }
    const first = newDay || prev.uid !== m.uid || m.ts - prev.ts > 300000;
    const row = document.createElement("div"); row.className = "row" + (mine ? " me" : "") + (first ? " first" : "") + (sel.has(m.id) ? " sel" : "");
    row.dataset.uid = m.uid; row.dataset.ts = m.ts; row.dataset.mid = m.id;
    if (box._unr && m.ts >= box._unr && !(prev && prev.ts >= box._unr)) { const u = document.createElement("div"); u.className = "unr"; u.id = "unrDiv"; const cnt = list.filter(x => x.uid !== myId && !x.del && x.ts >= box._unr).length; u.textContent = "⬇ " + cnt + " رسالة غير مقروءة"; nodes.push(u); } if (first) row.appendChild(avatar(p)); else { const s = document.createElement("div"); s.className = "sp"; row.appendChild(s); }
    const p2 = m.ucard ? (profiles[m.ucard.uid] || {}) : null;
    const sig = [sgs(m), mine ? 1 : 0, first ? 1 : 0, sel.has(m.id) ? 1 : 0, selMode ? 1 : 0, first ? sgs(p) : "", first && !mine ? nickOf(m.uid) : "", m.reply && m.reply.uid ? nickOf(m.reply.uid) : "", mine && seenOK() ? seenBy(m).length : -1, p2 ? (p2.name || "") + (p2.fcode || "") + (m.ucard.name || "") + (nickOf(m.ucard.uid) || "") : "", m.share ? rooms.length : ""].join("¦");
    const hit = RC.get(m.id); if (hit && hit.sig === sig) { keep.add(m.id); nodes.push(hit.row); return; }
    const b = document.createElement("div"); b.className = "b";
    if (first && !mine && !isDM(room)) { const n = document.createElement("div"); n.className = "n"; n.dir = "rtl"; n.textContent = nameOf(m.uid); n.style.cursor = "pointer"; n.onclick = e => { if (selMode) return; e.stopPropagation(); if (Date.now() - (b._f || 0) > 800) peerTap(m.uid, m.room || room); }; b.appendChild(n); }
    const dl = !!m.del;
    if (dl) { const x = el("div", "dl", delLabel(m)); x.dir = "rtl"; b.appendChild(x); b.classList.add("deld"); if (hit && !hit.dl) b.classList.add("poof"); row.dataset.dl = "1"; row._l0 = delLabel(m); }
    if (!dl && m.fwd) b.appendChild(el("div", "fw", "↪️ محوّلة من " + m.fwd));
    if (!dl && m.reply) { const q = el("div", "qt"); q.dir = "rtl"; q.append(el("b", "", (m.reply.uid ? nameOf(m.reply.uid) : m.reply.name) || "مجهول"), document.createTextNode(m.reply.text || "")); if (m.reply.id) { q.classList.add("go"); q.onclick = e => { if (selMode) return; e.stopPropagation(); const t = $("msgs").querySelector('[data-mid="' + m.reply.id + '"]'); if (!t) { flash("الرسالة الأصلية مش موجودة"); return; } t.scrollIntoView({ block: "center", behavior: "smooth" }); t.classList.remove("hl"); void t.offsetWidth; t.classList.add("hl"); setTimeout(() => t.classList.remove("hl"), 1800); }; } b.appendChild(q); }
    const tx = document.createElement("div"); tx.className = "tx"; tx.dir = "auto";
    if (dl) {}
    else if (m.audio) b.appendChild(audioPlayer(m));
    else if (m.poll) b.appendChild(pollBox(m));
    else if (m.mk === "doc") b.appendChild(docBox(m));
    else {
      if (m.mid || m.img || m.vid) b.appendChild(mediaBox(m));
      if (m.share) b.appendChild(roomCard(m.share));
      if (m.ucard) b.appendChild(userCard(m.ucard));
      if (m.text) { linkify(tx, m.text); if (m.mid || m.img || m.vid) tx.classList.add("mcap"); b.appendChild(tx); const jn = jumboN(m); if (jn) { b.classList.add("jumbo"); if (oldIds && !oldIds.has(m.id)) b.classList.add("pop"); tx.style.fontSize = [0, 64, 52, 44][jn] + "px"; } }
      else if (!m.mid && !m.img && !m.vid && !m.share && !m.ucard) { linkify(tx, m.text || ""); b.appendChild(tx); }
    }
    const rc = {}; Object.values(dl ? {} : m.reacts || {}).forEach(k => { if (EMO[k]) rc[k] = (rc[k] || 0) + 1; });
    if (Object.keys(rc).length) {
      const rw = document.createElement("div"); rw.className = "rxs";
      Object.keys(rc).forEach(k => { const c = document.createElement("button"); c.type = "button"; c.className = "rx" + ((m.reacts || {})[myId] === k ? " on" : ""); c.innerHTML = EMO[k].s; c.appendChild(document.createTextNode(" " + rc[k])); c.onclick = () => toggleReact(m, k); rw.appendChild(c); });
      b.appendChild(rw); b.classList.add("hasrx");
    }
    const t = document.createElement("div"); t.className = "t";
    if (m.edited) { const ed = document.createElement("span"); ed.textContent = "معدّلة"; t.appendChild(ed); }
    if (mine) { const sc = document.createElement("span"); const n = seenOK() ? seenBy(m).length : 0; if (m._p) { sc.className = "pend"; sc.innerHTML = SVG_CLOCK; sc.title = "في انتظار الإرسال"; b.classList.add("pending"); } else if (isDM(m.room || room)) { sc.textContent = n ? "✓✓" : "✓"; if (n) sc.className = "rd"; } else sc.textContent = n ? "👁 " + n : "✓"; t.appendChild(sc); }
    const tm = document.createElement("span"); tm.textContent = new Date(m.ts).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }); t.appendChild(tm);
    b.appendChild(t); holdMenu(b, m); row.appendChild(b);
    if (selMode) { const ck = document.createElement("span"); ck.className = "ck"; ck.textContent = sel.has(m.id) ? "✓" : ""; row.appendChild(ck); }
    row.onclick = () => { if (selMode) toggleSel(m.id); }; nodes.push(row); RC.set(m.id, { sig, row, dl }); keep.add(m.id);
  } catch (err) { console.warn("رسالة تالفة اتخطّت", err); } });
  { let run = []; const flush = () => { run.forEach((r, i) => { r.classList.toggle("dgrp-x", i > 0); const x = r.querySelector(".dl"); if (x) x.textContent = i === 0 && run.length > 1 ? "🚫 " + run.length + " رسايل اتحذفت" : r._l0; }); run = []; };
    nodes.forEach(n => { if (n.dataset && n.dataset.dl && (!run.length || run[0].dataset.uid === n.dataset.uid)) run.push(n); else { flush(); if (n.dataset && n.dataset.dl) run.push(n); } }); flush(); }
  { const ns = new Set(nodes); [...box.childNodes].forEach(c => { if (!ns.has(c)) c.remove(); }); let cur = box.firstChild; for (const n of nodes) { if (n === cur) cur = cur.nextSibling; else box.insertBefore(n, cur); } for (const k of [...RC.keys()]) if (!keep.has(k)) RC.delete(k); } box._ids = new Set(list.map(x => x.id)); try { UPL.mount(list, box); } catch (_) {} try { DUP.mount(list, box); } catch (_) {}
  const lm = list[list.length - 1], mineNew = lm && lm.uid === myId && Date.now() - lm.ts < 5000;
  if (fresh) { box.scrollTop = box.scrollHeight; if (box._stickDown) box._stickDown(); box._pin = 1; requestAnimationFrame(() => { if (box._pin) box.scrollTop = box.scrollHeight; setTimeout(() => { if (box._pin) box.scrollTop = box.scrollHeight; box._pin = 0; }, 400); }); }
  else if (near || mineNew || list.length < 4) { box.scrollTop = box.scrollHeight; if (box._stickDown) box._stickDown(); }
  try { netUI(); } catch (_) {} boxScrolled(); _spMsg = true; if (_spMin) hideSplash();
  try { renderPin(); } catch (_) {}
  markSeen(list); updateTotal();
  setStatus(list.length ? "" : "مفيش رسايل لسه. ابدأ إنت!");
}

const DEL_TXT = "🚫 تم حذف هذه الرسالة";
const mtext = m => m.del ? DEL_TXT : m.audio ? "🎤 رسالة صوتية" : m.poll ? "📊 " + (m.poll.q || "استطلاع") : m.mk === "doc" ? "📄 " + (m.fname || "مستند") : (m.mid ? m.mk === "vid" : false) || m.vid ? "🎥 فيديو" + (m.text ? " · " + m.text : "") : m.mid || m.img ? "🖼 صورة" + (m.text ? " · " + m.text : "") : m.ucard ? "🆔 كارت تعريف" : m.share ? "🏠 غرفة: " + (m.share.name || "") : (m.text || "");
const EMO = Object.assign(Object.create(null), {
  fol: { n: "فل", s: `<svg viewBox='0 0 40 40'><g fill='#fff' stroke='#e7a8c8' stroke-width='1.5'><circle cx='20' cy='9' r='7'/><circle cx='31' cy='17' r='7'/><circle cx='27' cy='30' r='7'/><circle cx='13' cy='30' r='7'/><circle cx='9' cy='17' r='7'/></g><circle cx='20' cy='20' r='9' fill='#ffd34d'/><circle cx='17' cy='19' r='1.4' fill='#4a3200'/><circle cx='23' cy='19' r='1.4' fill='#4a3200'/><path d='M16 23q4 4 8 0' fill='none' stroke='#4a3200' stroke-width='1.6' stroke-linecap='round'/></svg>` },
  nar: { n: "نار", s: `<svg viewBox='0 0 40 40'><path d='M20 3c2 7 11 11 11 21a11 11 0 0 1-22 0c0-5 3-8 5-11 1 3 2 4 4 4 0-5 0-8 2-14z' fill='#ff7a2f'/><path d='M20 17c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-5 3-7 1 2 2 2 3 2z' fill='#ffd34d'/><rect x='12' y='22' width='7' height='5' rx='2' fill='#1b1b1b'/><rect x='21' y='22' width='7' height='5' rx='2' fill='#1b1b1b'/><path d='M19 24h2' stroke='#1b1b1b' stroke-width='1.5'/></svg>` },
  qalb: { n: "قلب", s: `<svg viewBox='0 0 40 40'><path d='M20 35C5 25 3 14 10 9c5-3 9 0 10 4 1-4 5-7 10-4 7 5 5 16-10 26z' fill='#ff4d79'/><circle cx='15' cy='20' r='1.5' fill='#3a0a1a'/><circle cx='25' cy='20' r='1.5' fill='#3a0a1a'/><path d='M17 24q3 3 6 0' fill='none' stroke='#3a0a1a' stroke-width='1.5' stroke-linecap='round'/><circle cx='12.5' cy='23' r='2' fill='#ff9db5'/><circle cx='27.5' cy='23' r='2' fill='#ff9db5'/></svg>` },
  dahk: { n: "ضحك", s: `<svg viewBox='0 0 40 40'><circle cx='20' cy='20' r='16' fill='#ffd34d'/><path d='M11 17q3-3 6 0M23 17q3-3 6 0' fill='none' stroke='#4a3200' stroke-width='2' stroke-linecap='round'/><path d='M12 24h16q-1 8-8 8t-8-8z' fill='#4a3200'/><path d='M5 20c-3 5 0 8 2 4 0-2-1-3-2-4zM35 20c3 5 0 8-2 4 0-2 1-3 2-4z' fill='#4fc3f7'/></svg>` },
  tamam: { n: "تمام", s: `<svg viewBox='0 0 40 40'><path d='M20 2l5 6 8-1 1 8 6 5-5 6 1 8-8 1-5 6-5-6-8-1-1-8-6-5 5-6-1-8 8 1z' fill='#2cc4a9'/><path d='M12 21l6 6 11-12' fill='none' stroke='#fff' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/></svg>` },
  wow: { n: "واو", s: `<svg viewBox='0 0 40 40'><circle cx='20' cy='20' r='16' fill='#ffd34d'/><circle cx='14' cy='17' r='2' fill='#4a3200'/><circle cx='26' cy='17' r='2' fill='#4a3200'/><ellipse cx='20' cy='27' rx='4' ry='5' fill='#4a3200'/><path d='M10 11q4-3 8-1M22 10q4-2 8 1' fill='none' stroke='#4a3200' stroke-width='1.6' stroke-linecap='round'/></svg>` },
  bka: { n: "حزين", s: `<svg viewBox='0 0 40 40'><circle cx='20' cy='20' r='16' fill='#ffd34d'/><circle cx='14' cy='18' r='2' fill='#4a3200'/><circle cx='26' cy='18' r='2' fill='#4a3200'/><path d='M14 29q6-5 12 0' fill='none' stroke='#4a3200' stroke-width='2' stroke-linecap='round'/><path d='M13 21c-2 4 0 6 2 3 0-1-1-2-2-3z' fill='#4fc3f7'/></svg>` },
  kool: { n: "كوول", s: `<svg viewBox='0 0 40 40'><circle cx='20' cy='20' r='16' fill='#ffd34d'/><path d='M6 15h28v3q0 6-6 6t-6-5h-4q0 5-6 5t-6-6z' fill='#1b1b1b'/><path d='M14 28q6 4 12 0' fill='none' stroke='#4a3200' stroke-width='2' stroke-linecap='round'/></svg>` },
  like: { n: "إعجاب", s: `<svg viewBox='0 0 40 40'><circle cx='20' cy='20' r='17' fill='#4f8cff'/><rect x='9' y='19' width='5' height='12' rx='1.5' fill='#fff'/><path d='M16 19l4-9c2.5 0 3.5 1.5 3 4l-1 4h7c1.6 0 2.7 1.5 2.2 3l-2.2 8c-.4 1.3-1.5 2-2.8 2H16z' fill='#fff'/></svg>` },
  oyoun: { n: "عيون", s: `<svg viewBox='0 0 40 40'><ellipse cx='12' cy='20' rx='9' ry='12' fill='#fff' stroke='#333' stroke-width='2'/><ellipse cx='28' cy='20' rx='9' ry='12' fill='#fff' stroke='#333' stroke-width='2'/><circle cx='14' cy='23' r='4.5' fill='#222'/><circle cx='30' cy='23' r='4.5' fill='#222'/></svg>` }
});
function toggleReact(m, k) {
  if (selMode) return;
  const cr = curR(); if (cr && cr.noReact && !adminOf(cr)) { setStatus("التفاعلات متوقفة في الغرفة دي"); return; }
  const on = (m.reacts || {})[myId] === k;
  vcSnd(on ? "tap" : "react");
  msgCol(m.room || room).doc(m.id).update({ ["reacts." + myId]: on ? FV().delete() : k }).catch(() => setStatus("ماقدرتش أضيف التفاعل."));
}
// ───── حذف الرسالة زي واتساب: بتفضل علامة «تم حذف هذه الرسالة» ومحتواها بيتمسح ─────
const DEL_KEEP = new Set(["id", "room", "uid", "ts", "members", "reacts", "_p"]);
async function delMsg(m, rid) {
  rid = rid || m.room || room; const ref = msgCol(rid).doc(m.id), patch = { del: true, delBy: myId, delTs: Date.now() };
  Object.keys(m).forEach(k => { if (!DEL_KEEP.has(k) && !(k in patch)) patch[k] = FV().delete(); });
  try { await ref.update(patch); }
  catch (e) {
    if (!e || e.code !== "permission-denied") throw e;
    await ref.delete(); flash("اتحذفت نهائياً (قواعد Firebase مش بتسمح بعلامة «تم الحذف»)"); syncDmMeta(rid); return;   // احتياطي لو القواعد بتمنع التعديل
  }
  syncDmMeta(rid);
}
// ═══ 🧠 مزامنة بيانات المحادثة الخاصة: آخر رسالة + عدّاد الطرف التاني بيتحسبوا من الرسايل الموجودة فعلاً (مش رقم بيتزوّد بس) ═══
const _sdm = {};
function syncDmMeta(rid) { if (!isDM(rid) || !db) return; clearTimeout(_sdm[rid]); _sdm[rid] = setTimeout(() => syncDmMeta0(rid), 450); }
async function syncDmMeta0(rid) {
  try {
    const s = await db.collection("dmsgs").where("room", "==", rid).where("members", "array-contains", myId).get({ source: "server" });
    const all = s.docs.map(x => ({ ...x.data(), id: x.id })).filter(m => !m._p && m.ts > dmWipeAt(dms[rid])).sort((x, y) => x.ts - y.ts), lt = all[all.length - 1];
    const peer = dmPeerOf(rid), rd = (((dms[rid] || {}).read || {})[peer]) || 0;
    const un = all.filter(m => m.uid === myId && !m.del && m.ts > rd).length;
    await db.collection("dms").doc(rid).update({ last: lt ? { uid: lt.uid, ts: lt.ts, text: mtext(lt).slice(0, 60) } : FV().delete(), ["unread." + peer]: un });
  } catch (_) {}
}
// جهة المستقبِل: لو العدّاد أكبر من الرسايل الحقيقية (حد حذف رسايله) بنصلّحه لوحدنا ونصلّح معاينة آخر رسالة
const _vdm = new Map();
async function verifyDm(d) {
  if (!db || !d || !d.id || d.id === room) return;
  const sig = d.id + "|" + ((d.unread || {})[myId] || 0) + "|" + ((d.last || {}).ts || 0) + "|" + ((d.last || {}).text || ""); if (_vdm.get(d.id) === sig) return; _vdm.set(d.id, sig);
  try {
    const s = await db.collection("dmsgs").where("room", "==", d.id).where("members", "array-contains", myId).get({ source: "server" });
    const all = s.docs.map(x => ({ ...x.data(), id: x.id })).filter(m => !m._p && m.ts > dmWipeAt(d)).sort((x, y) => x.ts - y.ts), lt = all[all.length - 1], rd = ((d.read || {})[myId]) || 0;
    const real = all.filter(m => m.uid !== myId && !m.del && m.ts > rd).length, cur = (d.unread || {})[myId] || 0, patch = {};
    if (real < cur) patch["unread." + myId] = real;
    if (lt && (!d.last || d.last.ts !== lt.ts || d.last.text !== mtext(lt).slice(0, 60))) patch.last = { uid: lt.uid, ts: lt.ts, text: mtext(lt).slice(0, 60) };
    if (Object.keys(patch).length) await db.collection("dms").doc(d.id).update(patch);
  } catch (_) {}
}
const delOne = (m, rid) => (m.del ? msgCol(rid || m.room || room).doc(m.id).delete().then(() => syncDmMeta(rid || m.room || room)) : delMsg(m, rid));   // المحذوفة أصلاً = إزالة نهائية
const delLabel = m => !m.del ? "" : m.delBy && m.delBy !== m.uid ? "🚫 تم حذف هذه الرسالة بواسطة المشرف" : m.uid === myId ? "🚫 حذفت هذه الرسالة" : DEL_TXT;
// ↩️ حذف مع «تراجع»: الرسالة بتختفي فوراً وبعد 5 ثواني الحذف بيتنفّذ فعلاً
const UNDO = new Map();
function delUndo(m, rid) {
  const t = setTimeout(fin, 5000); function fin() { clearTimeout(t); if (!UNDO.has(m.id)) return; UNDO.delete(m.id); tst.remove(); delMsg(m, rid).catch(() => { setStatus("ماقدرتش أحذف الرسالة."); if (lastList.length) render(lastList); }); }
  UNDO.set(m.id, { fin }); if (lastList.length) render(lastList);
  document.querySelectorAll(".undo-t").forEach(x => x.remove());
  const tst = el("div", "undo-t"), bt = el("button", "", "↩ تراجع"); bt.type = "button"; tst.append(el("span", "", "🗑 اتحذفت الرسالة"), bt, el("i", "")); document.body.append(tst);
  bt.onclick = () => { clearTimeout(t); UNDO.delete(m.id); tst.remove(); vcSnd("tap"); if (lastList.length) render(lastList); };
}
const flushUndo = () => [...UNDO.values()].forEach(u => u.fin());
addEventListener("pagehide", flushUndo); document.addEventListener("visibilitychange", () => { if (document.hidden) flushUndo(); });
const hidKey = r => "vc_hid_" + r;
function hidSet(r) { try { return new Set(JSON.parse(localStorage.getItem(hidKey(r)) || "[]")); } catch (_) { return new Set(); } }
function hideLocal(m) { const r = m.room || room, h = hidSet(r); h.add(m.id); try { localStorage.setItem(hidKey(r), JSON.stringify([...h].slice(-300))); } catch (_) {} }
let selMode = false, selDelArm = false; const sel = new Set();
function selLbl(id, t) { const l = $(id).querySelector(".l"); if (l) l.textContent = t; }
function selSetCount(n) { const c = $("selCount"); if (c.textContent !== String(n)) { c.textContent = n; c.classList.remove("pop"); void c.offsetWidth; c.classList.add("pop"); } }
function selSetDel(arm, n) { const b = $("selDel"); b.classList.toggle("arm", arm); selLbl("selDel", arm ? "تأكيد (" + n + ")" : "حذف"); }
function updSel() { $("selBar").hidden = !selMode; $("selCopy").hidden = $("selFwd").hidden = fwdBlocked(); selSetCount(sel.size); selSetDel(false, 0); selDelArm = false; paintSel(); }
// تحديث التحديد في مكانه من غير إعادة رسم الشات (إعادة الرسم كانت بتعيد تحميل الفيديوهات فتترعش)
function paintSel() {
  const box = $("msgs"); box.classList.toggle("selmode", selMode);
  box.querySelectorAll(".row[data-mid]").forEach(r => {
    const on = sel.has(r.dataset.mid); r.classList.toggle("sel", on);
    let ck = r.querySelector(":scope > .ck");
    if (selMode) { if (!ck) { ck = document.createElement("span"); ck.className = "ck"; r.appendChild(ck); } ck.textContent = on ? "✓" : ""; }
    else if (ck) ck.remove();
  });
}
function enterSel(id) { selMode = true; sel.clear(); sel.add(id); updSel(); }
function exitSel() { selMode = false; sel.clear(); updSel(); }
function toggleSel(id) { if (sel.has(id)) sel.delete(id); else sel.add(id); if (!sel.size) exitSel(); else updSel(); }
async function copyText(t) {
  try { await navigator.clipboard.writeText(t); vcSnd("copy"); return true; } catch (e) {}
  try { const ta = document.createElement("textarea"); ta.value = t; ta.style.cssText = "position:fixed;opacity:0"; document.body.appendChild(ta); ta.select(); const ok = document.execCommand("copy"); ta.remove(); return ok; } catch (e) { return false; }
}
$("selCancel").onclick = exitSel;
$("selCopy").onclick = async () => {
  const txt = lastList.filter(x => sel.has(x.id)).map(x => ((profileFor(x.uid) || {}).name || "مجهول") + ": " + mtext(x)).join("\n");
  const ok = await copyText(txt);
  const cb = $("selCopy"); cb.classList.add(ok ? "ok" : "bad"); selLbl("selCopy", ok ? "تم ✓" : "فشل");
  setTimeout(() => { cb.classList.remove("ok", "bad"); selLbl("selCopy", "نسخ"); if (ok) exitSel(); }, 700);
};
$("selDel").onclick = () => {
  const cr = curR(), mine = lastList.filter(x => sel.has(x.id) && ((x.uid === myId && (!cr || !cr.noDelOwn || adminOf(cr))) || adminOf(cr)));
  if (!mine.length) { setStatus("تقدر تحذف رسايلك إنت بس."); return; }
  if (!selDelArm) { selDelArm = true; selSetDel(true, mine.length); setTimeout(() => { if (selDelArm) { selDelArm = false; selSetDel(false, 0); } }, 4000); return; }
  vcSnd("del"); Promise.all(mine.map(x => delOne(x, x.room || room))).catch(() => setStatus("ماقدرتش أحذف بعض الرسايل."));
  exitSel();
};
let editingId = null, reads = {}, myReads = {}, readsLoaded = false;
function seenBy(m) { const rid = m.room || room; if (isDM(rid)) { const rd = (dms[rid] || {}).read || {}; return Object.keys(rd).filter(u => u !== m.uid && rd[u] >= m.ts); } return Object.keys(reads).filter(u => u !== m.uid && ((reads[u] || {})[rid] || 0) >= m.ts); }
function markSeen(list) {
  if (!db || !readsLoaded || document.hidden) return;
  if (isDM(room) && !list.length) { const d0 = dms[room]; if (d0 && ((d0.unread || {})[myId] || 0)) { d0.unread = { ...(d0.unread || {}), [myId]: 0 }; db.collection("dms").doc(room).update({ ["unread." + myId]: 0 }).catch(() => {}); } return; }
  if (!list.length) return;
  if (isDM(room)) {
    const d = dms[room] || {}, lt = list[list.length - 1].ts;
    if (!d.id || (((d.read || {})[myId] || 0) >= lt && !(d.unread || {})[myId])) return;
    const nowT = Date.now(); d.read = { ...(d.read || {}), [myId]: lt }; d.readAt = { ...(d.readAt || {}), [myId]: nowT }; d.unread = { ...(d.unread || {}), [myId]: 0 };
    db.collection("dms").doc(room).update({ ["read." + myId]: lt, ["readAt." + myId]: nowT, ["unread." + myId]: 0 }).catch(() => {}); return;
  }
  const last = list[list.length - 1].ts;
  if ((myReads[room] || 0) >= last) return;
  myReads[room] = last;
  db.doc("reads/" + myId).set({ ...myReads }).catch(() => {});
}
function cancelEdit() { if (!editingId) return; editingId = null; $("editBar").hidden = true; $("sendBtn").innerHTML = SVG_SEND; $("inp").value = ""; }
$("cancelEdit").onclick = cancelEdit;
$("msheet").onclick = e => { if (e.target === $("msheet")) $("msheet").hidden = true; };
/* Very Chat — قوائم الرسالة (ضغطة مطوّلة) */
function holdMenu(node, m) {
  let tm, pr, x0 = 0, y0 = 0;
  const stop = () => { clearTimeout(tm); clearTimeout(pr); node.classList.remove("press"); };
  const go = e => {
    if (selMode) return; const t = e.touches ? e.touches[0] : e; x0 = t.clientX; y0 = t.clientY;
    clearTimeout(tm); clearTimeout(pr);
    pr = setTimeout(() => node.classList.add("press"), 140);
    tm = setTimeout(() => { node.classList.remove("press"); node._f = Date.now(); openMsg(m); }, 500);
  };
  const mv = e => { const t = e.touches ? e.touches[0] : e; if (Math.abs(t.clientX - x0) > 10 || Math.abs(t.clientY - y0) > 10) stop(); };
  ["touchstart", "mousedown"].forEach(ev => node.addEventListener(ev, go, { passive: true }));
  node.addEventListener("touchmove", mv, { passive: true });
  ["touchend", "touchcancel", "mouseup", "mouseleave"].forEach(ev => node.addEventListener(ev, stop, { passive: true }));
  // ↩ اسحب الفقاعة للرد (زي واتساب) + دبل تاب = ❤️
  let sx = 0, sy = 0, dx = 0, sw = false, lastTap = 0;
  node.addEventListener("touchstart", e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; dx = 0; sw = false; }, { passive: true });
  node.addEventListener("touchmove", e => {
    if (selMode || m.del) return; const t = e.touches[0], mx = t.clientX - sx, my = t.clientY - sy;
    if (!sw && (Math.abs(mx) < 14 || Math.abs(mx) < Math.abs(my) * 1.6)) return;
    sw = true; dx = Math.max(-90, Math.min(90, mx)); node.style.transition = "none"; node.style.transform = "translateX(" + dx + "px)";
    const ok = Math.abs(dx) > 60; if (ok !== node.classList.contains("swok")) { node.classList.toggle("swok", ok); if (ok && navigator.vibrate) navigator.vibrate(12); }
  }, { passive: true });
  node.addEventListener("touchend", e => {
    if (sw) { const go = Math.abs(dx) > 60; node.style.transition = "transform .25s cubic-bezier(.2,.9,.3,1.2)"; node.style.transform = ""; node.classList.remove("swok"); sw = false; if (go) { vcSnd("tap"); startReply(m); } node._f = Date.now(); return; }
    if (selMode || m.del || e.target.closest("a,button,audio,video,input,.qt")) return;
    const n = Date.now(); if (n - lastTap < 300) { lastTap = 0; node._f = n; if ((m.reacts || {})[myId] !== "qalb") toggleReact(m, "qalb"); if (navigator.vibrate) navigator.vibrate(10); } else lastTap = n;
  }, { passive: true });
  node.addEventListener("contextmenu", e => { e.preventDefault(); stop(); if (!selMode) { node._f = Date.now(); openMsg(m); } });
}
const MXI = {
  reply: '<svg viewBox="0 0 24 24"><path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 6 6v3"/></svg>',
  copy: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15"/></svg>',
  fwd: '<svg viewBox="0 0 24 24"><path d="m15 14 5-5-5-5"/><path d="M20 9H10a6 6 0 0 0-6 6v3"/></svg>',
  save: '<svg viewBox="0 0 24 24"><path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 20h14"/></svg>',
  sel: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.8 2.8L16 9.8"/></svg>',
  edit: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z"/><path d="m14.5 7.5 3 3"/></svg>',
  dm: '<svg viewBox="0 0 24 24"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>',
  user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c1-4 4-6 8-6s7 2 8 6"/></svg>',
  pin: '<svg viewBox="0 0 24 24"><path d="M9 4h6l-1 6 3 3H7l3-3z"/><path d="M12 13v7"/></svg>',
  del: '<svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-9.5-9.3C1.3 8.5 3 5 6.4 5c2 0 3.6 1.1 4.4 2.6h.4C12 6.1 13.6 5 15.6 5 19 5 20.7 8.5 19.5 11.7 17.5 16.4 12 21 12 21z"/></svg>',
  chev: '<svg class="seen-ch" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>'
};
function openDelMsg(m) {
  const c = $("mcard"); c.textContent = ""; const close = () => { $("msheet").hidden = true; }, rid = m.room || room, cr0 = curR();
  const wrap = el("div", "mx"); c.appendChild(wrap);
  const pv = el("div", "mx-pv" + (m.uid === myId ? " me" : "")); if (m.uid !== myId) pv.append(el("b", "mx-n", nameOf(m.uid, rid)));
  const tx = el("div", "mx-t", delLabel(m)); tx.dir = "rtl"; pv.append(tx);
  { const d = new Date(m.ts); pv.append(el("small", "mx-m", (d.toDateString() === new Date().toDateString() ? "اليوم" : d.toLocaleDateString("ar-EG", { day: "numeric", month: "long" })) + " · " + d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }))); }
  wrap.appendChild(pv);
  const list = el("div", "mx-l"); wrap.appendChild(list);
  const row = (cls, ico, label, fn) => { const b = el("button", "mx-r " + cls); b.type = "button"; const i = el("i"); i.innerHTML = ico; const sp = el("span", "", label); b.append(i, sp); b.onclick = () => fn(b, sp); list.appendChild(b); };
  row("", MXI.eye, "إخفاء عندي", () => { hideLocal(m); close(); if (lastList.length) render(lastList); });
  if (m.uid === myId || (cr0 && adminOf(cr0))) row("dg", MXI.del, "إزالة نهائياً من المحادثة", (b, sp) => {
    if (b.dataset.ok) { close(); vcSnd("del"); msgCol(rid).doc(m.id).delete().then(() => syncDmMeta(rid)).catch(() => setStatus("ماقدرتش أزيل الرسالة.")); }
    else { b.dataset.ok = "1"; b.classList.add("arm"); sp.textContent = "اضغط تاني لتأكيد الإزالة"; setTimeout(() => { if (b.isConnected && b.dataset.ok) { delete b.dataset.ok; b.classList.remove("arm"); sp.textContent = "إزالة نهائياً من المحادثة"; } }, 3500); }
  });
  $("msheet").hidden = false; wrap.scrollTop = 0;
}
// ───── حفظ الصورة/الفيديو على الجهاز: نفس البايتات بالظبط، من غير أي إعادة ضغط أو تغيير جودة ─────
const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif", "image/heic": "heic", "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov", "video/3gpp": "3gp" };
async function srcToBlob(src) {
  src = String(src || "");
  if (/^(blob|data):/.test(src)) { try { return await (await fetch(src)).blob(); } catch (_) {} }
  const mm = /^data:([^;,]+)(;base64)?,([\s\S]*)$/.exec(src); if (!mm) return null;
  if (!mm[2]) return new Blob([decodeURIComponent(mm[3])], { type: mm[1] });
  const bin = atob(mm[3]), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return new Blob([u8], { type: mm[1] });
}
async function exportToDevice(src, vid) {
  try {
    const blob = await srcToBlob(src); if (!blob || !blob.size) { flash("ماقدرتش أجهّز الملف للحفظ"); return false; }
    const type = (blob.type || (vid ? "video/mp4" : "image/jpeg")).split(";")[0], ext = EXT[type] || (vid ? "mp4" : "jpg"), d = new Date(), z = n => String(n).padStart(2, "0");
    const name = "VeryChat-" + d.getFullYear() + z(d.getMonth() + 1) + z(d.getDate()) + "-" + z(d.getHours()) + z(d.getMinutes()) + z(d.getSeconds()) + "." + ext;
    const file = new File([blob], name, { type });
    const ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    if (ios && navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file] }); return true; } catch (e) { if (e && e.name === "AbortError") return false; } }
    const u = URL.createObjectURL(file), a = document.createElement("a"); a.href = u; a.download = name; a.rel = "noopener"; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 60000);
    flash("✓ اتحفظ على جهازك"); return true;
  } catch (e) { flash("ماقدرتش أحفظ الملف"); return false; }
}
$("pvSave").onclick = e => { e.stopPropagation(); exportToDevice($("pvImg").src, false); };
function openMsg(m) {
  if (m.del) { openDelMsg(m); return; }
  const c = $("mcard"); c.textContent = ""; const cr0 = curR(), fb = fwdBlocked(), rid = m.room || room, mine = m.uid === myId;
  const close = () => { $("msheet").hidden = true; };
  try { if (navigator.vibrate) navigator.vibrate(8); } catch (_) {}
  const wrap = el("div", "mx"); c.appendChild(wrap);
  // 1) التفاعلات السريعة
  if (!(cr0 && cr0.noReact && !adminOf(cr0))) {
    const pill = el("div", "rpill");
    Object.keys(EMO).forEach((k, i) => {
      const bt = el("button"); bt.type = "button"; bt.title = EMO[k].n; bt.innerHTML = EMO[k].s;
      bt.style.animationDelay = (0.04 * i) + "s"; if ((m.reacts || {})[myId] === k) bt.className = "on";
      bt.onclick = () => { close(); toggleReact(m, k); }; pill.appendChild(bt);
    });
    wrap.appendChild(pill);
  }
  // 2) معاينة الرسالة (بنفس شكلها + الوقت)
  const pv = el("div", "mx-pv" + (mine ? " me" : ""));
  if (!mine) pv.append(el("b", "mx-n", nameOf(m.uid, rid)));
  { const mt = mtext(m), tx = el("div", "mx-t", mt.length > 240 ? mt.slice(0, 240) + "…" : mt); tx.dir = "auto"; pv.append(tx); }
  { const d = new Date(m.ts), today = d.toDateString() === new Date().toDateString();
    pv.append(el("small", "mx-m", (today ? "اليوم" : d.toLocaleDateString("ar-EG", { day: "numeric", month: "long" })) + " · " + d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }) + (m.edited ? " · معدّلة" : ""))); }
  wrap.appendChild(pv);
  // 3) أكتر الأوامر استخداماً: صف سريع
  const quick = el("div", "mx-q"), list = el("div", "mx-l");
  const qb = (cls, ico, label, fn) => { const b = el("button", "mx-qb " + cls); b.type = "button"; const i = el("i"); i.innerHTML = ico; const sp = el("span", "", label); b.append(i, sp); b.onclick = () => fn(b, sp); quick.appendChild(b); };
  const row = (cls, ico, label, fn) => { const b = el("button", "mx-r " + cls); b.type = "button"; const i = el("i"); i.innerHTML = ico; const sp = el("span", "", label); b.append(i, sp); b.onclick = () => fn(b, sp); list.appendChild(b); };
  qb("mx-blue", MXI.reply, "رد", () => { close(); startReply(m); });
  if (!fb && !m.audio && m.text) qb("mx-green", MXI.copy, "نسخ", async (b, sp) => { const ok = await copyText(m.text); sp.textContent = ok ? "تم ✓" : "فشل"; if (ok) setTimeout(close, 600); });
  if (!fb) qb("mx-orange", MXI.fwd, "توجيه", () => openForward([m]));
  if (!fb && m.mk !== "doc" && (m.mid || m.img || m.vid)) qb("mx-green", MXI.save, "حفظ", async (b, sp) => {
    const vid = m.mk === "vid" || !!m.vid; sp.textContent = "جاري…"; let src = ""; try { src = m.mid ? await getMedia(m.mid) : (m.img || m.vid); } catch (_) {}
    if (!src) { sp.textContent = "فشل"; return; }
    const ok = await exportToDevice(src, vid); sp.textContent = ok ? "تم ✓" : "حفظ"; if (ok) setTimeout(close, 600);
  });
  qb("mx-purple", MXI.sel, "تحديد", () => { close(); enterSel(m.id); });
  quick.style.gridTemplateColumns = "repeat(" + quick.children.length + ",1fr)"; wrap.appendChild(quick);
  // 4) باقي الأوامر: قايمة
  if (!mine && !isDM(room) && canDMFrom(m.uid, rid)) row("", MXI.dm, "مراسلة خاصة", () => { close(); openPeer(m.uid); });
  if (mine && !m.audio && !m.poll && !writeBlock(cr0) && (!cr0 || !cr0.noEdit || adminOf(cr0))) {
    row("", MXI.edit, "تعديل الرسالة", () => { close(); clearReply(); editingId = m.id; $("inp").value = m.text; $("editBar").hidden = false; $("sendBtn").innerHTML = SVG_CHECK; $("inp").focus(); });
  }
  if (cr0 && adminOf(cr0) && !mine && m.uid !== cr0.by && (ownerOf(cr0) || !(cr0.admins || []).includes(m.uid))) row("", MXI.user, "إدارة العضو", () => { close(); memberMenu(cr0, m.uid); });
  if (canPin(cr0)) { const isP = pinsOf(cr0).some(x => x.id === m.id); if (isP) row("", MXI.pin, "إلغاء التثبيت", () => { close(); delPin(cr0, m.id); }); else row("", MXI.pin, isDM(cr0.id) ? "تثبيت في المحادثة" : "تثبيت في الغرفة", () => { close(); addPin(cr0, { id: m.id, name: nameOf(m.uid), text: mtext(m).slice(0, 120) }); }); }
  if ((mine && (!cr0 || !cr0.noDelOwn || adminOf(cr0))) || (cr0 && adminOf(cr0))) {
    row("dg", MXI.del, "حذف الرسالة", (b, sp) => {
      if (b.dataset.ok) { close(); vcSnd("del"); delUndo(m, rid); }
      else { b.dataset.ok = "1"; b.classList.add("arm"); sp.textContent = "اضغط تاني لتأكيد الحذف"; setTimeout(() => { if (b.isConnected && b.dataset.ok) { delete b.dataset.ok; b.classList.remove("arm"); sp.textContent = "حذف الرسالة"; } }, 3500); }
    });
  }
  if (list.children.length) wrap.appendChild(list);
  // 5) كروت قابلة للطي: التفاعلات + اللي شافوها
  const fold = (ico, bg, title, n, stackNodes, rows, open) => {
    const sw = el("div", "seen" + (n ? "" : " empty")), head = el("button", "seen-h"); head.type = "button";
    const ic = el("span", "seen-ic"); ic.innerHTML = ico; if (bg && n) ic.style.background = bg; head.append(ic, el("span", "seen-t", title));
    if (n) {
      if (stackNodes.length) { const st = el("div", "stack"); stackNodes.forEach(x => st.appendChild(x)); head.appendChild(st); }
      head.appendChild(el("span", "seen-n", String(n))); head.insertAdjacentHTML("beforeend", MXI.chev);
    }
    sw.appendChild(head);
    if (n) {
      const lst = el("div", "seen-list"), inn = el("div", "seen-in"), sc = el("div", "seen-sc"); rows.forEach(r => sc.appendChild(r)); inn.appendChild(sc); lst.appendChild(inn); sw.appendChild(lst);
      head.onclick = () => sw.classList.toggle("open"); if (open) sw.classList.add("open");
    }
    return sw;
  };
  const rx = Object.entries(m.reacts || {}).filter(([u, k]) => EMO[k]);
  if (rx.length) {
    const kinds = [...new Set(rx.map(([, k]) => k))].slice(0, 3).map(k => { const d = el("span", "rxm"); d.innerHTML = EMO[k].s; return d; });
    const rows = rx.map(([u, k]) => {
      const r = el("div", "seen-r"), nm = el("span", "nm"); nm.dir = "rtl"; nm.textContent = u === myId ? "أنت" : nameOf(u, rid);
      const e = el("span", "rxe"); e.innerHTML = EMO[k].s; r.append(avatar(profileFor(u, rid)), nm);
      if (u === myId) { r.append(el("small", "seen-hint", "اضغط للإزالة")); r.style.cursor = "pointer"; r.onclick = () => { close(); toggleReact(m, k); }; }
      r.append(e); return r;
    });
    wrap.appendChild(fold(MXI.heart, "linear-gradient(135deg,#ff7aa8,#e0457b)", "التفاعلات", rx.length, kinds, rows, rx.length <= 4));
  }
  if (seenOK() && mine) {   // «شوهدت بواسطة» على رسايلك إنت بس (خاص / غرف / عام)
    const seen = seenBy(m).filter(u => u !== myId), n = seen.length, stack = seen.slice(0, 3).map(u => avatar(profileFor(u, rid)));
    if (n > 3) stack.push(el("span", "more", "+" + (n - 3)));
    const rows = seen.map(u => { const r = el("div", "seen-r"), nm = el("span", "nm"); nm.dir = "rtl"; nm.textContent = u === myId ? "أنت" : nameOf(u, rid); r.append(avatar(profileFor(u, rid)), nm); const at = isDM(rid) ? (((dms[rid] || {}).readAt || {})[u] || 0) : 0; if (at) { const d1 = new Date(at); r.append(el("small", "seen-hint", (d1.toDateString() === new Date().toDateString() ? "اليوم" : d1.toLocaleDateString("ar-EG", { day: "numeric", month: "long" })) + " · " + d1.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }))); } r.append(el("span", "ok", "✓✓")); return r; });
    if (n) wrap.appendChild(fold(MXI.eye, "", "شوهدت بواسطة", n, stack, rows, n <= 3));   // لو محدش شافها مفيش كارت خالص
  }
  $("msheet").hidden = false;
  wrap.scrollTop = 0;
}

const PAGE_URL = location.href.split(/[?#]/)[0];
const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x !== undefined) e.textContent = x; return e; };
const canSee = r => !(r.banned || []).includes(myId) && (r.by === myId || (r.members || []).includes(myId) || (!r.private && !r.members));
const isOwner = r => !r.by || r.by === myId;
const nameOf = (u, rid) => { const p = profileFor(u, rid) || {}; return (p === profiles[u] && nickOf(u)) || p.name || "مجهول"; };   // الاسم المستعار مبيتطبقش على الشخصيات المستعارة في الغرف
const newCode = () => { const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", b = new Uint8Array(10); try { crypto.getRandomValues(b); } catch (_) { for (let i = 0; i < 10; i++) b[i] = Math.floor(Math.random() * 256); } return Array.from(b, x => A[x % 32]).join(""); };
let joinId = (location.hash.match(/^#r-([A-Za-z0-9-]+)$/) || [])[1] || null;
const FV = () => firebase.firestore.FieldValue;
const findByCode = code => rooms.find(x => String(x.code || "").toLowerCase() === String(code || "").trim().toLowerCase());
/* Very Chat — الانضمام والغرف والأعضاء والإشعارات */
async function joinRoom(r) {
  const known = rooms.find(x => x.id === r.id); if (known) r = known;
  if ((r.banned || []).includes(myId)) { const e = new Error("أنت محظور من الغرفة دي"); e.custom = true; throw e; }
  if (r.stub || !canSee(r)) {
    $("msheet").hidden = true; closeDrawer();
    if ((r.invites || []).includes(myId)) { await decideInvite(r, true); return; }
    if ((r.requests || []).includes(myId)) { flash("⏳ طلبك لسه معلّق، استنى موافقة المالك"); return; }
    try { await db.collection("rooms").doc(r.id).update({ requests: AU(myId) }); }
    catch (e) { const x = new Error(e && e.code === "not-found" ? "الغرفة دي مش موجودة أو اتمسحت" : "ماقدرتش أبعت الطلب (ممكن تكون محظور من الغرفة)"); x.custom = true; throw x; }
    logJoin(r, "request"); reqFlash("✓ اتبعت طلب الانضمام، هيوصلك إشعار أول ما يوافق المالك"); return;
  }
  $("msheet").hidden = true; closeDrawer(); openRoom(r.id); flash("✓ " + r.name);
}
async function tryJoin() {
  if (!joinId || !db) return;
  const code = joinId; joinId = null;
  const r = await lookupCode(code); if (!r) { flash("كود الغرفة غلط أو اتلغى"); return; }
  joinRoom(r).catch(e => flash("ماقدرتش أدخل الغرفة: " + errMsg(e)));
}
async function shareText(text) {
  if (navigator.share) { try { await navigator.share({ title: "Very Chat", text }); return "shared"; } catch (e) { if (e && e.name === "AbortError") return "shared"; } }
  return (await copyText(text)) ? "copied" : "failed";
}
function shareInvite(r) {
  shareText("انضم لغرفة «" + r.name + "» على Very Chat\nالكود: " + r.code + "\nالرابط: " + PAGE_URL + "#r-" + r.code).then(x => { if (x !== "shared") setStatus(x === "copied" ? "✓ اتنسخت رسالة الدعوة" : "ماقدرتش أنسخ الدعوة"); });
}
function openDiscover() {
  const c = $("mcard"); c.textContent = ""; c.append(el("div", "mprev mh", "🔑 غرفة أو صديق بالكود"));
  const box = el("div", "acts"); box.style.cssText = "display:flex;flex-direction:column;gap:10px";
  box.append(el("div", "note", "اكتب كود غرفة (للانضمام) أو كود صاحبك (للمراسلة الخاصة)"));
  const row = el("div"); row.style.cssText = "display:flex;gap:8px";
  const cin = el("input"); cin.type = "text"; cin.placeholder = "كود غرفة أو كود شخص"; cin.autocomplete = "off"; cin.maxLength = 12; cin.autocapitalize = "characters";
  cin.style.cssText = "padding:12px 14px;border-radius:12px;border:1px solid var(--line);background:var(--bg);color:var(--ink);text-align:center;width:100%";
  const go = el("button", "send", "انضمام"); go.style.padding = "0 18px"; const msg = el("div", "note");
  go.onclick = async () => {
    if (!cin.value.trim()) return; go.disabled = true; msg.textContent = ""; const r = await lookupCode(cin.value); go.disabled = false;
    if (!r) {
      const pc = normFCode(cin.value), pu = pc.length === 8 && Object.keys(profiles).find(u => profiles[u] && profiles[u].fcode === pc);
      if (pu === myId) { msg.textContent = "ده كودك أنت 🙂"; return; }
      if (pu) { openPeer(pu); return; }
      msg.textContent = "مفيش غرفة أو شخص بالكود ده، اتأكد منه."; return;
    }
    go.disabled = true; try { await joinRoom(r); } catch (e) { go.disabled = false; msg.textContent = errMsg(e); }
  };
  cin.addEventListener("keydown", e => { if (e.key === "Enter") go.click(); });
  row.append(cin, go); box.append(row, msg); c.append(box); $("msheet").hidden = false;
}
$("dFind").onclick = () => { closeDrawer(); openDiscover(); };
window.addEventListener("online", () => { if (!started) start(); });
window.addEventListener("hashchange", () => { const m = location.hash.match(/^#r-([A-Za-z0-9-]+)$/); if (m) { joinId = m[1]; tryJoin(); } });
function copyBtn(label, text, cls) {
  const b = el("button", cls || "ghost", label);
  b.onclick = async () => { const ok = await copyText(text); b.textContent = ok ? "✓ تم النسخ" : "ماقدرتش أنسخ، انسخه يدوياً: " + text; if (ok) setTimeout(() => { b.textContent = label; }, 1600); };
  return b;
}
const FW_CK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const FW_SEARCH = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>';
const FW_SEND = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 3 10 14"/><path d="m21 3-7 18-4-7-7-4z"/></svg>';
function fwdTargets() {
  const out = [], seen = new Set();
  const add = (t) => { if (!seen.has(t.id)) { seen.add(t.id); out.push(t); } };
  const g = generalRoom(); if (!writeBlock(g)) add({ id: g.id, name: g.name, sub: ["الدردشة العامة", ""], av: g, keys: "", sec: 0 });
  Object.values(dms).filter(d => dmEstablished(d) && !pendingIn(d)).sort((a, b) => ((b.last || {}).ts || 0) - ((a.last || {}).ts || 0)).forEach(d => {
    const r = dmRoom(d.id); if (writeBlock(r)) return;
    const p = profiles[dmPeerOf(d.id)] || {};
    add({ id: d.id, name: r.name, sub: ["رسالة خاصة", p.fcode ? fmtFCode(p.fcode) : ""], av: r, keys: normFCode(p.fcode), sec: 1 });
  });
  rooms.filter(canSee).forEach(r => {
    if (writeBlock(r)) return;
    add({ id: r.id, name: r.name, sub: [r.private ? "🔒 غرفة خاصة" : "غرفة", r.code || ""], av: r.emoji || r.photo ? r : { emoji: "💬", color: "#5b6b78" }, keys: nzc(r.code), sec: 2 });
  });
  return out;
}
function openForward(msgs) {
  const c = $("mcard"); c.textContent = ""; const pick = new Map(), all = fwdTargets();
  const gen = all.find(t => t.sec === 0), dmAll = all.filter(t => t.sec === 1), rmAll = all.filter(t => t.sec === 2);
  let tab = dmAll.length || !rmAll.length ? 1 : 2;
  const root = el("div", "fw"), head = el("div", "fwh"), x = el("button", "fwx", "✕"); x.type = "button"; x.setAttribute("aria-label", "إغلاق");
  const ht = el("div", "fwt"); ht.append(el("b", "", "↪️ تحويل إلى…"), el("small", "", msgs.length > 1 ? msgs.length + " رسائل" : "رسالة واحدة"));
  head.append(ht, x); x.onclick = () => { $("msheet").hidden = true; };
  const sbox = el("div", "fws"), si = el("input"), sic = el("span", "fwsi"), sx = el("button", "fwsc", "✕"); sic.innerHTML = FW_SEARCH; sx.type = "button"; sx.hidden = true;
  si.type = "search"; si.placeholder = "ابحث بالاسم أو الكود…"; si.autocomplete = "off"; si.autocapitalize = "none"; si.enterKeyHint = "search"; si.setAttribute("aria-label", "بحث");
  sbox.append(sic, si, sx);
  const chips = el("div", "fwc"); chips.hidden = true;
  const pin = el("div", "fwpin");
  const tabs = el("div", "fwtabs"); tabs.setAttribute("role", "tablist");
  const mkTab = (id, label) => { const b = el("button", "fwtab"), l = el("span", "fwtl", label), n = el("em", "", "0"), k = el("i", "", "0"); b.type = "button"; b.setAttribute("role", "tab"); b.append(l, n, k); b.onclick = () => { tab = id; paint(); list.scrollTop = 0; }; b._n = n; b._k = k; return b; };
  const tDm = mkTab(1, "💬 خاصة"), tRm = mkTab(2, "👥 الغرف"); tabs.append(tDm, tRm);
  const list = el("div", "fwl"), foot = el("div", "fwf"), names = el("div", "fwn", "اختار واحد أو أكتر"), go = el("button", "fwg"); go.type = "button"; go.disabled = true;
  const goI = el("span", "fwgi"), goN = el("span", "fwgn"); goI.innerHTML = FW_SEND; go.append(goI, goN); foot.append(names, go);
  root.append(head, sbox, chips, pin, tabs, list, foot); c.append(root);
  const rowEls = new Map();
  function sync() {
    const n = pick.size; go.disabled = !n; goN.textContent = n || ""; goN.hidden = !n; go.setAttribute("aria-label", "إرسال");
    names.textContent = n ? [...pick.values()].map(t => t.name).join("، ") : "اختار واحد أو أكتر"; names.classList.toggle("on", !!n);
    chips.hidden = !n; chips.textContent = "";
    [...pick.values()].forEach(t => {
      const ch = el("button", "fwchip"); ch.type = "button"; const av = avatar(t.av), rm = el("i", "", "✕"); const w = el("span", "fwchw"); w.append(av, rm);
      ch.append(w, el("small", "", t.name)); ch.onclick = () => { pick.delete(t.id); const r = rowEls.get(t.id); if (r) { r.classList.remove("on"); r.setAttribute("aria-checked", "false"); } sync(); }; chips.appendChild(ch);
    });
    [[tDm, 1], [tRm, 2]].forEach(([b, k]) => { const m = [...pick.values()].filter(t => t.sec === k).length; b._k.textContent = m; b._k.hidden = !m; });
  }
  function toggle(t, row) { if (pick.has(t.id)) pick.delete(t.id); else pick.set(t.id, t); row.classList.toggle("on", pick.has(t.id)); row.setAttribute("aria-checked", pick.has(t.id)); sync(); }
  function mkRow(t) {
    const row = el("button", "fwrow" + (pick.has(t.id) ? " on" : "")), tx = el("div", "fwrt"), ck = el("span", "fwck"), aw = el("span", "fwav");
    row.type = "button"; row.setAttribute("role", "checkbox"); row.setAttribute("aria-checked", pick.has(t.id));
    ck.innerHTML = FW_CK; const nm = el("b", "", t.name); const sb = el("small", ""); sb.append(t.sub[0]); if (t.sub[1]) { const bd = document.createElement("bdi"); bd.textContent = t.sub[1]; sb.append(" · ", bd); }
    tx.append(nm, sb); aw.append(avatar(t.av)); const bd = el("span", "fwbd"); bd.innerHTML = FW_CK; aw.append(bd);
    row.append(aw, tx, ck); row.onclick = () => toggle(t, row); rowEls.set(t.id, row); return row;
  }
  let lastQ = "";
  function paint() {
    const q = si.value, qn = nzq(q), qc = nzc(q), qf = normFCode(q); sx.hidden = !q; list.textContent = ""; pin.textContent = ""; rowEls.clear();
    const ok = t => !q || nzq(t.name).includes(qn) || (qc.length >= 2 && t.keys.includes(qc)) || (qf.length >= 2 && t.keys.includes(qf));
    const gHit = gen && ok(gen) ? gen : null, dHit = dmAll.filter(ok), rHit = rmAll.filter(ok);
    if (q !== lastQ) { lastQ = q; if (tab === 1 && !dHit.length && rHit.length) tab = 2; else if (tab === 2 && !rHit.length && dHit.length) tab = 1; }
    tDm._n.textContent = dHit.length; tRm._n.textContent = rHit.length;
    tDm.classList.toggle("on", tab === 1); tRm.classList.toggle("on", tab === 2); tDm.setAttribute("aria-selected", tab === 1); tRm.setAttribute("aria-selected", tab === 2);
    if (gHit) pin.appendChild(mkRow(gHit)); pin.hidden = !gHit;
    const hit = tab === 1 ? dHit : rHit; hit.forEach(t => list.appendChild(mkRow(t)));
    if (!hit.length) {
      const other = tab === 1 ? rHit.length : dHit.length, n = el("div", "dnone");
      n.textContent = q ? "مفيش نتيجة بالاسم أو الكود ده هنا." + (other ? " فيه " + other + " نتيجة في «" + (tab === 1 ? "الغرف" : "خاصة") + "»." : "") : tab === 1 ? "مفيش محادثات خاصة تقدر تحوّل ليها." : "مفيش غرف تقدر تحوّل ليها.";
      list.appendChild(n);
      const pu = tab === 1 && qf.length === 8 ? Object.keys(profiles).find(u => u !== myId && profiles[u] && profiles[u].fcode === qf) : null;
      if (pu) n.textContent = "«" + pname(pu) + "» لسه ما بينكوش محادثة مفتوحة. ابعتله طلب محادثة الأول من «🔑 غرفة أو صديق بالكود».";
      if (q && other) { const sw = el("button", "ghost", "اعرض النتائج في «" + (tab === 1 ? "الغرف" : "خاصة") + "»"); sw.type = "button"; sw.onclick = () => { tab = tab === 1 ? 2 : 1; paint(); }; list.appendChild(sw); }
    }
  }
  let tx0 = 0, ty0 = 0;
  list.addEventListener("touchstart", e => { const t = e.touches[0]; tx0 = t.clientX; ty0 = t.clientY; }, { passive: true });
  list.addEventListener("touchend", e => { const t = e.changedTouches[0], dx = t.clientX - tx0, dy = t.clientY - ty0; if (Math.abs(dx) > 70 && Math.abs(dy) < 40) { const nt = dx > 0 ? 2 : 1; if (nt !== tab) { tab = nt; paint(); list.scrollTop = 0; } } }, { passive: true });
  si.oninput = paint; sx.onclick = () => { si.value = ""; paint(); si.focus(); };
  si.addEventListener("keydown", e => { if (e.key === "Escape") { if (si.value) { si.value = ""; paint(); } else $("msheet").hidden = true; } });
  const mkDoc = (rid, m, ts) => ({ ...mBase(rid), text: m.text || "", ...(m.audio ? { audio: m.audio, dur: m.dur || 0 } : {}), ...(m.mk === "doc" ? { fname: m.fname || "", fsize: m.fsize || 0, ftype: m.ftype || "" } : {}), ...(m.poll ? { poll: m.poll } : {}), ...(m.mid ? { mid: m.mid, mk: m.mk || "img", thumb: m.thumb || "", w: m.w || 0, h: m.h || 0 } : {}), ...(m.img ? { img: m.img, thumb: m.thumb || "", w: m.w || 0, h: m.h || 0 } : {}), ...(m.vid ? { vid: m.vid, thumb: m.thumb || "", w: m.w || 0, h: m.h || 0 } : {}), ...(m.share ? { share: m.share } : {}), uid: myId, ts, fwd: m.fwd || nameOf(m.uid) });
  go.onclick = async () => {
    if (!pick.size || go.disabled) return; go.disabled = true; go.classList.add("busy"); let i = 0, bad = 0, why = "";
    for (const t of pick.values()) { for (const m of msgs) { try { await sendDoc(mkDoc(t.id, m, Date.now() + (i++))); } catch (e) { bad++; if (e && e.custom) why = e.message; } } }
    $("msheet").hidden = true; if (selMode) exitSel();
    if (!bad) setStatus("✓ تم التحويل" + (pick.size > 1 ? " إلى " + pick.size : "")); else setStatus(why || "ماقدرتش أحوّل بعض الرسايل.");
    setTimeout(() => { if (/^✓ تم التحويل/.test($("status").textContent)) setStatus(""); }, 3000);
  };
  paint(); sync(); $("msheet").hidden = false;
  if (matchMedia("(pointer:fine)").matches) setTimeout(() => si.focus(), 60);
}

const FCA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const rndFCode = () => Array.from({ length: 8 }, () => FCA[Math.floor(Math.random() * 32)]).join("");
const fmtFCode = c => c ? c.slice(0, 4) + "-" + c.slice(4) : "";
const normFCode = v => String(v || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
async function uniqueFCode() {
  for (let i = 0; i < 6; i++) {
    const c = rndFCode();
    if (Object.values(profiles).some(p => p && p.fcode === c)) continue;
    try { const s = await db.collection("profiles").where("fcode", "==", c).limit(1).get(); if (s.empty) return c; }
    catch (e) { return c; }
  }
  return rndFCode();
}
let codeBusy = false;
async function ensureMyCode() {
  const p = profiles[myId]; if (!p || p.fcode || codeBusy || !db) return;
  codeBusy = true;
  try { await db.doc("profiles/" + myId).update({ fcode: await uniqueFCode() }); } catch (e) {}
  codeBusy = false;
}
function paintMyCode() { const u = $("myUidRow"); if (u) u.textContent = myId || "—"; const e = $("myCode"); if (e) e.textContent = fmtFCode((profiles[myId] || {}).fcode) || "جاري إنشاء الكود…"; }
function friendFinder(mem, banned, onAdd, btnLabel, memLabel) {
  const w = el("div", "ffind"); w.style.cssText = "display:flex;flex-direction:column;gap:8px";
  w.append(el("div", "note", "اكتب كود صديقك (8 حروف وأرقام) وهيظهرلك هو بالظبط. كل واحد ليه كود مختلف، فمفيش لخبطة في الأسامي."));
  const inp = document.createElement("input"); inp.placeholder = "مثال: K7M2-9QXA"; inp.maxLength = 12; inp.dir = "ltr"; inp.autocomplete = "off"; inp.autocapitalize = "characters"; inp.spellcheck = false;
  inp.style.cssText = "text-align:center;letter-spacing:2px;font-size:18px;font-weight:700;padding:12px;border-radius:14px;border:1px solid var(--line);background:var(--bg);color:var(--ink);width:100%";
  const go = el("button", "send", "🔎 بحث"); go.type = "button"; go.style.padding = "12px";
  const out = el("div"); out.style.cssText = "display:flex;flex-direction:column;gap:6px";
  const run = async () => {
    const code = normFCode(inp.value); out.textContent = "";
    if (code.length !== 8) { out.append(el("div", "note", "الكود لازم يكون 8 حروف وأرقام.")); return; }
    go.disabled = true; let uid = null, data = null;
    const loc = Object.keys(profiles).find(u => profiles[u] && profiles[u].fcode === code);
    if (loc) { uid = loc; data = profiles[loc]; }
    else {
      try { const s = await db.collection("profiles").where("fcode", "==", code).limit(1).get(); if (!s.empty) { uid = s.docs[0].id; data = s.docs[0].data(); } }
      catch (e) { go.disabled = false; out.append(el("div", "note", "ماقدرتش أبحث دلوقتي، جرّب تاني.")); return; }
    }
    go.disabled = false;
    if (!uid) { out.append(el("div", "note", "مفيش حد بالكود ده، اتأكد منه.")); return; }
    const row = el("div", "rrow"); row.style.cursor = "default"; row.append(avatar(data), el("b", "", nickOf(uid) || data.name || "مجهول"));
    if (uid === myId) row.append(el("span", "note", "ده كودك أنت"));
    else if (mem.includes(uid)) row.append(el("span", "note", memLabel || "موجود في الغرفة"));
    else if (banned.includes(uid)) row.append(el("span", "note", "محظور"));
    else { const b = el("button", "send", btnLabel || "＋ إضافة"); b.type = "button"; b.style.cssText += ";margin-inline-start:auto;padding:8px 16px"; b.onclick = () => { b.disabled = true; onAdd(uid); }; row.append(b); }
    out.append(row);
  };
  go.onclick = run; inp.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); run(); } };
  w.append(inp, go, out); return w;
}
function openMembers(r) {
  const c = $("mcard"); c.textContent = ""; const owner = isOwner(r);
  const mem = [...new Set([...(r.members || []), ...(r.by ? [r.by] : [])])];
  const change = async (u, add) => { await db.collection("rooms").doc(r.id).update({ members: add ? FV().arrayUnion(u) : FV().arrayRemove(u) }); openMembers({ ...r, members: add ? [...new Set([...mem, u])] : mem.filter(y => y !== u) }); };
  c.append(el("div", "mprev", "👥 " + r.name));
  const box = el("div", "acts"); box.style.cssText = "display:flex;flex-direction:column;gap:6px;max-height:46vh;overflow-y:auto";
  box.append(el("div", "note", r.private ? "🔒 غرفة خاصة: الأعضاء بس هم اللي بيشوفوها، والانضمام بالكود أو الرابط بس" : "🌐 غرفة عامة: أي حد يلاقيها في البحث وينضم"));
  mem.forEach(u => {
    const row = el("div", "rrow"); row.append(avatar(profileFor(u, r.id)), el("b", "", nameOf(u, r.id) + (u === r.by ? " (المنشئ)" : "")));
    if (owner && u !== r.by && u !== myId) { const x = el("button", "ghost", "إزالة"); x.style.marginInlineStart = "auto"; x.onclick = () => change(u, false).catch(() => setStatus("ماقدرتش أشيله.")); row.append(x); }
    box.append(row);
  });
  if (owner) {
    box.append(friendFinder(mem, r.banned || [], u => change(u, true).catch(() => setStatus("ماقدرتش أضيفه."))));
  }
  c.append(box);
  const canInvite = owner || (!r.private && canSee(r));
  if (canInvite && r.code) {
    c.append(el("div", "mprev", "🔑 كود الغرفة: " + r.code), copyBtn("📋 نسخ الكود", r.code), copyBtn("🔗 نسخ رابط الدعوة", PAGE_URL + "#r-" + r.code));
    const sh = el("button", "send", "📤 مشاركة الدعوة"); sh.onclick = () => shareInvite(r); c.append(sh);
  }
  else if (owner) {
    const mk = el("button", "send", "🔗 إنشاء رابط دعوة");
    mk.onclick = async () => { const { id, ...keep } = r, code = newCode(); try { await db.collection("rooms").doc(r.id).set({ ...keep, code }); openMembers({ ...r, code }); } catch (e) { setStatus("ماقدرتش أنشئ الرابط."); } };
    c.append(mk);
  }
  if (!owner && (r.members || []).includes(myId)) {
    const lv = el("button", "ghost", "🚪 مغادرة الغرفة");
    lv.onclick = async () => { try { await db.collection("rooms").doc(r.id).update({ members: FV().arrayRemove(myId) }); $("msheet").hidden = true; openRoom("general"); } catch (e) { setStatus("ماقدرتش أغادر."); } };
    c.append(lv);
  }
  $("msheet").hidden = false;
}
function openInvite() {
  const c = $("mcard"); c.textContent = ""; c.append(el("div", "mprev", "👋 دعوة صديق للتطبيق"));
  const box = el("div", "acts"); box.style.cssText = "display:flex;flex-direction:column;gap:10px;line-height:1.7;font-size:14px";
  ["١. ابعت رابط التطبيق لصاحبك (زرار المشاركة تحت).", "٢. يفتحه من موبايله ويضغط «إضافة إلى الشاشة الرئيسية» علشان يبقى تطبيق.", "٣. لو معاك كود غرفة أو كود صاحبك: يكتبه من «🔑 غرفة أو صديق بالكود». وتقدر تبعتله كودك من ＋ ← 🆔 كودي."].forEach(t => box.append(el("div", "", t)));
  const sh = el("button", "send", "📤 مشاركة التطبيق");
  sh.onclick = async () => { const x = await shareText("جرّب Very Chat 💬\n" + PAGE_URL); if (x !== "shared") sh.textContent = x === "copied" ? "✓ اتنسخ الرابط" : "فشل النسخ"; };
  c.append(box, sh, copyBtn("🔗 نسخ رابط التطبيق", PAGE_URL));
  const mc = (profiles[myId] || {}).fcode; if (mc) c.append(copyBtn("🆔 نسخ كودي: " + fmtFCode(mc), fmtFCode(mc)));
  $("msheet").hidden = false;
}
$("dInvite").onclick = () => { closeDrawer(); openInvite(); };
$("selFwd").onclick = () => { const a = lastList.filter(x => sel.has(x.id) && !x.del); if (a.length) openForward(a); };

let recent = [], firstRecent = true, replyTo = null; const T0 = Date.now();
function errMsg(e) {
  if (e && e.custom) return e.message;
  const c = (e && e.code) || "";
  if (c === "permission-denied") return "مفيش صلاحية. اتأكد من قواعد Firebase (Rules).";
  if (c === "not-found") return "الغرفة دي مش موجودة أو اتمسحت.";
  if (c === "unavailable") return "السيرفر مش متاح دلوقتي، اتأكد من النت.";
  if (c === "failed-precondition") return "فيه إعداد ناقص في Firebase: " + ((e && e.message) || "");
  return "حصلت مشكلة: " + ((e && e.message) || c || "غير معروفة");
}
const NET = { cache: false, was: false, t: 0, ok: 0 };
function netUI() {
  const el = $("net"); if (!el) return;
  const off = navigator.onLine === false, n = (typeof lastList !== "undefined" ? lastList : []).filter(m => m._p).length, tail = n ? " · " + n + (n === 1 ? " رسالة منتظرة" : " رسايل منتظرة") : "";
  clearTimeout(NET.t);
  const show = (cls, txt) => { el.className = cls; el.textContent = txt; el.hidden = false; };
  if (off) { NET.was = true; clearTimeout(NET.ok); show("off", "⚠️ مفيش اتصال بالنت · رسايلك هتتبعت أول ما يرجع" + tail); return; }
  if (NET.cache) { if (NET.was) show("con", "🔄 جاري الاتصال…" + tail); else if (n) show("con", "🔄 جاري الإرسال…" + tail); else NET.t = setTimeout(() => { if (NET.cache && navigator.onLine !== false) show("con", "🔄 جاري الاتصال…"); }, 4000); return; }
  if (NET.was) { NET.was = false; show("ok", "✅ رجع الاتصال"); clearTimeout(NET.ok); NET.ok = setTimeout(() => { if (el.className === "ok") el.hidden = true; }, 2200); return; }
  if (el.className !== "ok") el.hidden = true;
}
window.addEventListener("online", () => { try { if (db) db.enableNetwork().catch(() => {}); } catch (_) {} netUI(); }); window.addEventListener("offline", netUI);
setTimeout(netUI, 0);
function unreadOf(rid) { if (isDM(rid)) return ((dms[rid] || {}).unread || {})[myId] || 0; return readsLoaded ? recent.filter(m => m.room === rid && m.uid !== myId && !m.del && m.ts > (myReads[rid] || 0)).length : 0; }
function updateTotal() {
  let n = 0; ["general", ...rooms.filter(canSee).map(r => r.id), ...Object.keys(dms).filter(k => !pendingIn(dms[k]) && !dmCancelled(dms[k]))].forEach(id => { n += unreadOf(id); });
  try { Object.keys(dms).forEach(k => { if (unreadOf(k)) verifyDm(dms[k]); }); } catch (_) {}
  const rc = reqCount(), bg = $("reqBdg"); bg.hidden = !rc; bg.textContent = rc > 99 ? "99+" : rc; renderReqs();
  $("menuBtn").classList.toggle("un", n > 0 || rc > 0); document.title = (n ? "(" + n + ") " : "") + "Very Chat";
  try { const bn = n + rc; if (navigator.setAppBadge) (bn > 0 ? navigator.setAppBadge(bn) : navigator.clearAppBadge()).catch(() => {}); } catch (_) {}   // رقم الرسايل الجديدة على أيقونة التطبيق
}
async function pushLocal(title, body, tag) {
  try { const reg = await navigator.serviceWorker.getRegistration(); if (reg) { await reg.showNotification(title, { body, tag, icon: "icon-192.png" }); return; } } catch (e) {}
  try { new Notification(title, { body, tag }); } catch (e) {}
}
function notifyMsg(m) {
  if (m.uid === myId || !document.hidden || !("Notification" in window) || Notification.permission !== "granted") return;
  if (m.room !== "general" && !rooms.some(r => r.id === m.room && canSee(r))) return;
  pushLocal(m.room === "general" ? "عام" : roomName(m.room), nameOf(m.uid, m.room) + ": " + mtext(m), m.room);
}
function linkify(node, text) {
  String(text || "").split(/(https?:\/\/[^\s]+)/g).forEach(part => {
    if (/^https?:\/\//.test(part)) {
      const tail = (part.match(/[.,!?؟،;:)\]}"']+$/) || [""])[0], url = tail ? part.slice(0, -tail.length) : part; if (tail) part = url;
      const a = document.createElement("a"); a.href = part; a.textContent = part; a.target = "_blank"; a.rel = "noopener noreferrer";
      a.style.cssText = "color:inherit;text-decoration:underline"; a.addEventListener("click", e => e.stopPropagation()); node.appendChild(a); if (tail) node.appendChild(document.createTextNode(tail));
    } else if (part) node.appendChild(document.createTextNode(part));
  });
}
function startReply(m) {
  cancelEdit(); replyTo = { name: nameOf(m.uid), uid: m.uid, text: mtext(m).slice(0, 80), id: m.id };
  $("replyTxt").textContent = "↩️ رد على " + replyTo.name + ": " + replyTo.text; $("replyBar").hidden = false; $("inp").focus();
}
function clearReply() { replyTo = null; $("replyBar").hidden = true; }
$("cancelReply").onclick = clearReply;
const gName = () => { try { return (firebase.auth().currentUser.displayName || "").slice(0, 20); } catch (e) { return ""; } };
function accUI() {
  if (!(window.firebase && firebase.auth && firebase.auth().currentUser)) return;
  const u = firebase.auth().currentUser;
  $("accNote").textContent = u.isAnonymous ? "حسابك مؤقت على الجهاز ده. اربطه بجوجل علشان تدخل بنفس الحساب والرسايل من أي جهاز." : "مربوط بجوجل: " + (u.email || "");
  $("accBtn").textContent = u.isAnonymous ? "🔐 ربط الحساب بجوجل" : "تسجيل الخروج"; $("accBtn").classList.toggle("pri", !!u.isAnonymous);
}
$("accBtn").onclick = async () => {
  const u = firebase.auth().currentUser, prov = new firebase.auth.GoogleAuthProvider();
  try {
    if (u.isAnonymous) {
      try { await u.linkWithPopup(prov); }
      catch (e) { if (e.code === "auth/credential-already-in-use" && e.credential) await firebase.auth().signInWithCredential(e.credential); else throw e; }
    } else { await pushUnreg(); await firebase.auth().signOut(); }
    location.reload();
  } catch (e) { perr("ماقدرتش أكمل (" + (e.code || e.message) + "). اتأكد إن تسجيل جوجل متفعل في Firebase."); }
};
$("dNotif").onclick = async () => { try { if (Notification.permission === "default") await Notification.requestPermission(); } catch (e) {} await pushInit(true); $("dNotif").hidden = !("Notification" in window) || pushReady; };
/* Very Chat — إشعارات الـ Push (Firebase Cloud Messaging عن طريق Cloudflare Worker) */
// بتوصلك الإشعارات حتى والتطبيق مقفول. لو PUSH_URL أو VAPID_KEY فاضيين، الميزة دي متوقفة والباقي شغال عادي.
let pushReady = false;
async function pushCall(path, body) {
  const u = firebase.auth().currentUser; if (!u) return { ok: false, status: 0, err: "مش مسجّل دخول" };
  const r = await fetch(PUSH_URL.replace(/\/+$/, "") + path, { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + await u.getIdToken() }, body: JSON.stringify(body) });
  let j = null; try { j = await r.json(); } catch (_) {}
  return { ok: r.ok, status: r.status, err: j && j.error };
}
async function pushInit(manual) {
  const say = t => { if (manual) toast(t + " (نسخة " + String(BUILD).slice(-2) + ")", true); };
  if (pushReady) { say("✅ الإشعارات شغالة على الجهاز ده"); return; }
  if (!PUSH_URL || !VAPID_KEY) return say("⚠️ إعدادات الإشعارات ناقصة في core.js");
  if (!myId) return say("⚠️ سجّل دخولك الأول");
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return say("⚠️ المتصفح ده مش بيدعم إشعارات الخلفية. على الآيفون ثبّت التطبيق على الشاشة الرئيسية وافتحه منها");
  if (Notification.permission !== "granted") return say("⚠️ الإذن مش مفعّل (" + Notification.permission + "). فعّله من إعدادات الموقع ← الإشعارات");
  if (!/^https?:/.test(location.protocol)) return;
  try {
    if (!(firebase.messaging && await Promise.resolve(firebase.messaging.isSupported()))) return say("⚠️ Firebase Messaging مش مدعوم على الجهاز/المتصفح ده");
    const reg = await Promise.race([navigator.serviceWorker.ready, new Promise((_, no) => setTimeout(() => no(new Error("الـ service worker مش جاهز")), 8000))]);
    let tok; try { tok = await firebase.messaging().getToken({ vapidKey: VAPID_KEY, serviceWorkerRegistration: reg }); } catch (e) { return say("⚠️ ماقدرتش أجيب توكن الإشعارات: " + (e.code || e.message)); }
    if (!tok) return say("⚠️ مفيش توكن للجهاز");
    const key = tok + "|" + myId + "|" + Math.floor(Date.now() / 6048e5); let last = ""; try { last = localStorage.getItem("vc_ptok") || ""; } catch (_) {}
    if (manual || last !== key) {
      let rr; try { rr = await pushCall("/register", { token: tok }); } catch (e) { let up = false; try { await Promise.race([fetch(PUSH_URL, { mode: "no-cors", cache: "no-store" }), new Promise((_, no) => setTimeout(no, 6000))]); up = true; } catch (_) {} return say(up ? "⚠️ الـ Worker شغال بس المتصفح منع الطلب (CORS). اتأكد إن الدومين في worker.js هو " + location.origin : "⚠️ الرابط ده مش بيفتح: " + PUSH_URL + " (مش منشور أو غلط)"); }
      if (!rr.ok) return say("⚠️ الـ Worker رفض التسجيل (" + rr.status + (rr.err ? ": " + rr.err : "") + ")");
      try { localStorage.setItem("vc_ptok", key); localStorage.setItem("vc_ptok_raw", tok); } catch (_) {}
    }
    pushReady = true; say("✅ الإشعارات اتفعّلت على الجهاز ده");
  } catch (e) { say("⚠️ خطأ: " + (e.message || e)); }
}
async function pushUnreg() {   // قبل تسجيل الخروج: الجهاز ده ميستقبلش إشعارات الحساب ده تاني
  try { const t = localStorage.getItem("vc_ptok_raw"); if (!PUSH_URL || !t) return; await Promise.race([pushCall("/unregister", { token: t }), new Promise(r => setTimeout(r, 2500))]); localStorage.removeItem("vc_ptok"); localStorage.removeItem("vc_ptok_raw"); } catch (_) {}
}
function pushMsg(doc) {
  if (!PUSH_URL || !myId) return;
  const rid = doc.room, dm = isDM(rid);
  pushCall("/notify", { kind: "msg", room: rid, title: dm ? "💬 " + myName() : rid === "general" ? "عام" : roomName(rid), body: dm ? mtext(doc).slice(0, 60) : nameOf(myId, rid) + ": " + mtext(doc) }).catch(() => {});
}
function pushTo(to, type, name, roomName) {
  if (!PUSH_URL || !myId || !to || to === myId) return;
  pushCall("/notify", { kind: "to", to, type, name, roomName }).catch(() => {});
}
// مسح إشعارات المحادثة لما تفتحها (زي واتساب)، فالرسالة الجاية تنبّه من جديد
function clearNotifs(...tags) {
  try { if (!navigator.serviceWorker) return; navigator.serviceWorker.getRegistration().then(r => r && Promise.all(tags.filter(Boolean).map(t => r.getNotifications({ tag: t }).then(ns => ns.forEach(n => n.close()))))).catch(() => {}); } catch (_) {}
}
document.addEventListener("visibilitychange", () => { if (!document.hidden) clearNotifs(room, "join", "req", "info"); });
// فتح الغرفة/المحادثة اللي جاي منها الإشعار
function openByTag(t, tries) {
  t = String(t || ""); if (!t || t === "info") return;
  if (t === "join" || t === "req") { openReqs(); return; }
  if (!started) { if ((tries || 0) < 20) setTimeout(() => openByTag(t, (tries || 0) + 1), 500); return; }
  if (t === "general" || isDM(t) || rooms.some(r => r.id === t && canSee(r))) { try { closeDrawer(); } catch (_) {} openRoom(t); }
  else if ((tries || 0) < 16) setTimeout(() => openByTag(t, (tries || 0) + 1), 500);
}
try { const q = new URLSearchParams(location.search), o = q.get("open"); if (o) { history.replaceState(null, "", location.pathname + location.hash); setTimeout(() => openByTag(o), 400); } } catch (_) {}
function softReload() {
  if (document.getElementById("updov")) return; const o = document.createElement("div"); o.id = "updov";
  o.style.cssText = "position:fixed;inset:0;z-index:99;background:var(--bg);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:var(--ink);font-weight:800;font-size:20px";
  o.innerHTML = '<div style="width:84px;height:84px">' + logo("lgU") + '</div>Very Chat<div style="font-size:12px;font-weight:400;opacity:.6">جاري التحديث…</div>';
  document.body.append(o); setTimeout(() => location.reload(), 120);
}
function registerSW() {
  if (!("serviceWorker" in navigator) || !/^https?:/.test(location.protocol)) return;
  const had = !!navigator.serviceWorker.controller; let reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => { if (had && !reloaded) { reloaded = true; softReload(); } });
  navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then(r => { r.update().catch(() => {}); document.addEventListener("visibilitychange", () => { if (!document.hidden) r.update().catch(() => {}); }); }).catch(() => {});
}