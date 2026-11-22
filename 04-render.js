/* Very Chat — رسم الرسايل والتفاعلات والتحديد */
function render(list) {
  lastList = list;
  const box = $("msgs");
  const fresh = box._room !== room;
  if (fresh) { box._room = room; box._unr = 0; const s0 = getSeen(room); if (s0) { const f0 = list.find(m => m.uid !== myId && m.ts > s0); if (f0) box._unr = f0.ts; } else if (list.length) setSeen(room, list[list.length - 1].ts); }
  // لو في فيديو شغّال، نأجّل إعادة الرسم علشان ما يقفلش في وشك
  if ([...box.querySelectorAll("video")].some(v => !v.paused && !v.ended)) { clearTimeout(render._t); render._t = setTimeout(() => render(lastList), 1500); return; }
  const near = box.scrollHeight - box.scrollTop - box.clientHeight < 90;
  const frag = document.createDocumentFragment(), oldIds = !fresh && box._ids ? box._ids : null;
  list.forEach((m, i) => { try {
    const prev = list[i - 1], mine = m.uid === myId, p = profileFor(m.uid);
    const newDay = !prev || new Date(prev.ts).toDateString() !== new Date(m.ts).toDateString();
    if (newDay) { const dv = document.createElement("div"), d0 = new Date(m.ts); dv.className = "day"; dv.textContent = d0.toDateString() === new Date().toDateString() ? "اليوم" : d0.toLocaleDateString("ar-EG", { day: "numeric", month: "long" }); frag.appendChild(dv); }
    const first = newDay || prev.uid !== m.uid || m.ts - prev.ts > 300000;
    const row = document.createElement("div"); row.className = "row" + (mine ? " me" : "") + (first ? " first" : "") + (sel.has(m.id) ? " sel" : "");
    row.dataset.uid = m.uid; row.dataset.ts = m.ts;
    if (box._unr && m.ts >= box._unr && !(prev && prev.ts >= box._unr)) { const u = document.createElement("div"); u.className = "unr"; u.id = "unrDiv"; const cnt = list.filter(x => x.uid !== myId && x.ts >= box._unr).length; u.textContent = "⬇ " + cnt + " رسالة غير مقروءة"; frag.appendChild(u); } if (first) row.appendChild(avatar(p)); else { const s = document.createElement("div"); s.className = "sp"; row.appendChild(s); }
    const b = document.createElement("div"); b.className = "b";
    if (first && !mine) { const n = document.createElement("div"); n.className = "n"; n.dir = "auto"; n.textContent = (p && p.name) || "مجهول"; n.style.cursor = "pointer"; n.onclick = e => { e.stopPropagation(); if (Date.now() - (b._f || 0) > 800) peerTap(m.uid, m.room || room); }; b.appendChild(n); }
    if (m.fwd) b.appendChild(el("div", "fw", "↪️ محوّلة من " + m.fwd));
    if (m.reply) { const q = el("div", "qt"); q.dir = "auto"; q.append(el("b", "", m.reply.name || "مجهول"), document.createTextNode(m.reply.text || "")); b.appendChild(q); }
    const tx = document.createElement("div"); tx.className = "tx"; tx.dir = "auto";
    if (m.audio) b.appendChild(audioPlayer(m));
    else {
      if (m.mid || m.img || m.vid) b.appendChild(mediaBox(m));
      if (m.share) b.appendChild(roomCard(m.share));
      if (m.ucard) b.appendChild(userCard(m.ucard));
      if (m.text) { linkify(tx, m.text); if (m.mid || m.img || m.vid) tx.classList.add("mcap"); b.appendChild(tx); const jn = jumboN(m); if (jn) { b.classList.add("jumbo"); if (oldIds && !oldIds.has(m.id)) b.classList.add("pop"); tx.style.fontSize = [0, 64, 52, 44][jn] + "px"; } }
      else if (!m.mid && !m.img && !m.vid && !m.share && !m.ucard) { linkify(tx, m.text || ""); b.appendChild(tx); }
    }
    const rc = {}; Object.values(m.reacts || {}).forEach(k => { if (EMO[k]) rc[k] = (rc[k] || 0) + 1; });
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
    row.onclick = () => { if (selMode) toggleSel(m.id); }; frag.appendChild(row);
  } catch (err) { console.warn("رسالة تالفة اتخطّت", err); } });
  box.replaceChildren(frag); box._ids = new Set(list.map(x => x.id));
  const lm = list[list.length - 1], mineNew = lm && lm.uid === myId && Date.now() - lm.ts < 5000;
  if (fresh) { box.scrollTop = box.scrollHeight; box._pin = 1; requestAnimationFrame(() => { if (box._pin) box.scrollTop = box.scrollHeight; setTimeout(() => { if (box._pin) box.scrollTop = box.scrollHeight; box._pin = 0; }, 400); }); }
  else if (near || mineNew || list.length < 4) box.scrollTop = box.scrollHeight;
  try { netUI(); } catch (_) {} boxScrolled(); _spMsg = true; if (_spMin) hideSplash();
  markSeen(list); updateTotal();
  setStatus(list.length ? "" : "مفيش رسايل لسه. ابدأ إنت!");
}

const mtext = m => m.audio ? "🎤 رسالة صوتية" : (m.mid ? m.mk === "vid" : false) || m.vid ? "🎥 فيديو" + (m.text ? " · " + m.text : "") : m.mid || m.img ? "🖼 صورة" + (m.text ? " · " + m.text : "") : m.ucard ? "🆔 كارت تعريف" : m.share ? "🏠 غرفة: " + (m.share.name || "") : (m.text || "");
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
let selMode = false, selDelArm = false; const sel = new Set();
function selLbl(id, t) { const l = $(id).querySelector(".l"); if (l) l.textContent = t; }
function selSetCount(n) { const c = $("selCount"); if (c.textContent !== String(n)) { c.textContent = n; c.classList.remove("pop"); void c.offsetWidth; c.classList.add("pop"); } }
function selSetDel(arm, n) { const b = $("selDel"); b.classList.toggle("arm", arm); selLbl("selDel", arm ? "تأكيد (" + n + ")" : "حذف"); }
function updSel() { $("selBar").hidden = !selMode; $("selCopy").hidden = $("selFwd").hidden = fwdBlocked(); selSetCount(sel.size); selSetDel(false, 0); selDelArm = false; if (lastList.length) render(lastList); }
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
  vcSnd("del"); Promise.all(mine.map(x => msgCol(x.room || room).doc(x.id).delete())).catch(() => setStatus("ماقدرتش أحذف بعض الرسايل."));
  exitSel();
};
let editingId = null, reads = {}, myReads = {}, readsLoaded = false;
function seenBy(m) { if (isDM(room)) { const rd = (dms[room] || {}).read || {}; return Object.keys(rd).filter(u => u !== m.uid && rd[u] >= m.ts); } return Object.keys(reads).filter(u => u !== m.uid && ((reads[u] || {})[room] || 0) >= m.ts); }
function markSeen(list) {
  if (!db || !readsLoaded || !list.length || document.hidden) return;
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
