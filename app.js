/* Very Chat — الإعدادات والأدوات الأساسية */
// ═══ إعدادات Firebase: الصق هنا القيم من Firebase Console ← Project settings ← Your apps ← Web app ═══
// App Check: حط مفتاح reCAPTCHA v3 هنا بعد ما تفعّله من Firebase → App Check (فاضي = متوقف)
// الإشعارات (Push): الصق هنا رابط الـ Worker ومفتاح VAPID (Firebase ← Project settings ← Cloud Messaging ← Web Push certificates). فاضي = متوقفة
const PUSH_URL = "https://verychat-push.adhamemaad14.workers.dev";
const VAPID_KEY = "BLUhjxf71Ma_N_REq1eyVUo1-Pwl6j96_Cmkh05pvz2l_K3fnXeyPTsKp6AiL0xsbfHPKu1vzpVtr0OGDPk1iu0";
const APPCHECK_KEY = "6LdvzCsuAAAAAHvmMunzSxfkhomq9hmeyc4W9598";
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
const okSrc = (u, k) => { u = String(u || ""); return u.startsWith("blob:") || u.startsWith("data:" + k + "/"); };
const okPhoto = u => { u = String(u || ""); return u.startsWith("data:image/") || /^https:\/\/[a-z0-9.-]+\.googleusercontent\.com\//i.test(u); };
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
  const u = dmPeerOf(d.id), p = profiles[u] || {}, row = el("button", "rrow" + (d.id === room ? " on" : "")); row.type = "button"; row.style.setProperty("--rc", p.color || "#5b6b78");
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
const setNick = (u, v) => { const m = nickMap(); v = String(v || "").replace(/\s+/g, " ").trim().slice(0, 30); if (v && v !== ((profiles[u] || {}).name || "")) m[u] = v; else delete m[u]; try { localStorage.setItem("vc_nick_" + myId, JSON.stringify(m)); } catch (_) {} };
const pname = u => nickOf(u) || (profiles[u] || {}).name || "مجهول";
const repaintNames = () => { try { buildChips(); } catch (_) {} try { refreshMe(); } catch (_) {} try { if (lastList.length) render(lastList); } catch (_) {} };
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
  act("🧹", "مسح من عندي", "linear-gradient(135deg,#6bd0c0,#2a9d8f)", async (b, sp) => {
    if (!sure(b, sp)) return; close();
    try { await db.collection("dms").doc(d.id).update({ ["cleared." + myId]: Math.max(Date.now(), ((d.last || {}).ts || 0) + 1), ["unread." + myId]: 0 }); flash("🧹 اتمسحت من القايمة · لسه صديقك وتلاقيه بالبحث"); } catch (e) { flash(errMsg(e)); }
  });
  act("🗑", "حذف المحادثة", "linear-gradient(135deg,#ff7a7a,#d64545)", async (b, sp) => {
    if (!sure(b, sp)) return; close();
    try {
      const r = await deleteDmChat(d.id); if (room === d.id) openRoom("general");
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
    tx.append(el("b", "", p.name || "مجهول"), el("small", "", "اضغط للمراسلة")); row.append(avatar(p), tx);
    row.onclick = () => { closeDrawer(); openPeer(pu); }; box.appendChild(row);
  }
  sub.hidden = !box.children.length;
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
  else { d.style.background = (p && p.color) || "var(--line)"; d.textContent = (p && p.emoji) || "👤"; }
  return d;
}
function setAvatar(el, p) { el._photo = p && p.photo || ""; el.dataset.name = (p && p.name) || ""; el.replaceChildren(...avatar(p).childNodes); el.style.background = (p && !p.photo && p.color) || "var(--line)"; }

function closeDrawer() { $("drawer").hidden = true; }
const nzq = t => String(t || "").toLowerCase().replace(/[\u064B-\u0652\u0640]/g, "").replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/\s+/g, " ").trim();
const nzc = t => String(t || "").toLowerCase().replace(/[^a-z0-9]/g, "");
function roomMatches(r, q) {
  if (!q) return true;
  const n = nzq(r.name), qq = nzq(q), qc = nzc(q);
  return n.includes(qq) || (qc.length >= 2 && nzc(r.code).includes(qc));
}
function roomRow(r) {
  const row = document.createElement("button"); row.className = "rrow" + (r.id === room ? " on" : ""); row.style.setProperty("--rc", r.color || "#5b6b78");
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

// ───── طي/فتح قسمي الخاص والغرف (الحالة بتتحفظ) ─────
let foldSt = { dm: false, rooms: false };
try { foldSt = Object.assign(foldSt, JSON.parse(localStorage.getItem("vc_fold") || "{}")); } catch (e) {}
function applyFold() {
  const q = $("dSearch").value.trim();
  [["dm", "dmSub", "dmList", "flex"], ["rooms", "rmSub", "dlist", ""]].forEach(([k, sid, lid, disp]) => {
    const f = !!foldSt[k] && !q, h = $(sid), l = $(lid);   // أثناء البحث الأقسام بتتفتح تلقائيًا
    h.classList.toggle("fold", f); h.setAttribute("aria-expanded", String(!f));
    l.style.display = f ? "none" : disp;
    const n = k === "dm" ? $("dmList").children.length : rooms.filter(canSee).length;
    h.querySelector(".cnt").textContent = n || "";
  });
}
function toggleFold(k) {
  foldSt[k] = !foldSt[k];
  try { localStorage.setItem("vc_fold", JSON.stringify(foldSt)); } catch (e) {}
  applyFold();
}
["dmSub", "rmSub"].forEach(id => {
  const h = $(id);
  h.addEventListener("click", () => toggleFold(h.dataset.k));
  h.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleFold(h.dataset.k); } });
});
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
    const sig = [sgs(m), mine ? 1 : 0, first ? 1 : 0, sel.has(m.id) ? 1 : 0, selMode ? 1 : 0, first ? sgs(p) : "", mine && seenOK() ? seenBy(m).length : -1, p2 ? (p2.name || "") + (p2.fcode || "") + (m.ucard.name || "") + (nickOf(m.ucard.uid) || "") : "", m.share ? rooms.length : ""].join("¦");
    const hit = RC.get(m.id); if (hit && hit.sig === sig) { keep.add(m.id); nodes.push(hit.row); return; }
    const b = document.createElement("div"); b.className = "b";
    if (first && !mine) { const n = document.createElement("div"); n.className = "n"; n.dir = "rtl"; n.textContent = (p && p.name) || "مجهول"; n.style.cursor = "pointer"; n.onclick = e => { e.stopPropagation(); if (Date.now() - (b._f || 0) > 800) peerTap(m.uid, m.room || room); }; b.appendChild(n); }
    const dl = !!m.del;
    if (dl) { const x = el("div", "dl", delLabel(m)); x.dir = "rtl"; b.appendChild(x); b.classList.add("deld"); if (hit && !hit.dl) b.classList.add("poof"); row.dataset.dl = "1"; row._l0 = delLabel(m); }
    if (!dl && m.fwd) b.appendChild(el("div", "fw", "↪️ محوّلة من " + m.fwd));
    if (!dl && m.reply) { const q = el("div", "qt"); q.dir = "rtl"; q.append(el("b", "", m.reply.name || "مجهول"), document.createTextNode(m.reply.text || "")); if (m.reply.id) { q.classList.add("go"); q.onclick = e => { e.stopPropagation(); const t = $("msgs").querySelector('[data-mid="' + m.reply.id + '"]'); if (!t) { flash("الرسالة الأصلية مش موجودة"); return; } t.scrollIntoView({ block: "center", behavior: "smooth" }); t.classList.remove("hl"); void t.offsetWidth; t.classList.add("hl"); setTimeout(() => t.classList.remove("hl"), 1800); }; } b.appendChild(q); }
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
    if (mine) { const sc = document.createElement("span"); const n = seenOK() ? seenBy(m).length : 0; if (m._p) { sc.className = "pend"; sc.innerHTML = SVG_CLOCK; sc.title = "في انتظار الإرسال"; b.classList.add("pending"); } else sc.textContent = n ? "👁 " + n : "✓"; t.appendChild(sc); }
    const tm = document.createElement("span"); tm.textContent = new Date(m.ts).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }); t.appendChild(tm);
    b.appendChild(t); holdMenu(b, m); row.appendChild(b);
    if (selMode) { const ck = document.createElement("span"); ck.className = "ck"; ck.textContent = sel.has(m.id) ? "✓" : ""; row.appendChild(ck); }
    row.onclick = () => { if (selMode) toggleSel(m.id); }; nodes.push(row); RC.set(m.id, { sig, row, dl }); keep.add(m.id);
  } catch (err) { console.warn("رسالة تالفة اتخطّت", err); } });
  { let run = []; const flush = () => { run.forEach((r, i) => { r.classList.toggle("dgrp-x", i > 0); const x = r.querySelector(".dl"); if (x) x.textContent = i === 0 && run.length > 1 ? "🚫 " + run.length + " رسايل اتحذفت" : r._l0; }); run = []; };
    nodes.forEach(n => { if (n.dataset && n.dataset.dl && (!run.length || run[0].dataset.uid === n.dataset.uid)) run.push(n); else { flush(); if (n.dataset && n.dataset.dl) run.push(n); } }); flush(); }
  { const ns = new Set(nodes); [...box.childNodes].forEach(c => { if (!ns.has(c)) c.remove(); }); let cur = box.firstChild; for (const n of nodes) { if (n === cur) cur = cur.nextSibling; else box.insertBefore(n, cur); } for (const k of [...RC.keys()]) if (!keep.has(k)) RC.delete(k); } box._ids = new Set(list.map(x => x.id)); try { UPL.mount(list, box); } catch (_) {} try { DUP.mount(list, box); } catch (_) {}
  const lm = list[list.length - 1], mineNew = lm && lm.uid === myId && Date.now() - lm.ts < 5000;
  if (fresh) { box.scrollTop = box.scrollHeight; box._pin = 1; requestAnimationFrame(() => { if (box._pin) box.scrollTop = box.scrollHeight; setTimeout(() => { if (box._pin) box.scrollTop = box.scrollHeight; box._pin = 0; }, 400); }); }
  else if (near || mineNew || list.length < 4) box.scrollTop = box.scrollHeight;
  try { netUI(); } catch (_) {} boxScrolled(); _spMsg = true; if (_spMin) hideSplash();
  try { renderPin(); } catch (_) {}
  markSeen(list); updateTotal();
  setStatus(list.length ? "" : "مفيش رسايل لسه. ابدأ إنت!");
}

