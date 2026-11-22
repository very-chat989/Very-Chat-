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
    logJoin(r, "request"); flash("✓ اتبعت طلب الانضمام، هيوصلك إشعار أول ما يوافق المالك"); return;
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
function openForward(msgs) {
  const c = $("mcard"); c.textContent = ""; const pick = new Set();
  c.append(el("div", "mprev", "↪️ حوّل " + (msgs.length > 1 ? msgs.length + " رسائل" : "الرسالة") + " إلى…"));
  const list = el("div", "acts"); list.style.cssText = "display:flex;flex-direction:column;gap:6px;max-height:48vh;overflow-y:auto";
  [generalRoom(), ...rooms.filter(canSee)].filter(r => !writeBlock(r)).forEach(r => {
    const b = el("button", "rrow"), ck = el("span", "ck"); ck.style.marginInlineStart = "auto";
    b.append(avatar(r.emoji || r.photo ? r : { emoji: "💬", color: "#5b6b78" }), el("b", "", r.name), ck);
    b.onclick = () => { if (pick.has(r.id)) pick.delete(r.id); else pick.add(r.id); ck.textContent = pick.has(r.id) ? "✓" : ""; b.classList.toggle("on", pick.has(r.id)); };
    list.appendChild(b);
  });
  const go = el("button", "send", "إرسال"); go.style.padding = "13px";
  go.onclick = async () => {
    if (!pick.size) return; go.disabled = true; let i = 0;
    try {
      for (const rid of pick) for (const m of msgs) await db.collection("msgs").add({ room: rid, text: m.text || "", ...(m.audio ? { audio: m.audio, dur: m.dur || 0 } : {}), ...(m.mid ? { mid: m.mid, mk: m.mk || "img", thumb: m.thumb || "", w: m.w || 0, h: m.h || 0 } : {}), ...(m.img ? { img: m.img, thumb: m.thumb || "", w: m.w || 0, h: m.h || 0 } : {}), ...(m.vid ? { vid: m.vid, thumb: m.thumb || "", w: m.w || 0, h: m.h || 0 } : {}), ...(m.share ? { share: m.share } : {}), uid: myId, ts: Date.now() + (i++), fwd: m.fwd || nameOf(m.uid) });
      $("msheet").hidden = true; if (selMode) exitSel(); setStatus("✓ تم التحويل");
    } catch (e) { go.disabled = false; setStatus("ماقدرتش أحوّل الرسالة."); }
  };
  c.append(list, go); $("msheet").hidden = false;
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
$("selFwd").onclick = () => openForward(lastList.filter(x => sel.has(x.id)));

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
function unreadOf(rid) { if (isDM(rid)) return ((dms[rid] || {}).unread || {})[myId] || 0; return readsLoaded ? recent.filter(m => m.room === rid && m.uid !== myId && m.ts > (myReads[rid] || 0)).length : 0; }
function updateTotal() {
  let n = 0; ["general", ...rooms.filter(canSee).map(r => r.id), ...Object.keys(dms).filter(k => !pendingIn(dms[k]))].forEach(id => { n += unreadOf(id); });
  const rc = reqCount(), bg = $("reqBdg"); bg.hidden = !rc; bg.textContent = rc > 99 ? "99+" : rc; renderReqs();
  $("menuBtn").classList.toggle("un", n > 0 || rc > 0); document.title = (n ? "(" + n + ") " : "") + "Very Chat";
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
  cancelEdit(); replyTo = { name: nameOf(m.uid), text: mtext(m).slice(0, 80) };
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
    } else await firebase.auth().signOut();
    location.reload();
  } catch (e) { perr("ماقدرتش أكمل (" + (e.code || e.message) + "). اتأكد إن تسجيل جوجل متفعل في Firebase."); }
};
$("dNotif").onclick = async () => { try { await Notification.requestPermission(); } catch (e) {} $("dNotif").hidden = !("Notification" in window) || Notification.permission !== "default"; };
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

