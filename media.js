/* Very Chat — 3/4: الإرسال والميديا (الصوت، الصور والفيديو، الاستوديو، المستندات) */

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
  btn.onclick = e => { if (selMode) return; e.stopPropagation(); if (a.paused) { if (curAudio && curAudio !== a) curAudio.pause(); curAudio = a; a.playbackRate = VRATE; a.play().catch(() => setStatus("ماقدرتش أشغّل الصوت.")); } else a.pause(); };
  sp.onclick = e => { if (selMode) return; e.stopPropagation(); VRATE = VRATE === 1 ? 1.5 : VRATE === 1.5 ? 2 : VRATE === 2 ? 0.75 : 1; try { localStorage.setItem("vrate", VRATE); } catch (_) {} sp.textContent = VRATE + "×"; a.playbackRate = VRATE; };
  wv.onclick = e => { if (selMode) return; e.stopPropagation(); const r = wv.getBoundingClientRect(), d = a.duration || m.dur || 0; let p = (e.clientX - r.left) / r.width; if (getComputedStyle(wv).direction === "rtl") p = 1 - p; if (a.readyState && d) { a.currentTime = Math.max(0, Math.min(1, p)) * d; sync(); } };
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
document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("pview").hidden) $("pvX").click(); });
function mediaGuard(rid) {
  rid = rid || room;
  if (!db) { setStatus("لسه مش متصل."); return false; }
  const cr = rid === "general" ? generalRoom() : isDM(rid) ? dmRoom(rid) : rooms.find(x => x.id === rid);
  const why = writeBlock(cr); if (why) { setStatus(why); return false; }
  const wait = cr && !adminOf(cr) && cr.slow ? cr.slow - (Date.now() - (lastSent[rid] || 0)) / 1000 : 0;
  if (wait > 0) { setStatus("🐢 وضع بطيء: استنى " + Math.ceil(wait) + " ثانية"); return false; }
  return true;
}
async function postMedia(extra, rid) {
  rid = rid || room;
  if (extra && extra.mid) mineTag(extra.mid, rid);   // نعرف الميديا دي في أنهي غرفة (العام بيتمسح أسرع)
  const doc = { ...mBase(rid), text: "", uid: myId, ts: Date.now(), ...extra };
  if (!doc.reply && replyTo && rid === room) { doc.reply = replyTo; clearReply(); }
  lastSent[rid] = Date.now(); vcSnd("send");
  await sendDoc(doc);
}
const readURL = f => new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = () => res(null); fr.readAsDataURL(f); });
// ───── تخزين الملفات مرة واحدة + تحميل تدريجي (زي تيليجرام) ─────
const MEDIA = new Map(), MEDIA_P = new Map(), MEDIA_ERR = new Map();
function mkThumb(src, w, h) { try { const k = Math.min(1, 28 / Math.max(w, h)), c = document.createElement("canvas"); c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(h * k)); c.getContext("2d").drawImage(src, 0, 0, c.width, c.height); return c.toDataURL("image/jpeg", .5); } catch (e) { return ""; } }
function videoMeta(file) {
  return new Promise(res => {
    const u = URL.createObjectURL(file), v = document.createElement("video"); v.muted = true; v.playsInline = true; v.preload = "auto";
    let done = false, best = null, ti = 0, times = [];
    const fin = r => { if (done) return; done = true; URL.revokeObjectURL(u); res(r); };
    const info = t => ({ w: v.videoWidth || 0, h: v.videoHeight || 0, d: isFinite(v.duration) ? v.duration : 0, thumb: t || "" });
    // بنجرّب كذا لقطة ونختار الأنور (علشان الفريم الأول غالبًا أسود) وبجودة أعلى
    const grab = () => { try { const k = Math.min(1, 720 / Math.max(v.videoWidth, v.videoHeight, 1)), c = document.createElement("canvas"); c.width = Math.max(1, Math.round(v.videoWidth * k)); c.height = Math.max(1, Math.round(v.videoHeight * k)); const g = c.getContext("2d"); g.drawImage(v, 0, 0, c.width, c.height); const d = g.getImageData(0, 0, c.width, c.height).data; let t = 0, n = 0; for (let i = 0; i < d.length; i += 64) { t += d[i] + d[i + 1] + d[i + 2]; n++; } return { c, b: n ? t / n / 3 : 0 }; } catch (_) { return null; } };
    const finish = () => { if (!best) return fin(info()); const inf = info(mkThumb(best.c, best.c.width, best.c.height)); try { inf.poster = best.c.toDataURL("image/jpeg", .85); } catch (_) {} fin(inf); };
    v.onloadeddata = () => { const d = v.duration; times = isFinite(d) && d > 0 ? [Math.min(0.3, d / 2), d * .15, d * .3, d * .5, d * .7] : [0.1]; try { v.currentTime = times[0]; } catch (e) { fin(info()); } };
    v.onseeked = () => { const r = grab(); if (r && (!best || r.b > best.b)) best = r; if ((best && best.b >= 35) || ti >= times.length - 1) return finish(); ti++; try { v.currentTime = times[ti]; } catch (_) { finish(); } };
    v.onerror = () => fin(info()); v.src = u; setTimeout(() => { if (best) finish(); else fin(info()); }, 8000);
  });
}
// بيحفظ الملف في مجموعة media مرة واحدة، والرسالة بتشاور عليه بس. لو القواعد منعت بيرجع للطريقة القديمة.
async function saveMedia(kind, data, meta, rid) {
  rid = rid || room;
  const id = db.collection("media").doc().id, base = { thumb: meta.thumb || "", w: meta.w || 0, h: meta.h || 0 };
  MEDIA.set(id, data);
  const p = db.collection("media").doc(id).set({ data, kind, uid: myId, ts: Date.now(), room: rid, expireAt: expAt(rid) });
  mineAdd(id, 1); idbPut(id, data);   // نسخة دايمة على جهازك + تسجيل للمسح التلقائي من Firestore
  try { const r = await Promise.race([p.then(() => "ok"), new Promise(x => setTimeout(() => x("slow"), 5000))]); if (r === "slow") p.catch(() => {}); return { mid: id, mk: kind, n: 1, ...base }; }
  catch (e) { MEDIA.delete(id); return { [kind === "vid" ? "vid" : "img"]: data, ...base }; }
}
// الوسائط ما بتتحمّل لوحدها: لازم تضغط عليها. اللي اتحمّل بإيدك بيفضل ظاهر، ولما تمسح بيانات التطبيق بيرجع يحتاج ضغطة
const DLD = (() => { try { return new Set(JSON.parse(localStorage.getItem("vc_dl") || "[]")); } catch (e) { return new Set(); } })();
const dlSave = () => { try { localStorage.setItem("vc_dl", JSON.stringify([...DLD].slice(-1500))); } catch (e) {} };
// ───── تخزين دائم على الجهاز: اللي بتحمّله بيفضل لحد ما تمسحه من «الحساب والتخزين» (زي واتساب/تيليجرام) ─────
const IDBN = "vc-media";
let _idb = null;
const idbOpen = () => _idb || (_idb = new Promise(res => { try { const q = indexedDB.open(IDBN, 1); q.onupgradeneeded = () => q.result.createObjectStore("m"); q.onsuccess = () => res(q.result); q.onerror = q.onblocked = () => res(null); } catch (e) { res(null); } }));
const idbTx = async (mode, fn) => { const d = await idbOpen(); if (!d) return null; return new Promise(res => { try { const t = d.transaction("m", mode), r = fn(t.objectStore("m")); t.oncomplete = () => res(r && "result" in r ? r.result : true); t.onerror = t.onabort = () => res(null); } catch (e) { res(null); } }); };
const idbGet = k => idbTx("readonly", st => st.get(k));
const idbPut = async (k, v) => { const ok = await idbTx("readwrite", st => st.put(v, k)); if (ok) { DLD.add(k); dlSave(); } return !!ok; };
async function idbStats() { const d = await idbOpen(); if (!d) return { n: 0, bytes: 0 }; return new Promise(res => { let n = 0, bytes = 0; try { const q = d.transaction("m").objectStore("m").openCursor(); q.onsuccess = () => { const c = q.result; if (c) { n++; const v = c.value; bytes += v && v.size != null ? v.size : String(v || "").length; c.continue(); } else res({ n, bytes }); }; q.onerror = () => res({ n, bytes }); } catch (e) { res({ n, bytes }); } }); }
const idbClear = async () => { await idbTx("readwrite", st => { const q = st.openCursor(); q.onsuccess = () => { const c = q.result; if (c) { if (!String(c.key).startsWith("nick:")) c.delete(); c.continue(); } }; return q; }); };   // مابنمسحش الأسماء المعدّلة
try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (_) {}
// الفيديو الكبير بيتقسّم لقطع (كل قطعة document في media). أول قطعة header: data:video/..;vcn=N;base64,
const VCN = /^data:((?:video|application)\/[a-z0-9.+-]+);vcn=(\d+);base64,/i, MEDIA_CB = new Map(), sleep = ms => new Promise(r => setTimeout(r, ms));
const b64Bytes = b => { const bin = atob(b), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; };
// ───── إبقاء الشاشة صاحية أثناء النقل (الشاشة لو اتقفلت المتصفح بيوقّف النقل) ─────
const WL = (() => {
  let n = 0, lock = null;
  const get = async () => { if (n < 1 || lock || document.hidden || !navigator.wakeLock) return; try { lock = await navigator.wakeLock.request("screen"); lock.addEventListener("release", () => { lock = null; }); } catch (_) {} };
  document.addEventListener("visibilitychange", get);
  return { on() { n++; get(); }, off() { n = Math.max(0, n - 1); if (!n && lock) { try { lock.release(); } catch (_) {} lock = null; } } };
})();
// قايمة التحميلات الشغّالة: لو التطبيق اتقفل أو المتصفح وقّفه، بتكمّل أول ما ترجع
const dlqGet = () => { try { return JSON.parse(localStorage.getItem("vc_dlq") || "[]"); } catch (_) { return []; } };
const dlq = (id, on) => { try { const q = dlqGet().filter(x => x !== id); if (on) q.push(id); localStorage.setItem("vc_dlq", JSON.stringify(q.slice(-30))); } catch (_) {} };
const waitBack = () => new Promise(res => {
  let iv; const go = () => { if (document.hidden || navigator.onLine === false) return; document.removeEventListener("visibilitychange", go); window.removeEventListener("online", go); clearInterval(iv); res(); };
  document.addEventListener("visibilitychange", go); window.addEventListener("online", go); iv = setInterval(go, 5000);
});
async function loadChunked(id, first, mm) {
  const n = +mm[2], parts = new Array(n), dk = i => "dp:" + id + ":" + i; parts[0] = first.slice(mm[0].length); let done = 1, next = 1;
  const tell = () => (MEDIA_CB.get(id) || []).forEach(f => { try { f(done / n); } catch (_) {} });
  dlq(id, 1); WL.on();
  try {
    // الأجزاء اللي نزلت قبل كده (لو التطبيق اتقفل في النص) ما بتتحمّلش تاني
    for (let i = 1; i < n; i++) { const s = await idbGet(dk(i)); if (typeof s === "string" && s) { parts[i] = s; done++; } }
    tell();
    let dead = false;
    const one = async i => {
      const t0 = Date.now(); let miss = 0, last = null;
      for (let t = 0; !dead; t++) {
        try {
          const d = await withTO(db.collection("media").doc(id + "_" + i).get(), 45000);
          if (d.exists && typeof d.data().data === "string") return d.data().data;
          if (!d.exists && ++miss >= 3) { const e = new Error("gone"); e.code = "gone"; throw e; }
        } catch (e) { if (e && (e.code === "permission-denied" || e.code === "gone")) throw e; last = e; }
        if (Date.now() - t0 > 5 * 60000) throw last || new Error("chunk " + i);
        if (t < 3) await sleep(500 * (t + 1)); else await waitBack();
      }
      throw new Error("aborted");
    };
    await Promise.all(Array.from({ length: Math.min(4, n - 1) }, async () => { while (next < n && !dead) { const i = next++; if (parts[i] !== undefined) continue; try { parts[i] = await one(i); } catch (e) { dead = true; throw e; } idbTx("readwrite", st => st.put(parts[i], dk(i))); done++; tell(); } }));
    const blob = new Blob(parts.map(b64Bytes), { type: mm[1].toLowerCase() });
    idbTx("readwrite", st => { for (let i = 1; i < n; i++) st.delete(dk(i)); }); dlq(id, 0);
    return blob;
  } catch (e) { dlq(id, 0); throw e; }
  finally { WL.off(); }
}
function getMedia(id, onp) {
  if (onp) { if (!MEDIA_CB.has(id)) MEDIA_CB.set(id, []); MEDIA_CB.get(id).push(onp); }
  if (MEDIA.has(id)) return Promise.resolve(MEDIA.get(id));
  if (MEDIA_P.has(id)) return MEDIA_P.get(id);
  const fin = v => { if (v) { MEDIA.set(id, v); while (MEDIA.size > 40) MEDIA.delete(MEDIA.keys().next().value); } MEDIA_P.delete(id); MEDIA_CB.delete(id); return v; };
  const p = (async () => {
    const loc = await idbGet(id);
    if (loc) return fin(typeof loc === "string" ? loc : URL.createObjectURL(loc));
    MEDIA_ERR.delete(id); const d = await withTO(db.collection("media").doc(id).get(), 45000); if (!d.exists) MEDIA_ERR.set(id, "gone"); let v = d.exists ? d.data().data : null;
    if (typeof v === "string") {
      const mm = VCN.exec(v);
      if (mm) { const blob = await loadChunked(id, v, mm); idbPut(id, blob); v = URL.createObjectURL(blob); }
      else idbPut(id, v);
    }
    return fin(v);
  })().catch(e => { MEDIA_ERR.set(id, (e && e.code) || (e && e.message) || "err"); return fin(null); });
  MEDIA_P.set(id, p); return p;
}
const dlResume = () => { if (!db || !myId) return; dlqGet().forEach(id => { try { getMedia(id).catch(() => {}); } catch (_) {} }); };
document.addEventListener("visibilitychange", () => { if (!document.hidden) dlResume(); }); window.addEventListener("online", dlResume);
{ const iv = setInterval(() => { if (db && myId) { clearInterval(iv); dlResume(); } }, 2500); }
// ───── مسح تلقائي زي واتساب: الميديا اللي انت رفعتها بتتمسح من Firestore بعد MEDIA_DAYS يوم، ونسختك بتفضل على جهازك ─────
const MEDIA_DAYS = 2, GENERAL_MIN = 4;   // الغرف والخاص: يومين — العام: 4 دقايق
const mediaTTL = rid => rid === "general" ? GENERAL_MIN * 60e3 : MEDIA_DAYS * 864e5;
const expAt = rid => firebase.firestore.Timestamp.fromMillis(Date.now() + mediaTTL(rid) + 60e3);
// أي حد فاتح العام: يمسح ميديا العام اللي عدّى عليها GENERAL_MIN (مش بتاعته بس)
const SWEPT = (() => { try { return new Set(JSON.parse(localStorage.getItem("vc_swept") || "[]")); } catch (_) { return new Set(); } })();
async function sweepGeneral() {
  if (!db || !myId || room !== "general" || navigator.onLine === false) return;
  const now = Date.now(), ms = mediaTTL("general");
  const old = lastList.filter(m => m && m.mid && m.n && m.room === "general" && typeof m.ts === "number" && now - m.ts > ms && !SWEPT.has(m.mid)).slice(0, 20);
  if (!old.length) return;
  for (const m of old) {
    SWEPT.add(m.mid);
    await Promise.allSettled(Array.from({ length: Math.min(m.n, 100) }, (_, i) => db.collection("media").doc(i ? m.mid + "_" + i : m.mid).delete()));
  }
  try { localStorage.setItem("vc_swept", JSON.stringify([...SWEPT].slice(-1500))); } catch (_) {}
}
function mineTag(id, rid) { try { const a = JSON.parse(localStorage.getItem("vc_mine") || "[]"); const e = a.find(x => x[0] === id); if (e) { e[3] = rid; localStorage.setItem("vc_mine", JSON.stringify(a)); } } catch (_) {} }
function mineAdd(id, n) { try { const a = JSON.parse(localStorage.getItem("vc_mine") || "[]"); a.push([id, n || 1, Date.now()]); localStorage.setItem("vc_mine", JSON.stringify(a.slice(-1500))); } catch (_) {} }
async function cleanOldMedia() {
  if (!db || !myId || navigator.onLine === false) return;
  let a; try { a = JSON.parse(localStorage.getItem("vc_mine") || "[]"); } catch (_) { return; }
  const now = Date.now(), old = a.filter(x => now - x[2] > mediaTTL(x[3])).slice(0, 30); if (!old.length) return;
  const done = new Set();
  for (const [id, n, ts] of old) {
    const rs = await Promise.allSettled(Array.from({ length: n }, (_, i) => db.collection("media").doc(i ? id + "_" + i : id).delete()));
    if (rs.every(r => r.status === "fulfilled" || (r.reason && r.reason.code === "permission-denied"))) done.add(id + "|" + ts);
  }
  try { localStorage.setItem("vc_mine", JSON.stringify(a.filter(x => !done.has(x[0] + "|" + x[2])))); } catch (_) {}
}
setTimeout(() => { const run = () => { cleanOldMedia().catch(() => {}); sweepGeneral().catch(() => {}); }; run(); setInterval(run, 30e3); }, 8000);
const MIO = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { MIO.unobserve(e.target); if (e.target._load) e.target._load(); } }), { rootMargin: "400px" }) : null;
function mediaBox(m) {
  const vid = m.mk === "vid" || !!m.vid, w0 = +m.w || 4, h0 = +m.h || 3; let W = 240, H = W * h0 / w0; if (H > 320) { H = 320; W = H * w0 / h0; } if (W < 120) W = 120;
  const box = el("div", "mwrap"); box.style.width = Math.round(W) + "px"; box.style.height = Math.round(H) + "px";
  const key = m.mid || m.id, auto = DLD.has(key) || (m.mid && MEDIA.has(m.mid)) || (m.uid === myId && !m.mid && Date.now() - (m.ts || 0) < 120000);
  const ph = el("div", "mph"); if (okSrc(m.thumb, "image")) ph.style.backgroundImage = "url(" + m.thumb + ")"; else ph.style.background = "linear-gradient(135deg,#3a4a46,#25332f)"; box.append(ph);
  if (auto) box.append(el("div", "msp"));
  const show = data => {
    if (data && !okSrc(data, vid ? "video" : "image")) data = "";
    box.querySelectorAll(".mretry").forEach(x => x.remove());
    if (!data) { const why = MEDIA_ERR.get(m.mid); const r = el("button", "mretry", why === "gone" ? "الملف اتمسح من السيرفر (الميديا بتتمسح بعد فترة)" : why === "permission-denied" ? "قواعد Firebase مش مسمحة بقراءة الميديا" : why === "timeout" ? "النت بطيء · اضغط للإعادة" : "تعذّر التحميل · اضغط للإعادة"); r.type = "button"; r.onclick = e => { if (selMode) return; e.stopPropagation(); r.remove(); box.append(el("div", "msp")); box._load(); }; box.querySelectorAll(".msp").forEach(x => x.remove()); box.append(r); return; }
    let node;
    if (vid) { node = el("video", "mvid"); node.src = data; node.controls = true; node.playsInline = true; node.preload = "auto"; if (okSrc(m.thumb, "image")) node.poster = m.thumb; const snap = () => { if (node._sharp) return node._sharp; try { if (node.videoWidth && node.readyState >= 2) { const k = Math.min(1, 720 / Math.max(node.videoWidth, node.videoHeight)), c = document.createElement("canvas"); c.width = Math.max(1, Math.round(node.videoWidth * k)); c.height = Math.max(1, Math.round(node.videoHeight * k)); c.getContext("2d").drawImage(node, 0, 0, c.width, c.height); return c.toDataURL("image/jpeg", .88); } } catch (_) {} return ""; };   // لقطة واضحة من الفيديو نفسه؛ ومابنستخدمش الصورة المصغّرة المشوّشة أبدًا في شاشة التشغيل
      node.controls = false; node.onclick = e => { if (selMode) return; e.stopPropagation(); openVideo(data, snap()); }; { let sought = false, fin = false; const finish = u => { if (fin) return; fin = true; if (u) { node._sharp = u; ph.style.backgroundImage = 'url("' + u + '")'; ph.classList.add("sharp"); ph.style.filter = "none"; ph.style.transform = "none"; } box.classList.add("vok"); };
      let best = null, ti = 0, times = [];   // بنجرّب كذا لقطة ونختار الأنور وبجودة عالية، ولو كلهم سودا بنفضل على الصورة المصغّرة
      const cap = () => { try { const k = Math.min(1, 720 / Math.max(node.videoWidth, node.videoHeight, 1)), c = document.createElement("canvas"); c.width = Math.max(1, Math.round(node.videoWidth * k)); c.height = Math.max(1, Math.round(node.videoHeight * k)); const g = c.getContext("2d"); g.drawImage(node, 0, 0, c.width, c.height); const d = g.getImageData(0, 0, c.width, c.height).data; let t = 0, n = 0; for (let i = 0; i < d.length; i += 64) { t += d[i] + d[i + 1] + d[i + 2]; n++; } return n ? { c, b: t / n / 3 } : null; } catch (_) { return null; } };
      const fb = () => finish(best && best.b >= 6 ? best.c.toDataURL("image/jpeg", .88) : "");
      const go = () => { if (sought) return; sought = true; try { const d = node.duration; times = isFinite(d) && d > 0 ? [Math.min(0.3, d / 2), d * .15, d * .3, d * .5, d * .7] : [0.1]; node.currentTime = times[0]; } catch (_) { fb(); } };
      node.onloadedmetadata = go; node.onloadeddata = go; node.onseeked = () => { const r = cap(); if (r && (!best || r.b > best.b)) best = r; if ((best && best.b >= 35) || ti >= times.length - 1) return fb(); ti++; try { node.currentTime = times[ti]; } catch (_) { fb(); } }; node.onerror = () => finish(""); setTimeout(fb, 8000); }
      const pl = el("div", "mplay"); pl.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>'; pl.onclick = e => { if (selMode) return; e.stopPropagation(); openVideo(data, snap()); }; box.append(pl); }
    else { node = el("img", "mimg"); node.alt = "صورة"; node.decoding = "async"; node.onload = () => box.classList.add("ok"); node.onclick = e => { if (selMode) return; e.stopPropagation(); { $("pvImg").src = data; $("pview").hidden = false; } }; node.src = data; }
    box.querySelectorAll(".mpct").forEach(x => x.remove()); box.append(node); if (key && !DLD.has(key) && !String(data).startsWith("blob:")) { DLD.add(key); dlSave(); }
  };
  box._load = () => { if (m.mid) getMedia(m.mid, vid ? f => { let pc = box.querySelector(".mpct"); if (!pc) { pc = el("div", "mpct"); box.append(pc); } pc.textContent = Math.round(f * 100) + "%"; } : null).then(show); else show(m.img || m.vid); };
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
(() => {
  const o = document.createElement("div"); o.id = "vview"; o.hidden = true;
  const x = document.createElement("button"); x.type = "button"; x.id = "vvX"; x.setAttribute("aria-label", "إغلاق"); x.textContent = "✕";
  const v = document.createElement("video"); v.id = "vvV"; v.controls = true; v.playsInline = true; v.setAttribute("playsinline", ""); v.setAttribute("webkit-playsinline", ""); v.setAttribute("controlslist", "nofullscreen nodownload"); v.disablePictureInPicture = false;
  o.append(v, x); document.body.append(o);
  const close = () => { try { v.pause(); } catch (_) {} v.removeAttribute("src"); try { v.load(); } catch (_) {} o.hidden = true; };
  x.onclick = close; o.addEventListener("click", e => { if (e.target === o) close(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !o.hidden) close(); });
  // الـ poster هنا هو نفس اللقطة الواضحة اللي ظاهرة في الرسالة، فمفيش لا تشويش ولا شاشة سودا
  window.openVideo = (src, poster) => { if (!src) return; if (poster) v.poster = poster; else v.removeAttribute("poster"); v.style.opacity = ""; v.src = src; o.hidden = false; const p = v.play(); if (p && p.catch) p.catch(() => {}); };
})();
async function sendImages(files, rid) {
  rid = rid || room;
  if (!mediaGuard(rid)) return;
  const cap = $("inp").value.trim(); let n = 0;
  for (const f of files) {
    setStatus("جاري تجهيز الصورة…");
    try {
      const r = await shrinkImage(f); if (!r) { setStatus("الصورة كبيرة جدًا."); continue; }
      setStatus("جاري الإرسال…");
      await postMedia({ ...(await saveMedia("img", r.url, r, rid)), ...(cap && !n ? { text: cap.slice(0, 300) } : {}) }, rid); n++;
    } catch (e) { setStatus("الصورة ماتبعتتش."); }
  }
  if (n) { if (cap && rid === room) $("inp").value = ""; if (!$("status").textContent.startsWith("جاري تحميل")) setStatus(""); }
}
// ───── الفيديو: بيتبعت بجودته الأصلية وكامل (مقسّم لقطع)، ولو أكبر من الحد بيتعمل ضغط بجودة عالية وبنفس الطول ─────
const VID_MAX = 48 * 1024 * 1024, VID_MAX_SEC = 300, RAW_CH = 562500; // RAW_CH بايت لكل قطعة (يساوي 750000 حرف base64)
const roomLabel = rid => rid === "general" ? "العام" : isDM(rid) ? dmRoom(rid).name : ((rooms.find(x => x.id === rid) || {}).name || "الغرفة");
function upChip(rid, kind) {
  let host = $("ups"); if (!host) { host = el("div"); host.id = "ups"; document.body.append(host); }
  const c = el("div", "upc"), t = el("span", "upt"), bar = el("i", "upb"), x = el("button", "upx", "✕"); x.type = "button"; x.setAttribute("aria-label", "إلغاء");
  const f = el("b", "upf"); bar.append(f); c.append(t, bar, x); host.append(c);
  const o = { cancel: false, set(txt, pct) { t.textContent = txt; f.style.width = Math.max(0, Math.min(100, pct || 0)) + "%"; }, done() { c.remove(); } };
  x.onclick = () => { o.cancel = true; t.textContent = "بيتلغي…"; }; o.set("⏫ " + kind + " لـ " + roomLabel(rid) + "…", 0); return o;
}
const b64Slice = (blob, a, b) => new Promise(res => { const fr = new FileReader(); fr.onload = () => { const r = String(fr.result || ""); res(r.slice(r.indexOf(",") + 1)); }; fr.onerror = () => res(null); fr.readAsDataURL(blob.slice(a, b)); });
const withTO = (p, ms) => Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error("timeout")), ms))]);
async function uploadChunks(blob, mime, ui, label, o) {
  o = o || {};
  const n = Math.max(1, Math.ceil(blob.size / RAW_CH)), id = o.id || db.collection("media").doc().id, ref = i => db.collection("media").doc(i ? id + "_" + i : id), skip = o.skip || new Set();
  let done = skip.size, next = 0, fail = null;
  const put = async i => {
    const b = await b64Slice(blob, i * RAW_CH, (i + 1) * RAW_CH); if (b === null) throw new Error("read");
    const data = (i === 0 ? "data:" + mime + ";vcn=" + n + ";base64," : "") + b;
    for (let t = 0; ; t++) {
      try { await withTO(ref(i).set({ data, kind: "vid", uid: myId, ts: Date.now(), room: o.rid || room, expireAt: expAt(o.rid || room) }), 120000); break; }
      catch (e) { if (ui.cancel || (e && e.code === "permission-denied") || t >= 3) throw e; await sleep(1500 * (t + 1)); }
    }
    if (o.onChunk) o.onChunk(i);
  };
  // القطعة الأولى (الـ header) آخر حاجة، علشان محدش يلاقي فيديو ناقص
  const order = []; for (let i = 1; i < n; i++) if (!skip.has(i)) order.push(i); if (!skip.has(0)) order.push(0);
  if (done) ui.set("⏫ " + label + " · " + Math.round(done / n * 100) + "%", done / n * 100);
  await Promise.all(Array.from({ length: Math.min(3, order.length) }, async () => {
    while (!fail && !ui.cancel && next < order.length) {
      const i = order[next++]; if (i === 0 && done < n - 1) { await sleep(100); next--; if (next < order.length) continue; }
      try { await put(i); done++; ui.set("⏫ " + label + " · " + Math.round(done / n * 100) + "%", done / n * 100); } catch (e) { fail = e; }
    }
  }));
  if (ui.cancel) { for (let i = 0; i < n; i++) ref(i).delete().catch(() => {}); throw new Error("cancel"); }
  if (fail) throw fail;
  return id;
}
// ضغط بجودة عالية وبنفس الطول (بيشتغل بالزمن الحقيقي، فسيب التطبيق مفتوح). بيتستخدم بس لو الملف أكبر من الحد.
async function shrinkVideo(file, ui, opt) {
  opt = opt || {};
  const src = URL.createObjectURL(file), v = document.createElement("video");
  v.muted = true; v.playsInline = true; v.preload = "auto"; v.src = src;
  try {
    await new Promise((ok, no) => { v.onloadedmetadata = ok; v.onerror = no; });
    const cvT = document.createElement("canvas"); if (!window.MediaRecorder || !cvT.captureStream) return null;
    const full = v.duration; if (!isFinite(full) || full <= 0) return null;
    const t0 = Math.max(0, Math.min(opt.start || 0, full)), t1 = Math.min(full, opt.end || full), dur = t1 - t0; if (dur < 0.3) return null;
    if (dur > VID_MAX_SEC) return { tooLong: true };
    const k = Math.min(1, (opt.hq ? 1080 : 720) / Math.min(v.videoWidth, v.videoHeight || 720)), cv = cvT;
    cv.width = Math.round(v.videoWidth * k / 2) * 2 || 640; cv.height = Math.round(v.videoHeight * k / 2) * 2 || 360;
    const g = cv.getContext("2d"), out = cv.captureStream(30), abps = 96000;
    if (!opt.mute) try { v.muted = false; v.volume = 1; const ac = new (window.AudioContext || window.webkitAudioContext)(), sc = ac.createMediaElementSource(v), dst = ac.createMediaStreamDestination(); sc.connect(dst); out.addTrack(dst.stream.getAudioTracks()[0]); await ac.resume(); } catch (e) { v.muted = true; }
    const mt = ["video/mp4;codecs=avc1,mp4a.40.2", "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"].find(t => MediaRecorder.isTypeSupported(t)); if (!mt) return null;
    const vbps = Math.max(700000, Math.min(8000000, Math.floor((VID_MAX * 0.85 * 8) / dur - abps)));
    const mr = new MediaRecorder(out, { mimeType: mt, videoBitsPerSecond: vbps, audioBitsPerSecond: abps }), parts = [];
    mr.ondataavailable = e => { if (e.data && e.data.size) parts.push(e.data); };
    const done = new Promise(r => { mr.onstop = r; });
    let raf; const draw = () => { g.drawImage(v, 0, 0, cv.width, cv.height); raf = requestAnimationFrame(draw); };
    if (t0 > 0.05) { await new Promise(r => { v.onseeked = r; v.currentTime = t0; setTimeout(r, 3000); }); }
    mr.start(1000);
    try { await v.play(); } catch (e) { v.muted = true; await v.play(); }
    draw();
    await new Promise(r => { const t = setInterval(() => { ui.set("🎞 بجهّز الفيديو (سيب التطبيق مفتوح) · " + Math.min(99, Math.round((v.currentTime - t0) / dur * 100)) + "%", (v.currentTime - t0) / dur * 100); if (v.ended || v.currentTime >= t1 - 0.05 || ui.cancel) { clearInterval(t); r(); } }, 250); });
    cancelAnimationFrame(raf); v.pause(); if (mr.state !== "inactive") mr.stop(); await done;
    if (ui.cancel) return null;
    return new Blob(parts, { type: mt.split(";")[0] });
  } catch (e) { return null; }
  finally { URL.revokeObjectURL(src); }
}
// ───── مدير الرفع: الفيديو بيظهر في الشات فورًا بدايرة تقدّم، ويكمّل في الخلفية، وبيرجع يكمّل لو التطبيق اتقفل ─────
const UPL = (() => {
  const jobs = new Map(), jk = id => "job:" + id, pk = id => "jobp:" + id;
  const MB = n => String(Math.max(0.1, n / 1048576).toFixed(1)).replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[d]);
  const PC = n => String(Math.round(n)).replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[d]) + "٪";
  const R = 20, CIRC = 2 * Math.PI * R;
  let rel = null, noteAt = 0, noteLast = -1;
  const keep = on => { if (on && !rel && navigator.locks) { let r; const p = new Promise(x => { r = x; }); rel = r; navigator.locks.request("vc-upload", () => p).catch(() => {}); } else if (!on && rel) { rel(); rel = null; } };
  const act = () => keep([...jobs.values()].some(j => j.state !== "err"));
  const note = (job, done) => {
    try {
      if (!document.hidden && !done) return; if (!("Notification" in window) || Notification.permission !== "granted" || !navigator.serviceWorker) return;
      const pct = Math.round(job.pct || 0); if (!done && (Date.now() - noteAt < 2500 || Math.abs(pct - noteLast) < 4)) return; noteAt = Date.now(); noteLast = pct;
      navigator.serviceWorker.ready.then(r => {
        const o = { tag: "vc-up", renotify: false, silent: true, icon: "icon-192.png", badge: "icon-192.png", dir: "auto", lang: "ar", data: { up: 1 } };
        if (done) { o.silent = false; r.showNotification("✓ اتبعت الفيديو", { ...o, body: "لـ " + roomLabel(job.rid) }); setTimeout(() => r.getNotifications({ tag: "vc-up" }).then(a => a.forEach(n => n.close())).catch(() => {}), 6000); }
        else r.showNotification("⏫ جاري رفع الفيديو… " + PC(pct), { ...o, body: "لـ " + roomLabel(job.rid) });
      }).catch(() => {});
    } catch (_) {}
  };
  function size(job) { const w0 = +(job.meta && job.meta.w) || 4, h0 = +(job.meta && job.meta.h) || 3; let W = 240, H = W * h0 / w0; if (H > 320) { H = 320; W = H * w0 / h0; } if (W < 140) W = 140; return [Math.round(W), Math.round(H)]; }
  function build(job) {
    const row = el("div", "row me"), b = el("div", "b upb2"), box = el("div", "mwrap upw");
    const ph = el("div", "mph sharp"); box.append(ph);
    const ctr = el("div", "upc2"), ring = document.createElementNS("http://www.w3.org/2000/svg", "svg"); ring.setAttribute("viewBox", "0 0 48 48"); ring.setAttribute("class", "upr");
    ring.innerHTML = '<circle class="bg" cx="24" cy="24" r="' + R + '"/><circle class="fg" cx="24" cy="24" r="' + R + '" stroke-dasharray="' + CIRC.toFixed(2) + '" stroke-dashoffset="' + CIRC.toFixed(2) + '"/>';
    const x = el("button", "upx2", "✕"); x.type = "button"; x.setAttribute("aria-label", "إلغاء");
    x.onclick = e => { e.stopPropagation(); if (job.state === "err") { job.err = ""; run(job); } else if (job.state !== "post") cancel(job); };
    ctr.append(ring, x); const lb = el("div", "upl"); box.append(ctr, lb); b.append(box);
    const t = el("div", "t"), sc = el("span", "pend"); sc.innerHTML = typeof SVG_CLOCK !== "undefined" ? SVG_CLOCK : "⏱"; t.append(sc, el("span", "", new Date(job.t0).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })));
    const tx = el("div", "tx mcap"); tx.dir = "auto"; tx.hidden = true; b.append(tx, t); row.append(b);
    job.row = row; job.el = { box, ph, ring, fg: ring.querySelector(".fg"), x, lb, tx }; paint(job); return row;
  }
  function paint(job) {
    const e = job.el; if (!e) return; const [W, H] = size(job); e.box.style.width = W + "px"; e.box.style.height = H + "px";
    if (job.poster && e.ph._p !== job.poster) { e.ph._p = job.poster; e.ph.style.backgroundImage = "url(" + job.poster + ")"; }
    e.tx.hidden = !job.cap; e.tx.textContent = job.cap || "";
    const st = job.state, pct = Math.max(0, Math.min(100, job.pct || 0)), ind = st === "post" || (st === "prep" && !pct) || (st === "up" && !pct && !job.n);
    e.ring.classList.toggle("spin", ind); e.fg.style.strokeDashoffset = (CIRC * (1 - (ind ? .28 : pct / 100))).toFixed(2);
    e.box.classList.toggle("err", st === "err"); e.x.textContent = st === "err" ? "↻" : "✕"; e.x.hidden = st === "post";
    const sz = job.blob ? " · " + MB(job.blob.size) + " م.ب" : "";
    e.lb.textContent = st === "err" ? (job.err || "اتقطع الرفع") + " · اضغط ↻" : st === "post" ? "بيتبعت…" : st === "prep" ? "بجهّز الفيديو… " + (pct ? PC(pct) : "") + " · سيب التطبيق مفتوح" : "بيترفع… " + (pct ? PC(pct) : "") + sz;
  }
  const mount = (job, box) => { if (!job.row) build(job); box.append(job.row); };
  function show(job) { if (job.rid !== room) return; const box = $("msgs"); mount(job, box); box.scrollTop = box.scrollHeight; }
  function drop(job) { jobs.delete(job.id); if (job.row) job.row.remove(); act(); }
  const wipe = job => { if (job.mid) { idbTx("readwrite", st => { st.delete(jk(job.mid)); st.delete(pk(job.mid)); }); } };
  async function cancel(job) {
    job.cancel = true; drop(job); wipe(job); flash("اتلغى رفع الفيديو");
    if (job.mid && job.n && db) for (let i = 0; i < job.n; i++) db.collection("media").doc(i ? job.mid + "_" + i : job.mid).delete().catch(() => {});
  }
  async function posted(job) {
    if (!job.resumed || !db) return false;
    try { let q = db.collection(isDM(job.rid) ? "dmsgs" : "msgs").where("room", "==", job.rid).where("mid", "==", job.mid); if (isDM(job.rid)) q = q.where("members", "array-contains", myId); return !(await q.limit(1).get()).empty; } catch (_) { return false; }
  }
  async function run(job) {
    if (job.running) return; job.running = true; WL.on(); job.cancel = false; job.state = "up"; paint(job); act();
    try {
      if (job.small) { const url = await readURL(job.file); if (!url) throw new Error("read"); job.state = "post"; paint(job); await postMedia({ ...(await saveMedia("vid", url, job.meta, job.rid)), ...(job.cap ? { text: job.cap } : {}), ...(job.reply ? { reply: job.reply } : {}) }, job.rid); }
      else {
        await uploadChunks(job.blob, job.mime, job.ui, "فيديو", { id: job.mid, rid: job.rid, skip: job.done, onChunk: i => { job.done.add(i); idbTx("readwrite", st => st.put([...job.done], pk(job.mid))); } });
        if (job.cancel) throw new Error("cancel");
        mineAdd(job.mid, job.n || 1);
        job.state = "post"; job.pct = 100; paint(job); note(job);
        try { MEDIA.set(job.mid, URL.createObjectURL(job.blob)); idbPut(job.mid, job.blob); } catch (_) {}
        if (!(await posted(job))) await postMedia({ mid: job.mid, mk: "vid", n: job.n || 1, thumb: job.meta.thumb || "", w: job.meta.w || 0, h: job.meta.h || 0, ...(job.cap ? { text: job.cap } : {}), ...(job.reply ? { reply: job.reply } : {}) }, job.rid);
      }
      wipe(job); note(job, true); setTimeout(() => drop(job), 700);
    } catch (e) {
      if (job.cancel || (e && e.message === "cancel")) { if (jobs.has(job.id)) cancel(job); }
      else if (e && e.code === "permission-denied") { flash("⚠️ قواعد Firebase مش مسمحة بحفظ الفيديو الكبير (collection media). راجع القواعد."); drop(job); wipe(job); }
      else { job.state = "err"; job.err = navigator.onLine === false ? "مفيش نت" : "اتقطع الرفع"; paint(job); }
    } finally { job.running = false; WL.off(); act(); }
  }
  const make = o => { const job = { id: "u" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), state: "prep", pct: 0, t0: Date.now(), done: new Set(), meta: {}, ...o }; job.ui = { get cancel() { return job.cancel; }, set(_t, p) { if (p != null) job.pct = p; paint(job); note(job); } }; jobs.set(job.id, job); show(job); return job; };
  async function resume() {
    if (!db || !myId) return;
    const keys = (await idbTx("readonly", st => st.getAllKeys())) || [];
    for (const k of keys) {
      if (typeof k !== "string" || !k.startsWith("job:")) continue; const rec = await idbGet(k); if (!rec || rec.uid !== myId) continue;
      if ([...jobs.values()].some(j => j.mid === rec.id)) continue;
      if (Date.now() - rec.t0 > 3 * 86400000) { idbTx("readwrite", st => { st.delete(k); st.delete(pk(rec.id)); }); continue; }
      const dn = (await idbGet(pk(rec.id))) || [];
      const job = { id: "r" + rec.id, mid: rec.id, rid: rec.rid, cap: rec.cap, mime: rec.mime, n: rec.n, meta: rec.meta || {}, poster: rec.poster, reply: rec.reply, blob: rec.blob, t0: rec.t0, done: new Set(dn), state: "up", pct: rec.n ? dn.length / rec.n * 100 : 0, resumed: 1 };
      job.ui = { get cancel() { return job.cancel; }, set(_t, p) { if (p != null) job.pct = p; paint(job); note(job); } };
      jobs.set(job.id, job); show(job); run(job);
    }
  }
  const save = job => idbTx("readwrite", st => st.put({ id: job.mid, uid: myId, rid: job.rid, cap: job.cap, mime: job.mime, n: job.n, meta: { thumb: job.meta.thumb, w: job.meta.w, h: job.meta.h }, poster: job.poster, reply: job.reply || null, t0: job.t0, blob: job.blob }, jk(job.mid)));
  const kick = () => { resume().catch(() => {}); [...jobs.values()].forEach(j => { if (j.state === "err" && !j.running) run(j); }); };
  document.addEventListener("visibilitychange", () => { if (!document.hidden) kick(); });
  window.addEventListener("online", kick);
  const iv = setInterval(() => { if (db && myId) { clearInterval(iv); kick(); } }, 2500);
  return { make, show, paint, run, save, drop, mount: (list, box) => { for (const j of jobs.values()) { if (j.rid !== room) continue; if (j.mid && list.some(m => m.mid === j.mid)) { if (j.row) j.row.remove(); continue; } mount(j, box); } }, jobs };
})();
async function sendVideo(file, rid, o) {
  rid = rid || room; o = o || {};
  if (!mediaGuard(rid)) return;
  const cap = o.cap !== undefined ? o.cap : $("inp").value.trim(); if (o.cap === undefined && cap && rid === room) { $("inp").value = ""; try { localStorage.removeItem(draftKey(rid)); } catch (_) {} }
  const reply = rid === room && replyTo ? replyTo : null; if (reply) clearReply();
  const job = UPL.make({ rid, cap: cap.slice(0, 300), file, reply });   // الفقاعة بتظهر فورًا في الشات
  try {
    const meta = await videoMeta(file); if (job.cancel) return;
    job.meta = meta; job.poster = meta.poster || ""; UPL.paint(job);
    if (file.size < 650000 && !o.edit) { job.small = true; UPL.run(job); return; }
    let blob = file, mime = (file.type || "video/mp4").split(";")[0]; if (!/^video\//i.test(mime)) mime = "video/mp4";
    if (file.size > VID_MAX || o.edit) {
      const r = await shrinkVideo(file, job.ui, o.edit ? { ...o.edit, hq: file.size <= VID_MAX } : {});
      if (job.cancel) return;
      if (r && r.tooLong) { UPL.drop(job); flash("🎥 الفيديو أطول من " + Math.round(VID_MAX_SEC / 60) + " دقايق، قصّره وجرّب تاني"); return; }
      if (!r) { UPL.drop(job); flash("ماقدرتش أجهّز الفيديو الكبير ده على المتصفح. جرّب مقطع أصغر."); return; }
      blob = r; mime = (r.type || "video/webm").split(";")[0];
      if (blob.size > VID_MAX * 1.08) { UPL.drop(job); flash("الفيديو لسه كبير بعد الضغط. قصّره شوية."); return; }
    }
    job.blob = blob; job.mime = mime; job.n = Math.max(1, Math.ceil(blob.size / RAW_CH)); job.mid = db.collection("media").doc().id; job.pct = 0; job.state = "up";
    await UPL.save(job);           // بنحفظه على الجهاز علشان لو التطبيق اتقفل يكمّل من مكانه
    UPL.run(job);                  // الرفع بيكمّل في الخلفية من غير ما نستنّاه
  } catch (e) { UPL.drop(job); flash("الفيديو ماتبعتش، اتأكد من النت وجرّب تاني."); }
}
// ───── استوديو الإرسال: معاينة وتعديل الصور والفيديو وشرح لكل ملف قبل الإرسال ─────
const STU = (() => {
  const CROPS = [["أصلي", 0], ["١:١", 1], ["٤:٥", .8], ["٣:٤", .75], ["١٦:٩", 16 / 9], ["٩:١٦", 9 / 16]];
  const FLT = [["أصلي", ""], ["نابض", "saturate(1.55) contrast(1.08)"], ["دافي", "sepia(.28) saturate(1.3) hue-rotate(-8deg) brightness(1.04)"], ["بارد", "saturate(1.15) hue-rotate(14deg) brightness(1.02) contrast(1.05)"], ["سينما", "contrast(1.28) saturate(.82) brightness(.92)"], ["أبيض وأسود", "grayscale(1) contrast(1.15)"], ["ذكرى", "sepia(.7) contrast(.95) brightness(1.05)"], ["فجر", "brightness(1.1) saturate(1.25) sepia(.15)"], ["ليل", "brightness(.85) contrast(1.2) saturate(.9) hue-rotate(15deg)"]];
  const EMO = "😂 🥹 😍 🔥 ❤️ 👍 🙏 🎉 ✨ 💯 😎 🤝 🌹 ⭐ 😭 🤲 💪 👀 🫶 🌙 ☀️ ✅ ❌ 🇪🇬".split(" ");
  const COL = ["#ffffff", "#111111", "#ff4d6d", "#ffb703", "#2cc4a9", "#4cc9f0", "#9b5cff", "#7ae582"];
  const MAX_ITEMS = 10, MAX_VIDS = 3;
  const canF = (() => { try { return "filter" in CanvasRenderingContext2D.prototype; } catch (_) { return false; } })();
  const ICO = {
    flt: '<path d="M12 3l2.2 5.3L20 9l-4.3 3.8L17 18.5 12 15.6 7 18.5l1.3-5.7L4 9l5.8-.7z"/>',
    adj: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
    crop: '<path d="M7 3v14h14M3 7h14v14"/>',
    rot: '<path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v5h-5"/>',
    draw: '<path d="M4 20l1-4L16.5 4.5a2 2 0 0 1 3 3L8 19z"/>',
    text: '<path d="M5 6V4h14v2M12 4v16M9 20h6"/>',
    emo: '<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2.5 4 2.5S16 14 16 14M9 9.5h.01M15 9.5h.01"/>',
    trim: '<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><path d="M8 7.5L20 18M8 16.5L20 6"/>',
    mute: '<path d="M4 9v6h4l5 4V5L8 9zM17 9l4 6M21 9l-4 6"/>',
    snd: '<path d="M4 9v6h4l5 4V5L8 9zM16.5 8.5a5 5 0 0 1 0 7"/>',
    reset: '<path d="M4 4v6h6M4.5 10A8 8 0 1 1 5 15"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    trash: '<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>',
    undo: '<path d="M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3"/>',
  };
  const svg = (k, s) => '<svg viewBox="0 0 24 24" width="' + (s || 22) + '" height="' + (s || 22) + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICO[k] + "</svg>";
  // لقطات مصغّرة من الفيديو لشريط القص (بتتولّد مرة واحدة وبتتخزّن على الملف)
  function filmFor(it, cb) {
    if (it._film) { cb(it._film); return; }
    if (!it._filmP) it._filmP = new Promise(res => {
      const N = 8, out = [], v = document.createElement("video"); v.muted = true; v.playsInline = true; v.preload = "auto";
      let k = 0, done = false;
      const fin = () => { if (done) return; done = true; it._film = out.filter(Boolean); try { v.removeAttribute("src"); v.load(); } catch (_) {} res(it._film); };
      const next = () => { if (k >= N) return fin(); try { v.currentTime = Math.min(Math.max(0, it.dur - .05), it.dur * (k + .5) / N); } catch (_) { fin(); } };
      v.onseeked = () => { try { const c = document.createElement("canvas"), w = 80; c.width = w; c.height = Math.max(1, Math.round(w * (v.videoHeight || 1) / (v.videoWidth || 1))); c.getContext("2d").drawImage(v, 0, 0, c.width, c.height); out.push(c.toDataURL("image/jpeg", .6)); } catch (_) { out.push(""); } k++; next(); };
      v.onloadeddata = next; v.onerror = fin; setTimeout(fin, 12000); v.src = it.url;
    });
    it._filmP.then(cb);
  }
  const fmt = s => { s = Math.max(0, s || 0); return Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0"); };
  const arN = n => String(n).replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[d]);
  let S = null, root = null, R = {}, uid = 0, raf = 0;

  const fstr = it => !canF ? "" : [FLT[it.flt][1], it.br ? "brightness(" + (1 + it.br / 100) + ")" : "", it.ct ? "contrast(" + (1 + it.ct / 100) + ")" : "", it.sa ? "saturate(" + (1 + it.sa / 100) + ")" : ""].filter(Boolean).join(" ");
  const edited = it => it.kind === "img" ? !!(it.rot || it.crop || it.flt || it.br || it.ct || it.sa || it.strokes.length || it.layers.length) : (it.st > .05 || it.en < it.dur - .05 || it.mute);
  function geom(it, maxPx) {
    const sw = it.bmp.width, sh = it.bmp.height, odd = it.rot % 2, rw = odd ? sh : sw, rh = odd ? sw : sh, a = CROPS[it.crop][1];
    let cw = rw, ch = rh; if (a) { if (rw / rh > a) cw = rh * a; else ch = rw / a; }
    const k = Math.min(1, maxPx / Math.max(cw, ch));
    return { sw, sh, k, ow: Math.max(1, Math.round(cw * k)), oh: Math.max(1, Math.round(ch * k)) };
  }
  function paint(it, cv, maxPx, ed) {
    const g = geom(it, maxPx); if (cv.width !== g.ow) cv.width = g.ow; if (cv.height !== g.oh) cv.height = g.oh;
    const c = cv.getContext("2d"); c.clearRect(0, 0, g.ow, g.oh); c.imageSmoothingQuality = "high";
    c.save(); if (canF) c.filter = fstr(it) || "none"; c.translate(g.ow / 2, g.oh / 2); c.rotate(it.rot * Math.PI / 2); c.scale(g.k, g.k); c.drawImage(it.bmp, -g.sw / 2, -g.sh / 2); c.restore();
    for (const s of it.strokes) {
      c.strokeStyle = s.c; c.lineWidth = Math.max(1.5, s.w * g.ow); c.lineCap = c.lineJoin = "round"; c.beginPath();
      s.p.forEach(([x, y], i) => i ? c.lineTo(x * g.ow, y * g.oh) : c.moveTo(x * g.ow, y * g.oh));
      if (s.p.length === 1) c.lineTo(s.p[0][0] * g.ow + .1, s.p[0][1] * g.oh); c.stroke();
    }
    it._box = [];
    it.layers.forEach((L, i) => {
      const fs = L.s * g.ow, x = L.x * g.ow, y = L.y * g.oh; c.save();
      c.font = (L.e ? "" : "800 ") + fs + "px system-ui,'Segoe UI Emoji','Noto Color Emoji',sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.direction = /[؀-ۿ]/.test(L.t) ? "rtl" : "ltr";
      const w = c.measureText(L.t).width, pad = fs * .32;
      if (!L.e && L.bg) {
        c.fillStyle = L.c; const bx = x - w / 2 - pad, by = y - fs * .75, bw = w + pad * 2, bh = fs * 1.5; c.beginPath();
        if (c.roundRect) c.roundRect(bx, by, bw, bh, fs * .4); else c.rect(bx, by, bw, bh); c.fill();
        c.fillStyle = L.c === "#ffffff" || L.c === "#ffb703" || L.c === "#7ae582" || L.c === "#4cc9f0" ? "#111" : "#fff";
      } else { c.fillStyle = L.c; if (!L.e) { c.shadowColor = "rgba(0,0,0,.55)"; c.shadowBlur = fs * .25; } }
      c.fillText(L.t, x, y + (L.e ? fs * .04 : 0)); c.restore();
      it._box[i] = { x: (x - w / 2 - pad) / g.ow, y: (y - fs * .75) / g.oh, w: (w + pad * 2) / g.ow, h: fs * 1.5 / g.oh };
      if (ed && S && S.sel === i) { c.save(); c.setLineDash([6, 5]); c.strokeStyle = "#fff"; c.lineWidth = 2; c.strokeRect(x - w / 2 - pad, y - fs * .75, w + pad * 2, fs * 1.5); c.restore(); }
    });
  }
  const sched = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; repaint(); }); };
  function repaint() { const it = cur(); if (!it || it.kind !== "img") return; paint(it, R.cv, 1000, true); }
  const cur = () => S && S.items[S.i];
  function ambient(src, w, h) {
    try { const c = document.createElement("canvas"); c.width = c.height = 1; c.getContext("2d").drawImage(src, 0, 0, w, h, 0, 0, 1, 1); const d = c.getContext("2d").getImageData(0, 0, 1, 1).data; root.style.setProperty("--amb", Math.max(30, d[0]) + "," + Math.max(30, d[1]) + "," + Math.max(30, d[2])); } catch (_) {}
  }
  const tick = () => { try { navigator.vibrate && navigator.vibrate(6); } catch (_) {} };

  function build() {
    root = document.createElement("div"); root.id = "stu"; root.hidden = true; root.setAttribute("role", "dialog"); root.setAttribute("aria-label", "إرسال صور وفيديو");
    root.innerHTML = '<div class="stu-aur"></div>' +
      '<div class="stu-top"><button type="button" class="stu-x" id="stuX" aria-label="إغلاق">✕</button><div class="stu-to"><span>إلى</span><b id="stuTo"></b></div><div class="stu-n" id="stuN"></div></div>' +
      '<div class="stu-stage"><div class="stu-rail" id="stuRail"></div><div class="stu-frame" id="stuFrame"><canvas id="stuCv"></canvas><div class="stu-vw" id="stuVW" hidden><video id="stuV" playsinline webkit-playsinline></video><button type="button" class="stu-pp" id="stuPlay" aria-label="تشغيل"></button><div class="stu-vc"><span id="stuTm">0:00</span><input type="range" id="stuSeek" min="0" max="1" step="0.05" value="0" aria-label="التقدّم"></div></div><div class="stu-tip" id="stuTip" hidden></div><div class="stu-ld" id="stuLd" hidden></div></div></div>' +
      '<div class="stu-panel" id="stuPanel" hidden></div>' +
      '<div class="stu-strip" id="stuStrip"></div>' +
      '<div class="stu-bar"><div class="stu-cap"><label id="stuCapL" for="stuCap"></label><textarea id="stuCap" rows="1" maxlength="300" placeholder="اكتب شرح…" dir="auto" enterkeyhint="enter"></textarea></div>' +
      '<button type="button" class="stu-send" id="stuSend" aria-label="إرسال"><svg class="pl" viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path class="tr" d="M2 9.2h4M1 12h5M2 14.8h4"/><path class="bd" d="M8.2 4.1 21.4 10.6c.9.5.9 1.8 0 2.3L8.2 19.4c-.8.4-1.7-.3-1.5-1.2l.9-4.6 7.2-1.6-7.2-1.6-.9-4.6c-.2-.9.7-1.6 1.5-1.2z"/></svg><b id="stuSN"></b></button></div>';
    document.body.append(root);
    ["stuX", "stuTo", "stuN", "stuRail", "stuFrame", "stuCv", "stuV", "stuVW", "stuPlay", "stuTm", "stuSeek", "stuTip", "stuLd", "stuPanel", "stuStrip", "stuCapL", "stuCap", "stuSend", "stuSN"].forEach(k => R[k.slice(3).toLowerCase() || k] = document.getElementById(k));
    R.x = R.x; R.cv = R.cv; R.v = R.v;
    R.x.onclick = () => close(false);
    R.send.onclick = () => { if (R.send.dataset.busy || !S) return; R.send.dataset.busy = "1"; tick(); const rm = matchMedia("(prefers-reduced-motion:reduce)").matches; R.send.classList.add("go"); setTimeout(() => { delete R.send.dataset.busy; R.send.classList.remove("go"); send(); }, rm ? 0 : 280); };
    R.cap.oninput = () => { const it = cur(); if (it) it.cap = R.cap.value; R.cap.style.height = "auto"; R.cap.style.height = Math.min(96, R.cap.scrollHeight) + "px"; };
    document.addEventListener("keydown", e => { if (e.key === "Escape" && S && !root.hidden) close(false); });
    // لوحة المفاتيح: نخلي الشاشة على قد المساحة المرئية بس
    const vv = window.visualViewport; if (vv) { const fit = () => { if (root.hidden) return; root.style.height = vv.height + "px"; root.style.top = vv.offsetTop + "px"; root.classList.toggle("kb", vv.height < window.innerHeight * .75); }; vv.addEventListener("resize", fit); vv.addEventListener("scroll", fit); R.fit = fit; }
    // لمس الصورة: رسم أو سحب نص/ملصق
    let stroke = null, drag = null;
    const pt = e => { const r = R.cv.getBoundingClientRect(); return [Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))]; };
    R.cv.style.touchAction = "none";
    R.cv.addEventListener("pointerdown", e => {
      const it = cur(); if (!it || it.kind !== "img") return; const p = pt(e);
      if (S.mode === "draw") { stroke = { c: S.col, w: S.pw, p: [p] }; it.strokes.push(stroke); try { R.cv.setPointerCapture(e.pointerId); } catch (_) {} sched(); return; }
      for (let i = it.layers.length - 1; i >= 0; i--) { const b = it._box[i]; if (b && p[0] >= b.x && p[0] <= b.x + b.w && p[1] >= b.y && p[1] <= b.y + b.h) { S.sel = i; drag = { i, dx: it.layers[i].x - p[0], dy: it.layers[i].y - p[1] }; try { R.cv.setPointerCapture(e.pointerId); } catch (_) {} panel(); sched(); return; } }
      if (S.sel !== -1) { S.sel = -1; panel(); sched(); }
    });
    R.cv.addEventListener("pointermove", e => {
      const it = cur(); if (!it) return; const p = pt(e);
      if (stroke) { const l = stroke.p[stroke.p.length - 1]; if (Math.hypot(p[0] - l[0], p[1] - l[1]) > .002) { stroke.p.push(p); sched(); } }
      else if (drag) { const L = it.layers[drag.i]; if (L) { L.x = Math.min(1, Math.max(0, p[0] + drag.dx)); L.y = Math.min(1, Math.max(0, p[1] + drag.dy)); sched(); } }
    });
    const up = () => { if (stroke) { stroke = null; thumbOf(cur()); dock(); } if (drag) { drag = null; thumbOf(cur()); } };
    R.cv.addEventListener("pointerup", up); R.cv.addEventListener("pointercancel", up);
    R.v.addEventListener("timeupdate", () => { const it = cur(); if (!it || it.kind !== "vid" || !it.dur) return; if (R.v.currentTime >= it.en - .05) { R.v.currentTime = it.st; if (!R.v.paused) R.v.play().catch(() => {}); } });
    R.v.addEventListener("play", () => { const it = cur(); if (it && it.kind === "vid" && (R.v.currentTime < it.st - .05 || R.v.currentTime >= it.en - .05)) R.v.currentTime = it.st; });
    const fitV = () => { const it = cur(); if (!it || it.kind !== "vid" || !it.tw || !it.th) return; const fw = R.frame.clientWidth, fh = R.frame.clientHeight; if (!fw || !fh) return; const k = Math.min(fw / it.tw, fh / it.th); R.vw.style.width = Math.floor(it.tw * k) + "px"; R.vw.style.height = Math.floor(it.th * k) + "px"; };
    // تحكم فيديو مخصص (بدل أزرار المتصفح): تشغيل بلمسة + شريط تقدّم داخل حدود القص
    let seeking = false;
    const vsync = () => { const it = cur(); if (!it || it.kind !== "vid") return; const lo = it.st || 0, hi = it.en || it.dur || 1; R.seek.min = lo; R.seek.max = hi; const t = Math.min(hi, Math.max(lo, R.v.currentTime)); if (!seeking) R.seek.value = t; R.tm.textContent = fmt(t - lo) + " / " + fmt(hi - lo); if (R.trimUpd) R.trimUpd(); R.vw.classList.toggle("playing", !R.v.paused); R.play.setAttribute("aria-label", R.v.paused ? "تشغيل" : "إيقاف"); };
    R.vsync = vsync;
    ["timeupdate", "play", "pause", "seeked", "loadedmetadata"].forEach(ev => R.v.addEventListener(ev, vsync));
    R.play.onclick = () => { if (R.v.paused) R.v.play().catch(() => {}); else R.v.pause(); };
    R.seek.addEventListener("pointerdown", () => { seeking = true; }); ["pointerup", "pointercancel", "change"].forEach(ev => R.seek.addEventListener(ev, () => { seeking = false; }));
    R.seek.oninput = () => { R.v.currentTime = +R.seek.value; vsync(); };
    R.fitV = fitV; if (window.ResizeObserver) new ResizeObserver(fitV).observe(R.frame); window.addEventListener("resize", fitV);
    R.v.addEventListener("volumechange", () => { const it = cur(); if (it && it.kind === "vid") R.v.muted = it.mute; });
  }

  // ───── تحميل الملفات ─────
  async function loadImg(it) {
    let bmp;
    try { bmp = await createImageBitmap(it.file); } catch (e) { bmp = await new Promise((ok, no) => { const u = URL.createObjectURL(it.file), im = new Image(); im.onload = () => { URL.revokeObjectURL(u); ok(im); }; im.onerror = no; im.src = u; }); }
    const w = bmp.width || bmp.naturalWidth, h = bmp.height || bmp.naturalHeight, k = Math.min(1, 2400 / Math.max(w, h));
    if (k < 1) { const c = document.createElement("canvas"); c.width = Math.round(w * k); c.height = Math.round(h * k); c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height); if (bmp.close) bmp.close(); bmp = c; }
    it.bmp = bmp; it.tw = bmp.width; it.th = bmp.height; thumbOf(it);
  }
  function loadVid(it) {
    return new Promise(res => {
      it.url = URL.createObjectURL(it.file); const v = document.createElement("video"); v.muted = true; v.playsInline = true; v.preload = "auto"; let done = false;
      const fin = () => { if (done) return; done = true; it.dur = isFinite(v.duration) ? v.duration : 0; it.en = Math.min(it.dur || 0, 300); it.tw = v.videoWidth; it.th = v.videoHeight; res(); };
      let early = false; v.onloadedmetadata = () => { if (early || done) return; early = true; it.dur = isFinite(v.duration) ? v.duration : 0; it.en = Math.min(it.dur || 0, 300); it.tw = v.videoWidth; it.th = v.videoHeight; res(); };   // الاستوديو يفتح فورًا، واللقطة المصغّرة بتيجي بعدها
      v.onloadeddata = () => { try { v.currentTime = Math.min(.2, (v.duration || 1) / 2); } catch (e) { fin(); } };
    v.onseeked = () => { try { const k = 160 / Math.max(v.videoWidth, v.videoHeight, 1), c = document.createElement("canvas"); c.width = Math.max(1, Math.round(v.videoWidth * k)); c.height = Math.max(1, Math.round(v.videoHeight * k)); const g = c.getContext("2d"); g.drawImage(v, 0, 0, c.width, c.height); it.poster = c.toDataURL("image/jpeg", .7); it.pc = c; if (early && S && S.items.indexOf(it) >= 0) { strip(); if (cur() === it) { root.style.setProperty("--pst", 'url("' + it.poster + '")'); ambient(it.pc, it.pc.width, it.pc.height); } } const d = g.getImageData(0, 0, c.width, c.height).data; let sm = 0; for (let j = 0; j < d.length; j += 16) sm += d[j] + d[j + 1] + d[j + 2]; if (sm / (d.length / 16) / 3 < 18 && !it._r && v.duration > 1) { it._r = 1; v.currentTime = v.duration * .35; return; } } catch (e) {} fin(); };
      v.onerror = fin; v.src = it.url; setTimeout(fin, 7000);
    });
  }
  function thumbOf(it) {
    if (!it) return;
    if (it.kind === "img") { const c = it.tc || (it.tc = document.createElement("canvas")); try { paint(it, c, 140); } catch (_) {} }
    strip();
  }

  // ───── الواجهة ─────
  function dock() {
    const it = cur(), r = R.rail; r.textContent = ""; if (!it) return;
    const B = (ic, lb, fn, on, dis) => { const b = document.createElement("button"); b.type = "button"; b.className = "stu-t" + (on ? " on" : ""); b.innerHTML = svg(ic) + "<i>" + lb + "</i>"; b.disabled = !!dis; b.onclick = () => { tick(); fn(); }; r.append(b); };
    const mode = m => () => { S.mode = S.mode === m ? "" : m; S.sel = -1; panel(); dock(); sched(); };
    if (it.kind === "img") {
      if (canF) { B("flt", "فلاتر", mode("flt"), S.mode === "flt"); B("adj", "ضبط", mode("adj"), S.mode === "adj"); }
      B("crop", "قص", mode("crop"), S.mode === "crop"); B("rot", "تدوير", rotate);
      B("draw", "رسم", mode("draw"), S.mode === "draw"); B("text", "نص", mode("text"), S.mode === "text"); B("emo", "ملصق", mode("emo"), S.mode === "emo");
    } else {
      B("trim", "قص", mode("trim"), S.mode === "trim");
      B(it.mute ? "mute" : "snd", it.mute ? "صامت" : "الصوت", () => { it.mute = !it.mute; R.v.muted = it.mute; dock(); strip(); });
    }
    B("reset", "إلغاء", resetIt, false, !edited(it));
  }
  function panel() {
    R.trimUpd = null; const it = cur(), p = R.panel; p.textContent = ""; const m = it && S.mode; p.hidden = !m; R.frame.classList.toggle("tall", !!m); if (!m) { tip(); return; }
    const row = (cls) => { const d = document.createElement("div"); d.className = "stu-row " + (cls || ""); p.append(d); return d; };
    const chip = (host, label, on, fn) => { const b = document.createElement("button"); b.type = "button"; b.className = "stu-c" + (on ? " on" : ""); b.textContent = label; b.onclick = () => { tick(); fn(); }; host.append(b); return b; };
    const dots = (host, sel, fn) => COL.forEach(c => { const b = document.createElement("button"); b.type = "button"; b.className = "stu-dot" + (c === sel ? " on" : ""); b.style.background = c; b.setAttribute("aria-label", "لون"); b.onclick = () => { tick(); fn(c); }; host.append(b); });
    const slider = (lb, val, fn) => { const d = row("sl"); const l = document.createElement("span"); l.textContent = lb; const i = document.createElement("input"); i.type = "range"; i.min = -50; i.max = 50; i.value = val; const o = document.createElement("b"); o.textContent = arN(val); i.oninput = () => { fn(+i.value); o.textContent = arN(i.value); sched(); }; i.onchange = () => { thumbOf(it); dock(); }; d.append(l, i, o); };
    if (m === "flt") {
      const d = row("scroll"); FLT.forEach(([n, f], i) => { const b = document.createElement("button"); b.type = "button"; b.className = "stu-f" + (it.flt === i ? " on" : ""); const c = document.createElement("canvas"); const k = 64 / Math.max(it.bmp.width, it.bmp.height); c.width = Math.max(1, Math.round(it.bmp.width * k)); c.height = Math.max(1, Math.round(it.bmp.height * k)); const g = c.getContext("2d"); g.filter = f || "none"; g.drawImage(it.bmp, 0, 0, c.width, c.height); const s = document.createElement("span"); s.textContent = n; b.append(c, s); b.onclick = () => { tick(); it.flt = i; thumbOf(it); panel(); dock(); sched(); }; d.append(b); });
    } else if (m === "adj") {
      slider("سطوع", it.br, v => it.br = v); slider("تباين", it.ct, v => it.ct = v); slider("ألوان", it.sa, v => it.sa = v);
    } else if (m === "crop") {
      const d = row("scroll"); CROPS.forEach(([n], i) => chip(d, n, it.crop === i, () => { if (it.crop === i) return; if (clearNotes()) return; it.crop = i; thumbOf(it); panel(); dock(); sched(); }));
    } else if (m === "draw") {
      const d = row(); dots(d, S.col, c => { S.col = c; panel(); });
      const t = row("scroll"); [["رفيع", .006], ["وسط", .011], ["عريض", .022]].forEach(([n, w]) => chip(t, n, S.pw === w, () => { S.pw = w; panel(); }));
      const u = chip(t, "↩ تراجع", false, () => { it.strokes.pop(); thumbOf(it); dock(); sched(); }); u.disabled = !it.strokes.length;
    } else if (m === "text") {
      const d = row("txt"), i = document.createElement("input"); i.type = "text"; i.placeholder = "اكتب النص…"; i.maxLength = 60; i.dir = "auto"; i.id = "stuTxt";
      const L = it.layers[S.sel]; if (L && !L.e) i.value = L.t;
      const add = document.createElement("button"); add.type = "button"; add.className = "stu-add"; add.textContent = L && !L.e ? "تحديث" : "إضافة";
      add.onclick = () => { const t = i.value.trim(); if (!t) { i.focus(); return; } const cl = it.layers[S.sel]; if (cl && !cl.e) { cl.t = t; cl.c = S.tc; cl.bg = S.tbg; } else { it.layers.push({ t, x: .5, y: .5, s: .075, c: S.tc, bg: S.tbg }); S.sel = it.layers.length - 1; } i.value = ""; thumbOf(it); panel(); dock(); sched(); };
      i.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); add.click(); } };
      d.append(i, add);
      const c = row(); dots(c, S.tc, col => { S.tc = col; const cl = it.layers[S.sel]; if (cl && !cl.e) cl.c = col; panel(); sched(); });
      const o = row("scroll"); chip(o, S.tbg ? "▣ بخلفية" : "▢ بدون خلفية", false, () => { S.tbg = !S.tbg; const cl = it.layers[S.sel]; if (cl && !cl.e) cl.bg = S.tbg; panel(); sched(); });
    } else if (m === "emo") {
      const d = row("emo"); EMO.forEach(e => { const b = document.createElement("button"); b.type = "button"; b.textContent = e; b.onclick = () => { tick(); it.layers.push({ t: e, e: 1, x: .5, y: .5, s: .17, c: "#fff" }); S.sel = it.layers.length - 1; thumbOf(it); panel(); dock(); sched(); }; d.append(b); });
    } else if (m === "trim") {
      const d = row("trim"), W = document.createElement("div"); W.className = "stu-trim"; d.append(W);
      const bs = document.createElement("b"), be = document.createElement("b"), bl = document.createElement("span"), tt = document.createElement("div"); tt.className = "stu-tt"; tt.append(bs, bl, be); W.append(tt);
      if (it.dur > 0) {
        const tk = document.createElement("div"); tk.className = "stu-tk"; tk.dir = "ltr";
        const fs = document.createElement("div"); fs.className = "stu-fs"; const tiles = []; for (let k = 0; k < 8; k++) { const t = document.createElement("i"); fs.append(t); tiles.push(t); }
        const shl = document.createElement("div"), shr = document.createElement("div"), win = document.createElement("div"), ph = document.createElement("div"), hs = document.createElement("div"), he = document.createElement("div");
        shl.className = "stu-sh l"; shr.className = "stu-sh r"; win.className = "stu-win"; ph.className = "stu-ph"; hs.className = "stu-hd s"; he.className = "stu-hd e";
        [[hs, "بداية المقطع"], [he, "نهاية المقطع"]].forEach(([h, lb]) => { h.setAttribute("role", "slider"); h.tabIndex = 0; h.setAttribute("aria-label", lb); });
        tk.append(fs, shl, shr, win, ph, hs, he); W.append(tk);
        const MINL = .5, MAXL = 300, pc = x => Math.min(100, Math.max(0, x / it.dur * 100));
        const upd = () => {
          shl.style.width = pc(it.st) + "%"; shr.style.width = (100 - pc(it.en)) + "%"; win.style.left = pc(it.st) + "%"; win.style.right = (100 - pc(it.en)) + "%";
          hs.style.left = pc(it.st) + "%"; he.style.left = pc(it.en) + "%"; hs.setAttribute("aria-valuenow", it.st.toFixed(1)); he.setAttribute("aria-valuenow", it.en.toFixed(1));
          bs.textContent = fmt(it.st); be.textContent = fmt(it.en); bl.textContent = "المدة " + fmt(it.en - it.st);
          const t = R.v.currentTime || 0; ph.style.left = pc(t) + "%"; ph.hidden = t < it.st - .1 || t > it.en + .1;
        };
        R.trimUpd = upd; upd();
        const setSt = t => { it.st = Math.max(0, Math.min(t, it.en - MINL)); if (it.en - it.st > MAXL) it.st = it.en - MAXL; R.v.currentTime = it.st; };
        const setEn = t => { it.en = Math.min(it.dur, Math.max(t, it.st + MINL)); if (it.en - it.st > MAXL) it.en = it.st + MAXL; R.v.currentTime = Math.max(it.st, it.en - .3); };
        const tOf = e => { const r = tk.getBoundingClientRect(); return Math.min(it.dur, Math.max(0, (e.clientX - r.left) / (r.width || 1) * it.dur)); };
        const drag = (h, set) => {
          h.addEventListener("pointerdown", e => {
            e.preventDefault(); e.stopPropagation(); try { h.setPointerCapture(e.pointerId); } catch (_) {} h.classList.add("on"); tick();
            const mv = ev => { set(tOf(ev)); upd(); if (R.vsync) R.vsync(); };
            const up = () => { h.classList.remove("on"); h.removeEventListener("pointermove", mv); h.removeEventListener("pointerup", up); h.removeEventListener("pointercancel", up); dock(); strip(); };
            h.addEventListener("pointermove", mv); h.addEventListener("pointerup", up); h.addEventListener("pointercancel", up);
          });
          h.addEventListener("keydown", e => { const k = e.key === "ArrowLeft" ? -.5 : e.key === "ArrowRight" ? .5 : 0; if (!k) return; e.preventDefault(); set((h === hs ? it.st : it.en) + k); upd(); if (R.vsync) R.vsync(); dock(); strip(); });
        };
        drag(hs, setSt); drag(he, setEn);
        // الضغط على الشريط نفسه بيحرّك رأس التشغيل جوه المقطع المحدد
        tk.addEventListener("pointerdown", e => { if (e.target === hs || e.target === he) return; R.v.currentTime = Math.min(it.en - .05, Math.max(it.st, tOf(e))); upd(); if (R.vsync) R.vsync(); });
        filmFor(it, fr => { if (!tk.isConnected) return; tiles.forEach((t, k) => { const u = fr[Math.min(fr.length - 1, Math.floor(k * fr.length / tiles.length))]; if (u) t.style.backgroundImage = 'url("' + u + '")'; }); tk.classList.add("lit"); });
      } else { bs.textContent = fmt(it.st); be.textContent = fmt(it.en); bl.textContent = "المدة " + fmt(it.en - it.st); }
      if (it.dur > 300) { const w = document.createElement("div"); w.className = "stu-len"; w.textContent = "الحد الأقصى ٥ دقايق"; W.append(w); }
    }
    if (it.kind === "img" && (m === "text" || m === "emo") && S.sel >= 0 && it.layers[S.sel]) {
      const d = row("lay"), L = it.layers[S.sel];
      chip(d, "＋ أكبر", false, () => { L.s = Math.min(.6, L.s * 1.2); thumbOf(it); sched(); }); chip(d, "－ أصغر", false, () => { L.s = Math.max(.02, L.s / 1.2); thumbOf(it); sched(); });
      chip(d, "🗑 حذف", false, () => { it.layers.splice(S.sel, 1); S.sel = -1; thumbOf(it); panel(); dock(); sched(); });
    }
    tip();
  }
  function tip() { const it = cur(), t = R.tip; const on = it && it.kind === "img" && S.mode === "draw" ? "ارسم بصباعك على الصورة" : it && it.kind === "img" && it.layers.length ? "اسحب النص أو الملصق عشان تحرّكه" : ""; t.hidden = !on; t.textContent = on; }
  function clearNotes() { const it = cur(); if (it.strokes.length || it.layers.length) { if (!confirm("ده هيمسح الرسم والنصوص اللي على الصورة. تكمّل؟")) return true; it.strokes = []; it.layers = []; S.sel = -1; } return false; }
  function rotate() { const it = cur(); if (clearNotes()) return; it.rot = (it.rot + 1) % 4; thumbOf(it); dock(); sched(); }
  function resetIt() {
    const it = cur(); if (!it) return;
    if (it.kind === "img") Object.assign(it, { rot: 0, crop: 0, flt: 0, br: 0, ct: 0, sa: 0, strokes: [], layers: [] }); else { it.st = 0; it.en = Math.min(it.dur, 300); it.mute = false; R.v.muted = false; R.v.currentTime = 0; }
    S.sel = -1; thumbOf(it); panel(); dock(); sched();
  }
  function strip() {
    const s = R.strip; s.textContent = "";
    S.items.forEach((it, i) => {
      const b = document.createElement("button"); b.type = "button"; b.className = "stu-th" + (i === S.i ? " on" : ""); b.setAttribute("aria-label", "ملف " + (i + 1));
      const src = it.kind === "img" ? it.tc : it.pc; if (src && src.width) { const c = document.createElement("canvas"); c.width = src.width; c.height = src.height; c.getContext("2d").drawImage(src, 0, 0); b.append(c); } else b.classList.add("nov");
      if (it.kind === "vid") { const t = document.createElement("i"); t.className = "stu-vd"; t.textContent = "▶ " + fmt(it.en - it.st); b.append(t); }
      if (edited(it)) { const e = document.createElement("u"); e.textContent = "✎"; b.append(e); }
      if (it.cap.trim()) { const e = document.createElement("s"); e.textContent = "Aa"; b.append(e); }
      b.onclick = () => { if (i !== S.i) show(i); };
      if (S.items.length > 1) { const x = document.createElement("span"); x.className = "stu-rm"; x.textContent = "✕"; x.onclick = ev => { ev.stopPropagation(); removeAt(i); }; b.append(x); }
      s.append(b);
    });
    if (S.items.length < MAX_ITEMS) { const a = document.createElement("button"); a.type = "button"; a.className = "stu-th stu-add2"; a.setAttribute("aria-label", "إضافة المزيد"); a.innerHTML = svg("plus", 22); a.onclick = () => document.getElementById("aMix").click(); s.append(a); }
    R.sn.textContent = S.items.length > 1 ? arN(S.items.length) : ""; R.n.textContent = S.items.length > 1 ? arN(S.i + 1) + " \u200E/\u200E " + arN(S.items.length) : "";
    R.send.classList.toggle("multi", S.items.length > 1);
    const on = s.querySelector(".on"); if (on && on.scrollIntoView) try { on.scrollIntoView({ inline: "center", block: "nearest" }); } catch (_) {}
  }
  function removeAt(i) { const it = S.items[i]; releaseOne(it); S.items.splice(i, 1); if (!S.items.length) { close(true); return; } show(Math.min(i, S.items.length - 1)); }
  function show(i) {
    S.i = i; const it = cur(); if (!it) return; S.sel = -1; if (it.kind === "vid" && !["trim", ""].includes(S.mode)) S.mode = ""; if (it.kind === "img" && S.mode === "trim") S.mode = "";
    R.cv.hidden = it.kind !== "img"; R.v.hidden = it.kind !== "vid"; R.vw.hidden = it.kind !== "vid"; root.style.setProperty("--pst", it.kind === "vid" && it.poster ? 'url("' + it.poster + '")' : "none");
    if (it.kind === "vid") { if (R.v.dataset.id !== String(it.id)) { R.v.dataset.id = it.id; R.v.src = it.url; R.v.muted = it.mute; R.v.currentTime = it.st || 0; } } else { try { R.v.pause(); } catch (_) {} }
    R.cap.value = it.cap; R.cap.style.height = "auto"; R.cap.style.height = Math.min(96, R.cap.scrollHeight) + "px";
    R.capl.textContent = (it.kind === "vid" ? "🎬 شرح الفيديو" : "🖼 شرح الصورة") + (S.items.length > 1 ? " · " + arN(i + 1) : "");
    if (it.kind === "img") { thumbOf(it); ambient(it.bmp, it.bmp.width, it.bmp.height); } else if (it.pc) ambient(it.pc, it.pc.width, it.pc.height);
    dock(); panel(); strip(); repaint(); if (R.vsync) R.vsync(); if (R.fitV) { R.fitV(); requestAnimationFrame(R.fitV); }
  }
  function releaseOne(it) { try { if (it.url) URL.revokeObjectURL(it.url); if (it.bmp && it.bmp.close) it.bmp.close(); } catch (_) {} }
  function close(sent) {
    if (!S) return;
    if (!sent && S.items.some(x => edited(x) || x.cap.trim()) && !confirm("تقفل من غير ما تبعت؟ التعديلات هتضيع.")) return;
    try { R.v.pause(); R.v.removeAttribute("src"); R.v.load(); } catch (_) {} delete R.v.dataset.id;
    root.hidden = true; document.documentElement.classList.remove("stu-open");
    if (!sent) S.items.forEach(releaseOne);
    S = null;
  }

  // ───── التجهيز والإرسال ─────
  const toBlob = (cv, q) => new Promise(res => cv.toBlob(b => res(b), "image/jpeg", q));
  async function exportImg(it) { const cv = document.createElement("canvas"); paint(it, cv, 1800, false); return (await toBlob(cv, .92)) || it.file; }
  async function send() {
    if (!S || !S.items.length) return; const rid = S.rid;
    if (!mediaGuard(rid)) return;
    const items = S.items.slice();
    if (S.inpTaken && rid === room) { $("inp").value = ""; try { localStorage.removeItem(draftKey(rid)); } catch (_) {} }
    close(true); let n = 0;
    for (const it of items) {
      const cap = it.cap.trim().slice(0, 300);
      try {
        if (it.kind === "img") {
          setStatus("جاري تجهيز الصورة…");
          const r = await shrinkImage(edited(it) ? await exportImg(it) : it.file); if (!r) { setStatus("الصورة كبيرة جدًا."); continue; }
          setStatus("جاري الإرسال…");
          await postMedia({ ...(await saveMedia("img", r.url, r, rid)), ...(cap ? { text: cap } : {}) }, rid); n++;
        } else await sendVideo(it.file, rid, { cap, edit: edited(it) ? { start: it.st, end: it.en || it.dur, mute: it.mute } : null });
      } catch (e) { setStatus("الملف ماتبعتش."); }
      releaseOne(it);
    }
    if (n && !$("status").textContent.startsWith("جاري تحميل")) setStatus("");
  }

  async function open(files, rid) {
    files = [...files].filter(f => /^(image|video)\//i.test(f.type || "")); if (!files.length) return;
    if (!root) build();
    if (!S) {
      rid = rid || room; if (!mediaGuard(rid)) return;
      S = { items: [], i: -1, rid, mode: "", sel: -1, col: COL[2], pw: .011, tc: "#ffffff", tbg: true, inpTaken: false };
      const first = $("inp").value.trim(); S.pre = first;
      R.to.textContent = roomLabel(rid); root.hidden = false; document.documentElement.classList.add("stu-open"); if (R.fit) R.fit();
    }
    const SS = S; R.ld.hidden = false; R.ld.textContent = "بجهّز الملفات…";
    for (const f of files) {
      if (S !== SS) return;
      if (S.items.length >= MAX_ITEMS) { flash("الحد " + arN(MAX_ITEMS) + " ملفات في المرة"); break; }
      const vid = (f.type || "").startsWith("video");
      if (vid && S.items.filter(x => x.kind === "vid").length >= MAX_VIDS) { flash("٣ فيديوهات بس في المرة"); continue; }
      const it = { id: ++uid, file: f, kind: vid ? "vid" : "img", cap: "", rot: 0, crop: 0, flt: 0, br: 0, ct: 0, sa: 0, strokes: [], layers: [], mute: false, st: 0, en: 0, dur: 0 };
      try { await (vid ? loadVid(it) : loadImg(it)); } catch (e) { flash(vid ? "الفيديو ده مش بيفتح" : "الصورة دي مش بتفتح"); continue; }
      if (S !== SS) { releaseOne(it); return; }
      if (!S.items.length && S.pre) { it.cap = S.pre; S.inpTaken = true; }
      S.items.push(it); if (S.i < 0) show(0); else strip();
    }
    R.ld.hidden = true;
    if (!S.items.length) close(true);
  }
  return { open, isOpen: () => !!S };
})();
$("aMix").onchange = e => { const f = [...e.target.files]; e.target.value = ""; if (f.length) STU.open(f, room); };
$("aCam").onchange = e => { const f = e.target.files[0]; e.target.value = ""; if (f) STU.open([f], room); };
$("aCamV").onchange = e => { const f = e.target.files[0]; e.target.value = ""; if (f) STU.open([f], room); };

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
  b.onclick = async e => { if (selMode) return; e.stopPropagation(); const rr = rooms.find(x => x.id === sh.id) || (sh.id === "general" ? generalRoom() : { stub: true, id: sh.id, name: sh.name || "غرفة" }); if (!rr) { setStatus("الغرفة دي مش موجودة."); return; } try { await joinRoom(rr); } catch (er) { setStatus(errMsg(er)); } };
  c.append(b); return c;
}
// الكارت بيشاور على الـ uid بس، والاسم والكود بيتقروا من البروفايل الحقيقي (علشان محدش يزوّر كارت)
function userCard(u) {
  const p = profiles[u && u.uid] || {}, c = el("div", "rcard"); c.append(avatar(p));
  // الاسم على الكارت: اسمي الخاص لو أنا مسجّله، وإلا الاسم اللي المُرسِل سجّله، وإلا الاسم الأصلي. (وأول ما تدوس «مراسلة» بيظهر الاسم الأصلي)
  const shown = u && u.uid !== myId ? (nickOf(u.uid) || String(u.name || "").replace(/\s+/g, " ").trim().slice(0, 30)) : "";
  const t = el("div", "rt"), nb = el("b", "", shown || p.name || "مجهول"); nb.dir = "auto"; t.append(nb, el("small", "", "كارت تعريف")); c.append(t);
  if (u && u.uid !== myId) { const b = el("button", "", "مراسلة"); b.type = "button"; b.onclick = e => { if (selMode) return; e.stopPropagation(); openPeer(u.uid); }; c.append(b); }
  return c;
}
async function sendMyCard() {
  if (!mediaGuard()) return;
  if (!canDMFrom(myId, room)) { flash("🎭 إنت بشخصية مستعارة هنا، مينفعش تبعت كودك الحقيقي"); return; }
  if (!(profiles[myId] || {}).fcode) { flash("كودك لسه بيتجهز، جرّب كمان ثانية"); return; }
  try { await postMedia({ ucard: { uid: myId } }); } catch (e) { flash("ماقدرتش أبعت الكارت."); }
}
// ───── 🆔 مشاركة الكود: كودي أو كود أي صديق (زي مشاركة جهة اتصال). الصديق بيتبعت بالاسم اللي مسجّله بيه عندك ─────
function openCodeShare() {
  const c = $("mcard"); c.textContent = ""; c.append(el("div", "mprev", "🆔 مشاركة الكود"));
  const acts = el("div", "acts lst");
  const row = (ico, grad, label, sub, fn) => { const b = el("button", "act"); b.type = "button"; const i = el("i", "", ico); i.style.background = grad; const sp = el("span", "", label); if (sub) { const sm = el("small", "", sub); sm.dir = "ltr"; sm.style.cssText = "display:block;opacity:.6;font-weight:500;font-size:12px"; sp.append(sm); } b.append(i, sp); b.onclick = fn; acts.append(b); };
  const mc = fmtFCode((profiles[myId] || {}).fcode);
  row("🆔", "linear-gradient(135deg,#2f8cff,#1f5fd1)", "كودي", mc, () => { $("msheet").hidden = true; sendMyCard(); });
  row("👥", "linear-gradient(135deg,#22b573,#0f8f7a)", "أكواد الأصدقاء", "", openFriendCodes);
  c.append(acts); $("msheet").hidden = false;
}
function openFriendCodes() {
  const c = $("mcard"); c.textContent = ""; c.append(el("div", "mprev", "👥 اختار صديق تبعت كوده"));
  const seen = new Set(), fr = [];
  Object.values(dms).filter(d => dmEstablished(d) && !pendingIn(d) && !(d.blockedBy || []).length).forEach(d => { const u = dmPeerOf(d.id); if (!u || u === myId || seen.has(u) || !profiles[u]) return; seen.add(u); fr.push(u); });
  fr.sort((x, y) => pname(x).localeCompare(pname(y), "ar"));
  const q = el("input", "dsearch"); q.type = "search"; q.placeholder = "🔎 ابحث بالاسم أو بالكود…"; q.autocomplete = "off"; q.autocapitalize = "off"; q.spellcheck = false; q.enterKeyHint = "search"; q.setAttribute("aria-label", "بحث عن صديق");
  const list = el("div", "acts"); list.style.cssText = "display:flex;flex-direction:column;gap:6px;max-height:52vh;overflow-y:auto";
  const draw = () => {
    list.textContent = ""; const qn = nzq(q.value), qc = normFCode(q.value);
    const hits = fr.filter(u => { if (!qn) return true; const p = profiles[u]; return nzq(pname(u)).includes(qn) || nzq(p.name).includes(qn) || (qc.length >= 2 && String(p.fcode || "").includes(qc)); });
    if (!hits.length) { const n = el("div", "note", fr.length ? "مفيش صديق بالاسم أو الكود ده" : "لسه مفيش أصدقاء"); n.style.cssText = "text-align:center;padding:18px 8px;opacity:.7"; list.append(n); return; }
    hits.forEach(u => {
      const p = profiles[u], b = el("button", "rrow"); b.type = "button"; const nb = el("b", "", pname(u)); nb.dir = "auto"; b.append(avatar(p), nb);
      if (p.fcode) { const k = el("small", "", fmtFCode(p.fcode)); k.dir = "ltr"; k.style.cssText = "margin-inline-start:auto;opacity:.55;font-variant-numeric:tabular-nums"; b.append(k); }
      b.onclick = async () => {
        $("msheet").hidden = true; if (!mediaGuard()) return;
        try { const nk = nickOf(u); await postMedia({ ucard: { uid: u, ...(nk ? { name: nk } : {}) } }); flash("✓ اتبعت كود " + pname(u)); } catch (e) { flash("ماقدرتش أبعت الكارت."); }
      };
      list.append(b);
    });
  };
  q.addEventListener("input", draw); draw(); c.append(q, list); $("msheet").hidden = false;
}
function openSharePicker() {
  const c = $("mcard"); c.textContent = "";
  c.append(el("div", "mprev", "🏠 اختار غرفة تشاركها"));
  // الغرفة العامة مفيهاش مشاركة (الكل فيها أصلًا)
  const mine = rooms.filter(r => r.id !== "general" && canSee(r) && (!r.private || r.by === myId || adminOf(r)));
  const q = el("input", "dsearch"); q.type = "search"; q.placeholder = "🔎 ابحث بالاسم أو بالكود…"; q.autocomplete = "off"; q.autocapitalize = "off"; q.spellcheck = false; q.enterKeyHint = "search"; q.setAttribute("aria-label", "بحث عن غرفة");
  const list = el("div", "acts"); list.style.cssText = "display:flex;flex-direction:column;gap:6px;max-height:52vh;overflow-y:auto";
  const draw = () => {
    list.textContent = "";
    const hits = mine.filter(r => roomMatches(r, q.value.trim()));
    if (!hits.length) { const n = el("div", "note", mine.length ? "مفيش غرفة بالاسم أو الكود ده" : "مفيش غرف تشاركها لسه"); n.style.cssText = "text-align:center;padding:18px 8px;opacity:.7"; list.append(n); return; }
    hits.forEach(r => {
      const b = el("button", "rrow"); b.type = "button"; b.append(avatar(r.emoji || r.photo ? r : { emoji: "💬", color: "#5b6b78" }), el("b", "", r.name));
      if (r.code) { const k = el("small", "", r.code); k.dir = "ltr"; k.style.cssText = "margin-inline-start:auto;opacity:.55;font-variant-numeric:tabular-nums"; b.append(k); }
      b.onclick = async () => {
        $("msheet").hidden = true;
        if (!mediaGuard()) return;
        try { await postMedia({ share: { id: r.id, name: String(r.name || "").slice(0, 30), emoji: r.emoji || "", color: r.color || "" } }); } catch (e) { setStatus("ماقدرتش أشارك الغرفة."); }
      };
      list.append(b);
    });
  };
  q.addEventListener("input", draw); draw();
  c.append(q, list); $("msheet").hidden = false;
}
$("plusBtn").onclick = () => {
  const c = $("mcard"); c.textContent = "";
  const wrap = el("div", "acts att"), P = d => '<svg viewBox="0 0 24 24">' + d + '</svg>';
  wrap.append(el("div", "agr"), el("h3", "atit", "إرسال"));
  const sec = (title, items, cols) => {
    wrap.append(el("div", "asl", title)); const g = el("div", "asec c" + cols);
    items.forEach(([bg, ic, t, fn]) => { const b = el("button", "apick"); b.type = "button"; const i = el("i"); i.style.background = bg; i.innerHTML = ic; b.append(i, document.createTextNode(t)); b.onclick = () => { $("msheet").hidden = true; fn(); }; g.append(b); });
    wrap.append(g);
  };
  sec("ملفات ووسائط", [
    ["#7c5cff", P('<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="M4 18l5-5 4 4 3-3 4 4"/>'), "المعرض", () => $("aMix").click()],
    ["#ec4899", P('<path d="M4 8h3l1.6-2.4h6.8L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.6"/>'), "كاميرا", () => { if (mediaGuard()) $("aCam").click(); }],
    ["#ef4444", P('<rect x="3" y="6" width="13" height="12" rx="3"/><path d="M16 10.5l5-3v9l-5-3"/>'), "فيديو", () => { if (mediaGuard()) $("aCamV").click(); }],
    ["#14b8a6", P('<path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>'), "مستند", () => { if (mediaGuard()) $("aDoc").click(); }]
  ], 4);
  sec("تفاعل ومشاركة", [
    ["#22b573", P('<path d="M5 20V10M12 20V4M19 20v-7"/>'), "استطلاع", openPollMaker],
    ["#f08c2e", P('<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'), "غرفة", openSharePicker],
    ["#2f8cff", P('<rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="9" cy="11" r="2.2"/><path d="M5.8 16c.6-1.4 1.8-2 3.2-2s2.6.6 3.2 2M14.5 10h4M14.5 13.5h3"/>'), "مشاركة الكود", openCodeShare]
  ], 3);
  c.append(wrap); $("msheet").hidden = false;
};
// ───── مستندات: رفع على قطع (نفس نظام الفيديو) ─────
const DOC_MAX = 15 * 1024 * 1024;
const docSize = n => n >= 1048576 ? arN((n / 1048576).toFixed(1)) + " ميجا" : arN(Math.max(1, Math.round(n / 1024))) + " كيلو";
const DOC_COL = { pdf: "#e5484d", doc: "#2f7de1", docx: "#2f7de1", xls: "#1f9d55", xlsx: "#1f9d55", csv: "#1f9d55", ppt: "#e8702a", pptx: "#e8702a", zip: "#7c5cff", rar: "#7c5cff", "7z": "#7c5cff", txt: "#5b6b78", apk: "#3ddc84" };
// ───── رفع المستند: الفقاعة بتظهر في الشات فورًا وعليها دايرة التقدّم (زي واتساب) ─────
const DUP = (() => {
  const jobs = new Map(), R = 20, CIRC = 2 * Math.PI * R, NS = "http://www.w3.org/2000/svg";
  const PC = n => arN(Math.round(n)) + "٪";
  function build(job) {
    const row = el("div", "row me"), b = el("div", "b dup"), box = el("div", "dcard");
    const nm = job.name, ext = (nm.includes(".") ? nm.split(".").pop() : "").toLowerCase().slice(0, 4);
    const ic = el("div", "dic", ext ? ext.toUpperCase() : "📄"); ic.style.background = DOC_COL[ext] || "#5b6b78";
    const t = el("div", "dtx"), n = el("b", "", nm), sm = el("small"); n.dir = "auto"; t.append(n, sm);
    const x = el("button", "dact dupx"); x.type = "button";
    const ring = document.createElementNS(NS, "svg"); ring.setAttribute("viewBox", "0 0 48 48"); ring.setAttribute("class", "upr");
    ring.innerHTML = '<circle class="bg" cx="24" cy="24" r="' + R + '"/><circle class="fg" cx="24" cy="24" r="' + R + '" stroke-dasharray="' + CIRC.toFixed(2) + '" stroke-dashoffset="' + CIRC.toFixed(2) + '"/>';
    const xl = el("span", "dupxl", "✕"); x.append(ring, xl);
    x.onclick = e => { e.stopPropagation(); if (job.state === "err") run(job); else if (job.state === "up") cancel(job); };
    box.onclick = e => e.stopPropagation();
    box.append(ic, t, x); b.append(box);
    const tm = el("div", "t"), sc = el("span", "pend"); sc.innerHTML = typeof SVG_CLOCK !== "undefined" ? SVG_CLOCK : "⏱";
    tm.append(sc, el("span", "", new Date(job.t0).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })));
    b.append(tm); row.append(b);
    job.row = row; job.el = { ring, fg: ring.querySelector(".fg"), x, xl, sm }; paint(job); return row;
  }
  function paint(job) {
    const e = job.el; if (!e) return; const st = job.state, pct = Math.max(0, Math.min(100, job.pct || 0)), ind = st === "post" || (st === "up" && !pct);
    e.ring.classList.toggle("spin", ind); e.fg.style.strokeDashoffset = (CIRC * (1 - (ind ? .28 : pct / 100))).toFixed(2);
    e.x.classList.toggle("err", st === "err"); e.xl.textContent = st === "err" ? "↻" : "✕"; e.x.hidden = st === "post";
    e.x.setAttribute("aria-label", st === "err" ? "إعادة المحاولة" : "إلغاء");
    const sz = docSize(job.file.size);
    e.sm.textContent = st === "err" ? (job.err || "اتقطع الرفع") + " · اضغط ↻" : st === "post" ? "بيتبعت…" : (pct ? PC(pct) + " · " : "") + sz;
  }
  function show(job) { if (job.rid !== room) return; const box = $("msgs"); if (!box) return; if (!job.row) build(job); box.append(job.row); box.scrollTop = box.scrollHeight; }
  function drop(job) { jobs.delete(job.id); if (job.row) job.row.remove(); }
  function cancel(job) {
    job.cancel = true; drop(job); flash("اتلغى رفع المستند");
    if (!job.running && job.mid && db) for (let i = 0; i < Math.max(1, Math.ceil(job.file.size / RAW_CH)); i++) db.collection("media").doc(i ? job.mid + "_" + i : job.mid).delete().catch(() => {});
  }
  async function run(job) {
    if (job.running) return; job.running = true; job.cancel = false; job.state = "up"; paint(job);
    try { WL.on(); } catch (_) {}
    try {
      if (!job.mid) job.mid = db.collection("media").doc().id;
      await uploadChunks(job.file, "application/octet-stream", job.ui, job.name.slice(0, 22), { id: job.mid, rid: job.rid, skip: job.done, onChunk: i => job.done.add(i) });
      if (job.cancel) throw new Error("cancel");
      mineAdd(job.mid, Math.max(1, Math.ceil(job.file.size / RAW_CH))); try { idbPut(job.mid, job.file); } catch (_) {}
      job.state = "post"; job.pct = 100; paint(job);
      await postMedia({ mid: job.mid, mk: "doc", n: Math.max(1, Math.ceil(job.file.size / RAW_CH)), fname: job.name, fsize: job.file.size, ftype: String(job.file.type || "").slice(0, 80) }, job.rid);
      job.state = "done"; setTimeout(() => drop(job), 700);
    } catch (e) {
      if (job.cancel || (e && e.message === "cancel")) drop(job);
      else if (e && e.code === "permission-denied") { drop(job); flash("⚠️ قواعد Firebase مش مسمحة برفع المستندات (collection media)."); }
      else { job.state = "err"; job.err = navigator.onLine === false ? "مفيش نت" : "اتقطع الرفع"; paint(job); }
    } finally { job.running = false; try { WL.off(); } catch (_) {} }
  }
  function make(o) {
    const job = { id: "d" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), state: "up", pct: 0, t0: Date.now(), done: new Set(), ...o };
    job.ui = { get cancel() { return job.cancel; }, set(_t, p) { if (p != null) job.pct = p; paint(job); } };
    jobs.set(job.id, job); show(job); return job;
  }
  const kick = () => [...jobs.values()].forEach(j => { if (j.state === "err" && !j.running) run(j); });
  window.addEventListener("online", kick);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) kick(); });
  return { make, run, mount: (list, box) => { for (const j of jobs.values()) { if (j.rid !== room) continue; if (j.state === "done" && j.mid && list.some(m => m.mid === j.mid)) { if (j.row) j.row.remove(); continue; } if (!j.row) build(j); box.append(j.row); } } };
})();
async function sendDocFile(file, rid) {
  rid = rid || room; if (!mediaGuard(rid)) return;
  const nm = String(file.name || "مستند").slice(0, 80);
  await DUP.run(DUP.make({ rid, name: nm, file }));   // الفقاعة بتظهر فورًا والتقدّم عليها
}
$("aDoc").onchange = async e => { const f = [...e.target.files].slice(0, 3); e.target.value = ""; for (const x of f) await sendDocFile(x, room); };
function docBox(m) {
  const nm = String(m.fname || "مستند"), ext = (nm.includes(".") ? nm.split(".").pop() : "").toLowerCase().slice(0, 4);
  const box = el("div", "dcard"), ic = el("div", "dic", ext ? ext.toUpperCase() : "📄"); ic.style.background = DOC_COL[ext] || "#5b6b78";
  const t = el("div", "dtx"), n = el("b", "", nm); n.dir = "auto"; t.append(n, el("small", "", docSize(+m.fsize || 0) + (ext ? " · " + ext.toUpperCase() : "")));
  const act = el("button", "dact"); act.type = "button"; act.setAttribute("aria-label", "تحميل المستند");
  const DL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 20h14"/></svg>';
  act.innerHTML = DL; let busy = false;
  const go = async () => {
    if (selMode || busy) return; busy = true; act.textContent = "…";
    try {
      const u = await getMedia(m.mid, f => { act.textContent = Math.round(f * 100) + "%"; }); if (!u) throw 0;
      const b = await (await fetch(u)).blob(), url = URL.createObjectURL(new Blob([b], { type: m.ftype || "application/octet-stream" }));
      const a = document.createElement("a"); a.href = url; a.download = nm; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000);
      act.textContent = "✓"; setTimeout(() => { act.innerHTML = DL; }, 2200);
    } catch (e) { flash("تعذّر تحميل المستند"); act.innerHTML = DL; }
    busy = false;
  };
  box.onclick = e => { if (selMode) return; e.stopPropagation(); go(); };
  box.append(ic, t, act); return box;
}