const DEL_TXT = "🚫 تم حذف هذه الرسالة";
const mtext = m => m.del ? DEL_TXT : m.audio ? "🎤 رسالة صوتية" : m.poll ? "📊 " + (m.poll.q || "استطلاع") : m.mk === "doc" ? "📄 " + (m.fname || "مستند") : (m.mid ? m.mk === "vid" : false) || m.vid ? "🎥 فيديو" + (m.text ? " · " + m.text : "") : m.mid || m.img ? "🖼 صورة" + (m.text ? " · " + m.text : "") : m.ucard ? "🆔 كارت تعريف" : m.share ? "🏠 غرفة: " + (m.share.name || "") : (m.text || "");
const EMO = {
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
};
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
function seenBy(m) { if (isDM(room)) { const rd = (dms[room] || {}).read || {}; return Object.keys(rd).filter(u => u !== m.uid && rd[u] >= m.ts); } return Object.keys(reads).filter(u => u !== m.uid && ((reads[u] || {})[room] || 0) >= m.ts); }
function markSeen(list) {
  if (!db || !readsLoaded || document.hidden) return;
  if (isDM(room) && !list.length) { const d0 = dms[room]; if (d0 && ((d0.unread || {})[myId] || 0)) { d0.unread = { ...(d0.unread || {}), [myId]: 0 }; db.collection("dms").doc(room).update({ ["unread." + myId]: 0 }).catch(() => {}); } return; }
  if (!list.length) return;
  if (isDM(room)) {
    const d = dms[room] || {}, lt = list[list.length - 1].ts;
    if (!d.id || (((d.read || {})[myId] || 0) >= lt && !(d.unread || {})[myId])) return;
    d.read = { ...(d.read || {}), [myId]: lt }; d.unread = { ...(d.unread || {}), [myId]: 0 };
    db.collection("dms").doc(room).update({ ["read." + myId]: lt, ["unread." + myId]: 0 }).catch(() => {}); return;
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
  if (seenOK()) {
    const seen = seenBy(m), n = seen.length, stack = seen.slice(0, 3).map(u => avatar(profileFor(u)));
    if (n > 3) stack.push(el("span", "more", "+" + (n - 3)));
    const rows = seen.map(u => { const r = el("div", "seen-r"), nm = el("span", "nm"); nm.dir = "rtl"; nm.textContent = nameOf(u); r.append(avatar(profileFor(u)), nm, el("span", "ok", "✓✓")); return r; });
    wrap.appendChild(fold(MXI.eye, "", n ? "شوهدت بواسطة" : "لسه محدش شافها", n, stack, rows, n <= 3));
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
      if (pu) n.textContent = "«" + (profiles[pu].name || "مجهول") + "» لسه ما بينكوش محادثة مفتوحة. ابعتله طلب محادثة الأول من «🔑 غرفة أو صديق بالكود».";
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
    const row = el("div", "rrow"); row.style.cursor = "default"; row.append(avatar(data), el("b", "", data.name || "مجهول"));
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
  cancelEdit(); replyTo = { name: nameOf(m.uid), text: mtext(m).slice(0, 80), id: m.id };
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
  if (!PUSH_URL || !VAPID_KEY) return say("⚠️ إعدادات الإشعارات ناقصة في app.js");
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

/* Very Chat — إعدادات ومعلومات الغرفة */
// معرّف مالك الدردشة العامة: انسخه من بروفايلك (سطر «معرّفك») وحطه هنا بين علامتي التنصيص
const OWNER_UID = "t2zZ3ijMhDPVsjGxQlunfmLHf122";
let gdoc = {};
const generalRoom = () => ({ id: "general", name: "عام", emoji: "🌐", color: "#5b6b78", ...gdoc, id: "general", by: OWNER_UID });
const curR = () => room === "general" ? generalRoom() : isDM(room) ? dmRoom(room) : rooms.find(x => x.id === room);
const ownerOf = r => !!r && r.by === myId;
const adminOf = r => !!r && (r.by === myId || (r.admins || []).includes(myId));
// 🔐 قائمة الأعضاء: للمالك فقط (افتراضي مفعّل، والمالك يقدر يقفله من إعدادات الغرفة)
const memHidden = r => !!r && !ownerOf(r) && r.ownerOnlyMem !== false;
// العدد: يظهر في الغرف لكل أعضائها، ومخفي في العام لغير المالك
const countHidden = r => memHidden(r) && r.id === "general";
const AU = v => FV().arrayUnion(v), AR = v => FV().arrayRemove(v);
const lastSent = {}; let infoId = null;
const LINK_RE = /(https?:\/\/|www\.)/i;
const fwdBlocked = () => { const r = curR(); return !!r && !!r.noFwd && !adminOf(r); };
const seenOK = () => { const r = curR(); return !r || !r.hideSeen || adminOf(r); };
function writeBlock(r) {
  if (!r) return "";
  if (r.dm) return !(r.blocked || []).length ? "" : r.blocked.includes(myId) ? "🚫 أنت حاظر الشخص ده (ألغِ الحظر من بروفايله)" : "المحادثة دي مقفولة";
  if ((r.banned || []).includes(myId)) return "أنت محظور من الغرفة دي";
  if (kickedLeft(r, myId)) return "اتشلت من الدردشة العامة (فاضل " + leftTxt(kickedLeft(r, myId)) + ")";
  if ((r.muted || []).includes(myId) || ((r.mutedUntil || {})[myId] || 0) > Date.now()) return "المالك كتمك في الغرفة دي";
  if (r.onlyAdmins && !adminOf(r)) return "الكتابة للمشرفين بس في الغرفة دي";
  return "";
}
function updateComposer() {
  const why = writeBlock(curR());
  $("inp").disabled = !!why; $("sendBtn").disabled = !!why || !db;
  { const c0 = curR(); $("inp").maxLength = c0 && c0.maxLen && !adminOf(c0) ? c0.maxLen : 1000; }
  $("inp").placeholder = why ? "🔒 " + why : "اكتب رسالة…";
  // سبب المنع بيظهر كامل في سطرين لو لزم (الـ placeholder كان بيتقطع)
  const pill = $("pill"); let lk = $("lockMsg");
  if (why) { if (!lk) { lk = document.createElement("div"); lk.id = "lockMsg"; lk.setAttribute("role", "status"); pill.insertBefore(lk, $("inp")); } lk.textContent = "🔒 " + why; }
  else if (lk) lk.remove();
  pill.classList.toggle("locked", !!why);
}
// مين يقدر يثبّت: الخاص = الاتنين (لو مفيش حظر) · الغرف والعام = الأدمن بس
function canPin(r) { if (!r) return false; if (r.dm) return !(r.blocked || []).length; return adminOf(r); }
// تثبيت متعدد: لحد ٣ رسايل (pins) — والحقل القديم pinned بيتحوّل تلقائي أول ما حد يعدّل
const MAX_PINS = 3;
const pinsOf = r => { if (!r) return []; const a = Array.isArray(r.pins) ? r.pins.filter(x => x && x.id) : []; if (r.pinned && r.pinned.id && !a.some(x => x.id === r.pinned.id)) a.unshift(r.pinned); return a.slice(-MAX_PINS); };
async function savePins(r, arr) { try { await db.collection(isDM(r.id) ? "dms" : "rooms").doc(r.id).update({ pins: arr.length ? arr : FV().delete(), pinned: FV().delete() }); } catch (e) { setStatus(errMsg(e)); setTimeout(() => setStatus(""), 4000); } }
function addPin(r, pin) { let a = pinsOf(r).filter(x => x.id !== pin.id); if (a.length >= MAX_PINS) { a = a.slice(a.length - (MAX_PINS - 1)); flash("الحد ٣ رسايل مثبتة — اتشال أقدم تثبيت"); } a.push(pin); return savePins(r, a); }
const delPin = (r, id) => savePins(r, pinsOf(r).filter(x => x.id !== id));
// يرجّع undefined لو القايمة لسه ما اتحمّلتش، و null لو الرسالة مش موجودة
function pinMsg(p) { if (!p || $("msgs")._room !== room) return undefined; return lastList.find(m => m.id === p.id) || null; }
function jumpToMsg(id) {
  const box = $("msgs"), row = [...box.querySelectorAll(".row")].find(r => r.dataset.mid === id);
  if (!row) { flash("الرسالة دي مش موجودة"); return; }
  box._pin = 0; try { row.scrollIntoView({ block: "center", behavior: "smooth" }); } catch (_) { row.scrollIntoView(); }
  // إضاءة موضعية: باقي الرسايل بتخفت لحظة والفقاعة بس بتلمع (من غير مربع ملوّن ورا الصف)
  document.querySelectorAll("#msgs .row.jhl").forEach(r => r.classList.remove("jhl"));
  clearTimeout(jumpToMsg._t); box.classList.add("spot");
  setTimeout(() => { row.classList.remove("jhl"); void row.offsetWidth; row.classList.add("jhl"); }, 260);
  jumpToMsg._t = setTimeout(() => { row.classList.remove("jhl"); box.classList.remove("spot"); }, 2500);
}
const PIN_I = {};
function livePins(r) { return pinsOf(r).map(p => ({ p, m: pinMsg(p) })).filter(x => !(x.m !== undefined && (!x.m || x.m.del))); }
function renderPin() {
  const r = curR(), box = $("pin"); box.textContent = "";
  const L = r ? livePins(r) : []; box.hidden = !L.length; if (!L.length) return;
  const sig = r.id + ":" + L.map(x => x.p.id).join(","); if (renderPin._s !== sig) { renderPin._s = sig; PIN_I[r.id] = L.length - 1; }
  let i = PIN_I[r.id]; if (!(i >= 0 && i < L.length)) i = L.length - 1; PIN_I[r.id] = i;
  const { p, m } = L[i], n = L.length;
  const nm = m ? nameOf(m.uid) : p.name || "", tx = m ? mtext(m).slice(0, 120) : p.text || "";
  if (n > 1) { const sg = el("div", "pseg"); L.forEach((_, k) => sg.append(el("s", k === i ? "on" : ""))); box.append(sg); }
  const t = el("div", "pt"), b = el("b", "", "رسالة مثبتة" + (n > 1 ? " " + arN(i + 1) + " من " + arN(n) : "") + " · " + nm), s = el("span", "", tx); s.dir = "auto"; t.append(b, s);
  box.append(el("i", "pi", "📌"), t);
  // زي تليجرام: الضغطة بتودّيك للرسالة، والضغطة اللي بعدها للي قبلها
  box.onclick = () => { if (m) jumpToMsg(p.id); else flash("بحمّل الرسالة…"); if (n > 1) { PIN_I[r.id] = (i - 1 + n) % n; renderPin(); } };
  if (canPin(r)) { const x = el("button", "", "✕"); x.type = "button"; x.setAttribute("aria-label", "إلغاء تثبيت الرسالة دي"); x.onclick = e => { e.stopPropagation(); delPin(r, p.id); }; box.append(x); }
}
async function upd(patch, rid) { try { await db.collection("rooms").doc(rid || room).update(patch); } catch (e) { setStatus(errMsg(e)); } }
const RI_COLORS = ["#0f8f7a", "#2f90d9", "#e0507a", "#e0a82f", "#8a5cf6", "#2cae6a", "#e0702f", "#d64545"];
const EMO_RE = /^((?:\p{Extended_Pictographic}[\uFE0F\u200D]*)+)\s*([\s\S]*)$/u;
function setRow(title, desc, ctrl, col) {
  const m = EMO_RE.exec(title), ico = m ? m[1] : "•", tx = m ? m[2] : title;
  const r = el("div", "ri-row" + (col ? " wrap" : "")), t = el("div", "ri-t"), ic = el("div", "ri-ic", ico);
  ic.style.setProperty("--c", RI_COLORS[tx.length % RI_COLORS.length]);
  t.append(el("b", "", tx)); if (desc) t.append(el("small", "", desc));
  r.append(ic, t); if (ctrl) r.append(ctrl); return r;
}
function swRow(title, desc, on, fn) {
  const sw = el("button", "sw" + (on ? " on" : "")); sw.type = "button"; sw.setAttribute("role", "switch"); sw.setAttribute("aria-pressed", on ? "true" : "false"); sw.onclick = () => { on = !on; sw.classList.toggle("on", on); sw.setAttribute("aria-pressed", on ? "true" : "false"); try { navigator.vibrate && navigator.vibrate(8); } catch (_) {} fn(on); };
  return setRow(title, desc, sw);
}
function actRow(title, desc, fn) {
  const r = setRow(title, desc, el("span", "ri-chev", "‹")); r.classList.add("ri-act"); r.tabIndex = 0; r.setAttribute("role", "button");
  r.onclick = fn; r.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(); } }; return r;
}
function riPaged(c, items, build, step) {
  step = step || 8; let n = step; const wrap = el("div", "ri-list"); c.append(wrap);
  const paint = () => {
    wrap.textContent = ""; items.slice(0, n).forEach(u => wrap.append(build(u)));
    if (items.length > n) { const b = el("button", "ri-more", "عرض المزيد (" + (items.length - n) + ")"); b.type = "button"; b.onclick = () => { n += step; paint(); }; wrap.append(b); }
  };
  paint();
}
let infoSig = null;
function openInfo(id) { if (!id) return; infoId = id; infoSig = null; riTab = null; riQ = ""; riFlt = "all"; riLim = 20; riDraft = {}; $("rinfo").hidden = false; $("riBody").scrollTop = 0; renderInfo(); }
function closeInfo() { infoId = null; $("rinfo").hidden = true; }
const FW_ADD = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9.5" cy="8" r="3.8"/><path d="M2.5 20c.8-3.6 3.5-5.5 7-5.5s6.2 1.9 7 5.5M19 8v6M16 11h6"/></svg>';
function addFriend(r, mem) {
  if (!r || r.id === "general" || r.dm) return;   // العام مفتوح للكل: مفيهوش دعوات
  const c = $("mcard"); c.textContent = "";
  const inRoom = new Set(mem), banned = new Set(r.banned || []), invited = new Set(r.invites || []);
  const seenU = new Set(), friends = [];
  Object.values(dms).filter(d => dmEstablished(d) && !pendingIn(d) && !(d.blockedBy || []).length).sort((x, y) => ((y.last || {}).ts || 0) - ((x.last || {}).ts || 0)).forEach(d => {
    const u = dmPeerOf(d.id); if (!u || u === myId || seenU.has(u)) return; seenU.add(u);
    friends.push(mkFr(u));
  });
  function mkFr(u, viaCode) {
    const p = profiles[u] || {}, dis = inRoom.has(u) ? "✓ موجود في الغرفة" : banned.has(u) ? "🚫 محظور" : invited.has(u) ? "⏳ اتبعتله دعوة" : "";
    return { id: u, name: p.name || "مجهول", fcode: p.fcode || "", av: p, keys: normFCode(p.fcode), dis, viaCode: !!viaCode };
  }
  const pick = new Map(); let extra = null, extraQ = "", busy = false, tok = 0;
  const root = el("div", "fw"), head = el("div", "fwh"), x = el("button", "fwx", "✕"); x.type = "button"; x.setAttribute("aria-label", "إغلاق");
  const ht = el("div", "fwt"); ht.append(el("b", "", "➕ إضافة أصدقاء"), el("small", "", "إلى غرفة «" + (r.name || "") + "»")); head.append(ht, x); x.onclick = () => { $("msheet").hidden = true; };
  const sbox = el("div", "fws"), si = el("input"), sic = el("span", "fwsi"), sx = el("button", "fwsc", "✕"); sic.innerHTML = FW_SEARCH; sx.type = "button"; sx.hidden = true;
  si.type = "search"; si.placeholder = "ابحث بالاسم أو اكتب كود صديق…"; si.autocomplete = "off"; si.autocapitalize = "none"; si.spellcheck = false; si.enterKeyHint = "search"; si.setAttribute("aria-label", "بحث"); sbox.append(sic, si, sx);
  const chips = el("div", "fwc"); chips.hidden = true;
  const list = el("div", "fwl"), foot = el("div", "fwf"), names = el("div", "fwn", "اختار صديق أو أكتر"), go = el("button", "fwg"); go.type = "button"; go.disabled = true;
  const goI = el("span", "fwgi add"), goN = el("span", "fwgn"); goI.innerHTML = FW_ADD; go.append(goI, goN); foot.append(names, go);
  root.append(head, sbox, chips, list, foot); c.append(root);
  const rowEls = new Map();
  function sync() {
    const n = pick.size; go.disabled = !n || busy; goN.textContent = n || ""; goN.hidden = !n; go.setAttribute("aria-label", "إرسال الدعوة");
    names.textContent = n ? [...pick.values()].map(t => t.name).join("، ") : "اختار صديق أو أكتر"; names.classList.toggle("on", !!n);
    chips.hidden = !n; chips.textContent = "";
    [...pick.values()].forEach(t => {
      const ch = el("button", "fwchip"); ch.type = "button"; const w = el("span", "fwchw"), rm = el("i", "", "✕"); w.append(avatar(t.av), rm); ch.append(w, el("small", "", t.name));
      ch.onclick = () => { pick.delete(t.id); const e = rowEls.get(t.id); if (e) { e.classList.remove("on"); e.setAttribute("aria-checked", "false"); } sync(); paintHead(); }; chips.appendChild(ch);
    });
  }
  function mkRow(t) {
    const row = el("button", "fwrow" + (t.dis ? " dis" : "") + (pick.has(t.id) ? " on" : "")), tx = el("div", "fwrt"), aw = el("span", "fwav"), sb = el("small", "");
    row.type = "button"; const nm = el("b", "", t.name); sb.append(t.dis || "صديق"); if (t.fcode) { const bd = document.createElement("bdi"); bd.textContent = fmtFCode(t.fcode); sb.append(" · ", bd); }
    tx.append(nm, sb); aw.append(avatar(t.av)); const bk = el("span", "fwbd"); bk.innerHTML = FW_CK; aw.append(bk); row.append(aw, tx);
    if (t.dis) { row.disabled = true; } else {
      const ck = el("span", "fwck"); ck.innerHTML = FW_CK; row.append(ck); row.setAttribute("role", "checkbox"); row.setAttribute("aria-checked", pick.has(t.id));
      row.onclick = () => { if (pick.has(t.id)) pick.delete(t.id); else pick.set(t.id, t); row.classList.toggle("on", pick.has(t.id)); row.setAttribute("aria-checked", pick.has(t.id)); sync(); paintHead(); }; rowEls.set(t.id, row);
    }
    return row;
  }
  let hdBtn = null, hdTxt = null, vis = [];
  function paintHead() { if (!hdBtn) return; const av = vis.filter(t => !t.dis), all = av.length && av.every(t => pick.has(t.id)); hdBtn.textContent = all ? "إلغاء تحديد الكل" : "تحديد الكل"; hdBtn.hidden = av.length < 2; }
  async function lookup(code, q) {
    const my = ++tok; busy = true; sync(); let uid = null, data = null;
    const loc = Object.keys(profiles).find(u => profiles[u] && profiles[u].fcode === code);
    if (loc) { uid = loc; data = profiles[loc]; }
    else { try { const sn = await db.collection("profiles").where("fcode", "==", code).limit(1).get(); if (!sn.empty) { uid = sn.docs[0].id; data = sn.docs[0].data(); } } catch (e) { if (my === tok) { busy = false; extra = { err: true }; extraQ = q; sync(); paint(); } return; } }
    if (my !== tok) return; busy = false;
    if (uid && uid !== myId) { if (!profiles[uid]) profiles[uid] = data; extra = mkFr(uid, true); } else extra = { none: true, self: uid === myId };
    extraQ = q; sync(); paint();
  }
  function paint() {
    const q = si.value, qn = nzq(q), qf = normFCode(q), qc = nzc(q); sx.hidden = !q; list.textContent = ""; rowEls.clear();
    vis = friends.filter(t => !q || nzq(t.name).includes(qn) || (qc.length >= 2 && t.keys.toLowerCase().includes(qc)));
    vis.sort((p, o) => (p.dis ? 1 : 0) - (o.dis ? 1 : 0));
    if (vis.length) {
      const hd = el("div", "fwsec fwsech"); hdTxt = el("span", "", q ? "نتايج البحث (" + vis.length + ")" : "👥 أصدقائك (" + vis.length + ")"); hdBtn = el("button", "fwall"); hdBtn.type = "button";
      hdBtn.onclick = () => { const av = vis.filter(t => !t.dis), all = av.every(t => pick.has(t.id)); av.forEach(t => { if (all) pick.delete(t.id); else pick.set(t.id, t); }); paint(); sync(); };
      hd.append(hdTxt, hdBtn); list.appendChild(hd); vis.forEach(t => list.appendChild(mkRow(t))); paintHead();
    } else hdBtn = null;
    const byCode = qf.length === 8 && !friends.some(t => t.keys === qf);
    if (byCode) {
      list.appendChild(el("div", "fwsec", "🔎 نتيجة البحث بالكود"));
      if (extra && extraQ === q && extra.id) list.appendChild(mkRow(extra));
      else if (extra && extraQ === q && extra.err) list.appendChild(el("div", "dnone", "ماقدرتش أبحث دلوقتي، جرّب تاني."));
      else if (extra && extraQ === q) list.appendChild(el("div", "dnone", extra.self ? "ده كودك أنت 🙂" : "مفيش حد بالكود ده، اتأكد منه."));
      else { list.appendChild(el("div", "dnone", "⏳ بدوّر…")); if (!busy || extraQ !== q) lookup(qf, q); }
    } else if (!vis.length) {
      list.appendChild(el("div", "dnone", q ? "مفيش صديق بالاسم ده. لو معاك كوده اكتبه كامل (8 حروف وأرقام) وهيظهرلك." : "لسه معندكش أصدقاء هنا. اكتب كود صديقك في البحث فوق وهيظهرلك."));
    }
  }
  si.oninput = () => { tok++; busy = false; extra = null; paint(); sync(); };
  sx.onclick = () => { si.value = ""; si.oninput(); si.focus(); };
  si.addEventListener("keydown", e => { if (e.key === "Escape") { if (si.value) { si.value = ""; si.oninput(); } else $("msheet").hidden = true; } });
  go.onclick = async () => {
    const ids = [...pick.keys()]; if (!ids.length || go.disabled) return; go.disabled = true; go.classList.add("busy");
    try { await db.collection("rooms").doc(r.id).update({ invites: FV().arrayUnion(...ids) }); ids.forEach(u => notifyUser(u, r, "invite")); $("msheet").hidden = true; reqFlash(ids.length > 1 ? "✓ اتبعتلهم " + ids.length + " دعوات، هيدخلوا أول ما يوافقوا" : "✓ اتبعتله دعوة، هيدخل أول ما يوافق"); }
    catch (e) { go.disabled = false; go.classList.remove("busy"); flash(errMsg(e)); }
  };
  paint(); sync(); $("msheet").hidden = false;
  if (matchMedia("(pointer:fine)").matches) setTimeout(() => si.focus(), 60);
}
/* ───── أصدقائي / محادثة جديدة ───── */
function openFriends() {
  if (!db || !myId) { flash("استنى لحظة وجرّب تاني"); return; }
  closeDrawer(); const c = $("mcard"); c.textContent = "";
  const seenU = new Set(), fr = [];
  Object.values(dms).filter(d => dmEstablished(d) && !pendingIn(d) && !(d.blockedBy || []).length).forEach(d => {
    const u = dmPeerOf(d.id); if (!u || u === myId || seenU.has(u)) return; seenU.add(u);
    const p = profiles[u] || {}, nm = nickOf(u) || p.name || "مجهول", ch = nzq(nm).charAt(0).toUpperCase();
    fr.push({ u, p, name: nm, fcode: p.fcode || "", keys: normFCode(p.fcode), hid: !!d.last && d.last.ts <= dmClearedAt(d), ch: /[\u0621-\u064Aa-zA-Z]/.test(ch) ? ch : "#" });
  });
  const grp = ch => /[\u0621-\u064A]/.test(ch) ? 0 : ch === "#" ? 2 : 1;
  fr.sort((x, y) => grp(x.ch) - grp(y.ch) || x.name.localeCompare(y.name, "ar"));
  const root = el("div", "fw"), head = el("div", "fwh"), x = el("button", "fwx", "✕"); x.type = "button"; x.setAttribute("aria-label", "إغلاق"); x.onclick = () => { $("msheet").hidden = true; };
  const ht = el("div", "fwt"), cnt = el("small", "", fr.length ? (fr.length === 1 ? "صديق واحد" : fr.length === 2 ? "صديقين" : fr.length + (fr.length > 10 ? " صديق" : " أصدقاء")) : "لسه مفيش أصدقاء");
  ht.append(el("b", "", "💬 محادثة جديدة"), cnt); head.append(ht, x);
  const sbox = el("div", "fws fwsb"), si = el("input"), sic = el("span", "fwsi"), sx = el("button", "fwsc", "✕"); sic.innerHTML = FW_SEARCH; sx.type = "button"; sx.hidden = true;
  si.type = "search"; si.placeholder = "ابحث بالاسم أو اكتب كود صديق…"; si.autocomplete = "off"; si.autocapitalize = "none"; si.spellcheck = false; si.enterKeyHint = "search"; si.setAttribute("aria-label", "بحث"); sbox.append(sic, si, sx);
  const list = el("div", "fwl");
  root.append(head, sbox, list); c.append(root);
  let tok = 0, extra = null, extraQ = "";
  function hl(name, q) {
    const f = document.createDocumentFragment(), nn = nzq(name), qn = nzq(q);
    const i = q && qn && nn.length === name.length ? nn.indexOf(qn) : -1;
    if (i < 0) { f.append(name); return f; }
    f.append(name.slice(0, i)); f.append(el("mark", "", name.slice(i, i + qn.length))); f.append(name.slice(i + qn.length)); return f;
  }
  function mkRow(t, q, viaCode) {
    const row = el("button", "fwrow nc"), tx = el("div", "fwrt"), aw = el("span", "fwav"), sb = el("small", ""), nm = el("b", ""), pr = presence[t.u];
    row.type = "button"; const on = !viaCode && isOnline(pr);
    sb.textContent = viaCode ? "اضغط لإرسال طلب محادثة" : on ? "🟢 متصل" : pr ? lastSeenText(pr) : "صديق"; if (on) sb.classList.add("on");
    nm.append(hl(t.name, q)); tx.append(nm, sb); aw.append(avatar(t.p)); if (on) aw.append(el("span", "fwdot")); row.append(aw, tx);
    if (t.fcode || t.hid) { const m = el("span", "fwmeta"); if (t.hid) m.append(el("i", "", "🧹")); if (t.fcode) { const bd = document.createElement("bdi"); bd.textContent = fmtFCode(t.fcode); m.append(bd); } row.append(m); }
    row.onclick = () => { $("msheet").hidden = true; openDM(t.u); }; return row;
  }
  async function lookup(code, q) {
    const my = ++tok; let uid = null, data = null;
    const loc = Object.keys(profiles).find(u => profiles[u] && profiles[u].fcode === code);
    if (loc) { uid = loc; data = profiles[loc]; }
    else { try { const sn = await db.collection("profiles").where("fcode", "==", code).limit(1).get(); if (!sn.empty) { uid = sn.docs[0].id; data = sn.docs[0].data(); } } catch (e) { if (my === tok) { extra = { err: true }; extraQ = q; paint(); } return; } }
    if (my !== tok) return;
    if (uid && uid !== myId) { if (!profiles[uid]) profiles[uid] = data; extra = { u: uid, p: data, name: data.name || "مجهول", fcode: data.fcode || "" }; } else extra = { none: true, self: uid === myId };
    extraQ = q; paint();
  }
  function paint() {
    const q = si.value, qn = nzq(q), qc = nzc(q), qf = normFCode(q); sx.hidden = !q; list.textContent = "";
    const hit = fr.filter(t => !q || nzq(t.name).includes(qn) || (qc.length >= 2 && t.keys.toLowerCase().includes(qc)));
    if (q && hit.length) list.appendChild(el("div", "fwsec", "نتايج البحث (" + hit.length + ")"));
    hit.forEach(t => list.appendChild(mkRow(t, q)));
    if (qf.length === 8 && !fr.some(t => t.keys === qf)) {
      list.appendChild(el("div", "fwsec", "🔎 نتيجة البحث بالكود"));
      if (extra && extraQ === q && extra.u) list.appendChild(mkRow(extra, "", true));
      else if (extra && extraQ === q && extra.err) list.appendChild(el("div", "dnone", "ماقدرتش أبحث دلوقتي، جرّب تاني."));
      else if (extra && extraQ === q) list.appendChild(el("div", "dnone", extra.self ? "ده كودك أنت 🙂" : "مفيش حد بالكود ده، اتأكد منه."));
      else { list.appendChild(el("div", "dnone", "⏳ بدوّر…")); lookup(qf, q); }
    } else if (!hit.length) {
      list.appendChild(el("div", "dnone", q ? "مفيش صديق بالاسم ده. لو معاك كوده اكتبه كامل (8 حروف وأرقام) وهيظهرلك." : "لسه معندكش أصدقاء. اكتب كود صاحبك في البحث فوق وابعتله طلب محادثة."));
    }
  }
  si.oninput = () => { tok++; extra = null; list.scrollTop = 0; paint(); };
  sx.onclick = () => { si.value = ""; si.oninput(); si.focus(); };
  si.addEventListener("keydown", e => { if (e.key === "Escape") { if (si.value) { si.value = ""; si.oninput(); } else $("msheet").hidden = true; } });
  paint(); $("msheet").hidden = false;
  if (matchMedia("(pointer:fine)").matches) setTimeout(() => si.focus(), 60);
}
$("dNew").onclick = openFriends;
const GEN_KICK = [["⏱️", "ساعة", 3600000], ["🌙", "24 ساعة", 86400000], ["📅", "7 أيام", 604800000]];
const kickedLeft = (r, u) => Math.max(0, ((r.removedUntil || {})[u] || 0) - Date.now());
function leftTxt(ms) { const m = Math.ceil(ms / 60000); return m < 90 ? m + " دقيقة" : m < 2880 ? Math.round(m / 60) + " ساعة" : Math.round(m / 1440) + " يوم"; }
function memberMenu(r, u) {
  const c = $("mcard"); c.textContent = ""; const close = () => { $("msheet").hidden = true; }, G = r.id === "general";
  const isAdm = (r.admins || []).includes(u), isMut = (r.muted || []).includes(u) || ((r.mutedUntil || {})[u] || 0) > Date.now();
  const head = el("div", "mprev mh");
  const a = avatar(profileFor(u, r.id)); a.style.cssText += ";width:68px;height:68px;font-size:34px";
  const nm = el("b", "", nameOf(u, r.id)); nm.dir = "rtl";
  const roleTx = u === r.by ? "👑 مالك الغرفة" : isAdm ? "🛡️ مشرف" : "عضو"; head.append(a, nm, el("small", "ri-msub", roleTx + (isMut ? "  ·  🔇 مكتوم" : "") + (isOnline(presence[u]) ? "  ·  🟢 متصل" : "")));
  c.append(head);
  const acts = el("div", "acts lst");
  const act = (ico, lb, grad, fn, o) => {
    o = o || {}; const b = el("button", "act"); b.type = "button"; const i = el("i", "", ico), sp = el("span", "", lb); i.style.background = grad; if (/d64545/.test(grad)) b.classList.add("dng"); b.append(i, sp);
    b.onclick = () => {
      if (o.confirm && !b.dataset.ok) {
        b.dataset.ok = "1"; sp.textContent = "تأكيد؟"; sp.style.color = "#ff7a7a"; i.style.transform = "scale(1.1)";
        setTimeout(() => { if (b.isConnected && b.dataset.ok) { delete b.dataset.ok; sp.textContent = lb; sp.style.color = ""; i.style.transform = ""; } }, 4000); return;
      }
      if (!o.keep) close(); fn();
    };
    acts.append(b);
  };
  const fit = () => { acts.style.gridTemplateColumns = "repeat(" + (acts.children.length <= 4 ? acts.children.length : 3) + ",1fr)"; };
  const done = t => { setStatus(t); setTimeout(() => setStatus(""), 3000); };
  // الغرفة العامة مفيهاش قايمة أعضاء، فالإزالة فيها مؤقتة (بمدة) والحظر دايم
  const gone = extra => ({ ...(G ? {} : { members: AR(u) }), ...(isMut ? { muted: AR(u) } : {}), ...(isAdm ? { admins: AR(u) } : {}), ...extra });
  const kickMenu = () => {
    c.textContent = ""; acts.textContent = ""; c.append(head);
    GEN_KICK.forEach(([ic, lb, ms]) => act(ic, lb, "linear-gradient(135deg,#ffb347,#e08a2f)", () => { upd(gone({ ["removedUntil." + u]: Date.now() + ms }), r.id); done("🚪 اتشال " + nameOf(u, r.id) + " من العامة لمدة " + lb); }));
    act("↩️", "رجوع", "linear-gradient(135deg,#8a9a96,#5d6d69)", () => memberMenu(r, u), { keep: true });
    fit(); c.append(acts);
  };
  if (ownerOf(r)) act("🛡️", isAdm ? "إلغاء الإشراف" : "ترقية لمشرف", "linear-gradient(135deg,#5aa9ff,#2f6fed)", () => upd({ admins: isAdm ? AR(u) : AU(u) }, r.id));
  act("🔇", isMut ? "إلغاء الكتم" : "كتم", "linear-gradient(135deg,#a07cff,#6b46e0)", () => upd(isMut ? { muted: AR(u), ["mutedUntil." + u]: FV().delete() } : { muted: AU(u) }, r.id));
  if (!isMut) act("⏱️", "كتم ساعة", "linear-gradient(135deg,#8f7cff,#5b46e0)", () => upd({ ["mutedUntil." + u]: Date.now() + 3600000 }, r.id));
  act("🧽", "مسح رسايله", "linear-gradient(135deg,#6bd0c0,#2a9d8f)", async () => { try { const res = await wipeRoomMsgs(r.id, null, u); setStatus(res.failed ? "اتمسح " + res.done + " ورسايل (" + res.failed + ") ماتمسحتش — راجع صلاحيات Firestore" : "✓ اتمسحت رسايل " + nameOf(u, r.id) + " (" + res.done + ")"); setTimeout(() => setStatus(""), 4000); } catch (e) { setStatus(errMsg(e)); } }, { confirm: true });
  if (G) act("🚪", "إزالة", "linear-gradient(135deg,#ffb347,#e08a2f)", kickMenu, { keep: true });
  else act("🚪", "إزالة", "linear-gradient(135deg,#ffb347,#e08a2f)", () => { upd(gone({}), r.id); done("🚪 اتشال " + nameOf(u, r.id) + " من الغرفة"); }, { confirm: true });
  act("⛔", "حظر", "linear-gradient(135deg,#ff7a7a,#d64545)", () => { upd(gone({ banned: AU(u) }), r.id); done("⛔ اتحظر " + nameOf(u, r.id)); }, { confirm: true });
  fit(); c.append(acts); $("msheet").hidden = false;
}
// ── تأكيد الضغط التاني: الحالة محفوظة برّه الزرار علشان إعادة رسم الصفحة ما تلغيهاش ──
const ARM = {}, BUSY = {};
function confirmBtn(btn, key, label, armedLabel, action) {
  const paint = () => {
    if (BUSY[key]) { btn.textContent = BUSY[key]; btn.disabled = true; return; }
    const left = (ARM[key] || 0) - Date.now();
    btn.disabled = false;
    if (left > 0) { btn.textContent = armedLabel; setTimeout(() => { if (btn.isConnected) paint(); }, left + 50); }
    else btn.textContent = label;
  };
  paint();
  btn.onclick = async () => {
    if (BUSY[key]) return;
    if (!((ARM[key] || 0) > Date.now())) { ARM[key] = Date.now() + 8000; paint(); return; }
    ARM[key] = 0;
    await action(t => { BUSY[key] = t; paint(); }, () => { BUSY[key] = ""; paint(); });
  };
}
async function wipeRoomMsgs(rid, onProg, uid) {
  // بيمسح على دفعات؛ لو في رسايل مش مسموح تتمسح بيعدّي عليها ويكمّل اللي بعدها
  let done = 0, failed = 0, after = null;
  for (let round = 0; round < 300; round++) {
    const base = () => {
      let x = db.collection("msgs").where("room", "==", rid); if (uid) x = x.where("uid", "==", uid);
      if (after) x = x.orderBy(firebase.firestore.FieldPath.documentId()).startAfter(after);
      return x.limit(400);
    };
    let q;
    try { q = await base().get({ source: "server" }); } catch (e) { q = await base().get(); }
    if (q.empty) break;
    let ok = 0;
    try { const b = db.batch(); q.docs.forEach(d => b.delete(d.ref)); await b.commit(); ok = q.size; }
    catch (e) {
      const rs = await Promise.allSettled(q.docs.map(d => d.ref.delete()));
      ok = rs.filter(x => x.status === "fulfilled").length;
      if (ok < rs.length) { failed += rs.length - ok; after = q.docs[q.docs.length - 1]; }
    }
    done += ok; onProg && onProg(done);
    if (q.size < 400 && ok === q.size) break;
    if (!ok && !after) break;
  }
  return { done, failed };
}
let riTab = null, riQ = "", riFlt = "all", riLim = 20, riDraft = {};
function renderInfo(tabSwitch) {
  const G = infoId === "general", r = G ? generalRoom() : rooms.find(x => x.id === infoId), box = $("riBody");
  if (!r || (!G && !canSee(r))) { closeInfo(); return; }
  const keep = box.scrollTop, ae = document.activeElement, refocus = ae && ae.id === "riSearch", caret = refocus ? ae.selectionStart : 0;
  box.textContent = ""; window.__memPaint = null;
  const owner = ownerOf(r), admin = adminOf(r), mem = [...new Set([...(r.members || []), ...(r.by ? [r.by] : [])])];
  /* ── الهيرو (زي الأول) ── */
  const hero = el("div", "ri-hero"); hero.style.background = "linear-gradient(160deg," + (r.color || "#5b6b78") + ",#0d1413)";
  const av = avatar(r.emoji || r.photo ? r : { emoji: "💬", color: "#5b6b78" }); av.classList.add("ri-av");
  hero.append(av, el("h2", "", r.name)); if (r.desc) hero.append(el("p", "", r.desc));
  const canCode = !!r.code && (admin || !r.lockInvite);
  hero.append(el("div", "ri-sub", (G ? "🌐 مفتوحة لكل المستخدمين" : r.private ? "🔒 غرفة خاصة" : "🌐 غرفة عامة") + (!G && !countHidden(r) ? "  ·  " + mem.length + " عضو" : ""))); box.append(hero);
  const q = el("div", "ri-quick"), qa = (ico, lb, fn) => { const b = el("button", "ri-q"); b.type = "button"; b.append(el("i", "", ico), el("span", "", lb)); b.onclick = () => fn(b); q.append(b); };
  if (canCode && (admin || !r.private)) qa("📤", "دعوة", () => shareInvite(r));
  if (canCode) qa("🔗", "نسخ الرابط", async b => { const sp = b.querySelector("span"), o = sp.textContent; if (await copyText(PAGE_URL + "#r-" + r.code)) { sp.textContent = "✓ اتنسخ"; setTimeout(() => { sp.textContent = o; }, 1500); } });
  qa("🎭", G ? "بروفايلي" : "شخصيتي", () => G ? openSheet("me") : openSheet("persona", r.id));
  if (owner) qa("✏️", "تعديل", () => openSheet("editroom", r.id));
  box.append(q);
  { const pp = profileFor(myId, r.id) || {}, ic = el("div", "ri-card ri-infoc");
    const val = (t, cls) => { const x = el("span", "ri-val" + (cls ? " " + cls : ""), t); x.dir = cls === "code" ? "ltr" : "auto"; return x; };
    ic.append(setRow("🙋 اسمك في الغرفة", owner ? "👑 مالك الغرفة" : admin ? "🛡️ مشرف" : "عضو", val(pp.name || "—")));
    const cp = (title, desc, text, v) => { const rw = setRow(title, desc, v); rw.classList.add("ri-act"); rw.onclick = async () => { const o = v.textContent; if (await copyText(text)) { v.textContent = "✓ اتنسخ"; setTimeout(() => { v.textContent = o; }, 1300); } }; ic.append(rw); };
    if (canCode) { cp("🔑 كود الغرفة", "اضغط للنسخ", r.code, val(r.code, "code")); cp("🔗 رابط الدعوة", "اضغط للنسخ", PAGE_URL + "#r-" + r.code, val("نسخ")); }
    ic.append(setRow(G || !r.private ? "🌐 نوع الغرفة" : "🔒 نوع الغرفة", G ? "مفتوحة لكل المستخدمين" : r.private ? "مش بتظهر في البحث" : "ظاهرة في البحث", val(G ? "عامة" : r.private ? "خاصة" : "عامة")));
    if (!G && !countHidden(r)) ic.append(setRow("👥 عدد الأعضاء", null, val(String(mem.length))));
    box.append(ic); }

  /* ── بيانات الأعضاء ── */
  const base = G ? [...new Set([...Object.keys(profiles), ...(r.by ? [r.by] : [])])].filter(u => !(r.banned || []).includes(u) && !kickedLeft(r, u)) : mem;
  const locked = memHidden(r), visible = locked ? [myId] : base, reqs = admin ? (r.requests || []) : [];
  const memTotal = locked ? (G ? null : mem.length) : visible.length;

  /* ── التابات ── */
  const tabs = [];
  if (owner) tabs.push(["priv", "🔐", "الخصوصية"], ["chat", "💬", "المحادثة"], ["filt", "📜", "القواعد"]);
  else if (r.rules || (G && admin)) tabs.push(["about", "ℹ️", "نظرة عامة"]);
  tabs.push(["mem", "👥", "الأعضاء", memTotal, reqs.length]);
  if (G && admin) tabs.push(["staff", "🛡️", "الإدارة"]);
  const canLeave = !owner && (r.members || []).includes(myId);
  if (owner || canLeave) tabs.push(["more", "🧰", "المزيد"]);
  const tab = tabs.some(t => t[0] === riTab) ? riTab : tabs[0][0];
  const bar = el("div", "ri-tabs"); bar.setAttribute("role", "tablist");
  tabs.forEach(([id, ic, lb, n, rq]) => {
    const b = el("button", "ri-tab" + (id === tab ? " on" : ""), ic + " " + lb); b.type = "button"; b.setAttribute("role", "tab");
    if (n != null) b.append(el("b", "", String(n)));
    if (rq) b.append(el("b", "rq", "✋ " + rq));
    b.onclick = () => { if (riTab !== id) { riTab = id; renderInfo(true); } };
    bar.append(b);
  });
  const head = el("div", "ri-head"); head.append(bar); box.append(head);
  const pane = el("div", "ri-pane"); box.append(pane);
  { let tx = 0, ty = 0, tt = 0;
    pane.addEventListener("touchstart", e => { const t = e.touches[0]; tx = t.clientX; ty = t.clientY; tt = Date.now(); }, { passive: true });
    pane.addEventListener("touchend", e => {
      if (e.target.closest && e.target.closest("input,textarea,.ri-fl,.seg")) return;
      const t = e.changedTouches[0], dx = t.clientX - tx, dy = t.clientY - ty;
      if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.8 || Date.now() - tt > 600) return;
      const i = tabs.findIndex(x => x[0] === tab), n = i + (dx > 0 ? 1 : -1);
      if (n >= 0 && n < tabs.length) { riTab = tabs[n][0]; renderInfo(true); }
    }, { passive: true }); }
  const card = (title, cls) => { if (title) pane.append(el("div", "ri-sh", title)); const c = el("div", "ri-card" + (cls ? " " + cls : "")); pane.append(c); return c; };
  const S = (c, t, d, k) => c.append(swRow(t, d, !!r[k], v => upd({ [k]: v }, r.id)));
  const segRow = (title, desc, opts, cur, key) => {
    const seg = el("div", "seg"); opts.forEach(([v, lb]) => { const b = el("button", cur === v ? "on" : "", lb); b.type = "button"; b.onclick = () => { seg.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); try { navigator.vibrate && navigator.vibrate(8); } catch (_) {} upd({ [key]: v }, r.id); }; seg.append(b); });
    return setRow(title, desc, seg, true);
  };
  const editor = (draftKey, val, rows, max) => {
    const wrap = el("div", "ri-ed"), ta = document.createElement("textarea"); ta.rows = rows; ta.dir = "auto"; ta.className = "ri-ta"; if (max) ta.maxLength = max;
    ta.value = riDraft[draftKey] !== undefined ? riDraft[draftKey] : val; wrap.append(ta); return [wrap, ta];
  };

  /* ═══ تاب: الخصوصية ═══ */
  if (tab === "priv") {
    if (!G) {
      const c = card("الظهور والدعوة");
      S(c, "🔒 غرفة خاصة", "مش بتظهر في البحث، بالكود أو الرابط بس", "private");
      c.append(el("div", "ri-note", "✋ الانضمام بموافقتك دايمًا: محدش يدخل الغرفة غير لما تقبله من «📥 الطلبات»"));
      S(c, "🙈 إخفاء الكود والرابط عن الأعضاء", "المشرفين بس يشوفوا الكود ويدعوا", "lockInvite");
      const rg = actRow(r.code ? "🔄 تجديد كود ورابط الدعوة" : "🔗 إنشاء كود ورابط دعوة", r.code ? "الكود والرابط القدام هيبطلوا" : "ابدأ بكود جديد للغرفة", () => {
        if (r.code && !rg.dataset.ok) { rg.dataset.ok = "1"; rg.querySelector("small").textContent = "⚠️ اضغط تاني للتأكيد"; return; } regenCode(r);
      });
      c.append(rg);
    }
    const c2 = card("الأعضاء والمحتوى");
    c2.append(swRow("🛡️ قائمة الأعضاء للمالك فقط", "إنت بس اللي تشوف الأعضاء وتبحث عنهم بالاسم أو الكود، وباقي الناس (حتى المشرفين) يشوفوا نفسهم بس", r.ownerOnlyMem !== false, v => upd({ ownerOnlyMem: v }, r.id)));
    S(c2, "👁 إخفاء «شوهدت بواسطة»", "المشرفين بس يشوفوا مين قرا الرسالة", "hideSeen");
    S(c2, "🚫 منع النسخ والتحويل", "الأعضاء مايقدروش ينسخوا أو يحوّلوا الرسايل", "noFwd");
  }

  /* ═══ تاب: المحادثة ═══ */
  if (tab === "chat") {
    const c1 = card("مين يقدر يكتب؟");
    S(c1, "✍️ الكتابة للمشرفين فقط", "الأعضاء يقروا بس ومايقدروش يكتبوا", "onlyAdmins");
    S(c1, "🔗 منع الروابط", "الأعضاء مايقدروش يبعتوا روابط", "noLinks");
    S(c1, "🎤 منع الرسائل الصوتية", "الأعضاء العاديين مايبعتوش صوت", "noVoice");
    const c2 = card("التفاعل مع الرسايل");
    S(c2, "😀 إيقاف التفاعلات", "مفيش تفاعلات على الرسايل", "noReact");
    S(c2, "✏️ منع تعديل الرسايل", "الأعضاء مايعدّلوش رسايلهم بعد الإرسال", "noEdit");
    S(c2, "🗑 منع حذف الأعضاء لرسايلهم", "المشرفين بس يحذفوا", "noDelOwn");
    const c3 = card("الحدود");
    c3.append(segRow("🐢 الوضع البطيء", "الفاصل بين رسالة ورسالة للأعضاء", [[0, "بدون"], [10, "١٠ث"], [30, "٣٠ث"], [60, "دقيقة"], [300, "٥د"]], r.slow || 0, "slow"));
    c3.append(segRow("📏 أقصى طول للرسالة", "للأعضاء العاديين", [[0, "عادي"], [100, "١٠٠"], [300, "٣٠٠"], [600, "٦٠٠"]], r.maxLen || 0, "maxLen"));
  }

  /* ═══ تاب: القواعد والكلمات ═══ */
  if (tab === "filt") {
    const parse = v => [...new Set(v.split(/[,،\n]/).map(x => x.trim().toLowerCase()).filter(Boolean))].slice(0, 100);
    const bc = card("🚫 كلمات ممنوعة", "stack");
    bc.append(el("div", "ri-note plain", "الأعضاء العاديين مش هيقدروا يبعتوا رسالة فيها أي كلمة من دي. افصل بين الكلمات بفاصلة."));
    const [bw, ta] = editor("bw", (r.badWords || []).join("، "), 4);
    const cnt = el("div", "ri-cnt"), paintC = () => { cnt.textContent = parse(ta.value).length + " / 100 كلمة"; }; paintC();
    ta.addEventListener("input", () => { riDraft.bw = ta.value; paintC(); });
    const sv = el("button", "ri-save", "💾 حفظ الكلمات"); sv.type = "button";
    sv.onclick = () => { upd({ badWords: parse(ta.value) }, r.id); delete riDraft.bw; sv.textContent = "✓ اتحفظت"; setTimeout(() => { sv.textContent = "💾 حفظ الكلمات"; }, 1500); };
    bc.append(bw, cnt, sv);
    const rc = card("📜 قواعد الدردشة", "stack");
    rc.append(el("div", "ri-note plain", "بتظهر لكل الأعضاء في صفحة المعلومات."));
    const [rw, ra] = editor("rules", r.rules || "", 5, 600);
    const cnt2 = el("div", "ri-cnt"), paintR = () => { cnt2.textContent = ra.value.length + " / 600"; }; paintR();
    ra.addEventListener("input", () => { riDraft.rules = ra.value; paintR(); });
    const rs = el("button", "ri-save", "💾 حفظ القواعد"); rs.type = "button";
    rs.onclick = () => { upd({ rules: ra.value.trim() }, r.id); delete riDraft.rules; rs.textContent = "✓ اتحفظت"; setTimeout(() => { rs.textContent = "💾 حفظ القواعد"; }, 1500); };
    rc.append(rw, cnt2, rs);
  }

  /* ═══ تاب: نظرة عامة (لغير المالك) ═══ */
  if (tab === "about") {
    if (r.rules) { const rc2 = card("📜 قواعد الدردشة"), rt = el("div", "ri-rules", r.rules); rt.dir = "auto"; rc2.append(rt); }
    if (G && admin && !owner) { const qc = card("⚡ تحكم سريع"); qc.append(swRow("🔒 قفل الدردشة", "الكتابة للمشرفين بس لحد ما تفتحها", !!r.onlyAdmins, v => upd({ onlyAdmins: v }, "general"))); }
  }

  /* ═══ تاب: الأعضاء ═══ */
  if (tab === "mem") {
    if (reqs.length) {
      const c = card("✋ طلبات الانضمام (" + reqs.length + ")", "stack");
      reqs.forEach(u => {
        const row = el("div", "ri-mem"), ok = el("button", "ri-ok", "✓"), no = el("button", "ri-no", "✕");
        ok.onclick = () => decideJoin(r, u, true); no.onclick = () => decideJoin(r, u, false);
        const nb = el("b", "", nameOf(u)); nb.dir = "rtl"; row.append(avatar(profileFor(u)), nb, ok, no); c.append(row);
      });
    }
    const isOn = u => u === myId || isOnline(presence[u]);
    const isAdm = u => u === r.by || (r.admins || []).includes(u);
    const isMut = u => (r.muted || []).includes(u) || ((r.mutedUntil || {})[u] || 0) > Date.now();
    let stOn = null;
    if (!locked) {
      const st = el("div", "ri-stats"), tile = (n, lb, ic) => { const t = el("div", "ri-stat"), b = el("b", "", String(n)); t.append(el("i", "", ic), b, el("span", "", lb)); st.append(t); return b; };
      tile(visible.length, "عضو", "👥"); stOn = tile(0, "متصل", "🟢"); tile(visible.filter(isAdm).length, "مشرف", "🛡️");
      pane.append(st);
    } else if (memTotal != null) {
      const st = el("div", "ri-stats one"), t = el("div", "ri-stat"); t.append(el("i", "", "👥"), el("b", "", String(memTotal)), el("span", "", "عضو")); st.append(t); pane.append(st);
    }
    if (locked) pane.append(el("div", "ri-note memlock", "🔐 قائمة الأعضاء متاحة للمالك فقط"));
    else if (owner && r.ownerOnlyMem !== false) pane.append(el("div", "ri-note memlock own", "🔐 القائمة دي ظاهرة ليك إنت بس"));
    if (admin && !G) { const ac = card(null); ac.append(actRow("➕ إضافة أصدقاء", "اختار من أصدقائك أو ابحث بالكود", () => addFriend(r, mem))); }
    const mc = card(null, "stack"), lst = el("div", "ri-list");
    let cnt = null;
    if (!locked && visible.length > 1) {
      const stk = el("div", "ri-stk"), sw = el("div", "ri-sw"), sIn = document.createElement("input");
      sIn.id = "riSearch"; sIn.type = "text"; sIn.dir = "auto"; sIn.enterKeyHint = "search"; sIn.autocomplete = "off"; sIn.spellcheck = false; sIn.className = "ri-in";
      sIn.placeholder = admin ? "ابحث بالاسم أو الكود…" : "ابحث بالاسم أو الكود الكامل…"; sIn.value = riQ;
      const clr = el("button", "ri-x", "✕"); clr.type = "button"; clr.hidden = !riQ; clr.setAttribute("aria-label", "مسح");
      sw.append(el("span", "ri-si", "🔍"), sIn, clr);
      const fl = el("div", "ri-fl"); [["all", "الكل"], ["on", "🟢 متصل"], ["adm", "🛡️ المشرفين"], ["mut", "🔇 المكتومين"]].forEach(([id, lb]) => {
        const b = el("button", "ri-fc" + (riFlt === id ? " on" : ""), lb); b.type = "button";
        b.onclick = () => { riFlt = id; riLim = 20; fl.querySelectorAll(".ri-fc").forEach(x => x.classList.toggle("on", x === b)); paintList(); }; fl.append(b);
      });
      sIn.addEventListener("input", () => { riQ = sIn.value; riLim = 20; clr.hidden = !riQ; paintList(); });
      clr.onclick = () => { sIn.value = ""; riQ = ""; riLim = 20; clr.hidden = true; paintList(); sIn.focus(); };
      stk.append(sw, fl); head.append(stk);
      cnt = el("div", "ri-cnt res"); mc.append(cnt);
    }
    mc.append(lst);
    const paintList = () => {
      const qq = riQ.trim().toLowerCase(), qc = normFCode(riQ);
      lst.textContent = "";
      const rows = visible.filter(u => {
        if (riFlt === "on" && !isOn(u)) return false; if (riFlt === "adm" && !isAdm(u)) return false; if (riFlt === "mut" && !isMut(u)) return false;
        if (!qq) return true;
        if ((nameOf(u, r.id) + " " + ((profiles[u] || {}).name || "")).toLowerCase().includes(qq)) return true;
        const fc = (profiles[u] || {}).fcode || ""; if (!fc || !qc) return false;
        return admin ? (qc.length >= 3 && fc.includes(qc)) : fc === qc;
      }).sort((x, y) => (isOn(y) - isOn(x)) || ((y === r.by) - (x === r.by)) || (((r.admins || []).includes(y)) - ((r.admins || []).includes(x))) || nameOf(x, r.id).localeCompare(nameOf(y, r.id), "ar"));
      if (stOn) stOn.textContent = String(visible.filter(isOn).length);
      if (cnt) cnt.textContent = (qq || riFlt !== "all") ? "النتايج: " + rows.length + " من " + visible.length : "";
      if (cnt) cnt.hidden = !cnt.textContent;
      if (!rows.length) { const e = el("div", "ri-empty"); e.append(el("i", "", "🔍"), el("b", "", "مفيش نتايج"), el("small", "", "جرّب اسم أو كود تاني")); lst.append(e); return; }
      rows.slice(0, riLim).forEach(u => {
        const row = el("div", "ri-mem" + (isOn(u) ? " on" : "")), mi = el("div", "mi"), l1 = el("div", "ri-nm"), nm = el("b", "", nameOf(u, r.id) + (u === myId ? " (أنت)" : "")); nm.dir = "rtl"; row.dataset.uid = u;
        l1.append(nm);
        if (u === r.by) l1.append(el("span", "ri-bd own", "👑 مالك")); else if ((r.admins || []).includes(u)) l1.append(el("span", "ri-bd adm", "🛡️ مشرف"));
        if (isMut(u)) l1.append(el("span", "ri-bd mut", "🔇"));
        const sub = el("small", "", isOn(u) ? "🟢 متصل" : lastSeenText(presence[u]));
        if (admin && (profiles[u] || {}).fcode) { const cs = el("span", "ri-code", fmtFCode(profiles[u].fcode)); cs.dir = "ltr"; cs.onclick = async e => { e.stopPropagation(); const o = cs.textContent; if (await copyText(o)) { cs.textContent = "✓ اتنسخ"; setTimeout(() => { cs.textContent = o; }, 1200); } }; sub.append(cs); }
        mi.append(l1, sub);
        row.append(avatar(profileFor(u, r.id)), mi);
        if (u !== myId && u !== r.by && (owner || (admin && !(r.admins || []).includes(u)))) { const d = el("button", "ri-dots", "⋮"); d.type = "button"; d.setAttribute("aria-label", "إدارة العضو"); d.onclick = () => memberMenu(r, u); row.append(d); }
        lst.append(row);
      });
      if (rows.length > riLim) { const mb = el("button", "ri-more", "عرض المزيد (" + (rows.length - riLim) + ")"); mb.type = "button"; mb.onclick = () => { riLim += 20; paintList(); }; lst.append(mb); }
    };
    paintList(); window.__memPaint = paintList;
    if (admin && !G && (r.banned || []).length) {
      const c = card("⛔ المحظورون (" + r.banned.length + ")", "stack");
      riPaged(c, r.banned, u => { const row = el("div", "ri-mem"), b = el("button", "ghost", "إلغاء الحظر"); b.onclick = () => upd({ banned: AR(u) }, r.id); const nb = el("b", "", nameOf(u)); nb.dir = "rtl"; row.append(avatar(profileFor(u)), nb, b); return row; });
    }
  }

  /* ═══ تاب: الإدارة (الغرفة العامة) ═══ */
  if (tab === "staff") {
    const staff = [...new Set([...(r.by ? [r.by] : []), ...(r.admins || [])])];
    const sc = card("🛡️ المشرفين (" + staff.length + ")", "stack");
    staff.forEach(u => {
      const row = el("div", "ri-mem"), nb = el("b", "", nameOf(u, "general") + (u === myId ? " (أنت)" : "")); nb.dir = "rtl";
      row.append(avatar(profileFor(u, "general")), nb, el("span", "ri-bd " + (u === r.by ? "own" : "adm"), u === r.by ? "👑 مالك" : "🛡️ مشرف"));
      if (owner && u !== r.by) { const x = el("button", "ghost", "إزالة"); x.onclick = () => upd({ admins: AR(u) }, "general"); row.append(x); }
      sc.append(row);
    });
    if (owner) sc.append(friendFinder(staff, r.banned || [], u => upd({ admins: AU(u) }, "general")));
    sc.append(el("div", "ri-note plain", "علشان تكتم أو تحظر حد: اضغط مطوّلاً على رسالته ← إدارة العضو."));
    const bn = card("⛔ حظر بالكود", "stack");
    bn.append(friendFinder(staff, r.banned || [], u => upd({ banned: AU(u) }, "general"), "⛔ حظر", "مشرف، مينفعش"));
    if ((r.banned || []).length) {
      const c = card("🚷 المحظورون (" + r.banned.length + ")", "stack");
      riPaged(c, r.banned, u => { const row = el("div", "ri-mem"), b = el("button", "ghost", "إلغاء الحظر"); b.onclick = () => upd({ banned: AR(u) }, r.id); const nb = el("b", "", nameOf(u)); nb.dir = "rtl"; row.append(avatar(profileFor(u)), nb, b); return row; });
    }
    const kd = Object.keys(r.removedUntil || {}).filter(u => kickedLeft(r, u) > 0);
    if (kd.length) {
      const kc = card("🚪 المُزالون مؤقتاً (" + kd.length + ")", "stack");
      riPaged(kc, kd, u => { const row = el("div", "ri-mem"), b = el("button", "ghost", "إرجاع"); b.onclick = () => upd({ ["removedUntil." + u]: FV().delete() }, "general"); const nm = el("b", "", nameOf(u, "general")); nm.dir = "rtl"; row.append(avatar(profileFor(u, "general")), nm, el("span", "ri-tag", leftTxt(kickedLeft(r, u))), b); return row; });
    }
    if ((r.muted || []).length) {
      const mc2 = card("🔇 المكتومين (" + r.muted.length + ")", "stack");
      riPaged(mc2, r.muted, u => { const row = el("div", "ri-mem"), b = el("button", "ghost", "إلغاء الكتم"); b.onclick = () => upd({ muted: AR(u), ["mutedUntil." + u]: FV().delete() }, "general"); const nb = el("b", "", nameOf(u, "general")); nb.dir = "rtl"; row.append(avatar(profileFor(u, "general")), nb, b); return row; });
    }
  }

  /* ═══ تاب: المزيد ═══ */
  if (tab === "more") {
    const dc = card("منطقة الخطر", "stack dn");
    if (canLeave) {
      const lv = el("button", "ri-danger", "🚪 مغادرة الغرفة");
      lv.onclick = async () => { try { await db.collection("rooms").doc(r.id).update({ members: AR(myId) }); closeInfo(); openRoom("general"); } catch (e) { setStatus(errMsg(e)); } };
      dc.append(lv);
    }
    if (owner) {
      const cl = el("button", "ri-danger", "🧹 مسح كل الرسايل");
      confirmBtn(cl, "clr:" + r.id, "🧹 مسح كل الرسايل", "⚠️ اضغط تاني للتأكيد", async (busy, idle) => {
        try {
          busy("جاري المسح…");
          const res = await wipeRoomMsgs(r.id, n => busy("جاري المسح… " + n)); if (r.pinned || r.pins) await upd({ pins: FV().delete(), pinned: FV().delete() }, r.id);
          setStatus(res.failed ? "اتمسح " + res.done + " ورسايل (" + res.failed + ") ماتمسحتش — راجع صلاحيات Firestore" : "✓ اتمسحت كل الرسايل (" + res.done + ")");
          setTimeout(() => setStatus(""), 4000);
        } catch (e) { setStatus(errMsg(e)); }
        idle();
      });
      dc.append(cl);
      if (!G) {
        const dl = el("button", "ri-danger", "🗑 حذف الغرفة");
        confirmBtn(dl, "del:" + r.id, "🗑 حذف الغرفة", "⚠️ اضغط تاني للتأكيد (هتتمسح الرسايل كمان)", async (busy, idle) => {
          try {
            busy("جاري الحذف…");
            await wipeRoomMsgs(r.id);
            await dropCode(r); await db.collection("rooms").doc(r.id).delete(); closeInfo(); openRoom("general");
          } catch (e) { setStatus(errMsg(e)); }
          idle();
        });
        dc.append(dl);
      }
    }
  }

  /* ── تثبيت التاب والسكرول ── */
  try { const on = bar.querySelector(".on"); if (on) bar.scrollLeft = on.offsetLeft - (bar.clientWidth - on.offsetWidth) / 2; } catch (_) {}
  box.scrollTop = tabSwitch ? Math.min(keep, Math.max(0, head.offsetTop - box.offsetTop)) : keep;
  if (refocus) { const s = $("riSearch"); if (s) { s.focus(); try { s.setSelectionRange(caret, caret); } catch (_) {} } }
}
$("riBack").onclick = closeInfo;
function openRoomMenu(r) {
  const c = $("mcard"); c.textContent = ""; const close = () => { $("msheet").hidden = true; };
  const head = document.createElement("div"); head.className = "mprev mh";
  const ic = avatar(r.emoji || r.photo ? r : { emoji: "💬", color: "#5b6b78" }); ic.style.cssText += ";width:68px;height:68px;font-size:34px";
  const nm = document.createElement("span"); nm.textContent = r.name; nm.style.fontWeight = "700"; head.append(ic, nm, el("small", "ri-msub", r.private ? "🔒 غرفة خاصة" : "🌐 غرفة عامة")); c.appendChild(head);
  const acts = document.createElement("div"); acts.className = "acts lst";
  const act = (ico, label, grad, fn) => {
    const b = document.createElement("button"); b.type = "button"; b.className = "act" + (/d64545/.test(grad) ? " dng" : "");
    const i = document.createElement("i"); i.textContent = ico; i.style.background = grad;
    const sp = document.createElement("span"); sp.textContent = label; b.append(i, sp); b.onclick = () => fn(b, sp); acts.appendChild(b);
  };
  act("⚙️", "الإعدادات", "linear-gradient(135deg,#a07cff,#6b46e0)", () => { $("msheet").hidden = true; closeDrawer(); openRoom(r.id); openInfo(r.id); });
  if (isOwner(r)) {
  act("✏️", "تعديل الغرفة", "linear-gradient(135deg,#5aa9ff,#2f6fed)", () => { close(); closeDrawer(); openSheet("editroom", r.id); });
  act("🗑", "حذف الغرفة", "linear-gradient(135deg,#ff7a7a,#d64545)", async (b, sp) => {
    if (!b.dataset.ok) { b.dataset.ok = "1"; sp.textContent = "تأكيد؟"; return; }
    close();
    try {
      await wipeRoomMsgs(r.id);
      await dropCode(r); await db.collection("rooms").doc(r.id).delete();
      if (room === r.id) openRoom("general");
    } catch (e) { setStatus("ماقدرتش أحذف الغرفة."); }
  });
  }
  acts.style.gridTemplateColumns = "repeat(" + (acts.children.length <= 4 ? acts.children.length : 3) + ",1fr)";
  c.appendChild(acts); $("msheet").hidden = false;
}

