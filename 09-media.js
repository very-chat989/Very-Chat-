/* Very Chat — الإرسال والصوت والصور والفيديو */
// ───── الإرسال ─────

// ───── رسائل صوتية ─────
const fmtDur = t => Math.floor(t / 60) + ":" + String(Math.floor(t % 60)).padStart(2, "0");
const AUD = new Map(); let curAudio = null; let VRATE = 1; try { VRATE = +localStorage.getItem("vrate") || 1; } catch (_) {}
function audioPlayer(m) {
  const w = el("div", "vp"), btn = el("button", "vpb", "▶"), wv = el("div", "vw"), tm = el("span", "vpd", fmtDur(m.dur || 0)), sp = el("button", "vps", VRATE + "×");
  let h = 0; for (const c of String(m.id)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const N = 30, bars = []; for (let i = 0; i < N; i++) { h = (h * 1664525 + 1013904223) >>> 0; const x = el("i"); x.style.height = (22 + (h >>> 24) % 78) + "%"; bars.push(x); wv.append(x); }
  btn.type = sp.type = "button"; w.append(btn, wv, sp, tm);
  let a = AUD.get(m.id); if (!a) { a = new Audio(okSrc(m.audio, "audio") ? m.audio : ""); a.preload = "none"; AUD.set(m.id, a); if (AUD.size > 40) for (const [k, v] of AUD) { if (v.paused && v !== curAudio && k !== m.id) { AUD.delete(k); break; } } }
  const sync = () => { btn.textContent = a.paused ? "▶" : "⏸"; const d = a.duration || m.dur || 0, p = d && a.currentTime ? a.currentTime / d : 0; bars.forEach((x, i) => x.classList.toggle("on", i / N < p)); tm.textContent = fmtDur(a.paused && !a.currentTime ? (m.dur || 0) : a.currentTime); w.classList.toggle("play", !a.paused); };
  a.ontimeupdate = sync; a.onplay = sync; a.onpause = sync; a.onended = () => { a.currentTime = 0; sync(); };
  sync();
  btn.onclick = e => { e.stopPropagation(); if (selMode) return; if (a.paused) { if (curAudio && curAudio !== a) curAudio.pause(); curAudio = a; a.playbackRate = VRATE; a.play().catch(() => setStatus("ماقدرتش أشغّل الصوت.")); } else a.pause(); };
  sp.onclick = e => { e.stopPropagation(); VRATE = VRATE === 1 ? 1.5 : VRATE === 1.5 ? 2 : VRATE === 2 ? 0.75 : 1; try { localStorage.setItem("vrate", VRATE); } catch (_) {} sp.textContent = VRATE + "×"; a.playbackRate = VRATE; };
  wv.onclick = e => { e.stopPropagation(); if (selMode) return; const r = wv.getBoundingClientRect(), d = a.duration || m.dur || 0; let p = (e.clientX - r.left) / r.width; if (getComputedStyle(wv).direction === "rtl") p = 1 - p; if (a.readyState && d) { a.currentTime = Math.max(0, Math.min(1, p)) * d; sync(); } };
  return w;
}
// ───── تأثيرات الصوت ─────
const FX = [["عادي", "🎙️"], ["تخين", "🐻"], ["سنجاب", "🐿️"], ["روبوت", "🤖"], ["صدى", "🏔️"], ["تليفون", "📞"]];
function fxGraph(ctx, buf, fx, dest) {
  const s = ctx.createBufferSource(); s.buffer = buf; let rate = 1, tail = 0;
  if (fx === 1) rate = 0.78; if (fx === 2) rate = 1.5; s.playbackRate.value = rate;
  if (fx === 3) { const g = ctx.createGain(); g.gain.value = 0; const o = ctx.createOscillator(); o.frequency.value = 55; o.connect(g.gain); s.connect(g).connect(dest); o.start(); s.onended = () => { try { o.stop(); } catch (_) {} }; }
  else if (fx === 4) { const d = ctx.createDelay(1), f = ctx.createGain(); d.delayTime.value = 0.22; f.gain.value = 0.45; s.connect(dest); s.connect(d); d.connect(f); f.connect(d); d.connect(dest); tail = 1.4; }
  else if (fx === 5) { const hp = ctx.createBiquadFilter(), lp = ctx.createBiquadFilter(), g = ctx.createGain(); hp.type = "highpass"; hp.frequency.value = 450; lp.type = "lowpass"; lp.frequency.value = 2800; g.gain.value = 1.7; s.connect(hp); hp.connect(lp); lp.connect(g); g.connect(dest); }
  else s.connect(dest);
  return { s, len: buf.duration / rate + tail };
}
let recFx = 0, fxCtx = null;
const fxCtxGet = () => { try { fxCtx = fxCtx && fxCtx.state !== "closed" ? fxCtx : new (window.AudioContext || window.webkitAudioContext)(); if (fxCtx.state === "suspended") fxCtx.resume(); } catch (_) {} return fxCtx; };
async function fxSend(blob, dur, roomId, fx) {
  if (!fx) return sendVoice(blob, dur, roomId);
  setStatus("🎛 بطبّق التأثير…");
  try {
    const ctx = fxCtxGet(), buf = await ctx.decodeAudioData(await blob.arrayBuffer()), d = ctx.createMediaStreamDestination();
    const mt = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"].find(t => MediaRecorder.isTypeSupported(t)) || "";
    const mr = new MediaRecorder(d.stream, mt ? { mimeType: mt, audioBitsPerSecond: 16000 } : { audioBitsPerSecond: 16000 }), parts = [];
    mr.ondataavailable = e => e.data && e.data.size && parts.push(e.data);
    const done = new Promise(r => mr.onstop = r), gr = fxGraph(ctx, buf, fx, d); mr.start(); gr.s.start();
    await new Promise(r => setTimeout(r, gr.len * 1000 + 200)); mr.stop(); await done; setStatus("");
    sendVoice(new Blob(parts, { type: mr.mimeType || "audio/webm" }), Math.max(1, Math.round(gr.len)), roomId);
  } catch (e) { setStatus(""); sendVoice(blob, dur, roomId); }
}
const paintRecFx = () => { $("recFx").textContent = "🎛 " + FX[recFx][0]; $("recFx").classList.toggle("on", !!recFx); };
$("recFx").onclick = () => { recFx = (recFx + 1) % FX.length; fxCtxGet(); paintRecFx(); };
const MAX_REC = 40; let rec = null;
function showRec(on) { $("recBar").hidden = !on; $("pill").hidden = on; $("sendBtn").hidden = true; $("micBtn").hidden = false; $("micBtn").innerHTML = on ? SVG_SEND : SVG_MIC; }
async function startRec() {
  if (rec || !db) return;
  const why = writeBlock(curR()); if (why) { setStatus(why); return; }
  { const cv = curR(); if (cv && cv.noVoice && !adminOf(cv)) { setStatus("🎤 الرسائل الصوتية متوقفة هنا"); return; } }
  if (!navigator.mediaDevices || !window.MediaRecorder) { setStatus("المتصفح ده مش بيدعم تسجيل الصوت."); return; }
  let stream; try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (e) { setStatus("لازم تسمح للمتصفح يستخدم الميكروفون."); return; }
  const mt = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"].find(t => MediaRecorder.isTypeSupported(t)) || "";
  let mr; try { mr = new MediaRecorder(stream, mt ? { mimeType: mt, audioBitsPerSecond: 16000 } : { audioBitsPerSecond: 16000 }); } catch (e) { mr = new MediaRecorder(stream); }
  const r = rec = { mr, stream, chunks: [], t0: Date.now(), cancel: false, room };
  mr.ondataavailable = e => { if (e.data && e.data.size) r.chunks.push(e.data); };
  mr.onstop = () => finishRec(r);
  recFx = 0; paintRecFx(); vcSnd("rec"); mr.start(); showRec(true); $("recTime").textContent = "0:00";
  r.timer = setInterval(() => { const t = (Date.now() - r.t0) / 1000; $("recTime").textContent = fmtDur(t); if (t >= MAX_REC) stopRec(true); }, 200);
}
function stopRec(send) { if (!rec) return; rec.cancel = !send; clearInterval(rec.timer); if (rec.mr.state !== "inactive") rec.mr.stop(); }
async function finishRec(r) {
  clearInterval(r.timer); r.stream.getTracks().forEach(t => t.stop()); if (rec === r) rec = null; showRec(false);
  if (r.cancel) { vcSnd("recx"); return; }
  vcSnd("recend");
  const dur = Math.round((Date.now() - r.t0) / 1000); if (dur < 1) { setStatus("الرسالة قصيرة جدًا."); return; }
  const cr = curR(), wait = cr && !adminOf(cr) && cr.slow ? cr.slow - (Date.now() - (lastSent[r.room] || 0)) / 1000 : 0;
  if (wait > 0) { setStatus("🐢 وضع بطيء: استنى " + Math.ceil(wait) + " ثانية"); return; }
  fxSend(new Blob(r.chunks, { type: r.mr.mimeType || "audio/webm" }), dur, r.room, recFx);
}
async function sendVoice(blob, dur, roomId) {
  const url = await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = () => res(null); fr.readAsDataURL(blob); });
  if (!url) { setStatus("ماقدرتش أجهّز التسجيل."); return; }
  if (url.length > 900000) { setStatus("التسجيل كبير، سجّل رسالة أقصر."); return; }
  lastSent[roomId] = Date.now();
  const doc = { ...mBase(roomId), text: "", audio: url, dur, uid: myId, ts: Date.now() }; if (replyTo) { doc.reply = replyTo; clearReply(); }
  try { await sendDoc(doc); vcSnd("vsend"); } catch (e) { setStatus("الرسالة الصوتية ماتبعتتش."); }
}
$("micBtn").onclick = () => { if (rec) { if (recFx) fxCtxGet(); stopRec(true); } else startRec(); };
$("recCancel").onclick = () => stopRec(false);
setInterval(() => {
  if (rec) return;
  const has = !!$("inp").value.trim() || !!editingId;
  $("micBtn").hidden = has; $("sendBtn").hidden = !has; $("camBtn").hidden = has; $("micBtn").disabled = !db || !!writeBlock(curR());
}, 250);

