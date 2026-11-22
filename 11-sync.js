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
const pendingIn = d => !!d && !!d.req && d.req !== myId && !d.acc && !(d.blockedBy || []).includes(myId) && !!d.last && d.last.ts > dmClearedAt(d);
const myName = () => (profiles[myId] || {}).name || gName() || "مجهول";
const joinReqs = () => rooms.filter(adminOf).map(r => ({ r, us: (r.requests || []).filter(u => u !== myId && !(r.banned || []).includes(u) && !(r.members || []).includes(u)) })).filter(x => x.us.length);
const dmReqs = () => Object.values(dms).filter(pendingIn).sort((a, b) => b.last.ts - a.last.ts);
const myInvites = () => rooms.filter(r => (r.invites || []).includes(myId) && !(r.members || []).includes(myId) && !(r.banned || []).includes(myId));
const myWaiting = () => rooms.filter(r => (r.requests || []).includes(myId) && !canSee(r));
const reqCount = () => joinReqs().reduce((n, x) => n + x.us.length, 0) + dmReqs().length + myInvites().length;
function notifyUser(u, r, kind) { if (db && u && u !== myId) db.collection("joins").add({ owner: u, uid: myId, name: myName(), room: r.id, roomName: r.name || "", kind, ts: Date.now() }).catch(() => {}); }
async function decideJoin(r, u, ok) {
  const cur = rooms.find(x => x.id === r.id);
  if (!cur || !(cur.requests || []).includes(u)) { flash("الطلب ده مبقاش موجود"); return; }
  try { await db.collection("rooms").doc(r.id).update(ok ? { requests: AR(u), members: AU(u) } : { requests: AR(u) }); notifyUser(u, r, ok ? "approved" : "declined"); flash(ok ? "✓ اتقبل الطلب" : "✕ اترفض الطلب"); }
  catch (e) { flash(errMsg(e)); }
}
async function decideInvite(r, ok) {
  const cur = rooms.find(x => x.id === r.id);
  if (!cur || !(cur.invites || []).includes(myId)) { flash("الدعوة دي اتلغت"); return; }
  try {
    await db.collection("rooms").doc(r.id).update(ok ? { members: AU(myId), invites: AR(myId) } : { invites: AR(myId) });
    if (r.by && r.by !== myId) db.collection("joins").add({ owner: r.by, uid: myId, name: myName(), room: r.id, roomName: r.name || "", kind: ok ? "inv_ok" : "inv_no", ts: Date.now() }).catch(() => {});
    flash(ok ? "✓ انضميت لغرفة " + r.name : "✕ اترفضت الدعوة");
  } catch (e) { flash(errMsg(e)); }
}
async function decideDM(d, ok) {
  try { await db.collection("dms").doc(d.id).update(ok ? { acc: true } : { ["cleared." + myId]: Math.max(Date.now(), d.last.ts + 1), ["unread." + myId]: 0 }); notifyUser(dmPeerOf(d.id), { id: d.id, name: "" }, ok ? "dm_ok" : "dm_no"); flash(ok ? "✓ اتقبلت المحادثة" : "✕ اترفض الطلب"); }
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
const sentDMs = () => Object.values(dms).filter(d => d.req === myId && !d.acc && d.last && ((d.cleared || {})[dmPeerOf(d.id)] || 0) < d.last.ts).sort((a, b) => b.last.ts - a.last.ts);
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
  const row = (av, name, sub, ...acts) => { const r = el("div", "ri-mem"), mi = el("div", "mi"), b = el("b", "", name), sm = el("small", "", sub); b.dir = sm.dir = "auto"; mi.append(b, sm); r.append(av, mi, ...acts); return r; };
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
    const upd1 = (r, patch) => async () => { try { await db.collection("rooms").doc(r.id).update(patch); } catch (e) { flash(errMsg(e)); } };
    if (W.length) { const c = sec("⏳", "طلبات انضمام بعتّها", W.length, "#e08a2f"); W.forEach(r => c.append(row(rav(r), r.name, "بانتظار موافقة المالك", btn("rq-wait", "إلغاء", upd1(r, { requests: AR(myId) }))))); }
    if (SI.length) { const c = sec("📨", "دعوات بعتّها", SI.length, "#2f90d9"); SI.forEach(({ r, u }) => c.append(row(avatar(profileFor(u)), nameOf(u), "دعوة لغرفة «" + r.name + "» · بانتظار الرد", btn("rq-wait", "إلغاء", upd1(r, { invites: AR(u) }))))); }
    if (SD.length) { const c = sec("💬", "طلبات محادثة بعتّها", SD.length, "#8a4fe0"); SD.forEach(d => { const u = dmPeerOf(d.id); c.append(row(avatar(profiles[u]), nameOf(u), "بانتظار القبول · " + ago(d.last.ts), btn("rq-wait", "إلغاء", async () => { try { await db.collection("dms").doc(d.id).update({ last: FV().delete(), req: FV().delete() }); flash("✓ اتلغى الطلب"); } catch (e) { flash(errMsg(e)); } }))); }); }
  }
  box.scrollTop = top;
}
$("dReq").onclick = openReqs; $("reqBack").onclick = () => { $("reqView").hidden = true; };
if (navigator.serviceWorker) navigator.serviceWorker.addEventListener("message", e => { const t = e.data && e.data.tag; if (t === "join" || t === "req") openReqs(); });
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
    const txt = fresh.length === 1 ? joinText(fresh[0]) : "🔔 " + fresh.length + " إشعارات جديدة";
    toast(txt); if (fresh.some(j => j.kind === "request" || j.kind === "invite")) $("toast").onclick = () => { $("toast").hidden = true; openReqs(); }; if (document.hidden && "Notification" in window && Notification.permission === "granted") pushLocal("Very Chat", txt, fresh.some(j => j.kind === "request" || j.kind === "invite") ? "join" : "info");
  }, () => {});
  // انضمام عضو جديد للدردشة العامة = أول مرة يحفظ بروفايله
  let noProfile = false, gLogged = false;
  db.collection("profiles").doc(myId).onSnapshot(d => {
    if (!d.exists && !d.metadata.fromCache) noProfile = true;
    else if (d.exists && noProfile && !gLogged) { gLogged = true; logJoin({ id: "general", name: "عام" }, "join"); }
  }, () => {});
}
{ const _open = openRoom; openRoom = function (id) { _open(id); stopTyping(); if (started) { presWrite({ typing: "", tts: 0 }); paintHSub(); } }; }

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