function openRoom(id) {
  if (!db) { setStatus("التطبيق لسه مش متصل بـ Firebase: حط إعدادات FIREBASE_CONFIG في أول الملف وافتح الصفحة من رابط مستضاف (مش من المعاينة)."); return; }
  clearReply(); selMode = false; sel.clear(); $("selBar").hidden = true;
  cancelEdit();
  room = id; creating = false; confirmDel = false; $("inp").placeholder = "اكتب رسالة…"; try { $("inp").value = localStorage.getItem("vc_draft_" + id) || ""; } catch (_) {} buildChips(); refreshMe();
  if (unsub) unsub();
  setStatus("جاري تحميل الرسايل…");
  const timer = setTimeout(() => setStatus("مش قادر أوصل للرسايل دلوقتي، ممكن النت ضعيف."), 10000);
  let firstSnap = true, pendSig = "";
  unsub = (isDM(id) ? db.collection("dmsgs").where("room", "==", id).where("members", "array-contains", myId) : db.collection("msgs").where("room", "==", id)).onSnapshot({ includeMetadataChanges: true },
    s => {
      clearTimeout(timer); NET.cache = s.metadata.fromCache;
      const pend = s.docs.filter(d => d.metadata.hasPendingWrites).map(d => d.id).join(",");
      if (!firstSnap && !s.docChanges().length && pend === pendSig) { netUI(); return; }
      firstSnap = false; pendSig = pend;
      const clr = isDM(id) ? dmClearedAt(dms[id]) : 0; { const st = $("status").textContent; if (st.startsWith("جاري تحميل") || st.startsWith("مش قادر أوصل")) setStatus(""); }
      render(s.docs.map(d => ({ ...d.data(), id: d.id, _p: d.metadata.hasPendingWrites })).filter(m => m.ts > clr).sort((a, b) => (a.ts - b.ts) || a.id.localeCompare(b.id)).slice(-150));
    },
    e => { clearTimeout(timer); setStatus(errMsg(e)); });
  maybePersona();
  if (window.syncHistory) syncHistory();
}

/* Very Chat — البروفايل وشخصيات الشلة */
// ───── البروفايل ─────
function perr(t) { $("pErr").textContent = t; $("pErr").hidden = !t; }
// ───── شخصيات الشلة: رسومات أصلية (SVG) لكل واحدة اسم وطابع ─────
const CHARS = (() => {
  const mk = (i, a, b, body) => "<svg viewBox='0 0 100 100'><defs><radialGradient id='cg" + i + "' cx='.3' cy='.2' r='1.05'><stop offset='0' stop-color='" + a + "'/><stop offset='1' stop-color='" + b + "'/></radialGradient></defs><rect width='100' height='100' fill='url(#cg" + i + ")'/>" + body + "</svg>";
  const L = [
    { k: "pharaoh", n: "الفرعون", t: "ملك الشلة", s: mk(1, "#fdba74", "#c2410c",
      "<circle cx='50' cy='46' r='40' fill='#fff' opacity='.14'/>" +
      "<path d='M12 100c0-18 14-27 38-27s38 9 38 27z' fill='#f5c542'/><path d='M24 100c1-12 10-20 26-20s25 8 26 20z' fill='#1e5bb8'/><path d='M32 100c1-8 7-13 18-13s17 5 18 13z' fill='#f5c542'/>" +
      "<path d='M22 44c0-22 12-34 28-34s28 12 28 34v34c0 5-4 8-9 8H31c-5 0-9-3-9-8z' fill='#f5c542'/>" +
      "<path d='M23 52h8M23 60h8M23 68h8M69 52h8M69 60h8M69 68h8' stroke='#1e5bb8' stroke-width='3'/>" +
      "<ellipse cx='50' cy='50' rx='17' ry='21' fill='#e8b07a'/><path d='M32 33q18-12 36 0v7q-18-9-36 0z' fill='#1e5bb8'/>" +
      "<path d='M50 12c4 0 5 5 3 8-1 2-1 4 0 6h-6c1-2 1-4 0-6-2-3-1-8 3-8z' fill='#facc15' stroke='#a16207' stroke-width='1'/>" +
      "<path d='M38 46q5-3 10 0M52 46q5-3 10 0' stroke='#111' stroke-width='2' fill='none' stroke-linecap='round'/>" +
      "<ellipse cx='43' cy='50' rx='4' ry='2.6' fill='#fff'/><ellipse cx='57' cy='50' rx='4' ry='2.6' fill='#fff'/><circle cx='43' cy='50' r='1.8' fill='#111'/><circle cx='57' cy='50' r='1.8' fill='#111'/>" +
      "<path d='M37 50h-3M63 50h3' stroke='#111' stroke-width='2' stroke-linecap='round'/><path d='M50 52v6' stroke='#c98d56' stroke-width='2'/>" +
      "<path d='M44 61q6 4 12 0' stroke='#7a3e1d' stroke-width='2' fill='none' stroke-linecap='round'/><path d='M47 68h6v14q-3 3-6 0z' fill='#1e5bb8'/>") },
    { k: "ninja", n: "النينجا", t: "بيظهر ويختفي", s: mk(2, "#4b5563", "#030712",
      "<path d='M82 10l3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1z' fill='#9ca3af' opacity='.45'/>" +
      "<path d='M14 100c0-18 14-28 36-28s36 10 36 28z' fill='#111827'/><path d='M38 76l12 14 12-14' stroke='#e11d48' stroke-width='5' fill='none' stroke-linejoin='round'/>" +
      "<circle cx='50' cy='50' r='27' fill='#111827'/><rect x='28' y='42' width='44' height='15' rx='7.5' fill='#f1c9a0'/>" +
      "<ellipse cx='41' cy='49.5' rx='4.5' ry='3.6' fill='#fff'/><ellipse cx='59' cy='49.5' rx='4.5' ry='3.6' fill='#fff'/><circle cx='42' cy='50' r='2.3' fill='#111'/><circle cx='58' cy='50' r='2.3' fill='#111'/>" +
      "<path d='M35 44l11 3M65 44l-11 3' stroke='#111' stroke-width='3' stroke-linecap='round'/>" +
      "<path d='M24 31h52v8H24z' fill='#e11d48'/><rect x='43' y='31' width='14' height='8' rx='2' fill='#cbd5e1'/><path d='M76 33l15-6-3 11zM76 37l14 9-9 1z' fill='#e11d48'/>") },
    { k: "robot", n: "الروبوت", t: "مبرمج على الضحك", s: mk(3, "#38bdf8", "#1e3a8a",
      "<path d='M16 100c0-16 14-24 34-24s34 8 34 24z' fill='#94a3b8'/><rect x='42' y='86' width='16' height='8' rx='3' fill='#22d3ee'/><rect x='45' y='68' width='10' height='10' fill='#64748b'/>" +
      "<path d='M50 24V13' stroke='#cbd5e1' stroke-width='3'/><circle cx='50' cy='11' r='5' fill='#fb7185'/><circle cx='48.5' cy='9.5' r='1.5' fill='#fff'/>" +
      "<rect x='19' y='42' width='9' height='16' rx='3' fill='#64748b'/><rect x='72' y='42' width='9' height='16' rx='3' fill='#64748b'/><rect x='26' y='24' width='48' height='46' rx='13' fill='#e2e8f0'/>" +
      "<rect x='32' y='34' width='36' height='22' rx='8' fill='#0f172a'/><circle cx='43' cy='45' r='5' fill='#22d3ee'/><circle cx='57' cy='45' r='5' fill='#22d3ee'/><circle cx='44.5' cy='43.5' r='1.6' fill='#fff'/><circle cx='58.5' cy='43.5' r='1.6' fill='#fff'/>" +
      "<path d='M38 63h24' stroke='#94a3b8' stroke-width='3' stroke-linecap='round' stroke-dasharray='4 3'/><circle cx='32' cy='61' r='2.5' fill='#fb7185' opacity='.8'/><circle cx='68' cy='61' r='2.5' fill='#fb7185' opacity='.8'/>") },
    { k: "astro", n: "رائد الفضاء", t: "دماغه في الكون", s: mk(4, "#4338ca", "#0b0720",
      "<circle cx='14' cy='18' r='1.6' fill='#fff'/><circle cx='86' cy='26' r='1.2' fill='#fff'/><circle cx='18' cy='64' r='1' fill='#fff'/><circle cx='88' cy='68' r='1.6' fill='#fff'/><circle cx='74' cy='10' r='1' fill='#fff'/>" +
      "<path d='M14 100c0-18 14-28 36-28s36 10 36 28z' fill='#f8fafc'/><rect x='34' y='86' width='13' height='8' rx='2' fill='#f97316'/><circle cx='64' cy='90' r='3' fill='#38bdf8'/>" +
      "<circle cx='50' cy='48' r='30' fill='#f1f5f9' stroke='#cbd5e1' stroke-width='2'/><rect x='19' y='42' width='7' height='12' rx='3' fill='#cbd5e1'/><rect x='74' y='42' width='7' height='12' rx='3' fill='#cbd5e1'/>" +
      "<ellipse cx='50' cy='48' rx='23' ry='19' fill='#16213f'/><ellipse cx='50' cy='50' rx='13' ry='14' fill='#f0c9a2'/><circle cx='45' cy='49' r='1.8' fill='#222'/><circle cx='55' cy='49' r='1.8' fill='#222'/><path d='M45 56q5 4 10 0' stroke='#9a3412' fill='none' stroke-width='2' stroke-linecap='round'/>" +
      "<path d='M33 40q4-9 14-10' stroke='#fff' stroke-width='3' fill='none' stroke-linecap='round' opacity='.65'/><path d='M62 63q5-3 7-9' stroke='#fff' stroke-width='2' fill='none' stroke-linecap='round' opacity='.35'/>") },
    { k: "ghost", n: "الشبح", t: "بيخضّك بحب", s: mk(5, "#8b5cf6", "#1e1b4b",
      "<ellipse cx='50' cy='90' rx='24' ry='5' fill='#000' opacity='.25'/><path d='M26 62q-10 0-10-9M74 62q10 0 10-9' stroke='#f5f3ff' stroke-width='6' fill='none' stroke-linecap='round'/>" +
      "<path d='M26 84V48c0-17 10-28 24-28s24 11 24 28v36l-8-7-8 7-8-7-8 7-8-7z' fill='#f5f3ff'/>" +
      "<path d='M41 26l9-18 9 18z' fill='#fb7185'/><circle cx='50' cy='8' r='3' fill='#fde047'/>" +
      "<ellipse cx='41' cy='46' rx='4.5' ry='6.5' fill='#1e1b4b'/><ellipse cx='59' cy='46' rx='4.5' ry='6.5' fill='#1e1b4b'/><circle cx='42.5' cy='43.5' r='1.6' fill='#fff'/><circle cx='60.5' cy='43.5' r='1.6' fill='#fff'/>" +
      "<ellipse cx='50' cy='60' rx='4' ry='5' fill='#1e1b4b'/><circle cx='34' cy='56' r='4' fill='#f9a8d4' opacity='.7'/><circle cx='66' cy='56' r='4' fill='#f9a8d4' opacity='.7'/>" +
      "<path d='M82 20l2 5 5 2-5 2-2 5-2-5-5-2 5-2z' fill='#fde047'/>") },
    { k: "count", n: "الكونت", t: "سهران لحد الفجر", s: mk(6, "#b91c1c", "#1c0a0a",
      "<circle cx='78' cy='24' r='13' fill='#fde68a'/><circle cx='83' cy='28' r='2.2' fill='#facc15' opacity='.5'/><circle cx='74' cy='20' r='1.6' fill='#facc15' opacity='.5'/>" +
      "<path d='M10 100c2-20 14-30 40-30s38 10 40 30z' fill='#111827'/><path d='M16 100l6-40 24 24z' fill='#0b1220'/><path d='M84 100l-6-40-24 24z' fill='#0b1220'/><path d='M23 100l4-26 14 12z' fill='#b91c1c'/><path d='M77 100l-4-26-14 12z' fill='#b91c1c'/>" +
      "<ellipse cx='50' cy='50' rx='17' ry='21' fill='#e5e7eb'/><path d='M32 46c-2-18 6-27 18-27s20 9 18 27c-3-8-8-12-18-9-10-3-15 1-18 9z' fill='#0b0b0f'/><path d='M44 34l6 9 6-9z' fill='#0b0b0f'/>" +
      "<ellipse cx='42' cy='50' rx='3.6' ry='2.8' fill='#fff'/><ellipse cx='58' cy='50' rx='3.6' ry='2.8' fill='#fff'/><circle cx='42' cy='50' r='1.8' fill='#dc2626'/><circle cx='58' cy='50' r='1.8' fill='#dc2626'/>" +
      "<path d='M36 44l10 3M64 44l-10 3' stroke='#0b0b0f' stroke-width='2.5' stroke-linecap='round'/><path d='M43 61q7 5 14 0' stroke='#7f1d1d' stroke-width='2' fill='none' stroke-linecap='round'/><path d='M45.5 62l1.6 6 1.6-5zM54.5 62l-1.6 6-1.6-5z' fill='#fff'/>") },
    { k: "wizard", n: "الساحر", t: "عنده حل لكل حاجة", s: mk(7, "#6d28d9", "#1e1b4b",
      "<path d='M16 30l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z' fill='#fde047'/><circle cx='86' cy='52' r='1.8' fill='#fde047'/><circle cx='12' cy='70' r='1.4' fill='#fff'/><circle cx='88' cy='80' r='1.2' fill='#fff'/>" +
      "<path d='M12 100c0-18 14-28 38-28s38 10 38 28z' fill='#4338ca'/><ellipse cx='50' cy='48' rx='15' ry='14' fill='#f0c9a2'/>" +
      "<path d='M33 52q17-8 34 0c0 20-7 36-17 36s-17-16-17-36z' fill='#f1f5f9'/><ellipse cx='50' cy='53' rx='3.6' ry='3' fill='#e8b48a'/>" +
      "<circle cx='44' cy='46' r='1.8' fill='#222'/><circle cx='56' cy='46' r='1.8' fill='#222'/><path d='M39 42q4-3 8 0M53 42q4-3 8 0' stroke='#e2e8f0' stroke-width='2.5' fill='none' stroke-linecap='round'/>" +
      "<ellipse cx='50' cy='37' rx='26' ry='6' fill='#5b21b6'/><path d='M31 37L50 3l19 34z' fill='#7c3aed'/><path d='M33 34q17 5 34 0l1.5 3q-18 6-37 0z' fill='#fde047'/><path d='M50 14l2 5 5 .5-4 3.5 1.5 5-4.5-3-4.5 3 1.5-5-4-3.5 5-.5z' fill='#fde047'/>") },
    { k: "pirate", n: "القرصان", t: "بيدوّر على كنز", s: mk(8, "#0ea5e9", "#0c4a6e",
      "<path d='M0 80q12-8 25 0t25 0 25 0 25 0v20H0z' fill='#0369a1' opacity='.7'/>" +
      "<path d='M12 100c0-18 14-27 38-27s38 9 38 27z' fill='#f8fafc'/><path d='M20 88h60M16 96h68' stroke='#1e3a8a' stroke-width='4'/>" +
      "<ellipse cx='50' cy='50' rx='19' ry='21' fill='#e8b07a'/><path d='M29 44c0-18 9-26 21-26s21 8 21 26c-10-6-32-6-42 0z' fill='#dc2626'/>" +
      "<circle cx='40' cy='30' r='1.8' fill='#fff'/><circle cx='52' cy='25' r='1.8' fill='#fff'/><circle cx='61' cy='34' r='1.8' fill='#fff'/><circle cx='47' cy='37' r='1.8' fill='#fff'/><path d='M70 38l14 2-4 6zM70 42l12 8h-8z' fill='#dc2626'/>" +
      "<path d='M30 41L68 53' stroke='#111' stroke-width='2'/><ellipse cx='42' cy='48' rx='6.5' ry='5.5' fill='#111'/><circle cx='58' cy='50' r='3.4' fill='#fff'/><circle cx='58.5' cy='50.5' r='1.8' fill='#111'/><path d='M52 44l11 2' stroke='#5b3a1e' stroke-width='3' stroke-linecap='round'/>" +
      "<path d='M41 62q10 8 20-1' stroke='#7a3e1d' stroke-width='2.4' fill='none' stroke-linecap='round'/><rect x='54' y='62.5' width='3.4' height='4' rx='1' fill='#facc15'/><circle cx='31' cy='57' r='3' fill='none' stroke='#facc15' stroke-width='2'/>") },
    { k: "monster", n: "الوحش اللطيف", t: "شكله مخيف وقلبه أبيض", s: mk(9, "#fde047", "#f97316",
      "<path d='M18 100c0-22 14-34 32-34s32 12 32 34z' fill='#7c3aed'/><path d='M22 52h-6M23 60l-6 3M78 52h6M77 60l6 3M26 40l-6-3M74 40l6-3' stroke='#8b5cf6' stroke-width='3' stroke-linecap='round'/>" +
      "<path d='M30 34l-7-16 15 9zM70 34l7-16-15 9z' fill='#fef3c7'/><path d='M22 52c0-18 12-30 28-30s28 12 28 30c0 16-12 26-28 26S22 68 22 52z' fill='#8b5cf6'/>" +
      "<circle cx='32' cy='58' r='3' fill='#a78bfa'/><circle cx='69' cy='60' r='4' fill='#a78bfa'/><circle cx='50' cy='46' r='14' fill='#fff'/><circle cx='52' cy='47' r='7' fill='#22c55e'/><circle cx='52' cy='47' r='3.6' fill='#111'/><circle cx='54.5' cy='44.5' r='2' fill='#fff'/>" +
      "<path d='M34 64q16 14 32 0z' fill='#3b0764'/><path d='M38 64.5l3.5 6 3.5-5zM55 66l3.5 5 3-6z' fill='#fff'/>") },
    { k: "alien", n: "المريخي", t: "جاي في زيارة", s: mk(10, "#14b8a6", "#3b0764",
      "<circle cx='12' cy='60' r='1.4' fill='#fff'/><circle cx='88' cy='54' r='1.8' fill='#fff'/><circle cx='84' cy='88' r='1.2' fill='#fff'/>" +
      "<path d='M16 100c0-16 14-24 34-24s34 8 34 24z' fill='#cbd5e1'/><path d='M40 78l10 10 10-10' stroke='#64748b' stroke-width='3' fill='none'/>" +
      "<path d='M38 24q-8-12-14-10M62 24q8-12 14-10' stroke='#4ade80' stroke-width='3' fill='none' stroke-linecap='round'/><circle cx='24' cy='13' r='4' fill='#fde047'/><circle cx='76' cy='13' r='4' fill='#fde047'/>" +
      "<path d='M50 20c18 0 28 14 26 30-2 18-14 28-26 28S26 68 24 50c-2-16 8-30 26-30z' fill='#4ade80'/>" +
      "<path d='M30 46c4-8 14-6 18 4-4 8-14 8-18-4z' fill='#052e16'/><path d='M70 46c-4-8-14-6-18 4 4 8 14 8 18-4z' fill='#052e16'/>" +
      "<ellipse cx='38' cy='46' rx='2.6' ry='1.6' fill='#fff' transform='rotate(-25 38 46)'/><ellipse cx='62' cy='46' rx='2.6' ry='1.6' fill='#fff' transform='rotate(25 62 46)'/>" +
      "<circle cx='47.5' cy='60' r='1' fill='#15803d'/><circle cx='52.5' cy='60' r='1' fill='#15803d'/><path d='M43 67q7 4 14 0' stroke='#15803d' stroke-width='2' fill='none' stroke-linecap='round'/>") },
    { k: "dragon", n: "التنين الصغير", t: "ينفخ نار وشوية دخان", s: mk(11, "#fb923c", "#7c2d12",
      "<path d='M24 54L6 32l4 24-8 6 14 4zM76 54l18-22-4 24 8 6-14 4z' fill='#15803d'/>" +
      "<path d='M16 100c0-18 12-28 34-28s34 10 34 28z' fill='#22c55e'/><path d='M36 100c0-12 6-18 14-18s14 6 14 18z' fill='#fde68a'/>" +
      "<path d='M33 30l-5-16 12 9zM67 30l5-16-12 9z' fill='#fde68a'/><path d='M44 21l6-9 6 9z' fill='#fde68a'/>" +
      "<path d='M24 48c0-18 12-28 26-28s26 10 26 28c0 14-10 26-26 26S24 62 24 48z' fill='#22c55e'/><ellipse cx='50' cy='60' rx='15' ry='11' fill='#4ade80'/>" +
      "<circle cx='44' cy='58' r='1.8' fill='#166534'/><circle cx='56' cy='58' r='1.8' fill='#166534'/><path d='M43 65q7 4 14 0' stroke='#166534' stroke-width='2' fill='none' stroke-linecap='round'/>" +
      "<ellipse cx='38' cy='42' rx='6' ry='6.5' fill='#fde047'/><ellipse cx='62' cy='42' rx='6' ry='6.5' fill='#fde047'/><ellipse cx='38' cy='42' rx='1.8' ry='5' fill='#111'/><ellipse cx='62' cy='42' rx='1.8' ry='5' fill='#111'/>" +
      "<path d='M31 34l12 3M69 34l-12 3' stroke='#15803d' stroke-width='3' stroke-linecap='round'/><circle cx='74' cy='66' r='3' fill='#e5e7eb' opacity='.85'/><circle cx='81' cy='59' r='4' fill='#e5e7eb' opacity='.7'/><circle cx='88' cy='50' r='5' fill='#e5e7eb' opacity='.55'/>") },
    { k: "camel", n: "الجمل الكوول", t: "ولا يهمه الحر", s: mk(12, "#fbbf24", "#b45309",
      "<circle cx='80' cy='22' r='12' fill='#fff7ad' opacity='.85'/><path d='M0 84q25-14 50-4t50-6v26H0z' fill='#92400e' opacity='.35'/><g transform='translate(0 7)'>" +
      "<path d='M30 100c2-14 8-24 10-32h20c2 8 8 18 10 32z' fill='#c68642'/><path d='M32 92q18 8 36 0l3 8H29z' fill='#dc2626'/><path d='M40 95v5M50 96v4M60 95v5' stroke='#fff' stroke-width='2'/>" +
      "<ellipse cx='27' cy='34' rx='6' ry='9' fill='#c68642' transform='rotate(-25 27 34)'/><ellipse cx='73' cy='34' rx='6' ry='9' fill='#c68642' transform='rotate(25 73 34)'/><ellipse cx='27.5' cy='35' rx='2.6' ry='5' fill='#f9a8a8' transform='rotate(-25 27.5 35)'/><ellipse cx='72.5' cy='35' rx='2.6' ry='5' fill='#f9a8a8' transform='rotate(25 72.5 35)'/>" +
      "<path d='M31 46c0-16 8-24 19-24s19 8 19 24c0 12-4 20-19 20S31 58 31 46z' fill='#d6a35f'/><path d='M43 22q7-9 14 0q-7-3-14 0z' fill='#8a5a2b'/><ellipse cx='50' cy='58' rx='13' ry='10' fill='#ecc994'/>" +
      "<ellipse cx='45' cy='55' rx='1.6' ry='2.4' fill='#7c4a1d'/><ellipse cx='55' cy='55' rx='1.6' ry='2.4' fill='#7c4a1d'/><path d='M43 64q6 3 15-2' stroke='#7c4a1d' stroke-width='2' fill='none' stroke-linecap='round'/>" +
      "<rect x='32' y='38' width='16' height='10' rx='4' fill='#111'/><rect x='52' y='38' width='16' height='10' rx='4' fill='#111'/><path d='M48 42h4' stroke='#111' stroke-width='2.5'/><path d='M36 41h5M56 41h5' stroke='#fff' stroke-width='1.8' opacity='.5' stroke-linecap='round'/></g>") },
    { k: "hacker", n: "الهاكر", t: "داخل الماتريكس", s: mk(13, "#166534", "#000",
      "<g fill='#22c55e'><rect x='10' y='6' width='3' height='16' opacity='.5'/><rect x='10' y='26' width='3' height='6' opacity='.3'/><rect x='22' y='14' width='3' height='20' opacity='.35'/><rect x='34' y='4' width='3' height='10' opacity='.5'/><rect x='66' y='8' width='3' height='12' opacity='.35'/><rect x='78' y='4' width='3' height='22' opacity='.5'/><rect x='90' y='14' width='3' height='14' opacity='.3'/><rect x='84' y='56' width='3' height='18' opacity='.35'/><rect x='8' y='54' width='3' height='20' opacity='.3'/></g>" +
      "<path d='M10 100c0-20 14-30 40-30s40 10 40 30z' fill='#1f2937'/><path d='M43 76v14M57 76v14' stroke='#9ca3af' stroke-width='2'/>" +
      "<path d='M20 56c0-22 12-38 30-38s30 16 30 38c0 8-4 14-8 16H28c-4-2-8-8-8-16z' fill='#111827'/><ellipse cx='50' cy='50' rx='19' ry='21' fill='#030712'/>" +
      "<ellipse cx='42' cy='48' rx='7' ry='5' fill='#4ade80' opacity='.25'/><ellipse cx='58' cy='48' rx='7' ry='5' fill='#4ade80' opacity='.25'/><ellipse cx='42' cy='48' rx='4.5' ry='3' fill='#4ade80'/><ellipse cx='58' cy='48' rx='4.5' ry='3' fill='#4ade80'/>" +
      "<path d='M40 60q10 7 20 0' stroke='#4ade80' stroke-width='2.5' fill='none' stroke-linecap='round'/><path d='M26 40q4-16 22-20' stroke='#374151' stroke-width='2' fill='none'/>") },
    { k: "falcon", n: "الصقر", t: "عينه على كل حاجة", s: mk(14, "#38bdf8", "#0c4a6e",
      "<ellipse cx='20' cy='20' rx='12' ry='5' fill='#fff' opacity='.35'/><ellipse cx='80' cy='30' rx='10' ry='4' fill='#fff' opacity='.3'/>" +
      "<path d='M12 100c0-20 14-30 38-30s38 10 38 30z' fill='#fef3c7'/><path d='M36 82l2 8M46 80l1 10M56 80l-1 10M66 82l-2 8' stroke='#92400e' stroke-width='3' stroke-linecap='round'/>" +
      "<path d='M24 50c0-20 12-32 26-32s26 12 26 32c0 16-10 26-26 26S24 66 24 50z' fill='#92400e'/><path d='M32 54c0-10 8-18 18-18s18 8 18 18c0 10-8 18-18 18S32 64 32 54z' fill='#fde7c0'/>" +
      "<path d='M38 52q-2 12 4 18M62 52q2 12-4 18' stroke='#3b1d0a' stroke-width='3' fill='none' stroke-linecap='round'/>" +
      "<circle cx='40' cy='48' r='6' fill='#fbbf24'/><circle cx='60' cy='48' r='6' fill='#fbbf24'/><circle cx='41' cy='48.5' r='2.8' fill='#111'/><circle cx='59' cy='48.5' r='2.8' fill='#111'/><path d='M31 40l14 6M69 40l-14 6' stroke='#3b1d0a' stroke-width='4' stroke-linecap='round'/>" +
      "<path d='M42 56h16c0 9-4 15-8 18-4-3-8-9-8-18z' fill='#f59e0b'/><path d='M50 74q-4-3-5-8h10q-1 5-5 8z' fill='#b45309'/><circle cx='47' cy='61' r='1.2' fill='#92400e'/><circle cx='53' cy='61' r='1.2' fill='#92400e'/>") },
    { k: "chef", n: "الشيف", t: "بيطبخ الدردشة", s: mk(15, "#fecaca", "#e11d48",
      "<path d='M12 100c0-18 14-27 38-27s38 9 38 27z' fill='#f8fafc'/><circle cx='50' cy='84' r='2' fill='#94a3b8'/><circle cx='50' cy='93' r='2' fill='#94a3b8'/><path d='M36 74q14 8 28 0l-2 6q-12 6-24 0z' fill='#2563eb'/>" +
      "<ellipse cx='50' cy='52' rx='18' ry='20' fill='#f0c9a2'/><circle cx='38' cy='26' r='11' fill='#fff'/><circle cx='50' cy='20' r='13' fill='#fff'/><circle cx='62' cy='26' r='11' fill='#fff'/><rect x='32' y='30' width='36' height='12' rx='3' fill='#fff' stroke='#e2e8f0' stroke-width='1.5'/>" +
      "<circle cx='43' cy='50' r='2' fill='#222'/><circle cx='57' cy='50' r='2' fill='#222'/><path d='M38 45q5-3 9 0M53 45q4-3 9 0' stroke='#3b2a1a' stroke-width='2' fill='none' stroke-linecap='round'/><circle cx='36' cy='58' r='3.4' fill='#fb7185' opacity='.5'/><circle cx='64' cy='58' r='3.4' fill='#fb7185' opacity='.5'/>" +
      "<path d='M50 57c-4-3-11-3-15 0 2 5 9 5 15 1 6 4 13 4 15-1-4-3-11-3-15 0z' fill='#3b2a1a'/><path d='M45 66q5 3 10 0' stroke='#9a3412' stroke-width='2' fill='none' stroke-linecap='round'/>") },
    { k: "genie", n: "المارد", t: "شبيك لبيك", s: mk(16, "#4f46e5", "#0f172a",
      "<path d='M82 22l2 5 5 2-5 2-2 5-2-5-5-2 5-2z' fill='#fde047'/><circle cx='14' cy='40' r='1.6' fill='#fff'/><circle cx='88' cy='66' r='1.4' fill='#fff'/>" +
      "<path d='M14 100c0-18 14-28 36-28s36 10 36 28z' fill='#38bdf8'/><path d='M28 100l6-24 16 8 16-8 6 24z' fill='#f59e0b'/><circle cx='50' cy='91' r='3.5' fill='#ef4444'/>" +
      "<circle cx='50' cy='17' r='8' fill='#38bdf8'/><ellipse cx='50' cy='48' rx='19' ry='22' fill='#38bdf8'/><path d='M31 36q19-8 38 0v5q-19-8-38 0z' fill='#f59e0b'/><circle cx='50' cy='36' r='3' fill='#ef4444'/>" +
      "<circle cx='30' cy='56' r='3.5' fill='none' stroke='#f59e0b' stroke-width='2'/><circle cx='70' cy='56' r='3.5' fill='none' stroke='#f59e0b' stroke-width='2'/>" +
      "<ellipse cx='42' cy='48' rx='4' ry='3' fill='#fff'/><ellipse cx='58' cy='48' rx='4' ry='3' fill='#fff'/><circle cx='42' cy='48' r='1.9' fill='#111'/><circle cx='58' cy='48' r='1.9' fill='#111'/><path d='M36 43q6-4 11 0M53 43q6-4 11 0' stroke='#0c4a6e' stroke-width='2.6' fill='none' stroke-linecap='round'/>" +
      "<path d='M42 64q8 4 16 0l-3 9q-5 4-10 0z' fill='#0f172a'/><path d='M38 59q6-5 12 0 6-5 12 0-6 5-12 2-6 3-12-2z' fill='#0f172a'/>") }
  ];
  L.forEach(c => { c.url = "data:image/svg+xml;utf8," + encodeURIComponent(c.s.replace("<svg ", "<svg xmlns='http://www.w3.org/2000/svg' ")); });
  return L;
})();
function paintDraft() {
  const pv = $("pvAv"); pv._photo = draft.photo || ""; pv.dataset.name = draft.name || ""; pv.replaceChildren(...avatar(draft).childNodes); pv.style.background = draft.photo ? "var(--line)" : draft.color;
  document.querySelectorAll("#emojis .opt").forEach(o => o.classList.toggle("on", o.textContent === draft.emoji));
  document.querySelectorAll("#colors .opt").forEach(o => o.classList.toggle("on", o.dataset.c === draft.color));
  $("rmPhoto").hidden = !draft.photo;
  $("hero2").style.setProperty("--dc", draft.color);
  const cur = draft.photo ? CHARS.find(c => c.url === draft.photo) : null, tg = $("chTag");
  tg.hidden = !cur; if (cur) tg.textContent = "🎭 " + cur.n + " · " + cur.t;
  const pk = draft.photo + "|" + draft.emoji;
  if (paintDraft._k !== pk) { paintDraft._k = pk; pv.classList.remove("pop2"); void pv.offsetWidth; pv.classList.add("pop2"); }
  document.querySelectorAll("#shalla .opt").forEach(o => o.classList.toggle("on", !!draft.photo && o.dataset.p === draft.photo));
}
function setPg(p) {
  $("pgP").hidden = p !== "p"; $("pgS").hidden = p !== "s";
  document.querySelectorAll("#pgSeg button").forEach(b => b.classList.toggle("on", b.dataset.pg === p));
  $("shBody").scrollTop = 0;
}
function setPk(k) {
  $("pk-emojis").hidden = k !== "emojis"; $("pk-shalla").hidden = k !== "shalla";
  document.querySelectorAll("#pkSeg button").forEach(b => b.classList.toggle("on", b.dataset.pk === k));
}
document.querySelectorAll("#pgSeg button").forEach(b => { b.onclick = () => { setPg(b.dataset.pg); try { vcSnd("tap"); } catch (e) {} }; });
document.querySelectorAll("#pkSeg button").forEach(b => { b.onclick = () => { setPk(b.dataset.pk); try { vcSnd("tap"); } catch (e) {} }; });
let sheetMode = "me", sheetRoom = null, rprofiles = {}, rpLoaded = false;
function roomName(id) { const r = rooms.find(x => x.id === id); return r ? r.name : "الغرفة"; }
function profileFor(uid, rid) { rid = rid || room; if (isDM(rid)) return profiles[uid]; const rp = (rprofiles[uid] || {})[rid]; return (rid !== "general" && rp && !rp.skip && rp) || profiles[uid]; }
function refreshMe() {
  const p = profileFor(myId); setAvatar($("meAv"), p);
  const r = room === "general" ? generalRoom() : isDM(room) ? dmRoom(room) : (rooms.find(x => x.id === room) || { name: "غرفة" });
  const box = $("hRoom"); box.textContent = "";
  const ra = avatar(r.id === undefined && room === "general" ? r : (r.emoji || r.photo ? r : { emoji: "💬", color: "#5b6b78" }));
  const t = document.createElement("div"); const nm = document.createElement("b"); nm.textContent = r.name;
  const sb = document.createElement("small"); sb.id = "hSub";
  t.append(nm, sb); box.append(ra, t); renderPin(); updateComposer(); try { paintHSub(); } catch (e) {}
}
function openSheet(mode, rid) {
  sheetMode = mode; sheetRoom = rid || null;
  const g = profiles[myId] || {};
  const base = mode === "me" ? g : mode === "persona" ? ((rprofiles[myId] || {})[rid] || {}) : mode === "editroom" ? (rid === "general" ? generalRoom() : (rooms.find(x => x.id === rid) || {})) : {};
  const src = (mode === "persona" && (!base.name || base.skip)) ? g : base;
  draft = { name: mode === "room" ? "" : (src.name || (mode === "me" ? gName() : "")), emoji: src.emoji || (mode === "room" || mode === "editroom" ? "💬" : "😀"), color: src.color || COLORS[0], photo: src.photo || "" };
  $("shTitle").textContent = mode === "me" ? "بروفايلك" : mode === "room" ? "غرفة جديدة" : mode === "editroom" ? "تعديل الغرفة" : "شخصيتك في غرفة " + roomName(rid);
  $("nameIn").placeholder = mode === "room" || mode === "editroom" ? "اسم الغرفة" : mode === "persona" ? "اسمك في الغرفة دي" : "اسمك";
  $("nameIn").maxLength = mode === "room" || mode === "editroom" ? 30 : 20;
  $("saveBtn").textContent = mode === "room" ? "إنشاء الغرفة" : mode === "editroom" ? "حفظ التعديلات" : "حفظ";
  $("skipBtn").hidden = mode !== "persona"; $("cancelSheet").hidden = (mode === "me" && !g.name);
  $("accSec").hidden = mode !== "me"; $("stoSec").hidden = mode !== "me"; if (mode === "me") { accUI(); stoUI(); } $("codeSec").hidden = mode !== "me"; paintMyCode();
  $("privRow").hidden = !(mode === "room" || (mode === "editroom" && rid !== "general")); $("descIn").hidden = !(mode === "room" || mode === "editroom"); $("descIn").value = mode === "editroom" ? ((src && src.desc) || "") : ""; $("privCk").checked = !!(src && src.private);
  $("nameIn").value = draft.name; $("sheet").hidden = false; perr(""); paintDraft();
  $("pgSeg").hidden = mode !== "me"; $("shCard").classList.toggle("tall", mode === "me"); setPg("p");
  setPk(draft.photo && draft.photo.indexOf("data:image/svg") === 0 ? "shalla" : "emojis");
}
function openProfile() { openSheet("me"); }
function maybePersona() {}
EMOJIS.forEach(e => { const b = document.createElement("button"); b.className = "opt"; b.textContent = e; b.onclick = () => { draft.emoji = e; draft.photo = ""; paintDraft(); }; $("emojis").appendChild(b); });
COLORS.forEach(c => { const b = document.createElement("button"); b.className = "opt col"; b.dataset.c = c; b.style.background = c; b.onclick = () => { draft.color = c; paintDraft(); }; $("colors").appendChild(b); });
$("copyCode").onclick = async () => {
  const c = fmtFCode((profiles[myId] || {}).fcode); if (!c) return;
  try { await navigator.clipboard.writeText(c); } catch (e) { const t = document.createElement("textarea"); t.value = c; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); } catch (x) {} t.remove(); }
  vcSnd("copy"); $("copyCode").textContent = "✓ اتنسخ"; setTimeout(() => { $("copyCode").textContent = "📋 نسخ"; }, 1500);
};
$("myUidRow").onclick = async () => {
  const el = $("myUidRow"), id = myId; if (!id || el.dataset.busy) return;
  const ok = await copyText(id);
  el.dataset.busy = "1"; el.textContent = ok ? "✓ اتنسخ" : "ماقدرتش أنسخ"; el.style.color = ok ? "var(--pri)" : "";
  setTimeout(() => { delete el.dataset.busy; el.style.color = ""; el.textContent = myId || "—"; }, 1200);
};
$("rmPhoto").onclick = () => { draft.photo = ""; paintDraft(); };
CHARS.forEach(c => {
  const b = document.createElement("button"); b.type = "button"; b.className = "opt ch"; b.title = c.n + " — " + c.t; b.dataset.p = c.url;
  const v = document.createElement("span"); v.className = "cav"; v.innerHTML = c.s;
  const n = document.createElement("small"); n.textContent = c.n;
  b.append(v, n); b.onclick = () => { draft.photo = c.url; try { vcSnd("tap"); } catch (e) {} paintDraft(); };
  $("shalla").appendChild(b);
});
$("file").onchange = e => {
  const f = e.target.files[0]; if (!f) return;
  const fr = new FileReader();
  fr.onload = () => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(img.width, img.height), o = Math.min(s, 640), c = document.createElement("canvas"); c.width = c.height = o;
      c.getContext("2d").drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, o, o);
      draft.photo = c.toDataURL("image/jpeg", 0.82); paintDraft(); perr("✓ الصورة جاهزة، اضغط حفظ");
    };
    img.onerror = () => perr("الصورة دي مش مدعومة، جرّب صورة تانية (JPG أو PNG).");
    img.src = fr.result;
  };
  fr.onerror = () => perr("ماقدرتش أقرأ الصورة، جرّب صورة تانية.");
  perr("⏳ جاري معالجة الصورة…");
  fr.readAsDataURL(f); e.target.value = "";
};
let saving = false;
$("saveBtn").onclick = async () => {
  if (saving) return;
  const name = $("nameIn").value.trim(); if (!name) { $("nameIn").focus(); return; }
  saving = true; $("saveBtn").disabled = true;
  const data = { name, emoji: draft.emoji, color: draft.color, photo: draft.photo };
  try {
    if (sheetMode === "me") await db.doc("profiles/" + myId).set({ ...data, fcode: (profiles[myId] || {}).fcode || await uniqueFCode() }, { merge: true });
    else if (sheetMode === "persona") await db.doc("rprofiles/" + myId).set({ ...(rprofiles[myId] || {}), [sheetRoom]: data });
    else if (sheetMode === "editroom") {
      const cur0 = sheetRoom === "general" ? generalRoom() : (rooms.find(x => x.id === sheetRoom) || {}), patch = { ...data, name: name.slice(0, 30), private: $("privCk").checked, desc: $("descIn").value.trim() };
      if (!cur0.by) { patch.by = myId; patch.members = [...new Set([...(cur0.members || []), myId])]; }
      if (sheetRoom === "general") { delete patch.private; await db.collection("rooms").doc("general").set(patch, { merge: true }); }
      else await db.collection("rooms").doc(sheetRoom).update(patch);
    }
    else { const priv = $("privCk").checked, nr = { ...data, name: name.slice(0, 30), by: myId, private: priv, approval: true, members: [myId], code: newCode(), desc: $("descIn").value.trim() }; const r = await db.collection("rooms").add(nr); $("sheet").hidden = true; if (!rooms.some(x => x.id === r.id)) rooms = [...rooms, { ...nr, id: r.id }]; buildChips(); openRoom(r.id); return; }
    $("sheet").hidden = true;
  } catch (e) { perr("ماقدرتش أحفظ: " + errMsg(e) + (e && e.code ? " [" + e.code + "]" : "")); }
  finally { saving = false; $("saveBtn").disabled = false; }
};
$("skipBtn").onclick = async () => {
  try { await db.doc("rprofiles/" + myId).set({ ...(rprofiles[myId] || {}), [sheetRoom]: { skip: true } }); } catch (e) {}
  $("sheet").hidden = true;
};
$("cancelSheet").onclick = () => { $("sheet").hidden = true; };
$("meBtn").onclick = () => { if (db) { if (room === "general" || isDM(room)) openSheet("me"); else openSheet("persona", room); } };