// ───── زرار + (صور / فيديو / كاميرا / مشاركة غرفة) ─────
const MAX_DOC = 900000; // حد حجم الرسالة في Firestore (~1MB)
$("pvX").onclick = () => { $("pview").hidden = true; $("pvImg").removeAttribute("src"); };
$("pview").onclick = e => { if (e.target === $("pview")) $("pvX").click(); };
function mediaGuard() {
  if (!db) { setStatus("لسه مش متصل."); return false; }
  const why = writeBlock(curR()); if (why) { setStatus(why); return false; }
  const cr = curR(), wait = cr && !adminOf(cr) && cr.slow ? cr.slow - (Date.now() - (lastSent[room] || 0)) / 1000 : 0;
  if (wait > 0) { setStatus("🐢 وضع بطيء: استنى " + Math.ceil(wait) + " ثانية"); return false; }
  return true;
}
async function postMedia(extra, rid) {
  rid = rid || room;
  const doc = { ...mBase(rid), text: "", uid: myId, ts: Date.now(), ...extra };
  if (replyTo && rid === room) { doc.reply = replyTo; clearReply(); }
  lastSent[rid] = Date.now(); vcSnd("send");
  await sendDoc(doc);
}
const readURL = f => new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = () => res(null); fr.readAsDataURL(f); });
// ───── تخزين الملفات مرة واحدة + تحميل تدريجي (زي تيليجرام) ─────
const MEDIA = new Map(), MEDIA_P = new Map();
function mkThumb(src, w, h) { try { const k = Math.min(1, 28 / Math.max(w, h)), c = document.createElement("canvas"); c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(h * k)); c.getContext("2d").drawImage(src, 0, 0, c.width, c.height); return c.toDataURL("image/jpeg", .5); } catch (e) { return ""; } }
function videoMeta(file) {
  return new Promise(res => {
    const u = URL.createObjectURL(file), v = document.createElement("video"); v.muted = true; v.playsInline = true; v.preload = "metadata";
    const fin = r => { URL.revokeObjectURL(u); res(r); };
    v.onloadeddata = () => { try { v.currentTime = Math.min(0.2, (v.duration || 1) / 2); } catch (e) { fin({ w: v.videoWidth, h: v.videoHeight, thumb: "" }); } };
    v.onseeked = () => fin({ w: v.videoWidth, h: v.videoHeight, thumb: mkThumb(v, v.videoWidth, v.videoHeight) });
    v.onerror = () => fin({ w: 0, h: 0, thumb: "" }); v.src = u; setTimeout(() => fin({ w: v.videoWidth || 0, h: v.videoHeight || 0, thumb: "" }), 4000);
  });
}
// بيحفظ الملف في مجموعة media مرة واحدة، والرسالة بتشاور عليه بس. لو القواعد منعت بيرجع للطريقة القديمة.
async function saveMedia(kind, data, meta) {
  const id = db.collection("media").doc().id, base = { thumb: meta.thumb || "", w: meta.w || 0, h: meta.h || 0 };
  MEDIA.set(id, data);
  const p = db.collection("media").doc(id).set({ data, kind, uid: myId, ts: Date.now() });
  try { const r = await Promise.race([p.then(() => "ok"), new Promise(x => setTimeout(() => x("slow"), 5000))]); if (r === "slow") p.catch(() => {}); return { mid: id, mk: kind, ...base }; }
  catch (e) { MEDIA.delete(id); return { [kind === "vid" ? "vid" : "img"]: data, ...base }; }
}
// الوسائط ما بتتحمّل لوحدها: لازم تضغط عليها. اللي اتحمّل بإيدك بيفضل ظاهر، ولما تمسح بيانات التطبيق بيرجع يحتاج ضغطة
const DLD = (() => { try { return new Set(JSON.parse(localStorage.getItem("vc_dl") || "[]")); } catch (e) { return new Set(); } })();
const dlSave = () => { try { localStorage.setItem("vc_dl", JSON.stringify([...DLD].slice(-1500))); } catch (e) {} };
function getMedia(id) {
  if (MEDIA.has(id)) return Promise.resolve(MEDIA.get(id));
  if (MEDIA_P.has(id)) return MEDIA_P.get(id);
  const p = db.collection("media").doc(id).get().then(d => { const v = d.exists ? d.data().data : null; if (v) { MEDIA.set(id, v); while (MEDIA.size > 40) MEDIA.delete(MEDIA.keys().next().value); } MEDIA_P.delete(id); return v; }).catch(() => { MEDIA_P.delete(id); return null; });
  MEDIA_P.set(id, p); return p;
}
const MIO = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { MIO.unobserve(e.target); if (e.target._load) e.target._load(); } }), { rootMargin: "400px" }) : null;
function mediaBox(m) {
  const vid = m.mk === "vid" || !!m.vid, w0 = +m.w || 4, h0 = +m.h || 3; let W = 240, H = W * h0 / w0; if (H > 320) { H = 320; W = H * w0 / h0; } if (W < 120) W = 120;
  const box = el("div", "mwrap"); box.style.width = Math.round(W) + "px"; box.style.height = Math.round(H) + "px";
  const key = m.mid || m.id, auto = DLD.has(key) || (m.uid === myId && (!m.mid || MEDIA.has(m.mid)));
  const ph = el("div", "mph"); if (okSrc(m.thumb, "image")) ph.style.backgroundImage = "url(" + m.thumb + ")"; else ph.style.background = "linear-gradient(135deg,#3a4a46,#25332f)"; box.append(ph);
  if (auto) box.append(el("div", "msp"));
  const show = data => {
    if (data && !okSrc(data, vid ? "video" : "image")) data = "";
    box.querySelectorAll(".mretry").forEach(x => x.remove());
    if (!data) { const r = el("button", "mretry", "تعذّر التحميل · اضغط للإعادة"); r.type = "button"; r.onclick = e => { e.stopPropagation(); r.remove(); box.append(el("div", "msp")); box._load(); }; box.querySelectorAll(".msp").forEach(x => x.remove()); box.append(r); return; }
    let node;
    if (vid) { node = el("video", "mvid"); node.src = data; node.controls = true; node.playsInline = true; node.preload = "metadata"; if (okSrc(m.thumb, "image")) node.poster = m.thumb; node.onclick = e => e.stopPropagation(); node.onloadeddata = () => box.classList.add("ok"); }
    else { node = el("img", "mimg"); node.alt = "صورة"; node.decoding = "async"; node.onload = () => box.classList.add("ok"); node.onclick = e => { e.stopPropagation(); if (!selMode) { $("pvImg").src = data; $("pview").hidden = false; } }; node.src = data; }
    box.append(node); if (key && !DLD.has(key)) { DLD.add(key); dlSave(); }
  };
  box._load = () => { if (m.mid) getMedia(m.mid).then(show); else show(m.img || m.vid); };
  if (!auto) {
    const g = el("button", "mdl"); g.type = "button"; g.setAttribute("aria-label", vid ? "تحميل الفيديو" : "تحميل الصورة");
    const ic = el("span", "mdl-i"); ic.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 20h14"/></svg>';
    g.append(ic, el("span", "mdl-t", vid ? "🎥 فيديو" : "🖼 صورة"));
    g.onclick = e => { if (selMode) return; e.stopPropagation(); g.remove(); box.append(el("div", "msp")); box._load(); };
    box.append(g);
  } else if (m.mid && !MEDIA.has(m.mid) && MIO) MIO.observe(box); else box._load();
  return box;
}
async function shrinkImage(file) {
  let bmp;
  try { bmp = await createImageBitmap(file); } catch (e) {
    bmp = await new Promise((ok, no) => { const u = URL.createObjectURL(file), im = new Image(); im.onload = () => { URL.revokeObjectURL(u); ok(im); }; im.onerror = no; im.src = u; });
  }
  const w0 = bmp.width || bmp.naturalWidth, h0 = bmp.height || bmp.naturalHeight;
  for (const [mx, q] of [[1600, .84], [1440, .8], [1280, .78], [1024, .7], [800, .62], [640, .55], [480, .5]]) {
    const k = Math.min(1, mx / Math.max(w0, h0)), c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(w0 * k)); c.height = Math.max(1, Math.round(h0 * k));
    const g = c.getContext("2d"); g.imageSmoothingQuality = "high"; g.drawImage(bmp, 0, 0, c.width, c.height);
    const url = c.toDataURL("image/jpeg", q);
    if (url.length < MAX_DOC) return { url, w: c.width, h: c.height, thumb: mkThumb(c, c.width, c.height) };
  }
  return null;
}
async function sendImages(files) {
  if (!mediaGuard()) return;
  const cap = $("inp").value.trim(); let n = 0;
  for (const f of files) {
    setStatus("جاري تجهيز الصورة…");
    try {
      const r = await shrinkImage(f); if (!r) { setStatus("الصورة كبيرة جدًا."); continue; }
      setStatus("جاري الإرسال…");
      await postMedia({ ...(await saveMedia("img", r.url, r)), ...(cap && !n ? { text: cap.slice(0, 300) } : {}) }); n++;
    } catch (e) { setStatus("الصورة ماتبعتتش."); }
  }
  if (n) { if (cap) $("inp").value = ""; setStatus(""); }
}
// ضغط الفيديو: بيعيد ترميزه بجودة قليلة علشان يدخل في حد الرسالة
async function shrinkVideo(file) {
  const src = URL.createObjectURL(file), v = document.createElement("video");
  v.muted = true; v.playsInline = true; v.preload = "auto"; v.src = src;
  try {
    await new Promise((ok, no) => { v.onloadedmetadata = ok; v.onerror = no; });
    if (!window.MediaRecorder || !v.captureStream && !document.createElement("canvas").captureStream) return null;
    const MAXS = 15, dur = Math.min(v.duration || MAXS, MAXS), k = Math.min(1, 360 / Math.min(v.videoWidth, v.videoHeight || 360));
    const cv = document.createElement("canvas"); cv.width = Math.round(v.videoWidth * k / 2) * 2 || 320; cv.height = Math.round(v.videoHeight * k / 2) * 2 || 240;
    const g = cv.getContext("2d"), out = cv.captureStream(20);
    try { v.muted = false; v.volume = 1; const ac = new (window.AudioContext || window.webkitAudioContext)(), sc = ac.createMediaElementSource(v), dst = ac.createMediaStreamDestination(); sc.connect(dst); out.addTrack(dst.stream.getAudioTracks()[0]); await ac.resume(); } catch (e) { v.muted = true; }
    const mt = ["video/webm;codecs=vp8,opus", "video/webm;codecs=vp8", "video/webm", "video/mp4"].find(t => MediaRecorder.isTypeSupported(t)); if (!mt) return null;
    const mr = new MediaRecorder(out, { mimeType: mt, videoBitsPerSecond: 280000, audioBitsPerSecond: 32000 }), parts = [];
    mr.ondataavailable = e => { if (e.data && e.data.size) parts.push(e.data); };
    const done = new Promise(r => { mr.onstop = r; });
    let raf; const draw = () => { g.drawImage(v, 0, 0, cv.width, cv.height); raf = requestAnimationFrame(draw); };
    mr.start(500);
    try { await v.play(); } catch (e) { v.muted = true; await v.play(); }
    draw();
    await new Promise(r => { const t = setInterval(() => { setStatus("جاري ضغط الفيديو… " + Math.min(99, Math.round(v.currentTime / dur * 100)) + "%"); if (v.ended || v.currentTime >= dur) { clearInterval(t); r(); } }, 200); });
    cancelAnimationFrame(raf); v.pause(); if (mr.state !== "inactive") mr.stop(); await done;
    return await readURL(new Blob(parts, { type: mt.split(";")[0] }));
  } catch (e) { return null; }
  finally { URL.revokeObjectURL(src); }
}
async function sendVideo(file) {
  if (!mediaGuard()) return;
  const cap = $("inp").value.trim();
  try {
    let url = file.size < 650000 ? await readURL(file) : null;
    if (!url || url.length > MAX_DOC) { setStatus("جاري تجهيز الفيديو…"); url = await shrinkVideo(file); }
    if (!url || url.length > MAX_DOC) { setStatus("الفيديو كبير. اختار مقطع أقصر (حوالي 15 ثانية أو أقل)."); return; }
    setStatus("جاري الإرسال…"); const meta = await videoMeta(file);
    await postMedia({ ...(await saveMedia("vid", url, meta)), ...(cap ? { text: cap.slice(0, 300) } : {}) }); if (cap) $("inp").value = ""; setStatus("");
  } catch (e) { setStatus("الفيديو ماتبعتش."); }
}
$("aMix").onchange = async e => {
  const f = [...e.target.files]; e.target.value = ""; if (!f.length) return;
  const im = f.filter(x => (x.type || "").startsWith("image")).slice(0, 5), vd = f.filter(x => (x.type || "").startsWith("video")).slice(0, 3);
  if (im.length) await sendImages(im);
  for (const v of vd) await sendVideo(v);
  if (f.length > im.length + vd.length) flash("اتبعت أول ٥ صور و٣ فيديوهات بس");
};
$("aCam").onchange = e => { const f = e.target.files[0]; e.target.value = ""; if (!f) return; if ((f.type || "").startsWith("video")) sendVideo(f); else sendImages([f]); };
$("aCamV").onchange = e => { const f = e.target.files[0]; e.target.value = ""; if (f) sendVideo(f); };

