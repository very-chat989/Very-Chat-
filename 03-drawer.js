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
  const sb = document.createElement("small"); sb.dir = "auto";
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
$("menuBtn").onclick = () => { $("dSearch").value = ""; buildChips(); $("dNotif").hidden = !("Notification" in window) || Notification.permission !== "default"; $("drawer").hidden = false; };
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