/* Very Chat — الإرسال والصوت والصور والفيديو */
// ───── الإرسال ─────

// ───── رسائل صوتية ─────
const fmtDur = t => Math.floor(t / 60) + ":" + String(Math.floor(t % 60)).padStart(2, "0");
const AUD = new Map(); let curAudio = null; let VRATE = 1; try { VRATE = +localStorage.getItem("vrate") || 1; } catch (_) {}
function audioPlayer(m) {
  const w = el("div", "vp"), btn = el("button", "vpb", "▶"), wv = el("div", "vw"), tm = el("span", "vpd", fmtDur(m.dur || 0)), sp = el("button", "vps", VRATE + "×");
  let h = 0; for (const c of String(m.id)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const N = 30, bars = []; for (let i = 0; i < N; i++) { h = (h * 1664525 + 1013904223) >>> 0; const x = el("i"); x.style.height = (22 + (h >>> 24) % 78) + "%"; bars.push(x); wv.append(x); }
  btn.type = sp.type = "button"; w.append(btn, wv, sp, tm);
  let a = AUD.get(m.id); if (!a) { a = new Audio(okSrc(m.audio, "audio") ? m.audio : ""); a.preload = "none"; AUD.set(m.id, a); if (AUD.size > 40) for (const [k, v] of AUD) { if (v.paused && v !== curAudio && k !== m.id) { AUD.delete(k); break; } } }
  const sync = () => { btn.textContent = a.paused ? "▶" : "⏸"; const d = a.duration || m.dur || 0, p = d && a.currentTime ? a.currentTime / d : 0; bars.forEach((x, i) => x.classList.toggle("on", i / N < p)); tm.textContent = fmtDur(a.paused && !a.currentTime ? (m.dur || 0) : a.currentTime); w.classList.toggle("play", !a.paused); };
  a.ontimeupdate = sync; a.onplay = sync; a.onpause = sync; a.onended = () => { a.currentTime = 0; sync(); };
  sync();
  btn.onclick = e => { e.stopPropagation(); if (selMode) return; if (a.paused) { if (curAudio && curAudio !== a) curAudio.pause(); curAudio = a; a.playbackRate = VRATE; a.play().catch(() => setStatus("ماقدرتش أشغّل الصوت.")); } else a.pause(); };
  sp.onclick = e => { e.stopPropagation(); VRATE = VRATE === 1 ? 1.5 : VRATE === 1.5 ? 2 : VRATE === 2 ? 0.75 : 1; try { localStorage.setItem("vrate", VRATE); } catch (_) {} sp.textContent = VRATE + "×"; a.playbackRate = VRATE; };
  wv.onclick = e => { e.stopPropagation(); if (selMode) return; const r = wv.getBoundingClientRect(), d = a.duration || m.dur || 0; let p = (e.clientX - r.left) / r.width; if (getComputedStyle(wv).direction === "rtl") p = 1 - p; if (a.readyState && d) { a.currentTime = Math.max(0, Math.min(1, p)) * d; sync(); } };
  return w;
}
// ───── تأثيرات الصوت ─────
const FX = [["عادي", "🎙️"], ["تخين", "🐻"], ["سنجاب", "🐿️"], ["روبوت", "🤖"], ["صدى", "🏔️"], ["تليفون", "📞"]];
function fxGraph(ctx, buf, fx, dest) {
  const s = ctx.createBufferSource(); s.buffer = buf; let rate = 1, tail = 0;
  if (fx === 1) rate = 0.78; if (fx === 2) rate = 1.5; s.playbackRate.value = rate;
  if (fx === 3) { const g = ctx.createGain(); g.gain.value = 0; const o = ctx.createOscillator(); o.frequency.value = 55; o.connect(g.gain); s.connect(g).connect(dest); o.start(); s.onended = () => { try { o.stop(); } catch (_) {} }; }
  else if (fx === 4) { const d = ctx.createDelay(1), f = ctx.createGain(); d.delayTime.value = 0.22; f.gain.value = 0.45; s.connect(dest); s.connect(d); d.connect(f); f.connect(d); d.connect(dest); tail = 1.4; }
  else if (fx === 5) { const hp = ctx.createBiquadFilter(), lp = ctx.createBiquadFilter(), g = ctx.createGain(); hp.type = "highpass"; hp.frequency.value = 450; lp.type = "lowpass"; lp.frequency.value = 2800; g.gain.value = 1.7; s.connect(hp); hp.connect(lp); lp.connect(g); g.connect(dest); }
  else s.connect(dest);
  return { s, len: buf.duration / rate + tail };
}
let recFx = 0, fxCtx = null;
const fxCtxGet = () => { try { fxCtx = fxCtx && fxCtx.state !== "closed" ? fxCtx : new (window.AudioContext || window.webkitAudioContext)(); if (fxCtx.state === "suspended") fxCtx.resume(); } catch (_) {} return fxCtx; };
async function fxSend(blob, dur, roomId, fx) {
  if (!fx) return sendVoice(blob, dur, roomId);
  setStatus("🎛 بطبّق التأثير…");
  try {
    const ctx = fxCtxGet(), buf = await ctx.decodeAudioData(await blob.arrayBuffer()), d = ctx.createMediaStreamDestination();
    const mt = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"].find(t => MediaRecorder.isTypeSupported(t)) || "";
    const mr = new MediaRecorder(d.stream, mt ? { mimeType: mt, audioBitsPerSecond: 16000 } : { audioBitsPerSecond: 16000 }), parts = [];
    mr.ondataavailable = e => e.data && e.data.size && parts.push(e.data);
    const done = new Promise(r => mr.onstop = r), gr = fxGraph(ctx, buf, fx, d); mr.start(); gr.s.start();
    await new Promise(r => setTimeout(r, gr.len * 1000 + 200)); mr.stop(); await done; setStatus("");
    sendVoice(new Blob(parts, { type: mr.mimeType || "audio/webm" }), Math.max(1, Math.round(gr.len)), roomId);
  } catch (e) { setStatus(""); sendVoice(blob, dur, roomId); }
}
const paintRecFx = () => { $("recFx").textContent = "🎛 " + FX[recFx][0]; $("recFx").classList.toggle("on", !!recFx); };
$("recFx").onclick = () => { recFx = (recFx + 1) % FX.length; fxCtxGet(); paintRecFx(); };
const MAX_REC = 40; let rec = null;
function showRec(on) { $("recBar").hidden = !on; $("pill").hidden = on; $("sendBtn").hidden = true; $("micBtn").hidden = false; $("micBtn").innerHTML = on ? SVG_SEND : SVG_MIC; }
async function startRec() {
  if (rec || !db) return;
  const why = writeBlock(curR()); if (why) { setStatus(why); return; }
  { const cv = curR(); if (cv && cv.noVoice && !adminOf(cv)) { setStatus("🎤 الرسائل الصوتية متوقفة هنا"); return; } }
  if (!navigator.mediaDevices || !window.MediaRecorder) { setStatus("المتصفح ده مش بيدعم تسجيل الصوت."); return; }
  let stream; try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (e) { setStatus("لازم تسمح للمتصفح يستخدم الميكروفون."); return; }
  const mt = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"].find(t => MediaRecorder.isTypeSupported(t)) || "";
  let mr; try { mr = new MediaRecorder(stream, mt ? { mimeType: mt, audioBitsPerSecond: 16000 } : { audioBitsPerSecond: 16000 }); } catch (e) { mr = new MediaRecorder(stream); }
  const r = rec = { mr, stream, chunks: [], t0: Date.now(), cancel: false, room };
  mr.ondataavailable = e => { if (e.data && e.data.size) r.chunks.push(e.data); };
  mr.onstop = () => finishRec(r);
  recFx = 0; paintRecFx(); vcSnd("rec"); mr.start(); showRec(true); $("recTime").textContent = "0:00";
  r.timer = setInterval(() => { const t = (Date.now() - r.t0) / 1000; $("recTime").textContent = fmtDur(t); if (t >= MAX_REC) stopRec(true); }, 200);
}
function stopRec(send) { if (!rec) return; rec.cancel = !send; clearInterval(rec.timer); if (rec.mr.state !== "inactive") rec.mr.stop(); }
async function finishRec(r) {
  clearInterval(r.timer); r.stream.getTracks().forEach(t => t.stop()); if (rec === r) rec = null; showRec(false);
  if (r.cancel) { vcSnd("recx"); return; }
  vcSnd("recend");
  const dur = Math.round((Date.now() - r.t0) / 1000); if (dur < 1) { setStatus("الرسالة قصيرة جدًا."); return; }
  const cr = curR(), wait = cr && !adminOf(cr) && cr.slow ? cr.slow - (Date.now() - (lastSent[r.room] || 0)) / 1000 : 0;
  if (wait > 0) { setStatus("🐢 وضع بطيء: استنى " + Math.ceil(wait) + " ثانية"); return; }
  fxSend(new Blob(r.chunks, { type: r.mr.mimeType || "audio/webm" }), dur, r.room, recFx);
}
async function sendVoice(blob, dur, roomId) {
  const url = await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = () => res(null); fr.readAsDataURL(blob); });
  if (!url) { setStatus("ماقدرتش أجهّز التسجيل."); return; }
  if (url.length > 900000) { setStatus("التسجيل كبير، سجّل رسالة أقصر."); return; }
  lastSent[roomId] = Date.now();
  const doc = { ...mBase(roomId), text: "", audio: url, dur, uid: myId, ts: Date.now() }; if (replyTo) { doc.reply = replyTo; clearReply(); }
  try { await sendDoc(doc); vcSnd("vsend"); } catch (e) { setStatus("الرسالة الصوتية ماتبعتتش."); }
}
$("micBtn").onclick = () => { if (rec) { if (recFx) fxCtxGet(); stopRec(true); } else startRec(); };
$("recCancel").onclick = () => stopRec(false);
setInterval(() => {
  if (rec) return;
  const has = !!$("inp").value.trim() || !!editingId;
  $("micBtn").hidden = has; $("sendBtn").hidden = !has; $("camBtn").hidden = has; $("micBtn").disabled = !db || !!writeBlock(curR());
}, 250);

