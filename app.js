/* Very Chat — 4/4: التشغيل (الاستطلاع، التخزين، التحديث، الإيموجي، start، الطلبات، الحضور، الأصوات) */
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
  const QMAX = 255, OMAX = 100, MAXO = 12;
  const c = $("mcard"); c.textContent = ""; const w = el("div", "plm plfull");
  const close = () => { $("msheet").hidden = true; };
  // الهيدر: سهم رجوع + عنوان (شاشة كاملة زي واتساب)
  const hd = el("div", "plh"), bk = el("button", "plbk"); bk.type = "button"; bk.setAttribute("aria-label", "رجوع");
  bk.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16M14 6l6 6-6 6"/></svg>';
  bk.onclick = close; hd.append(bk, el("h3", "plht", "إنشاء استطلاع رأي"));
  // حقل بإطار وعنوان بيطلع على الحد (floating label) + عدّاد حروف
  const fld = (inp, idle, up, max) => {
    const wrap = el("div", "plf"), box = el("div", "plbx"), l1 = el("span", "pl1", idle), l2 = el("span", "pl2", up), cnt = el("small", "plcnt");
    inp.maxLength = max; inp.dir = "auto"; box.append(inp, l1, l2); wrap.append(box, cnt);
    const upd = () => { box.classList.toggle("has", !!inp.value); cnt.textContent = arN(inp.value.length) + "/" + arN(max); };
    upd(); return { wrap, box, upd, l2 };
  };
  const q = el("textarea", "plq"); q.rows = 1; const qf = fld(q, "اطرح سؤالاً", "اطرح سؤالاً", QMAX);
  const ol = el("div", "plo"), err = el("div", "plerr"); err.hidden = true;
  const mt = el("label", "plt"), mc = el("input"); mc.type = "checkbox"; mc.className = "tgl"; mt.append(el("span", "", "السماح بإجابات متعددة"), mc);
  const go = el("button", "plsend"); go.type = "button"; go.setAttribute("aria-label", "إرسال الاستطلاع");
  go.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M2 21 23 12 2 3v7l15 2-15 2z" transform="matrix(-1 0 0 1 25 0)"/></svg>';
  const vals = () => [...new Set([...ol.querySelectorAll("input")].map(i => i.value.trim()).filter(Boolean))];
  const check = () => { const ok = !!q.value.trim() && vals().length >= 2; go.disabled = !ok; go.classList.toggle("off", !ok); err.hidden = true; };
  const sync = () => { const n = ol.children.length; ol.classList.toggle("min", n <= 2); [...ol.children].forEach((r, i) => { r._l2.textContent = "خيار " + arN(i + 1); }); check(); };
  const mk = () => {
    const inp = el("input"); inp.type = "text"; inp.enterKeyHint = "next";
    const f = fld(inp, "+ إضافة", "خيار", OMAX), r = f.wrap; r._l2 = f.l2;
    const x = el("button", "plx", "✕"); x.type = "button"; x.setAttribute("aria-label", "حذف الاختيار"); f.box.append(x);
    x.onclick = () => { if (ol.children.length <= 2) return; r.remove(); const l = ol.lastElementChild; if (l && l.querySelector("input").value.trim() && ol.children.length < MAXO) mk(); sync(); };
    inp.oninput = () => { f.upd(); if (r === ol.lastElementChild && inp.value.trim() && ol.children.length < MAXO) mk(); check(); };
    inp.onkeydown = e => { if (e.key !== "Enter") return; e.preventDefault(); const n = r.nextElementSibling; if (n) n.querySelector("input").focus(); else inp.blur(); };
    ol.append(r); sync(); return inp;
  };
  mk(); mk();
  q.oninput = () => { qf.upd(); q.style.height = "auto"; q.style.height = Math.min(q.scrollHeight, 150) + "px"; check(); };
  q.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); const f = ol.querySelector("input"); if (f) f.focus(); } };
  const sc = el("div", "plsc");
  sc.append(el("div", "pls", "السؤال"), qf.wrap, el("div", "pls", "الخيارات"), ol, el("div", "plsep"), mt, err);
  w.append(hd, sc, go); c.append(w); check(); $("msheet").hidden = false;
  let sending = false;
  go.onclick = async () => {
    if (sending) return;
    const qq = q.value.trim(), opts = vals();
    if (!qq) { q.focus(); return; } if (opts.length < 2) { err.textContent = "اكتب اختيارين مختلفين على الأقل"; err.hidden = false; return; }
    if (!mediaGuard(rid)) { close(); return; }
    sending = true; go.disabled = true; go.classList.add("busy");
    const post = postMedia({ poll: { q: qq, opts: opts.slice(0, MAXO), multi: !!mc.checked } }, rid);
    try {
      // لو الإرسال فشل بسرعة (صلاحيات/قواعد) نفضل في الشاشة ونقول السبب؛ لو بطيء (نت ضعيف) نقفل والرسالة هتتبعت لوحدها
      const r = await Promise.race([post.then(() => "ok"), new Promise(x => setTimeout(() => x("slow"), 3500))]);
      if (r === "slow") post.catch(e => { console.warn("poll send", e); flash(errMsg(e)); });
      close();
    } catch (e) {
      console.warn("poll send", e); sending = false; go.classList.remove("busy"); check();
      err.textContent = (e && e.custom ? e.message : errMsg(e)) || "الاستطلاع ماتبعتش، جرّب تاني."; err.hidden = false;
      try { err.scrollIntoView({ block: "nearest" }); } catch (_) {}
    }
  };
  setTimeout(() => { try { q.focus({ preventScroll: true }); } catch (_) { q.focus(); } }, 280);
  // أندرويد بيصغّر الصفحة مع الكيبورد لوحده (CSS بس)؛ iOS بيغطي من غير ما يصغّر فبنثبّت الشاشة فوق الكيبورد
  { const ms = $("msheet"), vv = window.visualViewport;
    if (vv) {
      let raf = 0;
      const clr = () => { ms.style.top = ms.style.bottom = ms.style.height = ""; };
      const apply = () => { raf = 0; if (ms.hidden || !w.isConnected) return off(); const ov = window.innerHeight - vv.height; if (ov > 80) { ms.style.top = Math.round(vv.offsetTop) + "px"; ms.style.bottom = "auto"; ms.style.height = Math.round(vv.height) + "px"; } else clr(); };
      const on = () => { if (!raf) raf = requestAnimationFrame(apply); };
      const off = () => { if (raf) cancelAnimationFrame(raf); raf = 0; vv.removeEventListener("resize", on); vv.removeEventListener("scroll", on); mo.disconnect(); clr(); };
      const mo = new MutationObserver(() => { if (ms.hidden || !w.isConnected) off(); });
      vv.addEventListener("resize", on); vv.addEventListener("scroll", on);
      mo.observe(ms, { attributes: true, attributeFilter: ["hidden"] }); mo.observe(c, { childList: true });
      on();
    } }
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
    r.onclick = e => { if (selMode) return; e.stopPropagation(); votePoll(m, i); }; box.append(r);
  });
  const ft = el("button", "pft", total ? arN(total) + " صوت · التفاصيل" : "مفيش أصوات لسه، كون أول واحد"); ft.type = "button"; ft.onclick = e => { if (selMode) return; e.stopPropagation(); if (total) openVoters(m); }; box.append(ft);
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
let noPersist = false, persistOff = false;
async function preWipe() {
  try { const t = +localStorage.getItem("vc_np") || 0; if (t && Date.now() - t < 3600e3) { noPersist = persistOff = true; localStorage.removeItem("vc_np"); localStorage.setItem("vc_np_clean", "1"); } } catch (e) {}
  let flag = ""; try { flag = localStorage.getItem("vc_wipe") || ""; localStorage.removeItem("vc_wipe"); } catch (e) {}
  try { if (!flag && localStorage.getItem("vc_np_clean")) { flag = "cache"; localStorage.removeItem("vc_np_clean"); } } catch (e) {}
  if (!flag) return;
  try {
    if (indexedDB.databases) {
      const dbs = await withTimeout(indexedDB.databases(), 1500) || [];
      // مابنمسحش قاعدة بيانات تسجيل الدخول (firebaseLocalStorageDb) أبدًا: لو تبويب تاني فاتحها المسح بيتعلّق وكل فتح بعده بيستنى للأبد
      await Promise.all(dbs.filter(d => d.name && d.name.startsWith("firestore/")).map(d => withTimeout(new Promise(r => { const q = indexedDB.deleteDatabase(d.name); q.onsuccess = q.onerror = r; q.onblocked = () => { noPersist = true; r(); }; }), 2000)));
    }
  } catch (e) {}
  if (flag === "all") { try { localStorage.clear(); sessionStorage.clear(); } catch (e) {} }
}
async function wipeStorage(everything) {
  await withTimeout(idbClear(), 3000); MEDIA.clear(); MEDIA_P.clear(); DLD.clear(); try { localStorage.removeItem("vc_dl"); } catch (e) {}
  try { localStorage.setItem("vc_wipe", everything ? "all" : "cache"); } catch (e) {}
  await withTimeout((async () => { if (window.caches) await Promise.all((await caches.keys()).map(k => caches.delete(k))); })(), 1500);
  if (everything) await withTimeout((async () => { const rs = await navigator.serviceWorker.getRegistrations(); await Promise.all(rs.map(r => r.unregister())); })(), 1500);
  if (everything) {
    // تسجيل خروج حقيقي قبل أي مسح، علشان مانعتمدش على مسح قاعدة بيانات الدخول
    try { if (window.firebase && firebase.apps && firebase.apps.length) await withTimeout(firebase.auth().signOut(), 2500); } catch (e) {}
    try { if (typeof pushUnreg === "function") await withTimeout(pushUnreg(), 2500); } catch (e) {}
  }
  try { if (db) { await withTimeout(db.terminate(), 2000); if (everything) await withTimeout(db.clearPersistence(), 2500); } } catch (e) {}
  if (everything) { try { localStorage.clear(); sessionStorage.clear(); } catch (e) {} }
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
    const m = (await r.text()).match(/name="vc-build" content="([^"]+)"/); if (!m || m[1] === BUILD || !/^[0-9A-Za-z._-]{1,40}$/.test(m[1])) return;
    updating = true; setStatus("🔄 فيه تحديث جديد، جاري التحميل…");
    await withTimeout((async () => { if (window.caches) await Promise.all((await caches.keys()).map(k => caches.delete(k))); const rs = await navigator.serviceWorker.getRegistrations(); await Promise.all(rs.map(x => x.update().catch(() => {}))); })(), 2500);
    location.replace(PAGE_URL + "?v=" + m[1] + location.hash);
  } catch (e) {}
}
setTimeout(checkUpdate, 300); setInterval(checkUpdate, 60000);
// لما بترجع من منتقي الصور/الفيديو مانعملش تحديث ولا إعادة رسم (ده اللي كان بيعمل وميض الشاشة)
document.addEventListener("click", e => { if (e.target && e.target.type === "file") window._pickAt = Date.now(); }, true);
const justPicked = () => Date.now() - (window._pickAt || 0) < 30000;
document.addEventListener("visibilitychange", () => { if (!document.hidden && !justPicked()) checkUpdate(); });

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
    myId = user.uid; db = firebase.firestore(); if (!noPersist) { try { db.settings({ cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED }); } catch (e) {} try { await withTimeout(db.enablePersistence({ synchronizeTabs: true }), 4000); } catch (e) {} }
  } catch (e) { setStatus(e.code === "auth/operation-not-allowed" || e.code === "auth/admin-restricted-operation" ? "فعّل تسجيل الدخول Anonymous من Firebase ← Authentication ← Sign-in method." : "ماقدرتش أتصل بـ Firebase: " + (e.code || e.message)); $("sendBtn").disabled = true; starting = false; setTimeout(() => { if (!started) start(); }, 6000); return; }
  started = true; starting = false; $("sendBtn").disabled = false; syncNicks();
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
  document.addEventListener("visibilitychange", () => { if (!document.hidden && lastList.length && !justPicked()) render(lastList); });
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
const PRES_TTL = 300000, PRES_BEAT = 120000, TYPE_TTL = 5000;   // زي واتساب: الحضور بيتسمع للشخص اللي فاتح محادثته بس (مش للكل) علشان قراءات Firebase ما تزيدش بعدد المستخدمين
let presence = {}, peerUn = null, peerId = null, presOn = false, typingSent = 0, typingActive = false;
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
// بنسمع وثيقة حضور واحدة بس: الطرف التاني في المحادثة الخاصة المفتوحة (مش مجموعة الحضور كلها)
function watchPeer() {
  const other = isDM(room) ? room.slice(3).split("_").find(u => u !== myId) : null;
  if (other === peerId) return;
  if (peerUn) { try { peerUn(); } catch (_) {} peerUn = null; }
  peerId = other || null; presence = {};
  if (!other || !db) { paintHSub(); return; }
  peerUn = db.collection("presence").doc(other).onSnapshot(d => { presence = d.exists ? { [other]: d.data() } : {}; paintHSub(); }, () => {});
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
  const total = countHidden(r) ? 0 : gen ? Object.keys(profiles).length : mem ? mem.size : 0;
  return { typing: false, text: total ? "👥 " + total + " عضو" : "" };
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
  watchPeer();
  presWrite({ typing: "", tts: 0 });
  setInterval(() => { if (!document.hidden) presWrite(); }, PRES_BEAT);
  setInterval(paintHSub, 8000);
  document.addEventListener("visibilitychange", () => { presWrite(document.hidden ? { typing: "", tts: 0 } : null); paintHSub(); });
  window.addEventListener("pagehide", () => presWrite({ online: false, typing: "", tts: 0 }));
  window.addEventListener("online", () => presWrite());
  const inp = $("inp");
  inp.addEventListener("input", () => { if (!inp.value.trim()) { stopTyping(); return; } const n = Date.now(); if (isDM(room) && n - typingSent > 2500) { typingSent = n; typingActive = true; presWrite({ typing: room, tts: n }); } });
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
{ const _open = openRoom; openRoom = function (id) { _open(id); clearNotifs(id); stopTyping(); if (started) { presWrite({ typing: "", tts: 0 }); watchPeer(); paintHSub(); } }; }

const vv = window.visualViewport;
function fit() {
  if (!vv) return;
  const cs = getComputedStyle(document.documentElement);
  const h = vv.height - (parseFloat(cs.paddingTop) || 0) - (parseFloat(cs.paddingBottom) || 0);
  document.documentElement.style.setProperty("--vh", Math.max(200, h) + "px");
  const inSheet = !!(document.activeElement && document.activeElement.closest && document.activeElement.closest("#msheet,#sheet"));
  if (!inSheet) {   // جوه الشيت (استطلاع/غيره) ما نحاربش سكرول المتصفح، ده اللي كان بيعمل الرجفة
    document.querySelector(".app").style.transform = vv.offsetTop ? "translateY(" + vv.offsetTop + "px)" : "";
    if (window.scrollX || window.scrollY) window.scrollTo(0, 0);
  }
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
