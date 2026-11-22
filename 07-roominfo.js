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
}
function renderPin() {
  const r = curR(), p = r && r.pinned, box = $("pin"); box.textContent = "";
  box.hidden = !p; if (!p) return;
  const t = el("span", "", "📌 " + (p.name || "") + ": " + (p.text || "")); t.dir = "auto"; box.append(t);
  if (adminOf(r)) { const x = el("button", "", "✕"); x.onclick = () => upd({ pinned: FV().delete() }); box.append(x); }
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
function addFriend(r, mem) {
  const c = $("mcard"); c.textContent = ""; c.append(el("div", "mprev mh", "＋ إضافة صديق"));
  const box = el("div", "acts"); box.style.cssText = "display:flex;flex-direction:column;gap:6px;max-height:55vh;overflow-y:auto";
  box.append(friendFinder(mem, [...(r.banned || []), ...(r.invites || [])], async u => { $("msheet").hidden = true; try { await db.collection("rooms").doc(r.id).update({ invites: AU(u) }); notifyUser(u, r, "invite"); flash("✓ اتبعتله دعوة، هيدخل أول ما يوافق"); } catch (e) { flash(errMsg(e)); } }));
  c.append(box); $("msheet").hidden = false;
}
const GEN_KICK = [["⏱️", "ساعة", 3600000], ["🌙", "24 ساعة", 86400000], ["📅", "7 أيام", 604800000]];
const kickedLeft = (r, u) => Math.max(0, ((r.removedUntil || {})[u] || 0) - Date.now());
function leftTxt(ms) { const m = Math.ceil(ms / 60000); return m < 90 ? m + " دقيقة" : m < 2880 ? Math.round(m / 60) + " ساعة" : Math.round(m / 1440) + " يوم"; }
function memberMenu(r, u) {
  const c = $("mcard"); c.textContent = ""; const close = () => { $("msheet").hidden = true; }, G = r.id === "general";
  const isAdm = (r.admins || []).includes(u), isMut = (r.muted || []).includes(u) || ((r.mutedUntil || {})[u] || 0) > Date.now();
  const head = el("div", "mprev mh");
  const a = avatar(profileFor(u, r.id)); a.style.cssText += ";width:68px;height:68px;font-size:34px";
  const nm = el("b", "", nameOf(u, r.id)); nm.dir = "auto";
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
        const nb = el("b", "", nameOf(u)); nb.dir = "auto"; row.append(avatar(profileFor(u)), nb, ok, no); c.append(row);
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
    if (admin && !G) { const ac = card(null); ac.append(actRow("➕ إضافة صديق", "ابعتله دعوة بكوده", () => addFriend(r, mem))); }
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
        const row = el("div", "ri-mem" + (isOn(u) ? " on" : "")), mi = el("div", "mi"), l1 = el("div", "ri-nm"), nm = el("b", "", nameOf(u, r.id) + (u === myId ? " (أنت)" : "")); nm.dir = "auto"; row.dataset.uid = u;
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
      riPaged(c, r.banned, u => { const row = el("div", "ri-mem"), b = el("button", "ghost", "إلغاء الحظر"); b.onclick = () => upd({ banned: AR(u) }, r.id); const nb = el("b", "", nameOf(u)); nb.dir = "auto"; row.append(avatar(profileFor(u)), nb, b); return row; });
    }
  }

  /* ═══ تاب: الإدارة (الغرفة العامة) ═══ */
  if (tab === "staff") {
    const staff = [...new Set([...(r.by ? [r.by] : []), ...(r.admins || [])])];
    const sc = card("🛡️ المشرفين (" + staff.length + ")", "stack");
    staff.forEach(u => {
      const row = el("div", "ri-mem"), nb = el("b", "", nameOf(u, "general") + (u === myId ? " (أنت)" : "")); nb.dir = "auto";
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
      riPaged(c, r.banned, u => { const row = el("div", "ri-mem"), b = el("button", "ghost", "إلغاء الحظر"); b.onclick = () => upd({ banned: AR(u) }, r.id); const nb = el("b", "", nameOf(u)); nb.dir = "auto"; row.append(avatar(profileFor(u)), nb, b); return row; });
    }
    const kd = Object.keys(r.removedUntil || {}).filter(u => kickedLeft(r, u) > 0);
    if (kd.length) {
      const kc = card("🚪 المُزالون مؤقتاً (" + kd.length + ")", "stack");
      riPaged(kc, kd, u => { const row = el("div", "ri-mem"), b = el("button", "ghost", "إرجاع"); b.onclick = () => upd({ ["removedUntil." + u]: FV().delete() }, "general"); const nm = el("b", "", nameOf(u, "general")); nm.dir = "auto"; row.append(avatar(profileFor(u, "general")), nm, el("span", "ri-tag", leftTxt(kickedLeft(r, u))), b); return row; });
    }
    if ((r.muted || []).length) {
      const mc2 = card("🔇 المكتومين (" + r.muted.length + ")", "stack");
      riPaged(mc2, r.muted, u => { const row = el("div", "ri-mem"), b = el("button", "ghost", "إلغاء الكتم"); b.onclick = () => upd({ muted: AR(u), ["mutedUntil." + u]: FV().delete() }, "general"); const nb = el("b", "", nameOf(u, "general")); nb.dir = "auto"; row.append(avatar(profileFor(u, "general")), nb, b); return row; });
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
          const res = await wipeRoomMsgs(r.id, n => busy("جاري المسح… " + n));
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