// ───── زرار + (صور / فيديو / كاميرا / مشاركة غرفة) ─────
const MAX_DOC = 900000; // حد حجم الرسالة في Firestore (~1MB)
$("pvX").onclick = () => { $("pview").hidden = true; $("pvImg").removeAttribute("src"); };
$("pview").onclick = e => { if (e.target === $("pview")) $("pvX").click(); };
document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("pview").hidden) $("pvX").click(); });
function mediaGuard(rid) {
  rid = rid || room;
  if (!db) { setStatus("لسه مش متصل."); return false; }
  const cr = rid === "general" ? generalRoom() : isDM(rid) ? dmRoom(rid) : rooms.find(x => x.id === rid);
  const why = writeBlock(cr); if (why) { setStatus(why); return false; }
  const wait = cr && !adminOf(cr) && cr.slow ? cr.slow - (Date.now() - (lastSent[rid] || 0)) / 1000 : 0;
  if (wait > 0) { setStatus("🐢 وضع بطيء: استنى " + Math.ceil(wait) + " ثانية"); return false; }
  return true;
}
async function postMedia(extra, rid) {
  rid = rid || room;
  const doc = { ...mBase(rid), text: "", uid: myId, ts: Date.now(), ...extra };
  if (!doc.reply && replyTo && rid === room) { doc.reply = replyTo; clearReply(); }
  lastSent[rid] = Date.now(); vcSnd("send");
  await sendDoc(doc);
}
const readURL = f => new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = () => res(null); fr.readAsDataURL(f); });
// ───── تخزين الملفات مرة واحدة + تحميل تدريجي (زي تيليجرام) ─────
const MEDIA = new Map(), MEDIA_P = new Map();
function mkThumb(src, w, h) { try { const k = Math.min(1, 28 / Math.max(w, h)), c = document.createElement("canvas"); c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(h * k)); c.getContext("2d").drawImage(src, 0, 0, c.width, c.height); return c.toDataURL("image/jpeg", .5); } catch (e) { return ""; } }
function videoMeta(file) {
  return new Promise(res => {
    const u = URL.createObjectURL(file), v = document.createElement("video"); v.muted = true; v.playsInline = true; v.preload = "metadata";
    let done = false; const fin = r => { if (done) return; done = true; URL.revokeObjectURL(u); res(r); };
    const info = t => ({ w: v.videoWidth || 0, h: v.videoHeight || 0, d: isFinite(v.duration) ? v.duration : 0, thumb: t || "" });
    v.onloadeddata = () => { try { v.currentTime = Math.min(0.2, (v.duration || 1) / 2); } catch (e) { fin(info()); } };
    v.onseeked = () => { const inf = info(mkThumb(v, v.videoWidth, v.videoHeight)); try { const k = Math.min(1, 360 / Math.max(v.videoWidth, v.videoHeight, 1)), c = document.createElement("canvas"); c.width = Math.max(1, Math.round(v.videoWidth * k)); c.height = Math.max(1, Math.round(v.videoHeight * k)); c.getContext("2d").drawImage(v, 0, 0, c.width, c.height); inf.poster = c.toDataURL("image/jpeg", .72); } catch (_) {} fin(inf); };
    v.onerror = () => fin(info()); v.src = u; setTimeout(() => fin(info()), 6000);
  });
}
// بيحفظ الملف في مجموعة media مرة واحدة، والرسالة بتشاور عليه بس. لو القواعد منعت بيرجع للطريقة القديمة.
async function saveMedia(kind, data, meta) {
  const id = db.collection("media").doc().id, base = { thumb: meta.thumb || "", w: meta.w || 0, h: meta.h || 0 };
  MEDIA.set(id, data);
  const p = db.collection("media").doc(id).set({ data, kind, uid: myId, ts: Date.now() });
  try { const r = await Promise.race([p.then(() => "ok"), new Promise(x => setTimeout(() => x("slow"), 5000))]); if (r === "slow") p.catch(() => {}); return { mid: id, mk: kind, ...base }; }
  catch (e) { MEDIA.delete(id); return { [kind === "vid" ? "vid" : "img"]: data, ...base }; }
}
// الوسائط ما بتتحمّل لوحدها: لازم تضغط عليها. اللي اتحمّل بإيدك بيفضل ظاهر، ولما تمسح بيانات التطبيق بيرجع يحتاج ضغطة
const DLD = (() => { try { return new Set(JSON.parse(localStorage.getItem("vc_dl") || "[]")); } catch (e) { return new Set(); } })();
const dlSave = () => { try { localStorage.setItem("vc_dl", JSON.stringify([...DLD].slice(-1500))); } catch (e) {} };
// ───── تخزين دائم على الجهاز: اللي بتحمّله بيفضل لحد ما تمسحه من «الحساب والتخزين» (زي واتساب/تيليجرام) ─────
const IDBN = "vc-media";
let _idb = null;
const idbOpen = () => _idb || (_idb = new Promise(res => { try { const q = indexedDB.open(IDBN, 1); q.onupgradeneeded = () => q.result.createObjectStore("m"); q.onsuccess = () => res(q.result); q.onerror = q.onblocked = () => res(null); } catch (e) { res(null); } }));
const idbTx = async (mode, fn) => { const d = await idbOpen(); if (!d) return null; return new Promise(res => { try { const t = d.transaction("m", mode), r = fn(t.objectStore("m")); t.oncomplete = () => res(r && "result" in r ? r.result : true); t.onerror = t.onabort = () => res(null); } catch (e) { res(null); } }); };
const idbGet = k => idbTx("readonly", st => st.get(k));
const idbPut = async (k, v) => { const ok = await idbTx("readwrite", st => st.put(v, k)); if (ok) { DLD.add(k); dlSave(); } return !!ok; };
async function idbStats() { const d = await idbOpen(); if (!d) return { n: 0, bytes: 0 }; return new Promise(res => { let n = 0, bytes = 0; try { const q = d.transaction("m").objectStore("m").openCursor(); q.onsuccess = () => { const c = q.result; if (c) { n++; const v = c.value; bytes += v && v.size != null ? v.size : String(v || "").length; c.continue(); } else res({ n, bytes }); }; q.onerror = () => res({ n, bytes }); } catch (e) { res({ n, bytes }); } }); }
const idbClear = async () => { await idbTx("readwrite", st => st.clear()); };
try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (_) {}
// الفيديو الكبير بيتقسّم لقطع (كل قطعة document في media). أول قطعة header: data:video/..;vcn=N;base64,
const VCN = /^data:((?:video|application)\/[a-z0-9.+-]+);vcn=(\d+);base64,/i, MEDIA_CB = new Map(), sleep = ms => new Promise(r => setTimeout(r, ms));
const b64Bytes = b => { const bin = atob(b), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; };
// ───── إبقاء الشاشة صاحية أثناء النقل (الشاشة لو اتقفلت المتصفح بيوقّف النقل) ─────
const WL = (() => {
  let n = 0, lock = null;
  const get = async () => { if (n < 1 || lock || document.hidden || !navigator.wakeLock) return; try { lock = await navigator.wakeLock.request("screen"); lock.addEventListener("release", () => { lock = null; }); } catch (_) {} };
  document.addEventListener("visibilitychange", get);
  return { on() { n++; get(); }, off() { n = Math.max(0, n - 1); if (!n && lock) { try { lock.release(); } catch (_) {} lock = null; } } };
})();
// قايمة التحميلات الشغّالة: لو التطبيق اتقفل أو المتصفح وقّفه، بتكمّل أول ما ترجع
const dlqGet = () => { try { return JSON.parse(localStorage.getItem("vc_dlq") || "[]"); } catch (_) { return []; } };
const dlq = (id, on) => { try { const q = dlqGet().filter(x => x !== id); if (on) q.push(id); localStorage.setItem("vc_dlq", JSON.stringify(q.slice(-30))); } catch (_) {} };
const waitBack = () => new Promise(res => {
  let iv; const go = () => { if (document.hidden || navigator.onLine === false) return; document.removeEventListener("visibilitychange", go); window.removeEventListener("online", go); clearInterval(iv); res(); };
  document.addEventListener("visibilitychange", go); window.addEventListener("online", go); iv = setInterval(go, 5000);
});
async function loadChunked(id, first, mm) {
  const n = +mm[2], parts = new Array(n), dk = i => "dp:" + id + ":" + i; parts[0] = first.slice(mm[0].length); let done = 1, next = 1;
  const tell = () => (MEDIA_CB.get(id) || []).forEach(f => { try { f(done / n); } catch (_) {} });
  dlq(id, 1); WL.on();
  try {
    // الأجزاء اللي نزلت قبل كده (لو التطبيق اتقفل في النص) ما بتتحمّلش تاني
    for (let i = 1; i < n; i++) { const s = await idbGet(dk(i)); if (typeof s === "string" && s) { parts[i] = s; done++; } }
    tell();
    const one = async i => {
      const t0 = Date.now();
      for (let t = 0; ; t++) {
        try { const d = await db.collection("media").doc(id + "_" + i).get(); if (d.exists && typeof d.data().data === "string") return d.data().data; } catch (e) {}
        if (Date.now() - t0 > 30 * 60000) throw new Error("chunk " + i);
        if (t < 3) await sleep(500 * (t + 1)); else await waitBack();      // ما نستسلمش: نستنى النت أو رجوعك للتطبيق ونكمّل
      }
    };
    await Promise.all(Array.from({ length: Math.min(4, n - 1) }, async () => { while (next < n) { const i = next++; if (parts[i] !== undefined) continue; parts[i] = await one(i); idbTx("readwrite", st => st.put(parts[i], dk(i))); done++; tell(); } }));
    const blob = new Blob(parts.map(b64Bytes), { type: mm[1].toLowerCase() });
    idbTx("readwrite", st => { for (let i = 1; i < n; i++) st.delete(dk(i)); }); dlq(id, 0);
    return blob;
  } catch (e) { dlq(id, 0); throw e; }
  finally { WL.off(); }
}
function getMedia(id, onp) {
  if (onp) { if (!MEDIA_CB.has(id)) MEDIA_CB.set(id, []); MEDIA_CB.get(id).push(onp); }
  if (MEDIA.has(id)) return Promise.resolve(MEDIA.get(id));
  if (MEDIA_P.has(id)) return MEDIA_P.get(id);
  const fin = v => { if (v) { MEDIA.set(id, v); while (MEDIA.size > 40) MEDIA.delete(MEDIA.keys().next().value); } MEDIA_P.delete(id); MEDIA_CB.delete(id); return v; };
  const p = (async () => {
    const loc = await idbGet(id);
    if (loc) return fin(typeof loc === "string" ? loc : URL.createObjectURL(loc));
    const d = await db.collection("media").doc(id).get(); let v = d.exists ? d.data().data : null;
    if (typeof v === "string") {
      const mm = VCN.exec(v);
      if (mm) { const blob = await loadChunked(id, v, mm); idbPut(id, blob); v = URL.createObjectURL(blob); }
      else idbPut(id, v);
    }
    return fin(v);
  })().catch(() => fin(null));
  MEDIA_P.set(id, p); return p;
}
const dlResume = () => { if (!db || !myId) return; dlqGet().forEach(id => { try { getMedia(id).catch(() => {}); } catch (_) {} }); };
document.addEventListener("visibilitychange", () => { if (!document.hidden) dlResume(); }); window.addEventListener("online", dlResume);
{ const iv = setInterval(() => { if (db && myId) { clearInterval(iv); dlResume(); } }, 2500); }
const MIO = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { MIO.unobserve(e.target); if (e.target._load) e.target._load(); } }), { rootMargin: "400px" }) : null;
function mediaBox(m) {
  const vid = m.mk === "vid" || !!m.vid, w0 = +m.w || 4, h0 = +m.h || 3; let W = 240, H = W * h0 / w0; if (H > 320) { H = 320; W = H * w0 / h0; } if (W < 120) W = 120;
  const box = el("div", "mwrap"); box.style.width = Math.round(W) + "px"; box.style.height = Math.round(H) + "px";
  const key = m.mid || m.id, auto = DLD.has(key) || (m.mid && MEDIA.has(m.mid)) || (m.uid === myId && !m.mid && Date.now() - (m.ts || 0) < 120000);
  const ph = el("div", "mph"); if (okSrc(m.thumb, "image")) ph.style.backgroundImage = "url(" + m.thumb + ")"; else ph.style.background = "linear-gradient(135deg,#3a4a46,#25332f)"; box.append(ph);
  if (auto) box.append(el("div", "msp"));
  const show = data => {
    if (data && !okSrc(data, vid ? "video" : "image")) data = "";
    box.querySelectorAll(".mretry").forEach(x => x.remove());
    if (!data) { const r = el("button", "mretry", "تعذّر التحميل · اضغط للإعادة"); r.type = "button"; r.onclick = e => { e.stopPropagation(); r.remove(); box.append(el("div", "msp")); box._load(); }; box.querySelectorAll(".msp").forEach(x => x.remove()); box.append(r); return; }
    let node;
    if (vid) { node = el("video", "mvid"); node.src = data; node.controls = true; node.playsInline = true; node.preload = "metadata"; if (okSrc(m.thumb, "image")) node.poster = m.thumb; node.controls = false; node.onclick = e => { e.stopPropagation(); if (!selMode) openVideo(data, okSrc(m.thumb, "image") ? m.thumb : ""); }; node.onloadeddata = () => box.classList.add("ok"); const pl = el("div", "mplay"); pl.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>'; pl.onclick = e => { e.stopPropagation(); if (!selMode) openVideo(data, okSrc(m.thumb, "image") ? m.thumb : ""); }; box.append(pl); }
    else { node = el("img", "mimg"); node.alt = "صورة"; node.decoding = "async"; node.onload = () => box.classList.add("ok"); node.onclick = e => { e.stopPropagation(); if (!selMode) { $("pvImg").src = data; $("pview").hidden = false; } }; node.src = data; }
    box.querySelectorAll(".mpct").forEach(x => x.remove()); box.append(node); if (key && !DLD.has(key) && !String(data).startsWith("blob:")) { DLD.add(key); dlSave(); }
  };
  box._load = () => { if (m.mid) getMedia(m.mid, vid ? f => { let pc = box.querySelector(".mpct"); if (!pc) { pc = el("div", "mpct"); box.append(pc); } pc.textContent = Math.round(f * 100) + "%"; } : null).then(show); else show(m.img || m.vid); };
  if (!auto) {
    const g = el("button", "mdl"); g.type = "button"; g.setAttribute("aria-label", vid ? "تحميل الفيديو" : "تحميل الصورة");
    const ic = el("span", "mdl-i"); ic.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 20h14"/></svg>';
    g.append(ic, el("span", "mdl-t", vid ? "🎥 فيديو" : "🖼 صورة"));
    g.onclick = e => { if (selMode) return; e.stopPropagation(); g.remove(); box.append(el("div", "msp")); box._load(); };
    box.append(g);
  } else if (m.mid && !MEDIA.has(m.mid) && MIO) MIO.observe(box); else box._load();
  return box;
}
async function shrinkImage(file) {
  let bmp;
  try { bmp = await createImageBitmap(file); } catch (e) {
    bmp = await new Promise((ok, no) => { const u = URL.createObjectURL(file), im = new Image(); im.onload = () => { URL.revokeObjectURL(u); ok(im); }; im.onerror = no; im.src = u; });
  }
  const w0 = bmp.width || bmp.naturalWidth, h0 = bmp.height || bmp.naturalHeight;
  for (const [mx, q] of [[1600, .84], [1440, .8], [1280, .78], [1024, .7], [800, .62], [640, .55], [480, .5]]) {
    const k = Math.min(1, mx / Math.max(w0, h0)), c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(w0 * k)); c.height = Math.max(1, Math.round(h0 * k));
    const g = c.getContext("2d"); g.imageSmoothingQuality = "high"; g.drawImage(bmp, 0, 0, c.width, c.height);
    const url = c.toDataURL("image/jpeg", q);
    if (url.length < MAX_DOC) return { url, w: c.width, h: c.height, thumb: mkThumb(c, c.width, c.height) };
  }
  return null;
}
(() => {
  const o = document.createElement("div"); o.id = "vview"; o.hidden = true;
  const x = document.createElement("button"); x.type = "button"; x.id = "vvX"; x.setAttribute("aria-label", "إغلاق"); x.textContent = "✕";
  const v = document.createElement("video"); v.id = "vvV"; v.controls = true; v.playsInline = true; v.setAttribute("playsinline", ""); v.setAttribute("webkit-playsinline", ""); v.setAttribute("controlslist", "nofullscreen nodownload"); v.disablePictureInPicture = false;
  o.append(v, x); document.body.append(o);
  const close = () => { try { v.pause(); } catch (_) {} v.removeAttribute("src"); try { v.load(); } catch (_) {} o.hidden = true; };
  x.onclick = close; o.addEventListener("click", e => { if (e.target === o) close(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !o.hidden) close(); });
  window.openVideo = (src, poster) => { if (!src) return; v.poster = poster || ""; v.src = src; o.hidden = false; const p = v.play(); if (p && p.catch) p.catch(() => {}); };
})();
async function sendImages(files, rid) {
  rid = rid || room;
  if (!mediaGuard(rid)) return;
  const cap = $("inp").value.trim(); let n = 0;
  for (const f of files) {
    setStatus("جاري تجهيز الصورة…");
    try {
      const r = await shrinkImage(f); if (!r) { setStatus("الصورة كبيرة جدًا."); continue; }
      setStatus("جاري الإرسال…");
      await postMedia({ ...(await saveMedia("img", r.url, r)), ...(cap && !n ? { text: cap.slice(0, 300) } : {}) }, rid); n++;
    } catch (e) { setStatus("الصورة ماتبعتتش."); }
  }
  if (n) { if (cap && rid === room) $("inp").value = ""; if (!$("status").textContent.startsWith("جاري تحميل")) setStatus(""); }
}
// ───── الفيديو: بيتبعت بجودته الأصلية وكامل (مقسّم لقطع)، ولو أكبر من الحد بيتعمل ضغط بجودة عالية وبنفس الطول ─────
const VID_MAX = 48 * 1024 * 1024, VID_MAX_SEC = 300, RAW_CH = 562500; // RAW_CH بايت لكل قطعة (يساوي 750000 حرف base64)
const roomLabel = rid => rid === "general" ? "العام" : isDM(rid) ? dmRoom(rid).name : ((rooms.find(x => x.id === rid) || {}).name || "الغرفة");
function upChip(rid, kind) {
  let host = $("ups"); if (!host) { host = el("div"); host.id = "ups"; document.body.append(host); }
  const c = el("div", "upc"), t = el("span", "upt"), bar = el("i", "upb"), x = el("button", "upx", "✕"); x.type = "button"; x.setAttribute("aria-label", "إلغاء");
  const f = el("b", "upf"); bar.append(f); c.append(t, bar, x); host.append(c);
  const o = { cancel: false, set(txt, pct) { t.textContent = txt; f.style.width = Math.max(0, Math.min(100, pct || 0)) + "%"; }, done() { c.remove(); } };
  x.onclick = () => { o.cancel = true; t.textContent = "بيتلغي…"; }; o.set("⏫ " + kind + " لـ " + roomLabel(rid) + "…", 0); return o;
}
const b64Slice = (blob, a, b) => new Promise(res => { const fr = new FileReader(); fr.onload = () => { const r = String(fr.result || ""); res(r.slice(r.indexOf(",") + 1)); }; fr.onerror = () => res(null); fr.readAsDataURL(blob.slice(a, b)); });
const withTO = (p, ms) => Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error("timeout")), ms))]);
async function uploadChunks(blob, mime, ui, label, o) {
  o = o || {};
  const n = Math.max(1, Math.ceil(blob.size / RAW_CH)), id = o.id || db.collection("media").doc().id, ref = i => db.collection("media").doc(i ? id + "_" + i : id), skip = o.skip || new Set();
  let done = skip.size, next = 0, fail = null;
  const put = async i => {
    const b = await b64Slice(blob, i * RAW_CH, (i + 1) * RAW_CH); if (b === null) throw new Error("read");
    const data = (i === 0 ? "data:" + mime + ";vcn=" + n + ";base64," : "") + b;
    for (let t = 0; ; t++) {
      try { await withTO(ref(i).set({ data, kind: "vid", uid: myId, ts: Date.now() }), 120000); break; }
      catch (e) { if (ui.cancel || (e && e.code === "permission-denied") || t >= 3) throw e; await sleep(1500 * (t + 1)); }
    }
    if (o.onChunk) o.onChunk(i);
  };
  // القطعة الأولى (الـ header) آخر حاجة، علشان محدش يلاقي فيديو ناقص
  const order = []; for (let i = 1; i < n; i++) if (!skip.has(i)) order.push(i); if (!skip.has(0)) order.push(0);
  if (done) ui.set("⏫ " + label + " · " + Math.round(done / n * 100) + "%", done / n * 100);
  await Promise.all(Array.from({ length: Math.min(3, order.length) }, async () => {
    while (!fail && !ui.cancel && next < order.length) {
      const i = order[next++]; if (i === 0 && done < n - 1) { await sleep(100); next--; if (next < order.length) continue; }
      try { await put(i); done++; ui.set("⏫ " + label + " · " + Math.round(done / n * 100) + "%", done / n * 100); } catch (e) { fail = e; }
    }
  }));
  if (ui.cancel) { for (let i = 0; i < n; i++) ref(i).delete().catch(() => {}); throw new Error("cancel"); }
  if (fail) throw fail;
  return id;
}
// ضغط بجودة عالية وبنفس الطول (بيشتغل بالزمن الحقيقي، فسيب التطبيق مفتوح). بيتستخدم بس لو الملف أكبر من الحد.
async function shrinkVideo(file, ui, opt) {
  opt = opt || {};
  const src = URL.createObjectURL(file), v = document.createElement("video");
  v.muted = true; v.playsInline = true; v.preload = "auto"; v.src = src;
  try {
    await new Promise((ok, no) => { v.onloadedmetadata = ok; v.onerror = no; });
    const cvT = document.createElement("canvas"); if (!window.MediaRecorder || !cvT.captureStream) return null;
    const full = v.duration; if (!isFinite(full) || full <= 0) return null;
    const t0 = Math.max(0, Math.min(opt.start || 0, full)), t1 = Math.min(full, opt.end || full), dur = t1 - t0; if (dur < 0.3) return null;
    if (dur > VID_MAX_SEC) return { tooLong: true };
    const k = Math.min(1, (opt.hq ? 1080 : 720) / Math.min(v.videoWidth, v.videoHeight || 720)), cv = cvT;
    cv.width = Math.round(v.videoWidth * k / 2) * 2 || 640; cv.height = Math.round(v.videoHeight * k / 2) * 2 || 360;
    const g = cv.getContext("2d"), out = cv.captureStream(30), abps = 96000;
    if (!opt.mute) try { v.muted = false; v.volume = 1; const ac = new (window.AudioContext || window.webkitAudioContext)(), sc = ac.createMediaElementSource(v), dst = ac.createMediaStreamDestination(); sc.connect(dst); out.addTrack(dst.stream.getAudioTracks()[0]); await ac.resume(); } catch (e) { v.muted = true; }
    const mt = ["video/mp4;codecs=avc1,mp4a.40.2", "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"].find(t => MediaRecorder.isTypeSupported(t)); if (!mt) return null;
    const vbps = Math.max(700000, Math.min(8000000, Math.floor((VID_MAX * 0.85 * 8) / dur - abps)));
    const mr = new MediaRecorder(out, { mimeType: mt, videoBitsPerSecond: vbps, audioBitsPerSecond: abps }), parts = [];
    mr.ondataavailable = e => { if (e.data && e.data.size) parts.push(e.data); };
    const done = new Promise(r => { mr.onstop = r; });
    let raf; const draw = () => { g.drawImage(v, 0, 0, cv.width, cv.height); raf = requestAnimationFrame(draw); };
    if (t0 > 0.05) { await new Promise(r => { v.onseeked = r; v.currentTime = t0; setTimeout(r, 3000); }); }
    mr.start(1000);
    try { await v.play(); } catch (e) { v.muted = true; await v.play(); }
    draw();
    await new Promise(r => { const t = setInterval(() => { ui.set("🎞 بجهّز الفيديو (سيب التطبيق مفتوح) · " + Math.min(99, Math.round((v.currentTime - t0) / dur * 100)) + "%", (v.currentTime - t0) / dur * 100); if (v.ended || v.currentTime >= t1 - 0.05 || ui.cancel) { clearInterval(t); r(); } }, 250); });
    cancelAnimationFrame(raf); v.pause(); if (mr.state !== "inactive") mr.stop(); await done;
    if (ui.cancel) return null;
    return new Blob(parts, { type: mt.split(";")[0] });
  } catch (e) { return null; }
  finally { URL.revokeObjectURL(src); }
}
// ───── مدير الرفع: الفيديو بيظهر في الشات فورًا بدايرة تقدّم، ويكمّل في الخلفية، وبيرجع يكمّل لو التطبيق اتقفل ─────
const UPL = (() => {
  const jobs = new Map(), jk = id => "job:" + id, pk = id => "jobp:" + id;
  const MB = n => String(Math.max(0.1, n / 1048576).toFixed(1)).replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[d]);
  const PC = n => String(Math.round(n)).replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[d]) + "٪";
  const R = 20, CIRC = 2 * Math.PI * R;
  let rel = null, noteAt = 0, noteLast = -1;
  const keep = on => { if (on && !rel && navigator.locks) { let r; const p = new Promise(x => { r = x; }); rel = r; navigator.locks.request("vc-upload", () => p).catch(() => {}); } else if (!on && rel) { rel(); rel = null; } };
  const act = () => keep([...jobs.values()].some(j => j.state !== "err"));
  const note = (job, done) => {
    try {
      if (!document.hidden && !done) return; if (!("Notification" in window) || Notification.permission !== "granted" || !navigator.serviceWorker) return;
      const pct = Math.round(job.pct || 0); if (!done && (Date.now() - noteAt < 2500 || Math.abs(pct - noteLast) < 4)) return; noteAt = Date.now(); noteLast = pct;
      navigator.serviceWorker.ready.then(r => {
        const o = { tag: "vc-up", renotify: false, silent: true, icon: "icon-192.png", badge: "icon-192.png", dir: "auto", lang: "ar", data: { up: 1 } };
        if (done) { o.silent = false; r.showNotification("✓ اتبعت الفيديو", { ...o, body: "لـ " + roomLabel(job.rid) }); setTimeout(() => r.getNotifications({ tag: "vc-up" }).then(a => a.forEach(n => n.close())).catch(() => {}), 6000); }
        else r.showNotification("⏫ جاري رفع الفيديو… " + PC(pct), { ...o, body: "لـ " + roomLabel(job.rid) });
      }).catch(() => {});
    } catch (_) {}
  };
  function size(job) { const w0 = +(job.meta && job.meta.w) || 4, h0 = +(job.meta && job.meta.h) || 3; let W = 240, H = W * h0 / w0; if (H > 320) { H = 320; W = H * w0 / h0; } if (W < 140) W = 140; return [Math.round(W), Math.round(H)]; }
  function build(job) {
    const row = el("div", "row me"), b = el("div", "b upb2"), box = el("div", "mwrap upw");
    const ph = el("div", "mph sharp"); box.append(ph);
    const ctr = el("div", "upc2"), ring = document.createElementNS("http://www.w3.org/2000/svg", "svg"); ring.setAttribute("viewBox", "0 0 48 48"); ring.setAttribute("class", "upr");
    ring.innerHTML = '<circle class="bg" cx="24" cy="24" r="' + R + '"/><circle class="fg" cx="24" cy="24" r="' + R + '" stroke-dasharray="' + CIRC.toFixed(2) + '" stroke-dashoffset="' + CIRC.toFixed(2) + '"/>';
    const x = el("button", "upx2", "✕"); x.type = "button"; x.setAttribute("aria-label", "إلغاء");
    x.onclick = e => { e.stopPropagation(); if (job.state === "err") { job.err = ""; run(job); } else if (job.state !== "post") cancel(job); };
    ctr.append(ring, x); const lb = el("div", "upl"); box.append(ctr, lb); b.append(box);
    const t = el("div", "t"), sc = el("span", "pend"); sc.innerHTML = typeof SVG_CLOCK !== "undefined" ? SVG_CLOCK : "⏱"; t.append(sc, el("span", "", new Date(job.t0).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })));
    const tx = el("div", "tx mcap"); tx.dir = "auto"; tx.hidden = true; b.append(tx, t); row.append(b);
    job.row = row; job.el = { box, ph, ring, fg: ring.querySelector(".fg"), x, lb, tx }; paint(job); return row;
  }
  function paint(job) {
    const e = job.el; if (!e) return; const [W, H] = size(job); e.box.style.width = W + "px"; e.box.style.height = H + "px";
    if (job.poster && e.ph._p !== job.poster) { e.ph._p = job.poster; e.ph.style.backgroundImage = "url(" + job.poster + ")"; }
    e.tx.hidden = !job.cap; e.tx.textContent = job.cap || "";
    const st = job.state, pct = Math.max(0, Math.min(100, job.pct || 0)), ind = st === "post" || (st === "prep" && !pct) || (st === "up" && !pct && !job.n);
    e.ring.classList.toggle("spin", ind); e.fg.style.strokeDashoffset = (CIRC * (1 - (ind ? .28 : pct / 100))).toFixed(2);
    e.box.classList.toggle("err", st === "err"); e.x.textContent = st === "err" ? "↻" : "✕"; e.x.hidden = st === "post";
    const sz = job.blob ? " · " + MB(job.blob.size) + " م.ب" : "";
    e.lb.textContent = st === "err" ? (job.err || "اتقطع الرفع") + " · اضغط ↻" : st === "post" ? "بيتبعت…" : st === "prep" ? "بجهّز الفيديو… " + (pct ? PC(pct) : "") + " · سيب التطبيق مفتوح" : "بيترفع… " + (pct ? PC(pct) : "") + sz;
  }
  const mount = (job, box) => { if (!job.row) build(job); box.append(job.row); };
  function show(job) { if (job.rid !== room) return; const box = $("msgs"); mount(job, box); box.scrollTop = box.scrollHeight; }
  function drop(job) { jobs.delete(job.id); if (job.row) job.row.remove(); act(); }
  const wipe = job => { if (job.mid) { idbTx("readwrite", st => { st.delete(jk(job.mid)); st.delete(pk(job.mid)); }); } };
  async function cancel(job) {
    job.cancel = true; drop(job); wipe(job); flash("اتلغى رفع الفيديو");
    if (job.mid && job.n && db) for (let i = 0; i < job.n; i++) db.collection("media").doc(i ? job.mid + "_" + i : job.mid).delete().catch(() => {});
  }
  async function posted(job) {
    if (!job.resumed || !db) return false;
    try { let q = db.collection(isDM(job.rid) ? "dmsgs" : "msgs").where("room", "==", job.rid).where("mid", "==", job.mid); if (isDM(job.rid)) q = q.where("members", "array-contains", myId); return !(await q.limit(1).get()).empty; } catch (_) { return false; }
  }
  async function run(job) {
    if (job.running) return; job.running = true; WL.on(); job.cancel = false; job.state = "up"; paint(job); act();
    try {
      if (job.small) { const url = await readURL(job.file); if (!url) throw new Error("read"); job.state = "post"; paint(job); await postMedia({ ...(await saveMedia("vid", url, job.meta)), ...(job.cap ? { text: job.cap } : {}), ...(job.reply ? { reply: job.reply } : {}) }, job.rid); }
      else {
        await uploadChunks(job.blob, job.mime, job.ui, "فيديو", { id: job.mid, skip: job.done, onChunk: i => { job.done.add(i); idbTx("readwrite", st => st.put([...job.done], pk(job.mid))); } });
        if (job.cancel) throw new Error("cancel");
        job.state = "post"; job.pct = 100; paint(job); note(job);
        try { MEDIA.set(job.mid, URL.createObjectURL(job.blob)); idbPut(job.mid, job.blob); } catch (_) {}
        if (!(await posted(job))) await postMedia({ mid: job.mid, mk: "vid", thumb: job.meta.thumb || "", w: job.meta.w || 0, h: job.meta.h || 0, ...(job.cap ? { text: job.cap } : {}), ...(job.reply ? { reply: job.reply } : {}) }, job.rid);
      }
      wipe(job); note(job, true); setTimeout(() => drop(job), 700);
    } catch (e) {
      if (job.cancel || (e && e.message === "cancel")) { if (jobs.has(job.id)) cancel(job); }
      else if (e && e.code === "permission-denied") { flash("⚠️ قواعد Firebase مش مسمحة بحفظ الفيديو الكبير (collection media). راجع القواعد."); drop(job); wipe(job); }
      else { job.state = "err"; job.err = navigator.onLine === false ? "مفيش نت" : "اتقطع الرفع"; paint(job); }
    } finally { job.running = false; WL.off(); act(); }
  }
  const make = o => { const job = { id: "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), state: "prep", pct: 0, t0: Date.now(), done: new Set(), meta: {}, ...o }; job.ui = { get cancel() { return job.cancel; }, set(_t, p) { if (p != null) job.pct = p; paint(job); note(job); } }; jobs.set(job.id, job); show(job); return job; };
  async function resume() {
    if (!db || !myId) return;
    const keys = (await idbTx("readonly", st => st.getAllKeys())) || [];
    for (const k of keys) {
      if (typeof k !== "string" || !k.startsWith("job:")) continue; const rec = await idbGet(k); if (!rec || rec.uid !== myId) continue;
      if ([...jobs.values()].some(j => j.mid === rec.id)) continue;
      if (Date.now() - rec.t0 > 3 * 86400000) { idbTx("readwrite", st => { st.delete(k); st.delete(pk(rec.id)); }); continue; }
      const dn = (await idbGet(pk(rec.id))) || [];
      const job = { id: "r" + rec.id, mid: rec.id, rid: rec.rid, cap: rec.cap, mime: rec.mime, n: rec.n, meta: rec.meta || {}, poster: rec.poster, reply: rec.reply, blob: rec.blob, t0: rec.t0, done: new Set(dn), state: "up", pct: rec.n ? dn.length / rec.n * 100 : 0, resumed: 1 };
      job.ui = { get cancel() { return job.cancel; }, set(_t, p) { if (p != null) job.pct = p; paint(job); note(job); } };
      jobs.set(job.id, job); show(job); run(job);
    }
  }
  const save = job => idbTx("readwrite", st => st.put({ id: job.mid, uid: myId, rid: job.rid, cap: job.cap, mime: job.mime, n: job.n, meta: { thumb: job.meta.thumb, w: job.meta.w, h: job.meta.h }, poster: job.poster, reply: job.reply || null, t0: job.t0, blob: job.blob }, jk(job.mid)));
  const kick = () => { resume().catch(() => {}); [...jobs.values()].forEach(j => { if (j.state === "err" && !j.running) run(j); }); };
  document.addEventListener("visibilitychange", () => { if (!document.hidden) kick(); });
  window.addEventListener("online", kick);
  const iv = setInterval(() => { if (db && myId) { clearInterval(iv); kick(); } }, 2500);
  return { make, show, paint, run, save, drop, mount: (list, box) => { for (const j of jobs.values()) { if (j.rid !== room) continue; if (j.mid && list.some(m => m.mid === j.mid)) { if (j.row) j.row.remove(); continue; } mount(j, box); } }, jobs };
})();
async function sendVideo(file, rid, o) {
  rid = rid || room; o = o || {};
  if (!mediaGuard(rid)) return;
  const cap = o.cap !== undefined ? o.cap : $("inp").value.trim(); if (o.cap === undefined && cap && rid === room) { $("inp").value = ""; try { localStorage.removeItem(draftKey(rid)); } catch (_) {} }
  const reply = rid === room && replyTo ? replyTo : null; if (reply) clearReply();
  const job = UPL.make({ rid, cap: cap.slice(0, 300), file, reply });   // الفقاعة بتظهر فورًا في الشات
  try {
    const meta = await videoMeta(file); if (job.cancel) return;
    job.meta = meta; job.poster = meta.poster || ""; UPL.paint(job);
    if (file.size < 650000 && !o.edit) { job.small = true; UPL.run(job); return; }
    let blob = file, mime = (file.type || "video/mp4").split(";")[0]; if (!/^video\//i.test(mime)) mime = "video/mp4";
    if (file.size > VID_MAX || o.edit) {
      const r = await shrinkVideo(file, job.ui, o.edit ? { ...o.edit, hq: file.size <= VID_MAX } : {});
      if (job.cancel) return;
      if (r && r.tooLong) { UPL.drop(job); flash("🎥 الفيديو أطول من " + Math.round(VID_MAX_SEC / 60) + " دقايق، قصّره وجرّب تاني"); return; }
      if (!r) { UPL.drop(job); flash("ماقدرتش أجهّز الفيديو الكبير ده على المتصفح. جرّب مقطع أصغر."); return; }
      blob = r; mime = (r.type || "video/webm").split(";")[0];
      if (blob.size > VID_MAX * 1.08) { UPL.drop(job); flash("الفيديو لسه كبير بعد الضغط. قصّره شوية."); return; }
    }
    job.blob = blob; job.mime = mime; job.n = Math.max(1, Math.ceil(blob.size / RAW_CH)); job.mid = db.collection("media").doc().id; job.pct = 0; job.state = "up";
    await UPL.save(job);           // بنحفظه على الجهاز علشان لو التطبيق اتقفل يكمّل من مكانه
    UPL.run(job);                  // الرفع بيكمّل في الخلفية من غير ما نستنّاه
  } catch (e) { UPL.drop(job); flash("الفيديو ماتبعتش، اتأكد من النت وجرّب تاني."); }
}
// ───── استوديو الإرسال: معاينة وتعديل الصور والفيديو وشرح لكل ملف قبل الإرسال ─────
const STU = (() => {
  const CROPS = [["أصلي", 0], ["١:١", 1], ["٤:٥", .8], ["٣:٤", .75], ["١٦:٩", 16 / 9], ["٩:١٦", 9 / 16]];
  const FLT = [["أصلي", ""], ["نابض", "saturate(1.55) contrast(1.08)"], ["دافي", "sepia(.28) saturate(1.3) hue-rotate(-8deg) brightness(1.04)"], ["بارد", "saturate(1.15) hue-rotate(14deg) brightness(1.02) contrast(1.05)"], ["سينما", "contrast(1.28) saturate(.82) brightness(.92)"], ["أبيض وأسود", "grayscale(1) contrast(1.15)"], ["ذكرى", "sepia(.7) contrast(.95) brightness(1.05)"], ["فجر", "brightness(1.1) saturate(1.25) sepia(.15)"], ["ليل", "brightness(.85) contrast(1.2) saturate(.9) hue-rotate(15deg)"]];
  const EMO = "😂 🥹 😍 🔥 ❤️ 👍 🙏 🎉 ✨ 💯 😎 🤝 🌹 ⭐ 😭 🤲 💪 👀 🫶 🌙 ☀️ ✅ ❌ 🇪🇬".split(" ");
  const COL = ["#ffffff", "#111111", "#ff4d6d", "#ffb703", "#2cc4a9", "#4cc9f0", "#9b5cff", "#7ae582"];
  const MAX_ITEMS = 10, MAX_VIDS = 3;
  const canF = (() => { try { return "filter" in CanvasRenderingContext2D.prototype; } catch (_) { return false; } })();
  const ICO = {
    flt: '<path d="M12 3l2.2 5.3L20 9l-4.3 3.8L17 18.5 12 15.6 7 18.5l1.3-5.7L4 9l5.8-.7z"/>',
    adj: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
    crop: '<path d="M7 3v14h14M3 7h14v14"/>',
    rot: '<path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v5h-5"/>',
    draw: '<path d="M4 20l1-4L16.5 4.5a2 2 0 0 1 3 3L8 19z"/>',
    text: '<path d="M5 6V4h14v2M12 4v16M9 20h6"/>',
    emo: '<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2.5 4 2.5S16 14 16 14M9 9.5h.01M15 9.5h.01"/>',
    trim: '<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M8 7.5L20 18M8 16.5L20 6"/>',
    mute: '<path d="M4 9v6h4l5 4V5L8 9zM17 9l4 6M21 9l-4 6"/>',
    snd: '<path d="M4 9v6h4l5 4V5L8 9zM16.5 8.5a5 5 0 0 1 0 7"/>',
    reset: '<path d="M4 4v6h6M4.5 10A8 8 0 1 1 5 15"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    trash: '<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>',
    undo: '<path d="M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3"/>',
  };
  const svg = (k, s) => '<svg viewBox="0 0 24 24" width="' + (s || 22) + '" height="' + (s || 22) + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICO[k] + "</svg>";
  // لقطات مصغّرة من الفيديو لشريط القص (بتتولّد مرة واحدة وبتتخزّن على الملف)
  function filmFor(it, cb) {
    if (it._film) { cb(it._film); return; }
    if (!it._filmP) it._filmP = new Promise(res => {
      const N = 8, out = [], v = document.createElement("video"); v.muted = true; v.playsInline = true; v.preload = "auto";
      let k = 0, done = false;
      const fin = () => { if (done) return; done = true; it._film = out.filter(Boolean); try { v.removeAttribute("src"); v.load(); } catch (_) {} res(it._film); };
      const next = () => { if (k >= N) return fin(); try { v.currentTime = Math.min(Math.max(0, it.dur - .05), it.dur * (k + .5) / N); } catch (_) { fin(); } };
      v.onseeked = () => { try { const c = document.createElement("canvas"), w = 80; c.width = w; c.height = Math.max(1, Math.round(w * (v.videoHeight || 1) / (v.videoWidth || 1))); c.getContext("2d").drawImage(v, 0, 0, c.width, c.height); out.push(c.toDataURL("image/jpeg", .6)); } catch (_) { out.push(""); } k++; next(); };
      v.onloadeddata = next; v.onerror = fin; setTimeout(fin, 12000); v.src = it.url;
    });
    it._filmP.then(cb);
  }
  const fmt = s => { s = Math.max(0, s || 0); return Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0"); };
  const arN = n => String(n).replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[d]);
  let S = null, root = null, R = {}, uid = 0, raf = 0;

  const fstr = it => !canF ? "" : [FLT[it.flt][1], it.br ? "brightness(" + (1 + it.br / 100) + ")" : "", it.ct ? "contrast(" + (1 + it.ct / 100) + ")" : "", it.sa ? "saturate(" + (1 + it.sa / 100) + ")" : ""].filter(Boolean).join(" ");
  const edited = it => it.kind === "img" ? !!(it.rot || it.crop || it.flt || it.br || it.ct || it.sa || it.strokes.length || it.layers.length) : (it.st > .05 || it.en < it.dur - .05 || it.mute);
  function geom(it, maxPx) {
    const sw = it.bmp.width, sh = it.bmp.height, odd = it.rot % 2, rw = odd ? sh : sw, rh = odd ? sw : sh, a = CROPS[it.crop][1];
    let cw = rw, ch = rh; if (a) { if (rw / rh > a) cw = rh * a; else ch = rw / a; }
    const k = Math.min(1, maxPx / Math.max(cw, ch));
    return { sw, sh, k, ow: Math.max(1, Math.round(cw * k)), oh: Math.max(1, Math.round(ch * k)) };
  }
  function paint(it, cv, maxPx, ed) {
    const g = geom(it, maxPx); if (cv.width !== g.ow) cv.width = g.ow; if (cv.height !== g.oh) cv.height = g.oh;
    const c = cv.getContext("2d"); c.clearRect(0, 0, g.ow, g.oh); c.imageSmoothingQuality = "high";
    c.save(); if (canF) c.filter = fstr(it) || "none"; c.translate(g.ow / 2, g.oh / 2); c.rotate(it.rot * Math.PI / 2); c.scale(g.k, g.k); c.drawImage(it.bmp, -g.sw / 2, -g.sh / 2); c.restore();
    for (const s of it.strokes) {
      c.strokeStyle = s.c; c.lineWidth = Math.max(1.5, s.w * g.ow); c.lineCap = c.lineJoin = "round"; c.beginPath();
      s.p.forEach(([x, y], i) => i ? c.lineTo(x * g.ow, y * g.oh) : c.moveTo(x * g.ow, y * g.oh));
      if (s.p.length === 1) c.lineTo(s.p[0][0] * g.ow + .1, s.p[0][1] * g.oh); c.stroke();
    }
    it._box = [];
    it.layers.forEach((L, i) => {
      const fs = L.s * g.ow, x = L.x * g.ow, y = L.y * g.oh; c.save();
      c.font = (L.e ? "" : "800 ") + fs + "px system-ui,'Segoe UI Emoji','Noto Color Emoji',sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.direction = /[؀-ۿ]/.test(L.t) ? "rtl" : "ltr";
      const w = c.measureText(L.t).width, pad = fs * .32;
      if (!L.e && L.bg) {
        c.fillStyle = L.c; const bx = x - w / 2 - pad, by = y - fs * .75, bw = w + pad * 2, bh = fs * 1.5; c.beginPath();
        if (c.roundRect) c.roundRect(bx, by, bw, bh, fs * .4); else c.rect(bx, by, bw, bh); c.fill();
        c.fillStyle = L.c === "#ffffff" || L.c === "#ffb703" || L.c === "#7ae582" || L.c === "#4cc9f0" ? "#111" : "#fff";
      } else { c.fillStyle = L.c; if (!L.e) { c.shadowColor = "rgba(0,0,0,.55)"; c.shadowBlur = fs * .25; } }
      c.fillText(L.t, x, y + (L.e ? fs * .04 : 0)); c.restore();
      it._box[i] = { x: (x - w / 2 - pad) / g.ow, y: (y - fs * .75) / g.oh, w: (w + pad * 2) / g.ow, h: fs * 1.5 / g.oh };
      if (ed && S && S.sel === i) { c.save(); c.setLineDash([6, 5]); c.strokeStyle = "#fff"; c.lineWidth = 2; c.strokeRect(x - w / 2 - pad, y - fs * .75, w + pad * 2, fs * 1.5); c.restore(); }
    });
  }
  const sched = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; repaint(); }); };
  function repaint() { const it = cur(); if (!it || it.kind !== "img") return; paint(it, R.cv, 1000, true); }
  const cur = () => S && S.items[S.i];
  function ambient(src, w, h) {
    try { const c = document.createElement("canvas"); c.width = c.height = 1; c.getContext("2d").drawImage(src, 0, 0, w, h, 0, 0, 1, 1); const d = c.getContext("2d").getImageData(0, 0, 1, 1).data; root.style.setProperty("--amb", Math.max(30, d[0]) + "," + Math.max(30, d[1]) + "," + Math.max(30, d[2])); } catch (_) {}
  }
  const tick = () => { try { navigator.vibrate && navigator.vibrate(6); } catch (_) {} };

  function build() {
    root = document.createElement("div"); root.id = "stu"; root.hidden = true; root.setAttribute("role", "dialog"); root.setAttribute("aria-label", "إرسال صور وفيديو");
    root.innerHTML = '<div class="stu-aur"></div>' +
      '<div class="stu-top"><button type="button" class="stu-x" id="stuX" aria-label="إغلاق">✕</button><div class="stu-to"><span>إلى</span><b id="stuTo"></b></div><div class="stu-n" id="stuN"></div></div>' +
      '<div class="stu-stage"><div class="stu-rail" id="stuRail"></div><div class="stu-frame" id="stuFrame"><canvas id="stuCv"></canvas><div class="stu-vw" id="stuVW" hidden><video id="stuV" playsinline webkit-playsinline></video><button type="button" class="stu-pp" id="stuPlay" aria-label="تشغيل"></button><div class="stu-vc"><span id="stuTm">0:00</span><input type="range" id="stuSeek" min="0" max="1" step="0.05" value="0" aria-label="التقدّم"></div></div><div class="stu-tip" id="stuTip" hidden></div><div class="stu-ld" id="stuLd" hidden></div></div></div>' +
      '<div class="stu-panel" id="stuPanel" hidden></div>' +
      '<div class="stu-strip" id="stuStrip"></div>' +
      '<div class="stu-bar"><div class="stu-cap"><label id="stuCapL" for="stuCap"></label><textarea id="stuCap" rows="1" maxlength="300" placeholder="اكتب شرح…" dir="auto" enterkeyhint="enter"></textarea></div>' +
      '<button type="button" class="stu-send" id="stuSend" aria-label="إرسال"><svg class="pl" viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path class="tr" d="M2 9.2h4M1 12h5M2 14.8h4"/><path class="bd" d="M8.2 4.1 21.4 10.6c.9.5.9 1.8 0 2.3L8.2 19.4c-.8.4-1.7-.3-1.5-1.2l.9-4.6 7.2-1.6-7.2-1.6-.9-4.6c-.2-.9.7-1.6 1.5-1.2z"/></svg><b id="stuSN"></b></button></div>';
    document.body.append(root);
    ["stuX", "stuTo", "stuN", "stuRail", "stuFrame", "stuCv", "stuV", "stuVW", "stuPlay", "stuTm", "stuSeek", "stuTip", "stuLd", "stuPanel", "stuStrip", "stuCapL", "stuCap", "stuSend", "stuSN"].forEach(k => R[k.slice(3).toLowerCase() || k] = document.getElementById(k));
    R.x = R.x; R.cv = R.cv; R.v = R.v;
    R.x.onclick = () => close(false);
    R.send.onclick = () => { if (R.send.dataset.busy || !S) return; R.send.dataset.busy = "1"; tick(); const rm = matchMedia("(prefers-reduced-motion:reduce)").matches; R.send.classList.add("go"); setTimeout(() => { delete R.send.dataset.busy; R.send.classList.remove("go"); send(); }, rm ? 0 : 280); };
    R.cap.oninput = () => { const it = cur(); if (it) it.cap = R.cap.value; R.cap.style.height = "auto"; R.cap.style.height = Math.min(96, R.cap.scrollHeight) + "px"; };
    document.addEventListener("keydown", e => { if (e.key === "Escape" && S && !root.hidden) close(false); });
    // لوحة المفاتيح: نخلي الشاشة على قد المساحة المرئية بس
    const vv = window.visualViewport; if (vv) { const fit = () => { if (root.hidden) return; root.style.height = vv.height + "px"; root.style.top = vv.offsetTop + "px"; root.classList.toggle("kb", vv.height < window.innerHeight * .75); }; vv.addEventListener("resize", fit); vv.addEventListener("scroll", fit); R.fit = fit; }
    // لمس الصورة: رسم أو سحب نص/ملصق
    let stroke = null, drag = null;
    const pt = e => { const r = R.cv.getBoundingClientRect(); return [Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))]; };
    R.cv.style.touchAction = "none";
    R.cv.addEventListener("pointerdown", e => {
      const it = cur(); if (!it || it.kind !== "img") return; const p = pt(e);
      if (S.mode === "draw") { stroke = { c: S.col, w: S.pw, p: [p] }; it.strokes.push(stroke); try { R.cv.setPointerCapture(e.pointerId); } catch (_) {} sched(); return; }
      for (let i = it.layers.length - 1; i >= 0; i--) { const b = it._box[i]; if (b && p[0] >= b.x && p[0] <= b.x + b.w && p[1] >= b.y && p[1] <= b.y + b.h) { S.sel = i; drag = { i, dx: it.layers[i].x - p[0], dy: it.layers[i].y - p[1] }; try { R.cv.setPointerCapture(e.pointerId); } catch (_) {} panel(); sched(); return; } }
      if (S.sel !== -1) { S.sel = -1; panel(); sched(); }
    });
    R.cv.addEventListener("pointermove", e => {
      const it = cur(); if (!it) return; const p = pt(e);
      if (stroke) { const l = stroke.p[stroke.p.length - 1]; if (Math.hypot(p[0] - l[0], p[1] - l[1]) > .002) { stroke.p.push(p); sched(); } }
      else if (drag) { const L = it.layers[drag.i]; if (L) { L.x = Math.min(1, Math.max(0, p[0] + drag.dx)); L.y = Math.min(1, Math.max(0, p[1] + drag.dy)); sched(); } }
    });
    const up = () => { if (stroke) { stroke = null; thumbOf(cur()); dock(); } if (drag) { drag = null; thumbOf(cur()); } };
    R.cv.addEventListener("pointerup", up); R.cv.addEventListener("pointercancel", up);
    R.v.addEventListener("timeupdate", () => { const it = cur(); if (!it || it.kind !== "vid" || !it.dur) return; if (R.v.currentTime >= it.en - .05) { R.v.currentTime = it.st; if (!R.v.paused) R.v.play().catch(() => {}); } });
    R.v.addEventListener("play", () => { const it = cur(); if (it && it.kind === "vid" && (R.v.currentTime < it.st - .05 || R.v.currentTime >= it.en - .05)) R.v.currentTime = it.st; });
    const fitV = () => { const it = cur(); if (!it || it.kind !== "vid" || !it.tw || !it.th) return; const fw = R.frame.clientWidth, fh = R.frame.clientHeight; if (!fw || !fh) return; const k = Math.min(fw / it.tw, fh / it.th); R.vw.style.width = Math.floor(it.tw * k) + "px"; R.vw.style.height = Math.floor(it.th * k) + "px"; };
    // تحكم فيديو مخصص (بدل أزرار المتصفح): تشغيل بلمسة + شريط تقدّم داخل حدود القص
    let seeking = false;
    const vsync = () => { const it = cur(); if (!it || it.kind !== "vid") return; const lo = it.st || 0, hi = it.en || it.dur || 1; R.seek.min = lo; R.seek.max = hi; const t = Math.min(hi, Math.max(lo, R.v.currentTime)); if (!seeking) R.seek.value = t; R.tm.textContent = fmt(t - lo) + " / " + fmt(hi - lo); if (R.trimUpd) R.trimUpd(); R.vw.classList.toggle("playing", !R.v.paused); R.play.setAttribute("aria-label", R.v.paused ? "تشغيل" : "إيقاف"); };
    R.vsync = vsync;
    ["timeupdate", "play", "pause", "seeked", "loadedmetadata"].forEach(ev => R.v.addEventListener(ev, vsync));
    R.play.onclick = () => { if (R.v.paused) R.v.play().catch(() => {}); else R.v.pause(); };
    R.seek.addEventListener("pointerdown", () => { seeking = true; }); ["pointerup", "pointercancel", "change"].forEach(ev => R.seek.addEventListener(ev, () => { seeking = false; }));
    R.seek.oninput = () => { R.v.currentTime = +R.seek.value; vsync(); };
    R.fitV = fitV; if (window.ResizeObserver) new ResizeObserver(fitV).observe(R.frame); window.addEventListener("resize", fitV);
    R.v.addEventListener("volumechange", () => { const it = cur(); if (it && it.kind === "vid") R.v.muted = it.mute; });
  }

  // ───── تحميل الملفات ─────
  async function loadImg(it) {
    let bmp;
    try { bmp = await createImageBitmap(it.file); } catch (e) { bmp = await new Promise((ok, no) => { const u = URL.createObjectURL(it.file), im = new Image(); im.onload = () => { URL.revokeObjectURL(u); ok(im); }; im.onerror = no; im.src = u; }); }
    const w = bmp.width || bmp.naturalWidth, h = bmp.height || bmp.naturalHeight, k = Math.min(1, 2400 / Math.max(w, h));
    if (k < 1) { const c = document.createElement("canvas"); c.width = Math.round(w * k); c.height = Math.round(h * k); c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height); if (bmp.close) bmp.close(); bmp = c; }
    it.bmp = bmp; it.tw = bmp.width; it.th = bmp.height; thumbOf(it);
  }
  function loadVid(it) {
    return new Promise(res => {
      it.url = URL.createObjectURL(it.file); const v = document.createElement("video"); v.muted = true; v.playsInline = true; v.preload = "auto"; let done = false;
      const fin = () => { if (done) return; done = true; it.dur = isFinite(v.duration) ? v.duration : 0; it.en = Math.min(it.dur || 0, 300); it.tw = v.videoWidth; it.th = v.videoHeight; res(); };
      v.onloadeddata = () => { try { v.currentTime = Math.min(.2, (v.duration || 1) / 2); } catch (e) { fin(); } };
    v.onseeked = () => { try { const k = 160 / Math.max(v.videoWidth, v.videoHeight, 1), c = document.createElement("canvas"); c.width = Math.max(1, Math.round(v.videoWidth * k)); c.height = Math.max(1, Math.round(v.videoHeight * k)); const g = c.getContext("2d"); g.drawImage(v, 0, 0, c.width, c.height); it.poster = c.toDataURL("image/jpeg", .7); it.pc = c; const d = g.getImageData(0, 0, c.width, c.height).data; let sm = 0; for (let j = 0; j < d.length; j += 16) sm += d[j] + d[j + 1] + d[j + 2]; if (sm / (d.length / 16) / 3 < 18 && !it._r && v.duration > 1) { it._r = 1; v.currentTime = v.duration * .35; return; } } catch (e) {} fin(); };
      v.onerror = fin; v.src = it.url; setTimeout(fin, 7000);
    });
  }
  function thumbOf(it) {
    if (!it) return;
    if (it.kind === "img") { const c = it.tc || (it.tc = document.createElement("canvas")); try { paint(it, c, 140); } catch (_) {} }
    strip();
  }

  // ───── الواجهة ─────
  function dock() {
    const it = cur(), r = R.rail; r.textContent = ""; if (!it) return;
    const B = (ic, lb, fn, on, dis) => { const b = document.createElement("button"); b.type = "button"; b.className = "stu-t" + (on ? " on" : ""); b.innerHTML = svg(ic) + "<i>" + lb + "</i>"; b.disabled = !!dis; b.onclick = () => { tick(); fn(); }; r.append(b); };
    const mode = m => () => { S.mode = S.mode === m ? "" : m; S.sel = -1; panel(); dock(); sched(); };
    if (it.kind === "img") {
      if (canF) { B("flt", "فلاتر", mode("flt"), S.mode === "flt"); B("adj", "ضبط", mode("adj"), S.mode === "adj"); }
      B("crop", "قص", mode("crop"), S.mode === "crop"); B("rot", "تدوير", rotate);
      B("draw", "رسم", mode("draw"), S.mode === "draw"); B("text", "نص", mode("text"), S.mode === "text"); B("emo", "ملصق", mode("emo"), S.mode === "emo");
    } else {
      B("trim", "قص", mode("trim"), S.mode === "trim");
      B(it.mute ? "mute" : "snd", it.mute ? "صامت" : "الصوت", () => { it.mute = !it.mute; R.v.muted = it.mute; dock(); strip(); });
    }
    B("reset", "إلغاء", resetIt, false, !edited(it));
  }
  function panel() {
    R.trimUpd = null; const it = cur(), p = R.panel; p.textContent = ""; const m = it && S.mode; p.hidden = !m; R.frame.classList.toggle("tall", !!m); if (!m) { tip(); return; }
    const row = (cls) => { const d = document.createElement("div"); d.className = "stu-row " + (cls || ""); p.append(d); return d; };
    const chip = (host, label, on, fn) => { const b = document.createElement("button"); b.type = "button"; b.className = "stu-c" + (on ? " on" : ""); b.textContent = label; b.onclick = () => { tick(); fn(); }; host.append(b); return b; };
    const dots = (host, sel, fn) => COL.forEach(c => { const b = document.createElement("button"); b.type = "button"; b.className = "stu-dot" + (c === sel ? " on" : ""); b.style.background = c; b.setAttribute("aria-label", "لون"); b.onclick = () => { tick(); fn(c); }; host.append(b); });
    const slider = (lb, val, fn) => { const d = row("sl"); const l = document.createElement("span"); l.textContent = lb; const i = document.createElement("input"); i.type = "range"; i.min = -50; i.max = 50; i.value = val; const o = document.createElement("b"); o.textContent = arN(val); i.oninput = () => { fn(+i.value); o.textContent = arN(i.value); sched(); }; i.onchange = () => { thumbOf(it); dock(); }; d.append(l, i, o); };
    if (m === "flt") {
      const d = row("scroll"); FLT.forEach(([n, f], i) => { const b = document.createElement("button"); b.type = "button"; b.className = "stu-f" + (it.flt === i ? " on" : ""); const c = document.createElement("canvas"); const k = 64 / Math.max(it.bmp.width, it.bmp.height); c.width = Math.max(1, Math.round(it.bmp.width * k)); c.height = Math.max(1, Math.round(it.bmp.height * k)); const g = c.getContext("2d"); g.filter = f || "none"; g.drawImage(it.bmp, 0, 0, c.width, c.height); const s = document.createElement("span"); s.textContent = n; b.append(c, s); b.onclick = () => { tick(); it.flt = i; thumbOf(it); panel(); dock(); sched(); }; d.append(b); });
    } else if (m === "adj") {
      slider("سطوع", it.br, v => it.br = v); slider("تباين", it.ct, v => it.ct = v); slider("ألوان", it.sa, v => it.sa = v);
    } else if (m === "crop") {
      const d = row("scroll"); CROPS.forEach(([n], i) => chip(d, n, it.crop === i, () => { if (it.crop === i) return; if (clearNotes()) return; it.crop = i; thumbOf(it); panel(); dock(); sched(); }));
    } else if (m === "draw") {
      const d = row(); dots(d, S.col, c => { S.col = c; panel(); });
      const t = row("scroll"); [["رفيع", .006], ["وسط", .011], ["عريض", .022]].forEach(([n, w]) => chip(t, n, S.pw === w, () => { S.pw = w; panel(); }));
      const u = chip(t, "↩ تراجع", false, () => { it.strokes.pop(); thumbOf(it); dock(); sched(); }); u.disabled = !it.strokes.length;
    } else if (m === "text") {
      const d = row("txt"), i = document.createElement("input"); i.type = "text"; i.placeholder = "اكتب النص…"; i.maxLength = 60; i.dir = "auto"; i.id = "stuTxt";
      const L = it.layers[S.sel]; if (L && !L.e) i.value = L.t;
      const add = document.createElement("button"); add.type = "button"; add.className = "stu-add"; add.textContent = L && !L.e ? "تحديث" : "إضافة";
      add.onclick = () => { const t = i.value.trim(); if (!t) { i.focus(); return; } const cl = it.layers[S.sel]; if (cl && !cl.e) { cl.t = t; cl.c = S.tc; cl.bg = S.tbg; } else { it.layers.push({ t, x: .5, y: .5, s: .075, c: S.tc, bg: S.tbg }); S.sel = it.layers.length - 1; } i.value = ""; thumbOf(it); panel(); dock(); sched(); };
      i.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); add.click(); } };
      d.append(i, add);
      const c = row(); dots(c, S.tc, col => { S.tc = col; const cl = it.layers[S.sel]; if (cl && !cl.e) cl.c = col; panel(); sched(); });
      const o = row("scroll"); chip(o, S.tbg ? "▣ بخلفية" : "▢ بدون خلفية", false, () => { S.tbg = !S.tbg; const cl = it.layers[S.sel]; if (cl && !cl.e) cl.bg = S.tbg; panel(); sched(); });
    } else if (m === "emo") {
      const d = row("emo"); EMO.forEach(e => { const b = document.createElement("button"); b.type = "button"; b.textContent = e; b.onclick = () => { tick(); it.layers.push({ t: e, e: 1, x: .5, y: .5, s: .17, c: "#fff" }); S.sel = it.layers.length - 1; thumbOf(it); panel(); dock(); sched(); }; d.append(b); });
    } else if (m === "trim") {
      const d = row("trim"), W = document.createElement("div"); W.className = "stu-trim"; d.append(W);
      const bs = document.createElement("b"), be = document.createElement("b"), bl = document.createElement("span"), tt = document.createElement("div"); tt.className = "stu-tt"; tt.append(bs, bl, be); W.append(tt);
      if (it.dur > 0) {
        const tk = document.createElement("div"); tk.className = "stu-tk"; tk.dir = "ltr";
        const fs = document.createElement("div"); fs.className = "stu-fs"; const tiles = []; for (let k = 0; k < 8; k++) { const t = document.createElement("i"); fs.append(t); tiles.push(t); }
        const shl = document.createElement("div"), shr = document.createElement("div"), win = document.createElement("div"), ph = document.createElement("div"), hs = document.createElement("div"), he = document.createElement("div");
        shl.className = "stu-sh l"; shr.className = "stu-sh r"; win.className = "stu-win"; ph.className = "stu-ph"; hs.className = "stu-hd s"; he.className = "stu-hd e";
        [[hs, "بداية المقطع"], [he, "نهاية المقطع"]].forEach(([h, lb]) => { h.setAttribute("role", "slider"); h.tabIndex = 0; h.setAttribute("aria-label", lb); });
        tk.append(fs, shl, shr, win, ph, hs, he); W.append(tk);
        const MINL = .5, MAXL = 300, pc = x => Math.min(100, Math.max(0, x / it.dur * 100));
        const upd = () => {
          shl.style.width = pc(it.st) + "%"; shr.style.width = (100 - pc(it.en)) + "%"; win.style.left = pc(it.st) + "%"; win.style.right = (100 - pc(it.en)) + "%";
          hs.style.left = pc(it.st) + "%"; he.style.left = pc(it.en) + "%"; hs.setAttribute("aria-valuenow", it.st.toFixed(1)); he.setAttribute("aria-valuenow", it.en.toFixed(1));
          bs.textContent = fmt(it.st); be.textContent = fmt(it.en); bl.textContent = "المدة " + fmt(it.en - it.st);
          const t = R.v.currentTime || 0; ph.style.left = pc(t) + "%"; ph.hidden = t < it.st - .1 || t > it.en + .1;
        };
        R.trimUpd = upd; upd();
        const setSt = t => { it.st = Math.max(0, Math.min(t, it.en - MINL)); if (it.en - it.st > MAXL) it.st = it.en - MAXL; R.v.currentTime = it.st; };
        const setEn = t => { it.en = Math.min(it.dur, Math.max(t, it.st + MINL)); if (it.en - it.st > MAXL) it.en = it.st + MAXL; R.v.currentTime = Math.max(it.st, it.en - .3); };
        const tOf = e => { const r = tk.getBoundingClientRect(); return Math.min(it.dur, Math.max(0, (e.clientX - r.left) / (r.width || 1) * it.dur)); };
        const drag = (h, set) => {
          h.addEventListener("pointerdown", e => {
            e.preventDefault(); e.stopPropagation(); try { h.setPointerCapture(e.pointerId); } catch (_) {} h.classList.add("on"); tick();
            const mv = ev => { set(tOf(ev)); upd(); if (R.vsync) R.vsync(); };
            const up = () => { h.classList.remove("on"); h.removeEventListener("pointermove", mv); h.removeEventListener("pointerup", up); h.removeEventListener("pointercancel", up); dock(); strip(); };
            h.addEventListener("pointermove", mv); h.addEventListener("pointerup", up); h.addEventListener("pointercancel", up);
          });
          h.addEventListener("keydown", e => { const k = e.key === "ArrowLeft" ? -.5 : e.key === "ArrowRight" ? .5 : 0; if (!k) return; e.preventDefault(); set((h === hs ? it.st : it.en) + k); upd(); if (R.vsync) R.vsync(); dock(); strip(); });
        };
        drag(hs, setSt); drag(he, setEn);
        // الضغط على الشريط نفسه بيحرّك رأس التشغيل جوه المقطع المحدد
        tk.addEventListener("pointerdown", e => { if (e.target === hs || e.target === he) return; R.v.currentTime = Math.min(it.en - .05, Math.max(it.st, tOf(e))); upd(); if (R.vsync) R.vsync(); });
        filmFor(it, fr => { if (!tk.isConnected) return; tiles.forEach((t, k) => { const u = fr[Math.min(fr.length - 1, Math.floor(k * fr.length / tiles.length))]; if (u) t.style.backgroundImage = 'url("' + u + '")'; }); tk.classList.add("lit"); });
      } else { bs.textContent = fmt(it.st); be.textContent = fmt(it.en); bl.textContent = "المدة " + fmt(it.en - it.st); }
      if (it.dur > 300) { const w = document.createElement("div"); w.className = "stu-len"; w.textContent = "الحد الأقصى ٥ دقايق"; W.append(w); }
    }
    if (it.kind === "img" && (m === "text" || m === "emo") && S.sel >= 0 && it.layers[S.sel]) {
      const d = row("lay"), L = it.layers[S.sel];
      chip(d, "＋ أكبر", false, () => { L.s = Math.min(.6, L.s * 1.2); thumbOf(it); sched(); }); chip(d, "－ أصغر", false, () => { L.s = Math.max(.02, L.s / 1.2); thumbOf(it); sched(); });
      chip(d, "🗑 حذف", false, () => { it.layers.splice(S.sel, 1); S.sel = -1; thumbOf(it); panel(); dock(); sched(); });
    }
    tip();
  }
  function tip() { const it = cur(), t = R.tip; const on = it && it.kind === "img" && S.mode === "draw" ? "ارسم بصباعك على الصورة" : it && it.kind === "img" && it.layers.length ? "اسحب النص أو الملصق عشان تحرّكه" : ""; t.hidden = !on; t.textContent = on; }
  function clearNotes() { const it = cur(); if (it.strokes.length || it.layers.length) { if (!confirm("ده هيمسح الرسم والنصوص اللي على الصورة. تكمّل؟")) return true; it.strokes = []; it.layers = []; S.sel = -1; } return false; }
  function rotate() { const it = cur(); if (clearNotes()) return; it.rot = (it.rot + 1) % 4; thumbOf(it); dock(); sched(); }
  function resetIt() {
    const it = cur(); if (!it) return;
    if (it.kind === "img") Object.assign(it, { rot: 0, crop: 0, flt: 0, br: 0, ct: 0, sa: 0, strokes: [], layers: [] }); else { it.st = 0; it.en = Math.min(it.dur, 300); it.mute = false; R.v.muted = false; R.v.currentTime = 0; }
    S.sel = -1; thumbOf(it); panel(); dock(); sched();
  }
  function strip() {
    const s = R.strip; s.textContent = "";
    S.items.forEach((it, i) => {
      const b = document.createElement("button"); b.type = "button"; b.className = "stu-th" + (i === S.i ? " on" : ""); b.setAttribute("aria-label", "ملف " + (i + 1));
      const src = it.kind === "img" ? it.tc : it.pc; if (src && src.width) { const c = document.createElement("canvas"); c.width = src.width; c.height = src.height; c.getContext("2d").drawImage(src, 0, 0); b.append(c); } else b.classList.add("nov");
      if (it.kind === "vid") { const t = document.createElement("i"); t.className = "stu-vd"; t.textContent = "▶ " + fmt(it.en - it.st); b.append(t); }
      if (edited(it)) { const e = document.createElement("u"); e.textContent = "✎"; b.append(e); }
      if (it.cap.trim()) { const e = document.createElement("s"); e.textContent = "Aa"; b.append(e); }
      b.onclick = () => { if (i !== S.i) show(i); };
      if (S.items.length > 1) { const x = document.createElement("span"); x.className = "stu-rm"; x.textContent = "✕"; x.onclick = ev => { ev.stopPropagation(); removeAt(i); }; b.append(x); }
      s.append(b);
    });
    if (S.items.length < MAX_ITEMS) { const a = document.createElement("button"); a.type = "button"; a.className = "stu-th stu-add2"; a.setAttribute("aria-label", "إضافة المزيد"); a.innerHTML = svg("plus", 22); a.onclick = () => document.getElementById("aMix").click(); s.append(a); }
    R.sn.textContent = S.items.length > 1 ? arN(S.items.length) : ""; R.n.textContent = S.items.length > 1 ? arN(S.i + 1) + " \u200E/\u200E " + arN(S.items.length) : "";
    R.send.classList.toggle("multi", S.items.length > 1);
    const on = s.querySelector(".on"); if (on && on.scrollIntoView) try { on.scrollIntoView({ inline: "center", block: "nearest" }); } catch (_) {}
  }
  function removeAt(i) { const it = S.items[i]; releaseOne(it); S.items.splice(i, 1); if (!S.items.length) { close(true); return; } show(Math.min(i, S.items.length - 1)); }
  function show(i) {
    S.i = i; const it = cur(); if (!it) return; S.sel = -1; if (it.kind === "vid" && !["trim", ""].includes(S.mode)) S.mode = ""; if (it.kind === "img" && S.mode === "trim") S.mode = "";
    R.cv.hidden = it.kind !== "img"; R.v.hidden = it.kind !== "vid"; R.vw.hidden = it.kind !== "vid"; root.style.setProperty("--pst", it.kind === "vid" && it.poster ? 'url("' + it.poster + '")' : "none");
    if (it.kind === "vid") { if (R.v.dataset.id !== String(it.id)) { R.v.dataset.id = it.id; R.v.src = it.url; R.v.muted = it.mute; R.v.currentTime = it.st || 0; } } else { try { R.v.pause(); } catch (_) {} }
    R.cap.value = it.cap; R.cap.style.height = "auto"; R.cap.style.height = Math.min(96, R.cap.scrollHeight) + "px";
    R.capl.textContent = (it.kind === "vid" ? "🎬 شرح الفيديو" : "🖼 شرح الصورة") + (S.items.length > 1 ? " · " + arN(i + 1) : "");
    if (it.kind === "img") { thumbOf(it); ambient(it.bmp, it.bmp.width, it.bmp.height); } else if (it.pc) ambient(it.pc, it.pc.width, it.pc.height);
    dock(); panel(); strip(); repaint(); if (R.vsync) R.vsync(); if (R.fitV) { R.fitV(); requestAnimationFrame(R.fitV); }
  }
  function releaseOne(it) { try { if (it.url) URL.revokeObjectURL(it.url); if (it.bmp && it.bmp.close) it.bmp.close(); } catch (_) {} }
  function close(sent) {
    if (!S) return;
    if (!sent && S.items.some(x => edited(x) || x.cap.trim()) && !confirm("تقفل من غير ما تبعت؟ التعديلات هتضيع.")) return;
    try { R.v.pause(); R.v.removeAttribute("src"); R.v.load(); } catch (_) {} delete R.v.dataset.id;
    root.hidden = true; document.documentElement.classList.remove("stu-open");
    if (!sent) S.items.forEach(releaseOne);
    S = null;
  }

  // ───── التجهيز والإرسال ─────
  const toBlob = (cv, q) => new Promise(res => cv.toBlob(b => res(b), "image/jpeg", q));
  async function exportImg(it) { const cv = document.createElement("canvas"); paint(it, cv, 1800, false); return (await toBlob(cv, .92)) || it.file; }
  async function send() {
    if (!S || !S.items.length) return; const rid = S.rid;
    if (!mediaGuard(rid)) return;
    const items = S.items.slice();
    if (S.inpTaken && rid === room) { $("inp").value = ""; try { localStorage.removeItem(draftKey(rid)); } catch (_) {} }
    close(true); let n = 0;
    for (const it of items) {
      const cap = it.cap.trim().slice(0, 300);
      try {
        if (it.kind === "img") {
          setStatus("جاري تجهيز الصورة…");
          const r = await shrinkImage(edited(it) ? await exportImg(it) : it.file); if (!r) { setStatus("الصورة كبيرة جدًا."); continue; }
          setStatus("جاري الإرسال…");
          await postMedia({ ...(await saveMedia("img", r.url, r)), ...(cap ? { text: cap } : {}) }, rid); n++;
        } else await sendVideo(it.file, rid, { cap, edit: edited(it) ? { start: it.st, end: it.en || it.dur, mute: it.mute } : null });
      } catch (e) { setStatus("الملف ماتبعتش."); }
      releaseOne(it);
    }
    if (n && !$("status").textContent.startsWith("جاري تحميل")) setStatus("");
  }

  async function open(files, rid) {
    files = [...files].filter(f => /^(image|video)\//i.test(f.type || "")); if (!files.length) return;
    if (!root) build();
    if (!S) {
      rid = rid || room; if (!mediaGuard(rid)) return;
      S = { items: [], i: -1, rid, mode: "", sel: -1, col: COL[2], pw: .011, tc: "#ffffff", tbg: true, inpTaken: false };
      const first = $("inp").value.trim(); S.pre = first;
      R.to.textContent = roomLabel(rid); root.hidden = false; document.documentElement.classList.add("stu-open"); if (R.fit) R.fit();
    }
    const SS = S; R.ld.hidden = false; R.ld.textContent = "بجهّز الملفات…";
    for (const f of files) {
      if (S !== SS) return;
      if (S.items.length >= MAX_ITEMS) { flash("الحد " + arN(MAX_ITEMS) + " ملفات في المرة"); break; }
      const vid = (f.type || "").startsWith("video");
      if (vid && S.items.filter(x => x.kind === "vid").length >= MAX_VIDS) { flash("٣ فيديوهات بس في المرة"); continue; }
      const it = { id: ++uid, file: f, kind: vid ? "vid" : "img", cap: "", rot: 0, crop: 0, flt: 0, br: 0, ct: 0, sa: 0, strokes: [], layers: [], mute: false, st: 0, en: 0, dur: 0 };
      try { await (vid ? loadVid(it) : loadImg(it)); } catch (e) { flash(vid ? "الفيديو ده مش بيفتح" : "الصورة دي مش بتفتح"); continue; }
      if (S !== SS) { releaseOne(it); return; }
      if (!S.items.length && S.pre) { it.cap = S.pre; S.inpTaken = true; }
      S.items.push(it); if (S.i < 0) show(0); else strip();
    }
    R.ld.hidden = true;
    if (!S.items.length) close(true);
  }
  return { open, isOpen: () => !!S };
})();
$("aMix").onchange = e => { const f = [...e.target.files]; e.target.value = ""; if (f.length) STU.open(f, room); };
$("aCam").onchange = e => { const f = e.target.files[0]; e.target.value = ""; if (f) STU.open([f], room); };
$("aCamV").onchange = e => { const f = e.target.files[0]; e.target.value = ""; if (f) STU.open([f], room); };

