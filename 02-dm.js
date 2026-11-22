/* Very Chat — الدردشة الخاصة (DM) */
// ───── الدردشة الخاصة (DM): كل اتنين ليهم محادثة واحدة id ثابت، وبيستخدموا بروفايلهم الحقيقي ─────
let dms = {}, dmFirst = true; const dmDone = {};
const isDM = id => typeof id === "string" && id.startsWith("dm_");
const dmKey = (a, b) => "dm_" + [a, b].sort().join("_");
const dmMembers = id => id.slice(3).split("_");
const dmPeerOf = id => dmMembers(id).find(u => u !== myId) || null;
const msgCol = rid => db.collection(isDM(rid) ? "dmsgs" : "msgs");
const mBase = rid => isDM(rid) ? { room: rid, members: dmMembers(rid) } : { room: rid };
const dmRoom = id => { const p = profiles[dmPeerOf(id)] || {}; return { id, dm: true, name: p.name || "مجهول", emoji: p.emoji, color: p.color, photo: p.photo, blocked: (dms[id] || {}).blockedBy || [] }; };
function flash(t) { flashSnd(t); setStatus(t); setTimeout(() => { if ($("status").textContent === t) setStatus(""); }, 3500); }
const dmEstablished = d => !!d && (!!d.acc || (!!d.last && !d.req));
async function sendDoc(doc) {
  if (!isDM(doc.room)) return db.collection("msgs").add(doc);
  { const g = dms[doc.room]; if (!dmEstablished(g) && !(g && g.req && g.req !== myId)) { const x = new Error("⏳ مينفعش تبعت رسايل لحد ما يوافق على طلب المحادثة"); x.custom = true; throw x; } }
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
  if (d && d.req === myId && !d.acc && d.last && ((d.cleared || {})[u] || 0) < d.last.ts) { flash("⏳ طلبك لسه معلّق، استنى موافقته"); return; }
  try {
    await db.collection("dms").doc(key).set({ members: [myId, u].sort(), req: myId, last: { uid: myId, ts: Date.now(), text: "👋 طلب محادثة" }, unread: { [u]: FV().increment(1) } }, { merge: true });
    flash("✓ اتبعت طلب المحادثة، هيوصلك إشعار أول ما يوافق");
  } catch (e) { flash(errMsg(e)); }
}
function openPeer(u) {
  if (!u || u === myId) return;
  const p = profiles[u] || {}, key = dmKey(myId, u), blocked = ((dms[key] || {}).blockedBy || []).includes(myId), c = $("mcard"); c.textContent = "";
  const head = el("div", "mprev"); head.style.cssText += ";display:flex;align-items:center;gap:12px";
  const a = avatar(p); a.style.cssText += ";width:56px;height:56px;font-size:28px";
  const t = el("div"), nm = el("b", "", p.name || "مجهول"); nm.style.display = "block"; t.append(nm); head.append(a, t); c.append(head);
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
  const tx = el("div", "rt"), sb = el("small"); sb.dir = "auto";
  sb.textContent = ((d.blockedBy || []).length ? "🚫 " : "") + (d.req === myId && !d.acc ? "⏳ " : "") + (d.last ? (d.last.uid === myId ? "أنت: " : "") + d.last.text : "");
  tx.append(el("b", "", p.name || "مجهول"), sb); row.append(avatar(p), tx);
  const un = unreadOf(d.id); if (un) row.append(el("span", "bdg", un > 99 ? "99+" : String(un)));
  let tm, fired = false;
  row.onclick = () => { if (fired) { fired = false; return; } openDM(u); };
  const go = () => { fired = false; tm = setTimeout(() => { fired = true; openDMMenu(d); }, 500); }, stop = () => clearTimeout(tm);
  ["touchstart", "mousedown"].forEach(ev => row.addEventListener(ev, go, { passive: true }));
  ["touchmove", "touchend", "touchcancel", "mouseup", "mouseleave"].forEach(ev => row.addEventListener(ev, stop, { passive: true }));
  row.addEventListener("contextmenu", e => { e.preventDefault(); stop(); fired = true; openDMMenu(d); });
  return row;
}
const dmClearedAt = d => ((d && d.cleared) || {})[myId] || 0;
async function wipeMyDm(id) {
  const s = await db.collection("dmsgs").where("room", "==", id).where("members", "array-contains", myId).get();
  const mine = s.docs.filter(x => x.data().uid === myId), rest = s.docs.filter(x => x.data().uid !== myId).map(x => x.data()).sort((a, b) => b.ts - a.ts);
  for (let i = 0; i < mine.length; i += 400) { const b = db.batch(); mine.slice(i, i + 400).forEach(x => b.delete(x.ref)); await b.commit(); }
  const lt = rest[0];
  await db.collection("dms").doc(id).update({ last: lt ? { uid: lt.uid, ts: lt.ts, text: mtext(lt).slice(0, 60) } : FV().delete() }).catch(() => {});
  return mine.length;
}
function openDMMenu(d) {
  const u = dmPeerOf(d.id), p = profiles[u] || {}, c = $("mcard"); c.textContent = ""; const close = () => { $("msheet").hidden = true; };
  const head = el("div", "mprev"); head.style.cssText += ";display:flex;align-items:center;gap:10px";
  const ic = avatar(p); ic.style.cssText += ";width:42px;height:42px;font-size:22px";
  const nm = el("span", "", p.name || "مجهول"); nm.style.fontWeight = "700"; head.append(ic, nm); c.append(head);
  const acts = el("div", "acts"), blocked = (d.blockedBy || []).includes(myId);
  const act = (ico, label, grad, fn) => { const b = el("button", "act"); b.type = "button"; const i = el("i", "", ico); i.style.background = grad; const sp = el("span", "", label); b.append(i, sp); b.onclick = () => fn(b, sp); acts.append(b); };
  const sure = (b, sp) => { if (!b.dataset.ok) { b.dataset.ok = "1"; sp.textContent = "تأكيد؟"; return false; } return true; };
  act("💬", "فتح", "linear-gradient(135deg,#5aa9ff,#2f6fed)", () => { close(); closeDrawer(); openDM(u); });
  act("🧹", "مسح من عندي", "linear-gradient(135deg,#6bd0c0,#2a9d8f)", async (b, sp) => {
    if (!sure(b, sp)) return; close();
    try { await db.collection("dms").doc(d.id).update({ ["cleared." + myId]: Math.max(Date.now(), ((d.last || {}).ts || 0) + 1), ["unread." + myId]: 0 }); flash("🧹 اتمسحت المحادثة من عندك"); } catch (e) { flash(errMsg(e)); }
  });
  act("🗑", "حذف رسايلي للطرفين", "linear-gradient(135deg,#ff7a7a,#d64545)", async (b, sp) => {
    if (!sure(b, sp)) return; close();
    try { const n = await wipeMyDm(d.id); flash("🗑 اتحذفت " + n + " رسالة"); } catch (e) { flash(errMsg(e)); }
  });
  act(blocked ? "✅" : "🚫", blocked ? "إلغاء الحظر" : "حظر", "linear-gradient(135deg,#a07cff,#6b46e0)", async () => {
    close();
    try { await db.collection("dms").doc(d.id).set({ members: [myId, u].sort(), blockedBy: blocked ? AR(myId) : AU(myId) }, { merge: true }); flash(blocked ? "✓ اتلغى الحظر" : "🚫 اتحظر"); } catch (e) { flash(errMsg(e)); }
  });
  acts.style.gridTemplateColumns = "repeat(4,1fr)"; c.append(acts); $("msheet").hidden = false;
}
function buildDMs(q) {
  const box = $("dmList"), sub = $("dmSub"), qn = nzq(q), qc = normFCode(q); box.textContent = "";
  const list = Object.values(dms).filter(d => d.last && d.last.ts > dmClearedAt(d) && !pendingIn(d) && !(d.req === myId && !d.acc)).sort((a, b) => b.last.ts - a.last.ts).filter(d => { if (!q) return true; const p = profiles[dmPeerOf(d.id)] || {}; return nzq(p.name).includes(qn) || (qc.length >= 2 && String(p.fcode || "").includes(qc)); });
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
  pushLocal("💬 " + ((profiles[dmPeerOf(d.id)] || {}).name || "رسالة خاصة"), d.last.text, d.id);
}

