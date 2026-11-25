/* Very Chat — 2/4: الغرف (إعدادات الغرفة، التثبيت، الأعضاء والمشرفين، البروفايل وشخصيات الشلة) */

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
  const hero = el("div", "ri-hero"); hero.style.background = "linear-gradient(160deg," + (safeCol(r.color) || "#5b6b78") + ",#0d1413)";
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
      tile(visible.length, "عضو", "👥"); tile(visible.filter(isAdm).length, "مشرف", "🛡️");
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
  if (unsub) unsub(); if (window._dog) clearTimeout(window._dog);
  setStatus("جاري تحميل الرسايل…");
  const timer = setTimeout(() => setStatus("مش قادر أوصل للرسايل دلوقتي، ممكن النت ضعيف."), 10000);
  // لو التحميل علّق (غالبًا بسبب قاعدة بيانات الكاش المحلية): أعد التشغيل مرة واحدة من غير كاش محلي
  const dog = window._dog = setTimeout(() => { try { if (navigator.onLine && !noPersist && !persistOff && !firstDone) { localStorage.setItem("vc_np", String(Date.now())); location.reload(); } } catch (_) {} }, 5000);
  let firstSnap = true, firstDone = false, pendSig = "";
  unsub = (isDM(id) ? db.collection("dmsgs").where("room", "==", id).where("members", "array-contains", myId) : db.collection("msgs").where("room", "==", id)).onSnapshot({ includeMetadataChanges: true },
    s => {
      clearTimeout(timer); clearTimeout(dog); firstDone = true; NET.cache = s.metadata.fromCache;
      const pend = s.docs.filter(d => d.metadata.hasPendingWrites).map(d => d.id).join(",");
      if (!firstSnap && !s.docChanges().length && pend === pendSig) { netUI(); return; }
      firstSnap = false; pendSig = pend;
      const clr = isDM(id) ? dmClearedAt(dms[id]) : 0; { const st = $("status").textContent; if (st.startsWith("جاري تحميل") || st.startsWith("مش قادر أوصل")) setStatus(""); }
      render(s.docs.map(d => ({ ...d.data(), id: d.id, _p: d.metadata.hasPendingWrites })).filter(m => m.ts > clr).sort((a, b) => (a.ts - b.ts) || a.id.localeCompare(b.id)).slice(-150));
    },
    e => { clearTimeout(timer); clearTimeout(dog); setStatus(errMsg(e)); });
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
  L.forEach(c => { c.url = "data:image/svg+xml;utf8," + encodeURIComponent(c.s.replace("<svg ", "<svg xmlns='http://www.w3.org/2000/svg' ")); CHAR_URLS.add(c.url); });
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