// ───── زرار الكاميرا: ضغطة = كاميرا الموبايل للصور، ضغطة مطوّلة = تصوير فيديو ─────
(() => {
  const b = $("camBtn"); let t0 = 0, skip = false, lp = 0;
  const open = vid => { if (!mediaGuard()) return; try { if (!vid && !localStorage.getItem("vc_camhint")) { localStorage.setItem("vc_camhint", "1"); flash("💡 اضغط مطوّلاً على الكاميرا علشان تصوّر فيديو"); } } catch (_) {} $(vid ? "aCamV" : "aCam").click(); };
  b.addEventListener("pointerdown", () => { t0 = Date.now(); skip = false; clearTimeout(lp); lp = setTimeout(() => { b.classList.add("lp"); if (navigator.vibrate) navigator.vibrate(12); }, 450); });
  const end = () => { clearTimeout(lp); b.classList.remove("lp"); };
  b.addEventListener("pointercancel", end); b.addEventListener("pointerleave", end);
  b.addEventListener("pointerup", () => { const long = t0 && Date.now() - t0 >= 450; t0 = 0; end(); if (long) { skip = true; open(true); } });
  b.addEventListener("click", e => { e.preventDefault(); if (skip) { skip = false; return; } open(false); });
  b.addEventListener("contextmenu", e => e.preventDefault());
})();

