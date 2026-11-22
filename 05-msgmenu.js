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
  node.addEventListener("contextmenu", e => { e.preventDefault(); stop(); if (!selMode) { node._f = Date.now(); openMsg(m); } });
}
const MXI = {
  reply: '<svg viewBox="0 0 24 24"><path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 6 6v3"/></svg>',
  copy: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V6.5A2.5 2.5 0 0 1 7.5 4H15"/></svg>',
  fwd: '<svg viewBox="0 0 24 24"><path d="m15 14 5-5-5-5"/><path d="M20 9H10a6 6 0 0 0-6 6v3"/></svg>',
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
function openMsg(m) {
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
  qb("mx-purple", MXI.sel, "تحديد", () => { close(); enterSel(m.id); });
  quick.style.gridTemplateColumns = "repeat(" + quick.children.length + ",1fr)"; wrap.appendChild(quick);
  // 4) باقي الأوامر: قايمة
  if (!mine && !isDM(room) && canDMFrom(m.uid, rid)) row("", MXI.dm, "مراسلة خاصة", () => { close(); openPeer(m.uid); });
  if (mine && !m.audio && !writeBlock(cr0) && (!cr0 || !cr0.noEdit || adminOf(cr0))) {
    row("", MXI.edit, "تعديل الرسالة", () => { close(); clearReply(); editingId = m.id; $("inp").value = m.text; $("editBar").hidden = false; $("sendBtn").innerHTML = SVG_CHECK; $("inp").focus(); });
  }
  if (cr0 && adminOf(cr0) && !mine && m.uid !== cr0.by && (ownerOf(cr0) || !(cr0.admins || []).includes(m.uid))) row("", MXI.user, "إدارة العضو", () => { close(); memberMenu(cr0, m.uid); });
  if (cr0 && adminOf(cr0)) row("", MXI.pin, "تثبيت في الغرفة", () => { close(); upd({ pinned: { id: m.id, name: nameOf(m.uid), text: mtext(m).slice(0, 120) } }); });
  if ((mine && (!cr0 || !cr0.noDelOwn || adminOf(cr0))) || (cr0 && adminOf(cr0))) {
    row("dg", MXI.del, "حذف الرسالة", (b, sp) => {
      if (b.dataset.ok) { close(); vcSnd("del"); msgCol(rid).doc(m.id).delete().catch(() => setStatus("ماقدرتش أحذف الرسالة.")); }
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
      const r = el("div", "seen-r"), nm = document.createElement("bdi"); nm.textContent = u === myId ? "أنت" : nameOf(u, rid);
      const e = el("span", "rxe"); e.innerHTML = EMO[k].s; r.append(avatar(profileFor(u, rid)), nm);
      if (u === myId) { r.append(el("small", "seen-hint", "اضغط للإزالة")); r.style.cursor = "pointer"; r.onclick = () => { close(); toggleReact(m, k); }; }
      r.append(e); return r;
    });
    wrap.appendChild(fold(MXI.heart, "linear-gradient(135deg,#ff7aa8,#e0457b)", "التفاعلات", rx.length, kinds, rows, rx.length <= 4));
  }
  if (seenOK()) {
    const seen = seenBy(m), n = seen.length, stack = seen.slice(0, 3).map(u => avatar(profileFor(u)));
    if (n > 3) stack.push(el("span", "more", "+" + (n - 3)));
    const rows = seen.map(u => { const r = el("div", "seen-r"), nm = document.createElement("bdi"); nm.textContent = nameOf(u); r.append(avatar(profileFor(u)), nm, el("span", "ok", "✓✓")); return r; });
    wrap.appendChild(fold(MXI.eye, "", n ? "شوهدت بواسطة" : "لسه محدش شافها", n, stack, rows, n <= 3));
  }
  $("msheet").hidden = false;
  wrap.scrollTop = 0;
}

const PAGE_URL = location.href.split(/[?#]/)[0];
const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x !== undefined) e.textContent = x; return e; };
const canSee = r => !(r.banned || []).includes(myId) && (r.by === myId || (r.members || []).includes(myId) || (!r.private && !r.members));
const isOwner = r => !r.by || r.by === myId;
const nameOf = (u, rid) => (profileFor(u, rid) || {}).name || "مجهول";
const newCode = () => { const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", b = new Uint8Array(10); try { crypto.getRandomValues(b); } catch (_) { for (let i = 0; i < 10; i++) b[i] = Math.floor(Math.random() * 256); } return Array.from(b, x => A[x % 32]).join(""); };
let joinId = (location.hash.match(/^#r-([A-Za-z0-9-]+)$/) || [])[1] || null;
const FV = () => firebase.firestore.FieldValue;
const findByCode = code => rooms.find(x => String(x.code || "").toLowerCase() === String(code || "").trim().toLowerCase());