// ───── زرار الكاميرا: ضغطة = كاميرا الموبايل للصور، ضغطة مطوّلة = تصوير فيديو ─────
(() => {
  const b = $("camBtn"); let t0 = 0, skip = false, lp = 0;
  const open = vid => { if (!mediaGuard()) return; try { if (!vid && !localStorage.getItem("vc_camhint")) { localStorage.setItem("vc_camhint", "1"); flash("💡 اضغط مطوّلاً على الكاميرا علشان تصوّر فيديو"); } } catch (_) {} $(vid ? "aCamV" : "aCam").click(); };
  b.addEventListener("pointerdown", () => { t0 = Date.now(); skip = false; clearTimeout(lp); lp = setTimeout(() => { b.classList.add("lp"); if (navigator.vibrate) navigator.vibrate(12); }, 450); });
  const end = () => { clearTimeout(lp); b.classList.remove("lp"); };
  b.addEventListener("pointercancel", end); b.addEventListener("pointerleave", end);
  b.addEventListener("pointerup", () => { const long = t0 && Date.now() - t0 >= 450; t0 = 0; end(); if (long) { skip = true; open(true); } });
  b.addEventListener("click", e => { e.preventDefault(); if (skip) { skip = false; return; } open(false); });
  b.addEventListener("contextmenu", e => e.preventDefault());
})();