function roomCard(sh) {
  const c = el("div", "rcard"), r = rooms.find(x => x.id === sh.id) || (sh.id === "general" ? generalRoom() : null);
  c.append(avatar({ emoji: sh.emoji || "💬", color: sh.color || "#5b6b78", photo: sh.photo || "" }));
  const t = el("div", "rt"); t.append(el("b", "", sh.name || "غرفة"), el("small", "", "غرفة على Very Chat")); c.append(t);
  const b = el("button", "", r && canSee(r) ? "فتح" : "انضمام"); b.type = "button";
  b.onclick = async e => { e.stopPropagation(); if (selMode) return; const rr = rooms.find(x => x.id === sh.id) || (sh.id === "general" ? generalRoom() : { stub: true, id: sh.id, name: sh.name || "غرفة" }); if (!rr) { setStatus("الغرفة دي مش موجودة."); return; } try { await joinRoom(rr); } catch (er) { setStatus(errMsg(er)); } };
  c.append(b); return c;
}
// الكارت بيشاور على الـ uid بس، والاسم والكود بيتقروا من البروفايل الحقيقي (علشان محدش يزوّر كارت)
function userCard(u) {
  const p = profiles[u && u.uid] || {}, c = el("div", "rcard"); c.append(avatar(p));
  // الاسم على الكارت: اسمي الخاص لو أنا مسجّله، وإلا الاسم اللي المُرسِل سجّله، وإلا الاسم الأصلي. (وأول ما تدوس «مراسلة» بيظهر الاسم الأصلي)
  const shown = u && u.uid !== myId ? (nickOf(u.uid) || String(u.name || "").replace(/\s+/g, " ").trim().slice(0, 30)) : "";
  const t = el("div", "rt"), nb = el("b", "", shown || p.name || "مجهول"); nb.dir = "auto"; t.append(nb, el("small", "", "كارت تعريف")); c.append(t);
  if (u && u.uid !== myId) { const b = el("button", "", "مراسلة"); b.type = "button"; b.onclick = e => { e.stopPropagation(); if (!selMode) openPeer(u.uid); }; c.append(b); }
  return c;
}
async function sendMyCard() {
  if (!mediaGuard()) return;
  if (!canDMFrom(myId, room)) { flash("🎭 إنت بشخصية مستعارة هنا، مينفعش تبعت كودك الحقيقي"); return; }
  if (!(profiles[myId] || {}).fcode) { flash("كودك لسه بيتجهز، جرّب كمان ثانية"); return; }
  try { await postMedia({ ucard: { uid: myId } }); } catch (e) { flash("ماقدرتش أبعت الكارت."); }
}
// ───── 🆔 مشاركة الكود: كودي أو كود أي صديق (زي مشاركة جهة اتصال). الصديق بيتبعت بالاسم اللي مسجّله بيه عندك ─────
function openCodeShare() {
  const c = $("mcard"); c.textContent = ""; c.append(el("div", "mprev", "🆔 مشاركة الكود"));
  const acts = el("div", "acts lst");
  const row = (ico, grad, label, sub, fn) => { const b = el("button", "act"); b.type = "button"; const i = el("i", "", ico); i.style.background = grad; const sp = el("span", "", label); if (sub) { const sm = el("small", "", sub); sm.dir = "ltr"; sm.style.cssText = "display:block;opacity:.6;font-weight:500;font-size:12px"; sp.append(sm); } b.append(i, sp); b.onclick = fn; acts.append(b); };
  const mc = fmtFCode((profiles[myId] || {}).fcode);
  row("🆔", "linear-gradient(135deg,#2f8cff,#1f5fd1)", "كودي", mc, () => { $("msheet").hidden = true; sendMyCard(); });
  row("👥", "linear-gradient(135deg,#22b573,#0f8f7a)", "أكواد الأصدقاء", "", openFriendCodes);
  c.append(acts); $("msheet").hidden = false;
}
function openFriendCodes() {
  const c = $("mcard"); c.textContent = ""; c.append(el("div", "mprev", "👥 اختار صديق تبعت كوده"));
  const seen = new Set(), fr = [];
  Object.values(dms).filter(d => dmEstablished(d) && !pendingIn(d) && !(d.blockedBy || []).length).forEach(d => { const u = dmPeerOf(d.id); if (!u || u === myId || seen.has(u) || !profiles[u]) return; seen.add(u); fr.push(u); });
  fr.sort((x, y) => pname(x).localeCompare(pname(y), "ar"));
  const q = el("input", "dsearch"); q.type = "search"; q.placeholder = "🔎 ابحث بالاسم أو بالكود…"; q.autocomplete = "off"; q.autocapitalize = "off"; q.spellcheck = false; q.enterKeyHint = "search"; q.setAttribute("aria-label", "بحث عن صديق");
  const list = el("div", "acts"); list.style.cssText = "display:flex;flex-direction:column;gap:6px;max-height:52vh;overflow-y:auto";
  const draw = () => {
    list.textContent = ""; const qn = nzq(q.value), qc = normFCode(q.value);
    const hits = fr.filter(u => { if (!qn) return true; const p = profiles[u]; return nzq(pname(u)).includes(qn) || nzq(p.name).includes(qn) || (qc.length >= 2 && String(p.fcode || "").includes(qc)); });
    if (!hits.length) { const n = el("div", "note", fr.length ? "مفيش صديق بالاسم أو الكود ده" : "لسه مفيش أصدقاء"); n.style.cssText = "text-align:center;padding:18px 8px;opacity:.7"; list.append(n); return; }
    hits.forEach(u => {
      const p = profiles[u], b = el("button", "rrow"); b.type = "button"; const nb = el("b", "", pname(u)); nb.dir = "auto"; b.append(avatar(p), nb);
      if (p.fcode) { const k = el("small", "", fmtFCode(p.fcode)); k.dir = "ltr"; k.style.cssText = "margin-inline-start:auto;opacity:.55;font-variant-numeric:tabular-nums"; b.append(k); }
      b.onclick = async () => {
        $("msheet").hidden = true; if (!mediaGuard()) return;
        try { const nk = nickOf(u); await postMedia({ ucard: { uid: u, ...(nk ? { name: nk } : {}) } }); flash("✓ اتبعت كود " + pname(u)); } catch (e) { flash("ماقدرتش أبعت الكارت."); }
      };
      list.append(b);
    });
  };
  q.addEventListener("input", draw); draw(); c.append(q, list); $("msheet").hidden = false;
}
function openSharePicker() {
  const c = $("mcard"); c.textContent = "";
  c.append(el("div", "mprev", "🏠 اختار غرفة تشاركها"));
  // الغرفة العامة مفيهاش مشاركة (الكل فيها أصلًا)
  const mine = rooms.filter(r => r.id !== "general" && canSee(r) && (!r.private || r.by === myId || adminOf(r)));
  const q = el("input", "dsearch"); q.type = "search"; q.placeholder = "🔎 ابحث بالاسم أو بالكود…"; q.autocomplete = "off"; q.autocapitalize = "off"; q.spellcheck = false; q.enterKeyHint = "search"; q.setAttribute("aria-label", "بحث عن غرفة");
  const list = el("div", "acts"); list.style.cssText = "display:flex;flex-direction:column;gap:6px;max-height:52vh;overflow-y:auto";
  const draw = () => {
    list.textContent = "";
    const hits = mine.filter(r => roomMatches(r, q.value.trim()));
    if (!hits.length) { const n = el("div", "note", mine.length ? "مفيش غرفة بالاسم أو الكود ده" : "مفيش غرف تشاركها لسه"); n.style.cssText = "text-align:center;padding:18px 8px;opacity:.7"; list.append(n); return; }
    hits.forEach(r => {
      const b = el("button", "rrow"); b.type = "button"; b.append(avatar(r.emoji || r.photo ? r : { emoji: "💬", color: "#5b6b78" }), el("b", "", r.name));
      if (r.code) { const k = el("small", "", r.code); k.dir = "ltr"; k.style.cssText = "margin-inline-start:auto;opacity:.55;font-variant-numeric:tabular-nums"; b.append(k); }
      b.onclick = async () => {
        $("msheet").hidden = true;
        if (!mediaGuard()) return;
        try { await postMedia({ share: { id: r.id, name: String(r.name || "").slice(0, 30), emoji: r.emoji || "", color: r.color || "" } }); } catch (e) { setStatus("ماقدرتش أشارك الغرفة."); }
      };
      list.append(b);
    });
  };
  q.addEventListener("input", draw); draw();
  c.append(q, list); $("msheet").hidden = false;
}
$("plusBtn").onclick = () => {
  const c = $("mcard"); c.textContent = "";
  const wrap = el("div", "acts att"), P = d => '<svg viewBox="0 0 24 24">' + d + '</svg>';
  wrap.append(el("div", "agr"), el("h3", "atit", "إرسال"));
  const sec = (title, items, cols) => {
    wrap.append(el("div", "asl", title)); const g = el("div", "asec c" + cols);
    items.forEach(([bg, ic, t, fn]) => { const b = el("button", "apick"); b.type = "button"; const i = el("i"); i.style.background = bg; i.innerHTML = ic; b.append(i, document.createTextNode(t)); b.onclick = () => { $("msheet").hidden = true; fn(); }; g.append(b); });
    wrap.append(g);
  };
  sec("ملفات ووسائط", [
    ["#7c5cff", P('<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="M4 18l5-5 4 4 3-3 4 4"/>'), "المعرض", () => $("aMix").click()],
    ["#ec4899", P('<path d="M4 8h3l1.6-2.4h6.8L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.6"/>'), "كاميرا", () => { if (mediaGuard()) $("aCam").click(); }],
    ["#ef4444", P('<rect x="3" y="6" width="13" height="12" rx="3"/><path d="M16 10.5l5-3v9l-5-3"/>'), "فيديو", () => { if (mediaGuard()) $("aCamV").click(); }],
    ["#14b8a6", P('<path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>'), "مستند", () => { if (mediaGuard()) $("aDoc").click(); }]
  ], 4);
  sec("تفاعل ومشاركة", [
    ["#22b573", P('<path d="M5 20V10M12 20V4M19 20v-7"/>'), "استطلاع", openPollMaker],
    ["#f08c2e", P('<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'), "غرفة", openSharePicker],
    ["#2f8cff", P('<rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="9" cy="11" r="2.2"/><path d="M5.8 16c.6-1.4 1.8-2 3.2-2s2.6.6 3.2 2M14.5 10h4M14.5 13.5h3"/>'), "مشاركة الكود", openCodeShare]
  ], 3);
  c.append(wrap); $("msheet").hidden = false;
};
// ───── مستندات: رفع على قطع (نفس نظام الفيديو) ─────
const DOC_MAX = 15 * 1024 * 1024;
const docSize = n => n >= 1048576 ? arN((n / 1048576).toFixed(1)) + " ميجا" : arN(Math.max(1, Math.round(n / 1024))) + " كيلو";
const DOC_COL = { pdf: "#e5484d", doc: "#2f7de1", docx: "#2f7de1", xls: "#1f9d55", xlsx: "#1f9d55", csv: "#1f9d55", ppt: "#e8702a", pptx: "#e8702a", zip: "#7c5cff", rar: "#7c5cff", "7z": "#7c5cff", txt: "#5b6b78", apk: "#3ddc84" };
// ───── رفع المستند: الفقاعة بتظهر في الشات فورًا وعليها دايرة التقدّم (زي واتساب) ─────
const DUP = (() => {
  const jobs = new Map(), R = 20, CIRC = 2 * Math.PI * R, NS = "http://www.w3.org/2000/svg";
  const PC = n => arN(Math.round(n)) + "٪";
  function build(job) {
    const row = el("div", "row me"), b = el("div", "b dup"), box = el("div", "dcard");
    const nm = job.name, ext = (nm.includes(".") ? nm.split(".").pop() : "").toLowerCase().slice(0, 4);
    const ic = el("div", "dic", ext ? ext.toUpperCase() : "📄"); ic.style.background = DOC_COL[ext] || "#5b6b78";
    const t = el("div", "dtx"), n = el("b", "", nm), sm = el("small"); n.dir = "auto"; t.append(n, sm);
    const x = el("button", "dact dupx"); x.type = "button";
    const ring = document.createElementNS(NS, "svg"); ring.setAttribute("viewBox", "0 0 48 48"); ring.setAttribute("class", "upr");
    ring.innerHTML = '<circle class="bg" cx="24" cy="24" r="' + R + '"/><circle class="fg" cx="24" cy="24" r="' + R + '" stroke-dasharray="' + CIRC.toFixed(2) + '" stroke-dashoffset="' + CIRC.toFixed(2) + '"/>';
    const xl = el("span", "dupxl", "✕"); x.append(ring, xl);
    x.onclick = e => { e.stopPropagation(); if (job.state === "err") run(job); else if (job.state === "up") cancel(job); };
    box.onclick = e => e.stopPropagation();
    box.append(ic, t, x); b.append(box);
    const tm = el("div", "t"), sc = el("span", "pend"); sc.innerHTML = typeof SVG_CLOCK !== "undefined" ? SVG_CLOCK : "⏱";
    tm.append(sc, el("span", "", new Date(job.t0).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })));
    b.append(tm); row.append(b);
    job.row = row; job.el = { ring, fg: ring.querySelector(".fg"), x, xl, sm }; paint(job); return row;
  }
  function paint(job) {
    const e = job.el; if (!e) return; const st = job.state, pct = Math.max(0, Math.min(100, job.pct || 0)), ind = st === "post" || (st === "up" && !pct);
    e.ring.classList.toggle("spin", ind); e.fg.style.strokeDashoffset = (CIRC * (1 - (ind ? .28 : pct / 100))).toFixed(2);
    e.x.classList.toggle("err", st === "err"); e.xl.textContent = st === "err" ? "↻" : "✕"; e.x.hidden = st === "post";
    e.x.setAttribute("aria-label", st === "err" ? "إعادة المحاولة" : "إلغاء");
    const sz = docSize(job.file.size);
    e.sm.textContent = st === "err" ? (job.err || "اتقطع الرفع") + " · اضغط ↻" : st === "post" ? "بيتبعت…" : (pct ? PC(pct) + " · " : "") + sz;
  }
  function show(job) { if (job.rid !== room) return; const box = $("msgs"); if (!box) return; if (!job.row) build(job); box.append(job.row); box.scrollTop = box.scrollHeight; }
  function drop(job) { jobs.delete(job.id); if (job.row) job.row.remove(); }
  function cancel(job) {
    job.cancel = true; drop(job); flash("اتلغى رفع المستند");
    if (!job.running && job.mid && db) for (let i = 0; i < Math.max(1, Math.ceil(job.file.size / RAW_CH)); i++) db.collection("media").doc(i ? job.mid + "_" + i : job.mid).delete().catch(() => {});
  }
  async function run(job) {
    if (job.running) return; job.running = true; job.cancel = false; job.state = "up"; paint(job);
    try { WL.on(); } catch (_) {}
    try {
      if (!job.mid) job.mid = db.collection("media").doc().id;
      await uploadChunks(job.file, "application/octet-stream", job.ui, job.name.slice(0, 22), { id: job.mid, skip: job.done, onChunk: i => job.done.add(i) });
      if (job.cancel) throw new Error("cancel");
      job.state = "post"; job.pct = 100; paint(job);
      await postMedia({ mid: job.mid, mk: "doc", fname: job.name, fsize: job.file.size, ftype: String(job.file.type || "").slice(0, 80) }, job.rid);
      job.state = "done"; setTimeout(() => drop(job), 700);
    } catch (e) {
      if (job.cancel || (e && e.message === "cancel")) drop(job);
      else if (e && e.code === "permission-denied") { drop(job); flash("⚠️ قواعد Firebase مش مسمحة برفع المستندات (collection media)."); }
      else { job.state = "err"; job.err = navigator.onLine === false ? "مفيش نت" : "اتقطع الرفع"; paint(job); }
    } finally { job.running = false; try { WL.off(); } catch (_) {} }
  }
  function make(o) {
    const job = { id: "d" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), state: "up", pct: 0, t0: Date.now(), done: new Set(), ...o };
    job.ui = { get cancel() { return job.cancel; }, set(_t, p) { if (p != null) job.pct = p; paint(job); } };
    jobs.set(job.id, job); show(job); return job;
  }
  const kick = () => [...jobs.values()].forEach(j => { if (j.state === "err" && !j.running) run(j); });
  window.addEventListener("online", kick);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) kick(); });
  return { make, run, mount: (list, box) => { for (const j of jobs.values()) { if (j.rid !== room) continue; if (j.state === "done" && j.mid && list.some(m => m.mid === j.mid)) { if (j.row) j.row.remove(); continue; } if (!j.row) build(j); box.append(j.row); } } };
})();
async function sendDocFile(file, rid) {
  rid = rid || room; if (!mediaGuard(rid)) return;
  const nm = String(file.name || "مستند").slice(0, 80);
  await DUP.run(DUP.make({ rid, name: nm, file }));   // الفقاعة بتظهر فورًا والتقدّم عليها
}
$("aDoc").onchange = async e => { const f = [...e.target.files].slice(0, 3); e.target.value = ""; for (const x of f) await sendDocFile(x, room); };
function docBox(m) {
  const nm = String(m.fname || "مستند"), ext = (nm.includes(".") ? nm.split(".").pop() : "").toLowerCase().slice(0, 4);
  const box = el("div", "dcard"), ic = el("div", "dic", ext ? ext.toUpperCase() : "📄"); ic.style.background = DOC_COL[ext] || "#5b6b78";
  const t = el("div", "dtx"), n = el("b", "", nm); n.dir = "auto"; t.append(n, el("small", "", docSize(+m.fsize || 0) + (ext ? " · " + ext.toUpperCase() : "")));
  const act = el("button", "dact"); act.type = "button"; act.setAttribute("aria-label", "تحميل المستند");
  const DL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 20h14"/></svg>';
  act.innerHTML = DL; let busy = false;
  const go = async () => {
    if (selMode || busy) return; busy = true; act.textContent = "…";
    try {
      const u = await getMedia(m.mid, f => { act.textContent = Math.round(f * 100) + "%"; }); if (!u) throw 0;
      const b = await (await fetch(u)).blob(), url = URL.createObjectURL(new Blob([b], { type: m.ftype || "application/octet-stream" }));
      const a = document.createElement("a"); a.href = url; a.download = nm; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000);
      act.textContent = "✓"; setTimeout(() => { act.innerHTML = DL; }, 2200);
    } catch (e) { flash("تعذّر تحميل المستند"); act.innerHTML = DL; }
    busy = false;
  };
  box.onclick = e => { e.stopPropagation(); go(); };
  box.append(ic, t, act); return box;
}
// ───── استطلاع رأي ─────
// الأصوات بتتخزّن في votes.<uid>. لو قواعد Firebase رفضت الحقل ده، بنخزّنها احتياطي في reacts.<uid> بصيغة "p:0,2"
// (التفاعلات كلها بتتفلتر بـ EMO فالصيغة دي مش بتظهر كإيموجي) — فالاستطلاع يشتغل حتى لو القواعد ما اتعدّلتش.
function pollVotes(m) {
  const V = {}, raw = m.votes || {}, ok = a => (Array.isArray(a) ? a : []).filter(n => Number.isInteger(n) && n >= 0);
  Object.keys(raw).forEach(u => { if (Array.isArray(raw[u])) V[u] = ok(raw[u]); });
  Object.entries(m.reacts || {}).forEach(([u, k]) => { if (typeof k === "string" && k.indexOf("p:") === 0) V[u] = ok(k.slice(2).split(",").filter(Boolean).map(Number)); });
  return V;
}
function openPollMaker() {
  const rid = room; if (!mediaGuard(rid)) return;
  const c = $("mcard"); c.textContent = ""; const w = el("div", "plm");
  w.append(el("div", "agr"), el("h3", "atit", "📊 استطلاع رأي"));
  const qw = el("div", "plqw"), q = el("textarea", "plq"), qn = el("small", "plcnt", "٠/١٢٠"); q.rows = 2; q.maxLength = 120; q.placeholder = "اسأل سؤالك…"; q.dir = "auto"; qw.append(q, qn);
  const ol = el("div", "plo"), add = el("button", "pla", "＋ أضف اختيار"); add.type = "button";
  const err = el("div", "plerr"); err.hidden = true;
  const mt = el("label", "plt"), mc = el("input"); mc.type = "checkbox"; mc.className = "tgl"; mt.append(el("span", "", "السماح بأكتر من اختيار"), mc);
  const row = el("div", "plb"), cn = el("button", "plc", "إلغاء"), go = el("button", "plg", "إرسال الاستطلاع"); cn.type = go.type = "button"; row.append(cn, go);
  const vals = () => [...new Set([...ol.querySelectorAll("input")].map(i => i.value.trim()).filter(Boolean))];
  const check = () => { const okq = !!q.value.trim(), okc = vals().length >= 2; go.disabled = !(okq && okc); go.classList.toggle("off", go.disabled); err.hidden = true; qn.textContent = arN(q.value.length) + "/" + arN(120); };
  const sync = () => { add.hidden = ol.children.length >= 6; ol.classList.toggle("min", ol.children.length <= 2); [...ol.children].forEach((r, i) => { r.firstChild.placeholder = "اختيار " + arN(i + 1); }); check(); };
  const mk = () => {
    const r = el("div", "plr"), i = el("input"); i.type = "text"; i.maxLength = 40; i.dir = "auto"; i.enterKeyHint = "next";
    const x = el("button", "plx", "✕"); x.type = "button"; x.setAttribute("aria-label", "حذف الاختيار");
    x.onclick = () => { if (ol.children.length > 2) { r.remove(); sync(); } };
    i.oninput = check;
    i.onkeydown = e => { if (e.key !== "Enter") return; e.preventDefault(); const n = r.nextElementSibling; if (n) n.firstChild.focus(); else if (ol.children.length < 6) mk().focus(); else go.focus(); };
    r.append(i, x); ol.append(r); sync(); return i;
  };
  mk(); mk(); add.onclick = () => mk().focus(); q.oninput = check;
  cn.onclick = () => { $("msheet").hidden = true; };
  let sending = false;
  go.onclick = async () => {
    if (sending) return;
    const qq = q.value.trim(), opts = vals();
    if (!qq) { q.focus(); return; } if (opts.length < 2) { err.textContent = "اكتب اختيارين مختلفين على الأقل"; err.hidden = false; return; }
    if (!mediaGuard(rid)) { $("msheet").hidden = true; return; }
    sending = true; go.disabled = true; go.textContent = "جاري الإرسال…";
    const post = postMedia({ poll: { q: qq, opts: opts.slice(0, 6), multi: !!mc.checked } }, rid);
    try {
      // لو الإرسال فشل بسرعة (صلاحيات/قواعد) نفضل في الشاشة ونقول السبب؛ لو بطيء (نت ضعيف) نقفل والرسالة هتتبعت لوحدها
      const r = await Promise.race([post.then(() => "ok"), new Promise(x => setTimeout(() => x("slow"), 3500))]);
      if (r === "slow") post.catch(e => { console.warn("poll send", e); flash(errMsg(e)); });
      $("msheet").hidden = true;
    } catch (e) {
      console.warn("poll send", e); sending = false; go.disabled = false; go.textContent = "إرسال الاستطلاع";
      err.textContent = (e && e.custom ? e.message : errMsg(e)) || "الاستطلاع ماتبعتش، جرّب تاني."; err.hidden = false;
    }
  };
  w.append(qw, el("div", "asl", "الاختيارات"), ol, add, mt, err, row); c.append(w); check(); $("msheet").hidden = false; setTimeout(() => q.focus(), 250);
}
function pollBox(m) {
  const P = m.poll || {}, V = pollVotes(m), opts = Array.isArray(P.opts) ? P.opts : [], mine = V[myId] || [];
  const voters = Object.values(V).filter(a => a.length), total = voters.length;
  const cnt = opts.map((_, i) => voters.filter(a => a.includes(i)).length), top = Math.max(0, ...cnt);
  const box = el("div", "poll"), q = el("div", "pq", P.q || "استطلاع"); q.dir = "auto";
  box.append(q, el("div", "ph", P.multi ? "اختار أكتر من إجابة" : "اختار إجابة واحدة"));
  opts.forEach((t, i) => {
    const on = mine.includes(i), r = el("button", "po" + (on ? " on" : "") + (top && cnt[i] === top ? " lead" : "")); r.type = "button"; r.setAttribute("aria-pressed", on ? "true" : "false");
    const pct = total ? Math.round(cnt[i] / total * 100) : 0, fill = el("i", "pf"); fill.style.width = pct + "%";
    const ck = el("span", "pk", on ? "✓" : ""), lb = el("span", "pl", t); lb.dir = "auto";
    const nb = el("b", "pn", arN(cnt[i])); if (total) nb.append(el("small", "", arN(pct) + "٪"));
    r.append(fill, ck, lb, nb);
    r.onclick = e => { e.stopPropagation(); if (!selMode) votePoll(m, i); }; box.append(r);
  });
  const ft = el("button", "pft", total ? arN(total) + " صوت · التفاصيل" : "مفيش أصوات لسه، كون أول واحد"); ft.type = "button"; ft.onclick = e => { e.stopPropagation(); if (total && !selMode) openVoters(m); }; box.append(ft);
  return box;
}
let _voteLock = 0;
async function votePoll(m, i) {
  if (Date.now() - _voteLock < 220) return; _voteLock = Date.now();
  const P = m.poll || {}, n = Array.isArray(P.opts) ? P.opts.length : 0; if (!(i >= 0 && i < n)) return;
  const cur = pollVotes(m)[myId] || [];
  const next = P.multi ? (cur.includes(i) ? cur.filter(x => x !== i) : [...cur, i].sort((a, b) => a - b)) : (cur.length === 1 && cur[0] === i ? [] : [i]);
  vcSnd(next.includes(i) ? "react" : "tap");
  const ref = msgCol(m.room || room).doc(m.id);
  try { await ref.update({ ["votes." + myId]: next }); }
  catch (e) {
    if (e && e.code === "permission-denied") {
      try { await ref.update({ ["reacts." + myId]: next.length ? "p:" + next.join(",") : FV().delete() }); return; } catch (e2) { e = e2; }
    }
    console.warn("vote", e); flash(errMsg(e));
  }
}
function openVoters(m) {
  const c = $("mcard"); c.textContent = ""; const w = el("div", "plm"), V = pollVotes(m);
  const h = el("h3", "atit", "📊 " + (m.poll.q || "")); h.dir = "auto"; w.append(el("div", "agr"), h);
  (m.poll.opts || []).forEach((t, i) => {
    const us = Object.keys(V).filter(u => V[u].includes(i)), g = el("div", "pvg"), hd = el("div", "pvh"), tl = el("span", "", t); tl.dir = "auto"; hd.append(tl, el("b", "", arN(us.length)));
    g.append(hd); us.forEach(u => { const r = el("div", "pvu"); try { const av = avatar(profileFor(u, m.room || room)); av.classList.add("pvav"); r.append(av); } catch (_) {} r.append(el("span", "", u === myId ? "أنت" : nameOf(u, m.room || room))); g.append(r); });
    if (!us.length) g.append(el("div", "pvu mut", "—")); w.append(g);
  });
  const x = el("button", "plc", "إغلاق"); x.type = "button"; x.onclick = () => { $("msheet").hidden = true; }; w.append(x); c.append(w); $("msheet").hidden = false;
}
// تعطيل + لما الكتابة ممنوعة
setInterval(() => { try { updateComposer(); } catch (e) {} }, 20000);
setInterval(() => { $("plusBtn").disabled = $("camBtn").disabled = !db || !!writeBlock(curR()); }, 400);

/* Very Chat — التخزين والتحديث والإيموجي والدخول وبدء التشغيل */
// ───── إدارة التخزين: عرض حجم البيانات المحمّلة ومسحها ─────
const fmtSize = b => b >= 1048576 ? (b / 1048576).toFixed(1) + " ميجا" : Math.max(1, Math.round(b / 1024)) + " كيلو";
const fmtParts = b => b >= 1048576 ? [(b / 1048576).toFixed(1), "ميجا"] : [String(Math.max(1, Math.round(b / 1024))), "كيلو"];
async function stoUI() {
  const box = $("stoInfo"); box.textContent = "جاري الحساب…";
  try {
    const e = navigator.storage && navigator.storage.estimate ? await navigator.storage.estimate() : null;
    let mem = 0; MEDIA.forEach(v => { mem += (v || "").length; });
    box.textContent = "";
    if (e && e.usage != null) {
      const pr = fmtParts(e.usage), top = el("div", "sto-top"); top.append(el("b", "", pr[0]), el("span", "", pr[1]));
      if (e.quota) top.append(el("small", "", "من " + fmtSize(e.quota)));
      const bar = el("div", "sto-bar"), fill = el("i"); fill.style.width = (e.quota ? Math.max(3, Math.min(100, e.usage / e.quota * 100)) : 3) + "%"; bar.append(fill);
      box.append(top, bar);
    }
    const chip = (t, v) => { const c = el("span", "", t); c.append(el("b", "", String(v))); return c; };
    const st = await idbStats(), ch = el("div", "sto-chips"); ch.append(chip("وسائط حمّلتها", DLD.size), chip("محفوظة على جهازك", st.n + (st.bytes ? " (" + fmtSize(st.bytes) + ")" : "")));
    box.append(ch);
  } catch (err) { box.textContent = "ماقدرتش أحسب الحجم."; }
}
const withTimeout = (p, ms) => Promise.race([Promise.resolve(p).catch(() => {}), new Promise(r => setTimeout(r, ms))]);
// بيتنفذ في أول تشغيل قبل Firebase: بيمسح قواعد البيانات المحلية بدون ما يعلّق
async function preWipe() {
  let flag = ""; try { flag = localStorage.getItem("vc_wipe") || ""; localStorage.removeItem("vc_wipe"); } catch (e) {}
  if (!flag) return;
  try {
    if (indexedDB.databases) {
      const dbs = await withTimeout(indexedDB.databases(), 1500) || [];
      await Promise.all(dbs.filter(d => d.name && (d.name.startsWith("firestore/") || (flag === "all" && d.name.startsWith("firebase")))).map(d => withTimeout(new Promise(r => { const q = indexedDB.deleteDatabase(d.name); q.onsuccess = q.onerror = q.onblocked = r; }), 2000)));
    }
  } catch (e) {}
  if (flag === "all") { try { localStorage.clear(); sessionStorage.clear(); } catch (e) {} }
}
async function wipeStorage(everything) {
  await withTimeout(idbClear(), 3000); MEDIA.clear(); MEDIA_P.clear(); DLD.clear(); try { localStorage.removeItem("vc_dl"); } catch (e) {}
  try { localStorage.setItem("vc_wipe", everything ? "all" : "cache"); } catch (e) {}
  await withTimeout((async () => { if (window.caches) await Promise.all((await caches.keys()).map(k => caches.delete(k))); })(), 1500);
  if (everything) await withTimeout((async () => { const rs = await navigator.serviceWorker.getRegistrations(); await Promise.all(rs.map(r => r.unregister())); })(), 1500);
  try { db && db.terminate(); } catch (e) {}
}
$("stoClear").onclick = async () => {
  const b = $("stoClear"); b.disabled = true; b.textContent = "جاري المسح…";
  await wipeStorage(false); b.textContent = "✓ اتمسح، جاري إعادة التحميل…"; setTimeout(() => location.reload(), 300);
};
let stoArm = 0;
$("stoAll").onclick = async () => {
  const b = $("stoAll");
  if (!stoArm) { stoArm = setTimeout(() => { stoArm = 0; b.textContent = "🗑 مسح كل بيانات التطبيق وتسجيل الخروج"; }, 4000); b.textContent = "⚠️ اضغط تاني للتأكيد (هيسجّل خروجك)"; return; }
  clearTimeout(stoArm); b.disabled = true; b.textContent = "جاري المسح…";
  await wipeStorage(true); setTimeout(() => location.reload(), 300);
};

// ───── تحديث تلقائي: لو في نسخة أحدث على الموقع بتتحمّل لوحدها (من غير تسجيل خروج) ─────
const BUILD = ((document.querySelector('meta[name="vc-build"]') || {}).content || "").trim();
let updating = false;
async function checkUpdate() {
  if (!BUILD || updating || !/^https?:/.test(location.protocol) || !navigator.onLine) return;
  try {
    const r = await withTimeout(fetch(PAGE_URL + "?_=" + Date.now(), { cache: "no-store" }), 6000); if (!r || !r.ok) return;
    const m = (await r.text()).match(/name="vc-build" content="([^"]+)"/); if (!m || m[1] === BUILD) return;
    updating = true; setStatus("🔄 فيه تحديث جديد، جاري التحميل…");
    await withTimeout((async () => { if (window.caches) await Promise.all((await caches.keys()).map(k => caches.delete(k))); const rs = await navigator.serviceWorker.getRegistrations(); await Promise.all(rs.map(x => x.update().catch(() => {}))); })(), 2500);
    location.replace(PAGE_URL + "?v=" + m[1] + location.hash);
  } catch (e) {}
}
setTimeout(checkUpdate, 1500); setInterval(checkUpdate, 120000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) checkUpdate(); });

// ───── لوحة الإيموجي ─────
const EMO_CATS = [
  ["😀", "😀 😃 😄 😁 😆 😅 😂 🤣 🥲 ☺️ 😊 😇 🙂 🙃 😉 😌 😍 🥰 😘 😗 😙 😚 😋 😛 😝 😜 🤪 🤨 🧐 🤓 😎 🥸 🤩 🥳 😏 😒 😞 😔 😟 😕 🙁 😣 😖 😫 😩 🥺 😢 😭 😤 😠 😡 🤬 🤯 😳 🥵 🥶 😱 😨 😰 😥 😓 🤗 🤔 🫣 🤭 🫢 🤫 🫠 🤥 😶 😐 😑 😬 🫨 🙄 😯 😦 😧 😮 😲 🥱 😴 🤤 😪 😵 🤐 🥴 🤢 🤮 🤧 😷 🤒 🤕"],
  ["👍", "👍 👎 👌 🤌 🤏 ✌️ 🤞 🫰 🤟 🤘 🤙 👈 👉 👆 👇 ☝️ ✋ 🤚 🖐️ 🖖 👋 🤝 👏 🙌 🫶 👐 🤲 🙏 ✍️ 💪 🦾 🫵 👀 👁️ 👅 👄 🧠 🫀 🦷 🦴"],
  ["❤️", "❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❤️‍🔥 💕 💞 💓 💗 💖 💘 💝 💟 ✨ 💫 ⭐ 🌟 🔥 💥 💯 ✅ ❌ ❗ ❓ 💤 🎉 🎊 🎁 🏆 🥇 👑 💎"],
  ["🐱", "🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🙈 🙉 🙊 🐔 🐧 🐦 🦅 🦉 🦇 🐺 🐴 🦄 🐝 🦋 🐢 🐍 🐙 🐬 🐳 🦈 🌹 🌸 🌻 🌴 🌵 🍀 🌍 🌙 ☀️ ⛅ 🌈 ⚡ ❄️"],
  ["🍕", "🍏 🍎 🍉 🍇 🍓 🍒 🍑 🥭 🍍 🥥 🥝 🍅 🥑 🌽 🌶️ 🥔 🍞 🧀 🍳 🥞 🍔 🍟 🌭 🍕 🌮 🌯 🥙 🍗 🍖 🍣 🍜 🍝 🍰 🎂 🍩 🍪 🍫 🍿 🍦 ☕ 🍵 🥤 🍹 🍺"],
  ["⚽", "⚽ 🏀 🏈 ⚾ 🎾 🏐 🏓 🥊 🎮 🕹️ 🎯 🎲 🎧 🎤 🎸 🎹 🥁 🎬 📷 📱 💻 ⌚ 💡 🔋 🚗 🚕 🏍️ ✈️ 🚀 🛸 🏠 🏝️ 🕌 🕋 ⏰ 💰 📚 ✏️ 🔒 🔑"]
];
const EMO_NAMES = ["وجوه ومشاعر", "إيدين وجسم", "قلوب ورموز", "حيوانات وطبيعة", "أكل وشرب", "أنشطة وأشياء"];
function jumboN(m) {
  if (m.mid || m.img || m.vid || m.share || m.ucard || m.reply || m.fwd || m.audio) return 0;
  const t = String(m.text || "").trim(); if (!t || t.length > 40) return 0;
  try { if (!/^(?:\p{Extended_Pictographic}|\p{Regional_Indicator}|\p{Emoji_Modifier}|[\u200d\ufe0f\u20e3\s])+$/u.test(t)) return 0; } catch (_) { return 0; }
  const n = window.Intl && Intl.Segmenter ? Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(t.replace(/\s+/g, ""))).length : Array.from(t).length;
  return n >= 1 && n <= 3 ? n : 0;
}
let emoRec = []; try { emoRec = JSON.parse(localStorage.getItem("emoRec") || "[]"); } catch (_) {}
function insEmo(e) {
  const i = $("inp"), a = i.selectionStart == null ? i.value.length : i.selectionStart, z = i.selectionEnd == null ? a : i.selectionEnd;
  i.value = i.value.slice(0, a) + e + i.value.slice(z); try { i.setSelectionRange(a + e.length, a + e.length); } catch (x) {}
  emoRec = [e, ...emoRec.filter(x => x !== e)].slice(0, 24); try { localStorage.setItem("emoRec", JSON.stringify(emoRec)); } catch (_) {}
}
function delEmo() {
  const i = $("inp"), p = i.selectionStart == null ? i.value.length : i.selectionStart, s = i.value.slice(0, p);
  const parts = window.Intl && Intl.Segmenter ? Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(s), x => x.segment) : Array.from(s);
  const n = parts.length ? parts[parts.length - 1].length : 0; i.value = i.value.slice(0, p - n) + i.value.slice(p); try { i.setSelectionRange(p - n, p - n); } catch (x) {}
}
function drawEmo() {
  const tabs = $("emoTabs"), grid = $("emoGrid"); tabs.textContent = ""; grid.textContent = "";
  const secs = []; if (emoRec.length) secs.push(["🕘", "المستخدمة مؤخراً", emoRec]);
  EMO_CATS.forEach((c, i) => secs.push([c[0], EMO_NAMES[i], c[1].split(" ")]));
  const es = [], ts = [];
  secs.forEach((s, i) => {
    const sec = el("div", "es"), g = el("div", "eg"); sec.append(el("div", "eh", s[1]), g);
    s[2].forEach(e => { const b = el("button", "", e); b.type = "button"; b.onclick = () => { insEmo(e); }; g.append(b); });
    grid.append(sec); es.push(sec);
    const t = el("button", i ? "" : "on", s[0]); t.type = "button"; t.setAttribute("aria-label", s[1]); t.onclick = () => grid.scrollTo({ top: sec.offsetTop, behavior: "smooth" }); tabs.append(t); ts.push(t);
  });
  const bk = el("button", "ebk", "⌫"); bk.type = "button"; bk.setAttribute("aria-label", "مسح"); bk.onclick = delEmo; tabs.append(bk);
  grid.onscroll = () => { let k = 0; es.forEach((s, i) => { if (s.offsetTop <= grid.scrollTop + 12) k = i; }); ts.forEach((t, i) => t.classList.toggle("on", i === k)); };
  grid.scrollTop = emoRec.length ? 0 : 0;
}
function closeEmo() { const p = $("emoPanel"); if (p.hidden || p.classList.contains("out")) return; p.classList.add("out"); $("emoBtn").innerHTML = SVG_SMILE; setTimeout(() => { p.hidden = true; p.classList.remove("out"); }, 170); }
$("emoBtn").onclick = () => { const p = $("emoPanel"); if (!p.hidden) { closeEmo(); $("inp").focus(); return; } $("inp").blur(); p.hidden = false; drawEmo(); $("emoBtn").innerHTML = SVG_KB; const m = $("msgs"); setTimeout(() => { m.scrollTop = m.scrollHeight; }, 60); };
$("f").addEventListener("submit", closeEmo, true);
$("inp").addEventListener("focus", closeEmo);

$("f").onsubmit = async e => {
  e.preventDefault();
  const text = $("inp").value.trim(); if (!text || !db) return;
  { const c0 = curR(), w0 = writeBlock(c0) || (c0 && c0.noLinks && !adminOf(c0) && LINK_RE.test(text) ? "🔗 المالك منع الروابط في الغرفة دي" : ""); if (w0) { setStatus(w0); return; } }
  { const c1 = curR(); if (c1 && !adminOf(c1)) { const low = text.toLowerCase(); if (c1.maxLen && text.length > c1.maxLen) { setStatus("📏 الرسالة أطول من المسموح (" + c1.maxLen + " حرف)"); return; } if ((c1.badWords || []).some(w => w && low.includes(w))) { setStatus("🚫 الرسالة فيها كلمة ممنوعة في الغرفة دي"); return; } } }
  if (!editingId) {
    const cr = curR();
    const wait = cr && !adminOf(cr) && cr.slow ? cr.slow - (Date.now() - (lastSent[room] || 0)) / 1000 : 0;
    if (wait > 0) { setStatus("🐢 وضع بطيء: استنى " + Math.ceil(wait) + " ثانية"); return; }
    lastSent[room] = Date.now();
  }
  $("inp").value = "";
  if (editingId) {
    const id = editingId; cancelEdit();
    try { await msgCol(room).doc(id).update({ text, edited: true }); }
    catch (err) { setStatus("ماقدرتش أعدّل الرسالة."); }
    return;
  }
  const doc = { ...mBase(room), text, uid: myId, ts: Date.now() }; if (replyTo) { doc.reply = replyTo; clearReply(); }
  try { await sendDoc(doc); }
  catch (err) { if (err && err.custom) { setStatus(err.message); return; } setStatus("الرسالة ماتبعتتش. غالباً مفيش صلاحية كتابة، اتأكد من النت ومن قواعد Firebase."); }
};

const lerr = t => { $("lErr").textContent = t; $("lErr").hidden = !t; };
const authMsg = e => ({ "auth/unauthorized-domain": "الدومين ده مش مضاف: Firebase ← Authentication ← Settings ← Authorized domains", "auth/operation-not-allowed": "فعّل الطريقة دي من Firebase ← Authentication ← Sign-in method", "auth/network-request-failed": "مفيش نت، جرّب تاني", "auth/popup-closed-by-user": "", "auth/cancelled-popup-request": "", "auth/operation-not-supported-in-this-environment": "افتح الصفحة من المتصفح بلينك http/https، مش من ملف على الجهاز" })[e.code] ?? ("حصلت مشكلة: " + (e.code || e.message));
function askLogin() {
  return new Promise(res => {
    $("lLogo").innerHTML = logo("lgL"); $("login").hidden = false;
    const done = u => { $("login").hidden = true; res(u); }, busy = v => { $("gBtn").disabled = v; };
    $("gBtn").onclick = async () => {
      busy(true); lerr("");
      try { done((await firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider())).user); }
      catch (e) {
        if (e.code === "auth/popup-blocked") { try { await firebase.auth().signInWithRedirect(new firebase.auth.GoogleAuthProvider()); return; } catch (e2) { e = e2; } }
        lerr(authMsg(e)); busy(false);
      }
    };
  });
}
function showPic(av, name) {
  const pic = $("lbPic"); pic.textContent = ""; pic.style.background = ""; pic.classList.remove("emo");
  const src = av._photo || (av.querySelector("img") && av.querySelector("img").src);
  if (okPhoto(src)) { const i = new Image(); i.alt = ""; i.src = src; pic.append(i); }
  else { pic.classList.add("emo"); pic.style.background = av.style.background || "var(--line)"; pic.textContent = av.textContent; }
  $("lbName").textContent = name || av.dataset.name || ""; $("lb").hidden = false;
}
const closePic = () => { $("lb").hidden = true; if (!$("pview").hidden) $("pvX").click(); };
$("lb").onclick = closePic;
document.addEventListener("keydown", e => { if (e.key === "Escape") closePic(); });
document.addEventListener("click", e => {
  const av = e.target.closest(".av"); if (!av || selMode) return;
  if (av.id === "meAv" || av.closest("#dlist, #hRoom, .chip, #lb")) return;
  if (av.closest("button") && av.id !== "pvAv") return;
  const ow = av.closest("[data-uid]");
  if (ow && ow.dataset.uid !== myId) { const bb = ow.querySelector(".b"); if (bb && Date.now() - (bb._f || 0) < 800) return; e.stopPropagation(); e.preventDefault(); peerTap(ow.dataset.uid, av.closest("#rinfo") ? infoId : room); return; }
  const nm = (av.closest(".ri-mem") && av.closest(".ri-mem").querySelector("b")) || (av.closest(".row") && av.closest(".row").querySelector(".n"));
  showPic(av, av.dataset.name || (nm ? nm.textContent : (av.classList.contains("ri-av") && document.querySelector(".ri-hero h2") ? document.querySelector(".ri-hero h2").textContent : "")));
}, true);

