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
    const ch = el("div", "sto-chips"); ch.append(chip("وسائط حمّلتها", DLD.size), chip("ملفات محمّلة في الجلسة", MEDIA.size + (mem ? " (" + fmtSize(mem) + ")" : "")));
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
  MEDIA.clear(); MEDIA_P.clear(); DLD.clear(); try { localStorage.removeItem("vc_dl"); } catch (e) {}
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
const closePic = () => { $("lb").hidden = true; };
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
  const ids = ["lb", "msheet", "sheet", "drawer", "rinfo", "selBar", "emoPanel"];
  const open = id => { const e = $(id); return !!e && !e.hidden; };
  const forced = () => open("sheet") && sheetMode === "me" && !$("cancelSheet").offsetParent;
  const closers = { lb: () => { $("lb").hidden = true; }, msheet: () => { $("msheet").hidden = true; }, sheet: () => { $("sheet").hidden = true; }, drawer: () => closeDrawer(), rinfo: () => closeInfo(), selBar: () => exitSel(), emoPanel: () => { $("emoPanel").hidden = true; } };
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
  syncRecent();
  document.addEventListener("visibilitychange", () => { if (!document.hidden && lastList.length) render(lastList); });
  db.collection("reads").onSnapshot(s => {
    reads = {}; s.docs.forEach(d => { reads[d.id] = d.data(); });
    if (!readsLoaded) { readsLoaded = true; myReads = { ...(reads[myId] || {}) }; }
    if (lastList.length) render(lastList);
  }, () => {});
  watchRooms();
  db.collection("dms").where("members", "array-contains", myId).onSnapshot(s => {
    const prevClr = dmClearedAt(dms[room]); dms = {}; s.docs.forEach(d => { dms[d.id] = { ...d.data(), id: d.id }; });
    s.docChanges().forEach(ch => { const d = ch.doc.data(); if (!dmFirst && ch.type !== "removed" && d.last && d.last.uid !== myId && d.last.ts >= T0 - 2000 && d.last.ts > (dmDone[ch.doc.id] || 0) && !s.metadata.hasPendingWrites) { dmDone[ch.doc.id] = d.last.ts; pendingIn(d) ? reqToast(d, ch.doc.id) : notifyDM({ ...d, id: ch.doc.id }); } });
    { const wasFirst = dmFirst, nc = isDM(room) ? dmClearedAt(dms[room]) : 0; dmFirst = false; buildChips(); updateTotal(); if (isDM(room)) { refreshMe(); if (nc !== prevClr || (wasFirst && nc)) openRoom(room); } }
  }, () => {});
  buildChips(); openRoom(room); presenceStart();
}