function roomCard(sh) {
  const c = el("div", "rcard"), r = rooms.find(x => x.id === sh.id) || (sh.id === "general" ? generalRoom() : null);
  c.append(avatar({ emoji: sh.emoji || "💬", color: sh.color || "#5b6b78", photo: sh.photo || "" }));
  const t = el("div", "rt"); t.append(el("b", "", sh.name || "غرفة"), el("small", "", "غرفة على Very Chat")); c.append(t);
  const b = el("button", "", r && canSee(r) ? "فتح" : "انضمام"); b.type = "button";
  b.onclick = async e => { e.stopPropagation(); if (selMode) return; const rr = rooms.find(x => x.id === sh.id) || (sh.id === "general" ? generalRoom() : { stub: true, id: sh.id, name: sh.name || "غرفة" }); if (!rr) { setStatus("الغرفة دي مش موجودة."); return; } try { await joinRoom(rr); } catch (er) { setStatus(errMsg(er)); } };
  c.append(b); return c;
}
// الكارت بيشاور على الـ uid بس، والاسم والكود بيتقروا من البروفايل الحقيقي (علشان محدش يزوّر كارت)
function userCard(u) {
  const p = profiles[u && u.uid] || {}, c = el("div", "rcard"); c.append(avatar(p));
  const t = el("div", "rt"); t.append(el("b", "", p.name || "مجهول"), el("small", "", "كارت تعريف")); c.append(t);
  if (u && u.uid !== myId) { const b = el("button", "", "مراسلة"); b.type = "button"; b.onclick = e => { e.stopPropagation(); if (!selMode) openPeer(u.uid); }; c.append(b); }
  return c;
}
async function sendMyCard() {
  if (!mediaGuard()) return;
  if (!canDMFrom(myId, room)) { flash("🎭 إنت بشخصية مستعارة هنا، مينفعش تبعت كودك الحقيقي"); return; }
  if (!(profiles[myId] || {}).fcode) { flash("كودك لسه بيتجهز، جرّب كمان ثانية"); return; }
  try { await postMedia({ ucard: { uid: myId } }); } catch (e) { flash("ماقدرتش أبعت الكارت."); }
}
function openSharePicker() {
  const c = $("mcard"); c.textContent = "";
  c.append(el("div", "mprev", "🏠 اختار غرفة تشاركها"));
  const list = el("div", "acts"); list.style.cssText = "display:flex;flex-direction:column;gap:6px;max-height:52vh;overflow-y:auto";
  const mine = [generalRoom(), ...rooms.filter(r => canSee(r) && (!r.private || r.by === myId || adminOf(r)))];
  mine.forEach(r => {
    const b = el("button", "rrow"); b.type = "button"; b.append(avatar(r.emoji || r.photo ? r : { emoji: "💬", color: "#5b6b78" }), el("b", "", r.name));
    b.onclick = async () => {
      $("msheet").hidden = true;
      if (!mediaGuard()) return;
      try { await postMedia({ share: { id: r.id, name: String(r.name || "").slice(0, 30), emoji: r.emoji || "", color: r.color || "" } }); } catch (e) { setStatus("ماقدرتش أشارك الغرفة."); }
    };
    list.append(b);
  });
  c.append(list); $("msheet").hidden = false;
}
$("plusBtn").onclick = () => {
  const c = $("mcard"); c.textContent = "";
  const g = el("div", "acts att");
  [["#7c5cff", '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="M4 18l5-5 4 4 3-3 4 4"/></svg>', "صور ومقاطع", () => $("aMix").click()],
   ["#f08c2e", '<svg viewBox="0 0 24 24"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>', "غرفة", openSharePicker],
   ["#2f8cff", '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="9" cy="11" r="2.2"/><path d="M5.8 16c.6-1.4 1.8-2 3.2-2s2.6.6 3.2 2M14.5 10h4M14.5 13.5h3"/></svg>', "كودي", sendMyCard]].forEach(([bg, ic, t, fn]) => {
    const b = el("button", "apick"); b.type = "button"; const i = el("i"); i.style.background = bg; i.innerHTML = ic;
    b.append(i, document.createTextNode(t)); b.onclick = () => { $("msheet").hidden = true; fn(); }; g.append(b);
  });
  c.append(g); $("msheet").hidden = false;
};
// تعطيل + لما الكتابة ممنوعة
setInterval(() => { try { updateComposer(); } catch (e) {} }, 20000);
setInterval(() => { $("plusBtn").disabled = $("camBtn").disabled = !db || !!writeBlock(curR()); }, 400);

