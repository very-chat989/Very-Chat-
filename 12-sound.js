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
function paintReqMute() { $("dReqMute").firstChild.innerHTML = reqMute ? DI.belloff : DI.bell; $("dReqMute").classList.toggle("off", !!reqMute); $("dReqMute").title = reqMute ? "إشعارات الطلبات مكتومة" : "إشعارات الطلبات شغالة"; }
$("dReqMute").onclick = () => { reqMute = !reqMute; try { localStorage.setItem("vc_reqmute", reqMute ? "1" : "0"); } catch (e) {} paintReqMute(); dtoast(reqMute ? "🔕 إشعارات الطلبات مكتومة (الرقم بس)" : "🔔 إشعارات الطلبات شغالة"); };
paintReqMute();
function paintSnd() { $("dSound").firstChild.innerHTML = sndOn ? DI.spk : DI.spkoff; $("dSound").classList.toggle("off", !sndOn); $("dSound").title = sndOn ? "الأصوات شغالة" : "الأصوات مقفولة"; }
$("dSound").onclick = () => { sndOn = !sndOn; try { localStorage.setItem("vc_snd", sndOn ? "1" : "0"); } catch (e) {} paintSnd(); dtoast(sndOn ? "🔊 الأصوات شغالة" : "🔇 الأصوات مقفولة"); if (sndOn) { sndCtx(); setTimeout(() => vcSnd("ping"), 80); } };
paintSnd();
$("f").addEventListener("submit", () => { if ($("inp").value.trim() && !$("inp").disabled) vcSnd("send"); }, true);
netUI(); buildChips(); registerSW();
start();
// ───── جديد في التحديث ─────
(() => { const V = "v11"; let seen; try { seen = localStorage.getItem("vc_ver"); } catch (_) {} if (seen === V) return;
  setTimeout(() => { const o = el("div"); o.id = "wn"; o.innerHTML = '<div class="vcard"><div class="grab"></div><div class="wnh">✨</div><h2>تحديث جديد في Very Chat</h2><ul><li><b>🎧 تأثيرات الصوت</b><small>وانت بتسجل دوس 🎛 واختار: تخين، سنجاب، روبوت، صدى، تليفون</small></li><li><b>⚡ سرعة الفويس</b><small>اضغط على 1× لتغيير السرعة (0.75 / 1.5 / 2)</small></li><li><b>🌊 موجة صوتية</b><small>اضغط على الموجة للتقديم والتأخير</small></li><li><b>🔊 أصوات تفاعلية</b><small>تسجيل وإرسال الفويس، الحذف، القبول والرفض والطلبات</small></li><li><b>😀 لوحة إيموجي جديدة</b><small>أقسام، المستخدمة مؤخراً، وزرار مسح</small></li><li><b>🎨 تصميم جديد</b><small>خطوط وألوان وفقاعات أحلى</small></li></ul><button class="send" type="button">يلا نبدأ</button></div>'; o.onclick = e => { if (e.target === o || e.target.tagName === "BUTTON") { o.remove(); try { localStorage.setItem("vc_ver", V); } catch (_) {} } }; document.body.append(o); }, 2600); })();