// ───── زرار الرجوع: يقفل اللي مفتوح بدل ما يطلع من التطبيق ─────
(function () {
  const ids = ["vview", "pview", "lb", "msheet", "reqView", "sheet", "drawer", "rinfo", "selBar", "emoPanel"];
  const open = id => { const e = $(id); return !!e && !e.hidden; };
  const forced = () => open("sheet") && sheetMode === "me" && !$("cancelSheet").offsetParent;
  const closers = { vview: () => { $("vvX").click(); }, pview: () => { $("pvX").click(); }, reqView: () => { $("reqView").hidden = true; }, lb: () => { $("lb").hidden = true; }, msheet: () => { $("msheet").hidden = true; }, sheet: () => { $("sheet").hidden = true; }, drawer: () => closeDrawer(), rinfo: () => closeInfo(), selBar: () => exitSel(), emoPanel: () => { $("emoPanel").hidden = true; } };
  let pushed = 0, skip = 0;
  const count = () => ids.filter(open).length + (room !== "general" ? 1 : 0);
  window.syncHistory = function () {
    const n = count();
    while (pushed < n) { history.pushState({ vc: 1 }, ""); pushed++; }
    if (pushed > n) { const k = pushed - n; pushed = n; skip++; history.go(-k); }
  };
  window.addEventListener("popstate", () => {
    if (skip > 0) { skip--; return; }
    if (pushed > 0) pushed--;
    const top = ids.find(open);
    if (top) { if (top === "sheet" && forced()) { history.pushState({ vc: 1 }, ""); pushed++; return; } closers[top](); }
    else if (room !== "general") openRoom("general");
    syncHistory();
  });
  const mo = new MutationObserver(() => syncHistory());
  ids.forEach(id => { const e = $(id); if (e) mo.observe(e, { attributes: true, attributeFilter: ["hidden"] }); });
})();
let started = false, starting = false;
async function start() {
  if (started || starting) return; starting = true;
  if (!FIREBASE_CONFIG.apiKey || FIREBASE_CONFIG.apiKey.startsWith("PASTE")) { setStatus("لازم تحط إعدادات Firebase في أول ملف الصفحة (FIREBASE_CONFIG)."); $("sendBtn").disabled = true; return; }
  try {
    await preWipe();
    if (!(firebase.apps || []).length) firebase.initializeApp(FIREBASE_CONFIG);
if (APPCHECK_KEY && firebase.appCheck) { try { firebase.appCheck().activate(APPCHECK_KEY, true); } catch (_) {} }
    const au = firebase.auth(); au.getRedirectResult().catch(e => lerr(authMsg(e)));
    let user = await new Promise(res => { const un = au.onAuthStateChanged(u => { un(); res(u); }); });
    if (!user) user = await askLogin();
    myId = user.uid; db = firebase.firestore(); try { await db.enablePersistence({ synchronizeTabs: true }); } catch (e) {}
  } catch (e) { setStatus(e.code === "auth/operation-not-allowed" || e.code === "auth/admin-restricted-operation" ? "فعّل تسجيل الدخول Anonymous من Firebase ← Authentication ← Sign-in method." : "ماقدرتش أتصل بـ Firebase: " + (e.code || e.message)); $("sendBtn").disabled = true; starting = false; setTimeout(() => { if (!started) start(); }, 6000); return; }
  started = true; starting = false; $("sendBtn").disabled = false;
  db.collection("profiles").onSnapshot(s => {
    profiles = {}; s.docs.forEach(d => profiles[d.id] = d.data());
    refreshMe(); ensureMyCode(); paintMyCode();
    if (!loaded) { loaded = true; if (!profiles[myId]) openProfile(); }
    if (lastList.length) render(lastList);
  }, () => { loaded = true; });
  db.collection("rprofiles").onSnapshot(s => {
    rprofiles = {}; s.docs.forEach(d => { rprofiles[d.id] = d.data(); });
    refreshMe(); if (!rpLoaded) { rpLoaded = true; maybePersona(); }
    if (lastList.length) render(lastList);
  }, () => { rpLoaded = true; });
  syncRecent(); pushInit();
  document.addEventListener("visibilitychange", () => { if (!document.hidden && lastList.length) render(lastList); });
  db.collection("reads").onSnapshot(s => {
    reads = {}; s.docs.forEach(d => { reads[d.id] = d.data(); });
    if (!readsLoaded) { readsLoaded = true; myReads = { ...(reads[myId] || {}) }; }
    if (lastList.length) render(lastList);
  }, () => {});
  watchRooms();
  db.collection("dms").where("members", "array-contains", myId).onSnapshot(s => {
    const prevClr = dmClearedAt(dms[room]); dms = {}; s.docs.forEach(d => { dms[d.id] = { ...d.data(), id: d.id }; });
    s.docChanges().forEach(ch => { const d = ch.doc.data(); if (!dmFirst && ch.type !== "removed" && d.last && d.last.uid !== myId && d.last.ts >= T0 - 2000 && d.last.ts > (dmDone[ch.doc.id] || 0) && !dmCancelled(d) && !s.metadata.hasPendingWrites) { dmDone[ch.doc.id] = d.last.ts; pendingIn(d) ? reqToast(d, ch.doc.id) : notifyDM({ ...d, id: ch.doc.id }); } });
    { const wasFirst = dmFirst, nc = isDM(room) ? dmClearedAt(dms[room]) : 0; dmFirst = false; buildChips(); updateTotal(); if (isDM(room)) { try { renderPin(); } catch (_) {} } if (isDM(room)) { refreshMe(); if (nc !== prevClr || (wasFirst && nc)) openRoom(room); } }
  }, () => {});
  buildChips(); openRoom(room); presenceStart();
}
/* Very Chat — مزامنة الغرف والطلبات والحضور */
// ═══ 🔒 الغرف والرسايل بحسب العضوية ═══
// الغرف: بنسمع بس للي أنا عضو فيها / مالكها / مدعو ليها / طالب انضمامها. الأكواد في مجموعة codes (قراءة بالكود بس، مفيش list).
const roomSlices = {}, codeSig = {};
const codeRef = c => db.collection("codes").doc(String(c).toUpperCase());
function syncCode(r) { if (db && r && r.code && r.by === myId) codeRef(r.code).set({ room: r.id, by: myId, name: r.name || "", emoji: r.emoji || "", color: r.color || "" }).catch(() => {}); }
async function dropCode(r) { if (r && r.code) { try { await codeRef(r.code).delete(); } catch (e) {} } }
async function regenCode(r) { await dropCode(r); upd({ code: newCode() }, r.id); }
async function lookupCode(code) {
  const c = String(code || "").trim().toUpperCase(); if (!/^[A-Z0-9-]{4,12}$/.test(c)) return null;
  const mine = findByCode(c); if (mine) return mine;
  try { const d = await codeRef(c).get(); if (!d.exists) return null; const v = d.data(); return { stub: true, id: v.room, name: v.name || "غرفة", emoji: v.emoji, color: v.color, by: v.by, code: c }; } catch (e) { return null; }
}
function applyRooms() {
  const had = rooms.some(r => r.id === room), map = new Map();
  Object.values(roomSlices).forEach(a => a.forEach(r => map.set(r.id, r)));
  rooms = [...map.values()].filter(r => r.id !== "general").sort((a, b) => (a.name || "").localeCompare(b.name || "", "ar"));
  rooms.filter(r => r.by === myId && r.code).forEach(r => { const sg = [r.code, r.name, r.emoji, r.color].join("|"); if (codeSig[r.id] !== sg) { codeSig[r.id] = sg; syncCode(r); } });
  buildChips();
  if (room !== "general" && had && !rooms.some(r => r.id === room && canSee(r))) openRoom("general");
  syncRecent(); tryJoin();
  if (infoId) { const sg = JSON.stringify(infoId === "general" ? gdoc : (rooms.find(x => x.id === infoId) || null)); if (sg !== infoSig) { infoSig = sg; renderInfo(); } } refreshMe();
}
function watchRooms() {
  const col = db.collection("rooms"), none = () => {};
  col.doc("general").onSnapshot(d => {
    gdoc = d.exists ? d.data() : {};
    if (OWNER_UID && myId === OWNER_UID && !d.exists) col.doc("general").set({ admins: [] }, { merge: true }).catch(none);
    applyRooms();
  }, none);
  [["m", col.where("members", "array-contains", myId)], ["o", col.where("by", "==", myId)], ["i", col.where("invites", "array-contains", myId)], ["q", col.where("requests", "array-contains", myId)]]
    .forEach(([k, q]) => q.onSnapshot(sn => { roomSlices[k] = sn.docs.map(d => ({ ...d.data(), id: d.id })); applyRooms(); }, none));
}
// آخر الرسايل: مستمع لكل غرفة أنا فيها (والعام) بدل استعلام واحد على كل الغرف. محتاج Index: msgs (room ↑، ts ↓)
const recentBy = {}, recUnsub = {};
function rebuildRecent() { recent = Object.values(recentBy).flat().sort((a, b) => (b.ts || 0) - (a.ts || 0)); updateTotal(); if (!$("drawer").hidden) buildChips(); }
function watchRecent(id, ordered) {
  const q0 = db.collection("msgs").where("room", "==", id), q = ordered ? q0.orderBy("ts", "desc").limit(60) : q0; let first = true;
  recUnsub[id] = q.onSnapshot(sn => {
    recentBy[id] = sn.docs.map(d => ({ ...d.data(), id: d.id })).sort((a, b) => (b.ts || 0) - (a.ts || 0)).slice(0, 60);
    if (!first && !sn.metadata.hasPendingWrites) sn.docChanges().forEach(ch => { const m = ch.doc.data(); if (ch.type === "added" && m.ts >= T0 - 2000) { soundMsg(m); notifyMsg(m); } });
    first = false; rebuildRecent();
  }, e => { if (ordered && e && e.code === "failed-precondition") { watchRecent(id, false); } });
}
function syncRecent() {
  if (!db) return;
  const want = new Set(["general", ...rooms.filter(canSee).map(r => r.id)]);
  Object.keys(recUnsub).forEach(id => { if (!want.has(id)) { try { recUnsub[id](); } catch (e) {} delete recUnsub[id]; delete recentBy[id]; rebuildRecent(); } });
  want.forEach(id => { if (!recUnsub[id]) watchRecent(id, true); });
}
// ═══ 📥 صندوق الطلبات: انضمام الغرف + طلبات المحادثة الخاصة + طلباتي المعلّقة ═══
const needApproval = () => true;
// الطلب اتلغى من اللي بعته: هو بيكتب cleared على اسمه هو (نفس آلية الرفض/المسح اللي شغالة بالفعل)
const dmCancelled = d => !!d && !!d.req && !d.acc && !!d.last && ((d.cleared || {})[d.req] || 0) >= d.last.ts;
const pendingIn = d => !!d && !!d.req && d.req !== myId && !d.acc && !(d.blockedBy || []).includes(myId) && !!d.last && d.last.ts > dmClearedAt(d) && !dmCancelled(d);
const myName = () => (profiles[myId] || {}).name || gName() || "مجهول";
const joinReqs = () => rooms.filter(adminOf).map(r => ({ r, us: (r.requests || []).filter(u => u !== myId && !(r.banned || []).includes(u) && !(r.members || []).includes(u)) })).filter(x => x.us.length);
const dmReqs = () => Object.values(dms).filter(pendingIn).sort((a, b) => b.last.ts - a.last.ts);
const myInvites = () => rooms.filter(r => (r.invites || []).includes(myId) && !(r.members || []).includes(myId) && !(r.banned || []).includes(myId));
const myWaiting = () => rooms.filter(r => (r.requests || []).includes(myId) && !canSee(r));
const reqCount = () => joinReqs().reduce((n, x) => n + x.us.length, 0) + dmReqs().length + myInvites().length;
function notifyUser(u, r, kind) { if (db && u && u !== myId) pushTo(u, kind, myName(), r.name || ""); if (db && u && u !== myId) db.collection("joins").add({ owner: u, uid: myId, name: myName(), room: r.id, roomName: r.name || "", kind, ts: Date.now() }).catch(() => {}); }
async function decideJoin(r, u, ok) {
  const cur = rooms.find(x => x.id === r.id);
  if (!cur || !(cur.requests || []).includes(u)) { flash("الطلب ده مبقاش موجود"); return; }
  try { await db.collection("rooms").doc(r.id).update(ok ? { requests: AR(u), members: AU(u) } : { requests: AR(u) }); notifyUser(u, r, ok ? "approved" : "declined"); reqFlash(ok ? "✓ اتقبل الطلب" : "✕ اترفض الطلب"); }
  catch (e) { flash(errMsg(e)); }
}
async function decideInvite(r, ok) {
  const cur = rooms.find(x => x.id === r.id);
  if (!cur || !(cur.invites || []).includes(myId)) { flash("الدعوة دي اتلغت"); return; }
  try {
    await db.collection("rooms").doc(r.id).update(ok ? { members: AU(myId), invites: AR(myId) } : { invites: AR(myId) });
    if (r.by && r.by !== myId) pushTo(r.by, ok ? "inv_ok" : "inv_no", myName(), r.name || "");
    if (r.by && r.by !== myId) db.collection("joins").add({ owner: r.by, uid: myId, name: myName(), room: r.id, roomName: r.name || "", kind: ok ? "inv_ok" : "inv_no", ts: Date.now() }).catch(() => {});
    reqFlash(ok ? "✓ انضميت لغرفة " + r.name : "✕ اترفضت الدعوة");
  } catch (e) { flash(errMsg(e)); }
}
async function decideDM(d, ok) {
  try { await db.collection("dms").doc(d.id).update(ok ? { acc: true } : { ["cleared." + myId]: Math.max(Date.now(), d.last.ts + 1), ["unread." + myId]: 0 }); notifyUser(dmPeerOf(d.id), { id: d.id, name: "" }, ok ? "dm_ok" : "dm_no"); reqFlash(ok ? "✓ اتقبلت المحادثة" : "✕ اترفض الطلب"); }
  catch (e) { flash(errMsg(e)); }
}
const reqSeen = {};
let reqBatch = [], reqTimer = null, lastReqPush = 0;
function reqToast(d, id) {
  if (reqSeen[id]) return; reqSeen[id] = 1;
  if (reqMute) return; // مكتومة: الرقم على «الطلبات» بس
  reqBatch.push(id); clearTimeout(reqTimer);
  reqTimer = setTimeout(() => {
    const ids = reqBatch; reqBatch = [];
    const t = ids.length === 1 ? "📩 " + nameOf(dmPeerOf(ids[0])) + " بعتلك طلب محادثة" : "📩 وصلك " + ids.length + " طلبات محادثة جديدة";
    toast(t, true); $("toast").onclick = () => { $("toast").hidden = true; openReqs(); };
    // إشعار الموبايل: مرة كل ٣٠ دقيقة بالكتير، والباقي بهدوء على الرقم
    if (document.hidden && "Notification" in window && Notification.permission === "granted" && Date.now() - lastReqPush > 18e5) { lastReqPush = Date.now(); pushLocal("Very Chat", t, "req"); }
  }, 3000);
}
function openReqs() { closeDrawer(); closeInfo(); rqTab = reqCount() || !(myWaiting().length + sentInvites().length + sentDMs().length) ? "in" : "out"; $("reqView").hidden = false; renderReqs(); $("reqBody").scrollTop = 0; }
let rqTab = "in";
const sentInvites = () => rooms.filter(adminOf).flatMap(r => (r.invites || []).filter(u => !(r.members || []).includes(u)).map(u => ({ r, u })));
const sentDMs = () => Object.values(dms).filter(d => d.req === myId && !d.acc && d.last && ((d.cleared || {})[dmPeerOf(d.id)] || 0) < d.last.ts && dmClearedAt(d) < d.last.ts).sort((a, b) => b.last.ts - a.last.ts);
function renderReqs() {
  if ($("reqView").hidden) return;
  const box = $("reqBody"), top = box.scrollTop, tabs = $("reqTabs"); box.textContent = ""; tabs.textContent = "";
  const J = joinReqs(), D = dmReqs(), I = myInvites(), W = myWaiting(), SI = sentInvites(), SD = sentDMs();
  const jn = J.reduce((n, x) => n + x.us.length, 0), nIn = jn + D.length + I.length, nOut = W.length + SI.length + SD.length;
  [["in", "📥 الواردة", nIn], ["out", "📤 الصادرة", nOut]].forEach(([k, t, n]) => {
    const b = el("button", "rq-tab" + (rqTab === k ? " on" : ""), t); b.type = "button"; b.setAttribute("role", "tab"); b.setAttribute("aria-selected", String(rqTab === k));
    if (n) b.append(el("span", "rq-n", String(n))); b.onclick = () => { rqTab = k; renderReqs(); $("reqBody").scrollTop = 0; }; tabs.append(b);
  });
  const btn = (cls, t, fn) => { const b = el("button", cls, t); b.type = "button"; b.onclick = async () => { b.disabled = true; try { await fn(); } finally { b.disabled = false; } }; return b; };
  const ago = ts => { const m = Math.max(0, Math.round((Date.now() - ts) / 6e4)); return m < 1 ? "دلوقتي" : m < 60 ? "من " + m + " دقيقة" : m < 1440 ? "من " + Math.round(m / 60) + " ساعة" : "من " + Math.round(m / 1440) + " يوم"; };
  const sec = (ico, title, n, color, all, rej) => { const c = el("div", "ri-card"), h = el("h3", "rq-h"); c.style.borderInlineStartColor = color; h.append(el("span", "", ico + " " + title), el("span", "rq-n", String(n))); if (rej && n > 1) h.append(btn("rq-wait", "✕ رفض الكل", rej)); if (all && n > 1) h.append(btn("rq-all", "✓ قبول الكل", all)); c.append(h); box.append(c); return c; };
  const row = (av, name, sub, ...acts) => { const r = el("div", "ri-mem"), mi = el("div", "mi"), b = el("b", "", name), sm = el("small", "", sub); b.dir = sm.dir = "rtl"; mi.append(b, sm); r.append(av, mi, ...acts); return r; };
  const rav = r => avatar(r.emoji || r.photo ? r : { emoji: "💬", color: "#5b6b78" });
  const yes = fn => btn("ri-ok", "✓", fn), no = fn => btn("ri-no", "✕", fn);
  const empty = (i, t, sub) => { const e = el("div", "rq-empty"); e.append(el("i", "", i), el("b", "", t), el("small", "", sub)); box.append(e); };
  if (rqTab === "in") {
    if (!nIn) empty("🎉", "مفيش طلبات واردة", "أي دعوة أو طلب انضمام أو محادثة جديدة هتظهر هنا");
    if (I.length) { const c = sec("📨", "دعوات ليك", I.length, "#2f90d9", async () => { for (const r of I) await decideInvite(r, true); }); I.forEach(r => c.append(row(rav(r), r.name, "دعوة من " + nameOf(r.by), yes(() => decideInvite(r, true)), no(() => decideInvite(r, false))))); }
    if (jn) { const c = sec("✋", "طلبات الانضمام لغرفك", jn, "var(--pri)", async () => { for (const { r, us } of J) for (const u of us) await decideJoin(r, u, true); }); J.forEach(({ r, us }) => us.forEach(u => c.append(row(avatar(profileFor(u)), nameOf(u), "يطلب دخول «" + r.name + "»", yes(() => decideJoin(r, u, true)), no(() => decideJoin(r, u, false)))))); }
    if (D.length) { const c = sec("💬", "طلبات محادثة خاصة", D.length, "#8a4fe0", async () => { for (const d of D) await decideDM(d, true); }, async () => { for (const d of D) await decideDM(d, false); }); D.forEach(d => c.append(row(avatar(profiles[dmPeerOf(d.id)]), nameOf(dmPeerOf(d.id)), "طلب محادثة · " + ago(d.last.ts), yes(() => decideDM(d, true)), no(() => decideDM(d, false))))); }
  } else {
    if (!nOut) empty("📤", "مفيش طلبات صادرة", "طلبات الانضمام والدعوات اللي بعتّها هتظهر هنا لحد ما يتردّ عليها");
    const upd1 = (r, patch) => async () => { try { await db.collection("rooms").doc(r.id).update(patch); } catch (e) { toast(errMsg(e), true); } };
    if (W.length) { const c = sec("⏳", "طلبات انضمام بعتّها", W.length, "#e08a2f"); W.forEach(r => c.append(row(rav(r), r.name, "بانتظار موافقة المالك", btn("rq-wait", "إلغاء", upd1(r, { requests: AR(myId) }))))); }
    if (SI.length) { const c = sec("📨", "دعوات بعتّها", SI.length, "#2f90d9"); SI.forEach(({ r, u }) => c.append(row(avatar(profileFor(u)), nameOf(u), "دعوة لغرفة «" + r.name + "» · بانتظار الرد", btn("rq-wait", "إلغاء", upd1(r, { invites: AR(u) }))))); }
    if (SD.length) { const c = sec("💬", "طلبات محادثة بعتّها", SD.length, "#8a4fe0"); SD.forEach(d => { const u = dmPeerOf(d.id); c.append(row(avatar(profiles[u]), nameOf(u), "بانتظار القبول · " + ago(d.last.ts), btn("rq-wait", "إلغاء", async () => { try { await db.collection("dms").doc(d.id).update({ ["cleared." + myId]: Math.max(Date.now(), d.last.ts + 1) }); toast("✓ اتلغى الطلب، واختفى عند الشخص التاني كمان", true); } catch (e) { toast(errMsg(e), true); } }))); }); }
  }
  box.scrollTop = top;
}
$("dReq").onclick = openReqs; $("reqBack").onclick = () => { $("reqView").hidden = true; };
if (navigator.serviceWorker) navigator.serviceWorker.addEventListener("message", e => { openByTag(e.data && e.data.tag); });
// ═══ المتصلين / بيكتب / إشعار الانضمام للمالك ═══
const PRES_TTL = 90000, PRES_BEAT = 30000, TYPE_TTL = 5000;
let presence = {}, presOn = false, typingSent = 0, typingActive = false;
const isOnline = p => !!p && p.online !== false && Date.now() - (p.ts || 0) < PRES_TTL;
function presWrite(extra) {
  if (!db || !myId) return;
  db.collection("presence").doc(myId).set({ ts: Date.now(), online: !document.hidden, room: room || "general", ...(extra || {}) }, { merge: true }).catch(() => {});
}
function lastSeenText(p) {
  if (!p || !p.ts) return "";
  const d = new Date(p.ts), t = d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
  return "آخر ظهور " + (d.toDateString() === new Date().toDateString() ? "اليوم " : d.toLocaleDateString("ar-EG", { day: "numeric", month: "short" }) + " ") + t;
}
function presenceInfo() {
  const r = curR(); if (!r) return { text: "", typing: false };
  const now = Date.now(), dm = isDM(room), other = dm ? room.slice(3).split("_").find(u => u !== myId) : null;
  const typers = Object.keys(presence).filter(u => u !== myId && presence[u].typing === room && now - (presence[u].tts || 0) < TYPE_TTL && isOnline(presence[u]) && (!dm || u === other));
  if (typers.length) {
    const nm = typers.map(u => nameOf(u, room));
    return { typing: true, text: "✍️ " + (typers.length === 1 ? nm[0] + " بيكتب…" : typers.length === 2 ? nm[0] + " و" + nm[1] + " بيكتبوا…" : typers.length + " بيكتبوا…") };
  }
  if (dm) { const p = presence[other]; return { typing: false, text: isOnline(p) ? "🟢 متصل" : (lastSeenText(p) || "💬 دردشة خاصة") }; }
  const gen = room === "general", mem = !gen && r.members ? new Set([...r.members, r.by].filter(Boolean)) : null;
  const on = new Set(Object.keys(presence).filter(u => isOnline(presence[u]) && (gen || (mem ? mem.has(u) : presence[u].room === room))));
  if (!document.hidden) on.add(myId);
  const total = countHidden(r) ? 0 : gen ? Object.keys(profiles).length : mem ? mem.size : 0;
  return { typing: false, text: "🟢 " + on.size + " متصل" + (total > on.size ? " من " + total : "") };
}
function paintHSub() { try { if (window.__memPaint && !$("rinfo").hidden) window.__memPaint(); } catch (x0) {} const e = $("hSub"); if (!e) return; const x = presenceInfo(); e.textContent = x.text; e.classList.toggle("typing", x.typing); }
function stopTyping() { if (typingActive) { typingActive = false; typingSent = 0; presWrite({ typing: "", tts: 0 }); } }
function toast(t, quiet) {
  let e = $("toast"); if (!e) { e = el("div"); e.id = "toast"; document.body.append(e); } e.onclick = () => { e.hidden = true; };
  if (!quiet) vcSnd("ping"); e.textContent = t; e.hidden = false; clearTimeout(e._t); e._t = setTimeout(() => { e.hidden = true; }, 7000);
}
function logJoin(r, kind) {
  if (!db || !myId || !r) return;
  const owner = r.id === "general" ? OWNER_UID : r.by; if (!owner || owner === myId) return;
  pushTo(owner, kind, (profiles[myId] || {}).name || gName() || "مجهول", r.id === "general" ? "" : r.name || "");
  db.collection("joins").add({ owner, uid: myId, name: (profiles[myId] || {}).name || gName() || "مجهول", room: r.id, roomName: r.name || "عام", kind, ts: Date.now() }).catch(() => {});
}
const joinText = j => j.kind === "dm_ok" ? "✅ " + j.name + " قبل طلب محادثتك، تقدر تراسله دلوقتي" : j.kind === "dm_no" ? "❌ " + j.name + " رفض طلب محادثتك" : j.kind === "request" ? "✋ " + j.name + " طلب الانضمام لغرفة «" + j.roomName + "»" : j.kind === "invite" ? "📨 " + j.name + " دعاك لغرفة «" + j.roomName + "»" : j.kind === "inv_ok" ? "✅ " + j.name + " قبل دعوتك لغرفة «" + j.roomName + "»" : j.kind === "inv_no" ? "❌ " + j.name + " رفض دعوتك لغرفة «" + j.roomName + "»" : j.kind === "approved" ? "✅ اتقبل طلب انضمامك لغرفة «" + j.roomName + "»" : j.kind === "declined" ? "❌ طلب انضمامك لغرفة «" + j.roomName + "» اترفض" : j.room === "general" ? "👋 " + j.name + " انضم للدردشة العامة" : "👋 " + j.name + " انضم لغرفة «" + j.roomName + "»";
function presenceStart() {
  if (presOn) return; presOn = true;
  db.collection("presence").onSnapshot(s => { presence = {}; s.docs.forEach(d => { presence[d.id] = d.data(); }); paintHSub(); }, () => {});
  presWrite({ typing: "", tts: 0 });
  setInterval(() => { if (!document.hidden) presWrite(); }, PRES_BEAT);
  setInterval(paintHSub, 8000);
  document.addEventListener("visibilitychange", () => { presWrite(document.hidden ? { typing: "", tts: 0 } : null); paintHSub(); });
  window.addEventListener("pagehide", () => presWrite({ online: false, typing: "", tts: 0 }));
  window.addEventListener("online", () => presWrite());
  const inp = $("inp");
  inp.addEventListener("input", () => { if (!inp.value.trim()) { stopTyping(); return; } const n = Date.now(); if (n - typingSent > 2500) { typingSent = n; typingActive = true; presWrite({ typing: room, tts: n }); } });
  inp.addEventListener("blur", stopTyping); $("f").addEventListener("submit", stopTyping);
  // إشعار المالك بالانضمام (للمالك بس)
  let seen = 0; try { seen = +localStorage.getItem("vc_joins_seen") || 0; } catch (e) {}
  db.collection("joins").where("owner", "==", myId).onSnapshot(s => {
    s.docs.forEach(d => { if ((d.data().ts || 0) < Date.now() - 6048e5) d.ref.delete().catch(() => {}); });
    const all = s.docs.map(d => d.data()).filter(j => j.uid !== myId);
    if (!seen) { seen = Date.now(); try { localStorage.setItem("vc_joins_seen", seen); } catch (e) {} return; }
    const fresh = all.filter(j => j.ts > seen).sort((a, b) => a.ts - b.ts); if (!fresh.length) return;
    seen = fresh[fresh.length - 1].ts; try { localStorage.setItem("vc_joins_seen", seen); } catch (e) {}
    if (reqMute) return; const txt = fresh.length === 1 ? joinText(fresh[0]) : "🔔 " + fresh.length + " إشعارات جديدة";
    toast(txt); if (fresh.some(j => j.kind === "request" || j.kind === "invite")) $("toast").onclick = () => { $("toast").hidden = true; openReqs(); }; if (document.hidden && "Notification" in window && Notification.permission === "granted") pushLocal("Very Chat", txt, fresh.some(j => j.kind === "request" || j.kind === "invite") ? "join" : "info");
  }, () => {});
  // انضمام عضو جديد للدردشة العامة = أول مرة يحفظ بروفايله
  let noProfile = false, gLogged = false;
  db.collection("profiles").doc(myId).onSnapshot(d => {
    if (!d.exists && !d.metadata.fromCache) noProfile = true;
    else if (d.exists && noProfile && !gLogged) { gLogged = true; logJoin({ id: "general", name: "عام" }, "join"); }
  }, () => {});
}
{ const _open = openRoom; openRoom = function (id) { _open(id); clearNotifs(id); stopTyping(); if (started) { presWrite({ typing: "", tts: 0 }); paintHSub(); } }; }

const vv = window.visualViewport;
function fit() {
  if (!vv) return;
  const cs = getComputedStyle(document.documentElement);
  const h = vv.height - (parseFloat(cs.paddingTop) || 0) - (parseFloat(cs.paddingBottom) || 0);
  document.documentElement.style.setProperty("--vh", Math.max(200, h) + "px");
  document.querySelector(".app").style.transform = vv.offsetTop ? "translateY(" + vv.offsetTop + "px)" : "";
  window.scrollTo(0, 0);
  const m = $("msgs"); if (m && document.activeElement === $("inp")) m.scrollTop = m.scrollHeight;
}
if (vv) { vv.addEventListener("resize", fit); vv.addEventListener("scroll", fit); }
$("inp").addEventListener("focus", () => { fit(); setTimeout(fit, 120); setTimeout(fit, 350); });
fit();
/* Very Chat — الأصوات و«جديد في التحديث» */
// ───── أصوات Very Chat: متصنّعة بالكود (Web Audio) يعني مفيش ملفات ولا حقوق، وليها طابع خاص بالتطبيق ─────
let sndOn = true; try { sndOn = localStorage.getItem("vc_snd") !== "0"; } catch (e) {}
let AC = null; const sndLast = {};
function sndCtx() { try { if (!AC) { const C = window.AudioContext || window.webkitAudioContext; if (!C) return null; AC = new C(); } if (AC.state === "suspended") AC.resume(); return AC; } catch (e) { return null; } }
["pointerdown", "keydown", "touchstart"].forEach(ev => window.addEventListener(ev, () => { if (sndOn) sndCtx(); }, { passive: true }));
function pluck(t0, f, dur, vol, f2, type) {
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = type || "sine"; o.frequency.setValueAtTime(f, t0);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur * 0.8);
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(AC.destination); o.start(t0); o.stop(t0 + dur + 0.03);
}
function noise(t0, dur, vol, f0, f1) {
  const n = Math.floor(AC.sampleRate * dur), b = AC.createBuffer(1, n, AC.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(); s.buffer = b; f.type = "bandpass"; f.Q.value = 1.2;
  f.frequency.setValueAtTime(f0, t0); f.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + dur * 0.25); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  s.connect(f); f.connect(g); g.connect(AC.destination); s.start(t0);
}
const SND = {
  vsend: t => { noise(t, 0.22, 0.12, 400, 3200); pluck(t + 0.16, 880, 0.14, 0.14, 1320); pluck(t + 0.22, 1760, 0.16, 0.06); }, // فويس اتبعت: وشّة + بوب
  rec: t => { pluck(t, 700, 0.07, 0.12, 1000); pluck(t + 0.08, 1000, 0.09, 0.12, 1400); },       // بدء التسجيل
  recend: t => pluck(t, 1000, 0.09, 0.12, 650),                                                   // وقف التسجيل
  recx: t => { pluck(t, 500, 0.2, 0.12, 200, "triangle"); noise(t, 0.12, 0.05, 1800, 500); },     // إلغاء التسجيل
  del: t => { noise(t, 0.2, 0.14, 2600, 400); pluck(t, 300, 0.22, 0.1, 110, "triangle"); },       // حذف
  ok: t => [523, 659, 784, 1047].forEach((f, i) => pluck(t + i * 0.07, f, 0.22, 0.12, 0, i === 3 ? "triangle" : "sine")), // موافقة
  no: t => { pluck(t, 330, 0.14, 0.14, 0, "triangle"); pluck(t + 0.11, 247, 0.24, 0.14, 0, "triangle"); }, // رفض
  req: t => { noise(t, 0.16, 0.09, 500, 2600); pluck(t + 0.12, 988, 0.12, 0.1); pluck(t + 0.2, 1319, 0.22, 0.1); }, // طلب اتبعت
  err: t => { pluck(t, 200, 0.12, 0.07, 150, "sawtooth"); pluck(t + 0.14, 170, 0.16, 0.07, 130, "sawtooth"); }, // خطأ
  copy: t => { pluck(t, 1500, 0.03, 0.07, 1000); pluck(t + 0.05, 1900, 0.04, 0.06); },
  pop: t => pluck(t, 700, 0.06, 0.1, 1200),
  send: t => { pluck(t, 520, 0.12, 0.16, 900); pluck(t + 0.07, 1320, 0.1, 0.05); },          // فقاعة طالعة لفوق
  in: t => { pluck(t, 660, 0.16, 0.14); pluck(t + 0.09, 880, 0.22, 0.12); },                  // نغمتين دافيين
  ping: t => { [784, 988, 1319].forEach((f, i) => pluck(t + i * 0.075, f, 0.2, 0.13, 0, i === 2 ? "triangle" : "sine")); }, // أربيجيو صغير
  react: t => { pluck(t, 880, 0.14, 0.12, 1500); pluck(t + 0.06, 1760, 0.12, 0.06); pluck(t + 0.11, 2093, 0.1, 0.04); }, // بريق
  tap: t => pluck(t, 1200, 0.035, 0.06, 700),
  open: t => pluck(t, 380, 0.16, 0.07, 760)
};
// قواعد الهدوء: مفيش صوت وقت فتح التطبيق أو الرجوع له، والرسايل الداخلة صوت واحد كل 4 ثواني، وأصوات النتيجة (خطأ/قبول/رفض/طلب) بس بعد حاجة انت عملتها
var lastGest = 0, quietUntil = performance.now() + 4000;
["pointerdown", "keydown", "touchstart"].forEach(ev => window.addEventListener(ev, () => { lastGest = performance.now(); }, { passive: true, capture: true }));
document.addEventListener("visibilitychange", () => { quietUntil = performance.now() + 3500; });
const SND_IN = { in: 1, ping: 1 }, SND_RES = { err: 1, ok: 1, no: 1, req: 1 };
const HAP = { send: 8, vsend: 12, del: [12, 40, 12], err: [18, 50, 18], ok: 10, no: [10, 40, 10], req: 10 };
function buzz(k) { try { if (HAP[k] && navigator.vibrate && !document.hidden && performance.now() - lastGest < 8000) navigator.vibrate(HAP[k]); } catch (_) {} }
function vcSnd(k) {
  buzz(k);
  if (!sndOn || document.hidden) return;
  { const n = performance.now();
    if (SND_IN[k]) { if (n < quietUntil || n - (sndLast.__in || 0) < 4000) return; sndLast.__in = n; }
    else if (SND_RES[k] && n - lastGest > 8000) return; }
  const c = sndCtx(); if (!c || c.state !== "running") return;
  const n = performance.now(); if (n - (sndLast[k] || 0) < 120) return; sndLast[k] = n;
  try { SND[k](c.currentTime + 0.005); } catch (e) {}
}
function soundMsg(m) { if (m.uid === myId) return; if (m.room !== "general" && !rooms.some(r => r.id === m.room && canSee(r))) return; vcSnd(m.room === room ? "in" : "ping"); }
let reqMute = false; try { reqMute = localStorage.getItem("vc_reqmute") === "1"; } catch (e) {}
// ───── إشعارات الطلبات: مفتاح واحد بيتحكم في كل حاجة ─────
// شغّالة: بانر + صوت + إشعار موبايل. صامتة: مفيش بانر ولا نص ولا إشعار موبايل ولا نغمة تنبيه،
// والرقم على «الطلبات» بس، وكل التفاصيل تفضل مستنياك جوه صندوق الطلبات.
// أصوات التأثيرات (اتبعت/اتقبل/اترفض) ما بتتأثرش بالكتم، وليها زرار «الصوت».
// بيتأثر بيها: طلب محادثة جديد، طلب انضمام، دعوة، قبول/رفض (طلب أو دعوة أو محادثة)، انضمام عضو جديد.
// ما بيتأثرش: الأخطاء، ورسايل الشات العادية.
function reqFlash(t) { if (reqMute) flashSnd(t); else flash(t); }   // صامتة: صوت التأثير بس (زي أي تطبيق)، من غير نص
function paintReqMute() { $("dReqMute").firstChild.innerHTML = reqMute ? DI.belloff : DI.bell; $("dReqMute").classList.toggle("off", !!reqMute); $("dReqMute").title = reqMute ? "الطلبات صامتة (الرقم بس)" : "إشعارات الطلبات شغالة"; }
$("dReqMute").onclick = () => { reqMute = !reqMute; try { localStorage.setItem("vc_reqmute", reqMute ? "1" : "0"); } catch (e) {} paintReqMute(); dtoast(reqMute ? "🔕 الطلبات صامتة: مفيش بانرات ولا إشعارات، الرقم بس" : "🔔 إشعارات الطلبات شغالة"); };
paintReqMute();
function paintSnd() { $("dSound").firstChild.innerHTML = sndOn ? DI.spk : DI.spkoff; $("dSound").classList.toggle("off", !sndOn); $("dSound").title = sndOn ? "الأصوات شغالة" : "الأصوات مقفولة"; }
$("dSound").onclick = () => { sndOn = !sndOn; try { localStorage.setItem("vc_snd", sndOn ? "1" : "0"); } catch (e) {} paintSnd(); dtoast(sndOn ? "🔊 الأصوات شغالة" : "🔇 الأصوات مقفولة"); if (sndOn) { sndCtx(); setTimeout(() => vcSnd("ping"), 80); } };
paintSnd();
$("f").addEventListener("submit", () => { if ($("inp").value.trim() && !$("inp").disabled) vcSnd("send"); }, true);
netUI(); buildChips(); registerSW();
start();
// ───── جديد في التحديث ─────
(() => { const V = "v12"; let seen; try { seen = localStorage.getItem("vc_ver"); } catch (_) {} if (seen === V) return;
  setTimeout(() => { const o = el("div"); o.id = "wn"; o.innerHTML = '<div class="vcard"><div class="grab"></div><div class="wnh">✨</div><h2>تحديث جديد في Very Chat</h2><ul><li><b>✏️ تعديل الاسم</b><small>اضغط مطوّلاً على أي محادثة خاصة ← تعديل الاسم، وغيّر الاسم براحتك (بيظهر ليك انت بس)</small></li><li><b>🗑 حذف المحادثة</b><small>بتمسح كل الرسايل، بتاعتك وبتاعة صاحبك، عند الاتنين</small></li></ul><button class="send" type="button">يلا نبدأ</button></div>'; o.onclick = e => { if (e.target === o || e.target.tagName === "BUTTON") { o.remove(); try { localStorage.setItem("vc_ver", V); } catch (_) {} } }; document.body.append(o); }, 2600); })();
