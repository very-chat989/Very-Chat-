/* Very Chat — الإعدادات والأدوات الأساسية */
// ═══ إعدادات Firebase: الصق هنا القيم من Firebase Console ← Project settings ← Your apps ← Web app ═══
// App Check: حط مفتاح reCAPTCHA v3 هنا بعد ما تفعّله من Firebase → App Check (فاضي = متوقف)
const APPCHECK_KEY = "6LdvzCsuAAAAAHvmMunzSxfkhomq9hmeyc4W9598";
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyA2G05p10GHyhFR8hOfdx0f__pYRw8fG9s",
  authDomain: "very-chat-c7e65.firebaseapp.com",
  projectId: "very-chat-c7e65",
  appId: "1:351423421163:web:f61b829b9b65deb38abcae"
};
const $ = id => document.getElementById(id);
const okSrc = (u, k) => { u = String(u || ""); return u.startsWith("blob:") || u.startsWith("data:" + k + "/"); };
const okPhoto = u => { u = String(u || ""); return u.startsWith("data:image/") || /^https:\/\/[a-z0-9.-]+\.googleusercontent\.com\//i.test(u); };
const logo = id => `<svg viewBox='0 0 100 100'><defs><linearGradient id='${id}' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='#2cc4a9'/><stop offset='1' stop-color='#0f8f7a'/></linearGradient></defs><rect width='100' height='100' rx='26' fill='url(#${id})'/><path d='M50 18c-18 0-32 12-32 28 0 8 4 15 10 20l-3 14 15-7c3 1 6 1 10 1 18 0 32-12 32-28S68 18 50 18z' fill='#fff'/><path d='M36 38l14 22 14-22' fill='none' stroke='#0f8f7a' stroke-width='8' stroke-linecap='round' stroke-linejoin='round'/></svg>`;
$("sLogo").innerHTML = logo("lgS"); $("dLogo").innerHTML = logo("lgD");
const draftKey = r => "vc_draft_" + r;
$("inp").addEventListener("input", () => { try { if (editingId) return; const v = $("inp").value; v ? localStorage.setItem(draftKey(room), v) : localStorage.removeItem(draftKey(room)); } catch (_) {} });
$("f").addEventListener("submit", () => setTimeout(() => { try { if (!$("inp").value) localStorage.removeItem(draftKey(room)); } catch (_) {} }, 50));
const SVG_MIC = '<svg viewBox="0 0 24 24"><path d="M12 15a3.5 3.5 0 0 0 3.5-3.5v-6a3.5 3.5 0 0 0-7 0v6A3.5 3.5 0 0 0 12 15zm6-3.5a.9.9 0 0 0-1.8 0 4.2 4.2 0 0 1-8.4 0 .9.9 0 0 0-1.8 0 6 6 0 0 0 5.1 5.9V20H9.9a.9.9 0 0 0 0 1.8h4.2a.9.9 0 0 0 0-1.8h-1.2v-2.6a6 6 0 0 0 5.1-5.9z"/></svg>',
  SVG_SEND = '<svg viewBox="0 0 24 24"><path d="M3.4 20.4l17.5-7.5a1 1 0 0 0 0-1.8L3.4 3.6a1 1 0 0 0-1.4 1.2L4 10.5l9 1.5-9 1.5-2 5.7a1 1 0 0 0 1.4 1.2z"/></svg>',
  SVG_CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  SVG_SMILE = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5"/><path d="M8 14.2c1 1.6 2.4 2.3 4 2.3s3-.7 4-2.3"/><circle cx="9" cy="9.8" r=".7" fill="currentColor"/><circle cx="15" cy="9.8" r=".7" fill="currentColor"/></svg>',
  SVG_KB = '<svg viewBox="0 0 24 24"><rect x="2.5" y="5.5" width="19" height="13" rx="3"/><path d="M6.5 10h.01M10 10h.01M14 10h.01M17.5 10h.01M7.5 14.5h9"/></svg>',
  SVG_CLIP = '<svg viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>',
  SVG_CLOCK = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/></svg>',
  SVG_CAM = '<svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>';
$("emoBtn").innerHTML = SVG_SMILE; $("plusBtn").innerHTML = SVG_CLIP; $("camBtn").innerHTML = SVG_CAM; $("micBtn").innerHTML = SVG_MIC; $("sendBtn").innerHTML = SVG_SEND;
const DI = {
  inbox: '<svg viewBox="0 0 24 24"><path d="M3 13l2.6-7.2A2 2 0 0 1 7.5 4.5h9a2 2 0 0 1 1.9 1.3L21 13v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 13h5l1 2.5h6l1-2.5h5"/></svg>',
  key: '<svg viewBox="0 0 24 24"><circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3M14 9l2 2"/></svg>',
  invite: '<svg viewBox="0 0 24 24"><circle cx="9.5" cy="8" r="3.8"/><path d="M2.5 20c.8-3.6 3.5-5.5 7-5.5s6.2 1.9 7 5.5M19 8v6M16 11h6"/></svg>',
  spk: '<svg viewBox="0 0 24 24"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>',
  spkoff: '<svg viewBox="0 0 24 24"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></svg>',
  bell: '<svg viewBox="0 0 24 24"><path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15z"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>',
  belloff: '<svg viewBox="0 0 24 24"><path d="M6 17V11a6 6 0 0 1 9.5-4.9M18 11v6l1.5 2H8M10 21a2 2 0 0 0 4 0M3 3l18 18"/></svg>'
};
$("dReq").firstChild.innerHTML = DI.inbox; $("dFind").firstChild.innerHTML = DI.key; $("dInvite").firstChild.innerHTML = DI.invite;
let _dtT = 0; function dtoast(t) { const e = $("dToast"); e.textContent = t; e.hidden = false; clearTimeout(_dtT); _dtT = setTimeout(() => { e.hidden = true; }, 1800); }
$("dClose").onclick = () => closeDrawer();
var _spMin = false, _spMsg = false;
function hideSplash() { const s = $("splash"); if (!s || s._h) return; s._h = 1; s.classList.add("out"); setTimeout(() => s.remove(), 450); }
setTimeout(() => { _spMin = true; if (_spMsg) hideSplash(); }, 350); setTimeout(hideSplash, 6000);
const EMOJIS = ["😀","😎","🤓","🥳","😍","🤩","😂","🥹","😴","🤠","👻","🤖","👽","💀","🐱","🐶","🦁","🐼","🦊","🐯","🐸","🐵","🦄","🐧","🦅","🐢","🐬","🦋","🚀","⚽","🏀","🎮","🎧","🎸","🌶️","🍕","🍔","🔥","⭐","👑","💎","❤️","🌹","🌙"];
const COLORS = ["#0f8f7a","#2f6fed","#8a4fe0","#e0507a","#e08a2f","#c9a400","#3f8f3f","#5b6b78"];
let confirmDel = false;
async function delRoom() {
  const id = room;
  try {
    const s = await db.collection("msgs").where("room", "==", id).get();
    await Promise.all(s.docs.map(d => db.collection("msgs").doc(d.id).delete()));
    await dropCode(rooms.find(x => x.id === id)); await db.collection("rooms").doc(id).delete();
    openRoom("general");
  } catch (e) { setStatus("ماقدرتش أحذف الغرفة."); }
}
let db = null, myId = null, room = "general", rooms = [], profiles = {}, unsub = null, creating = false, lastList = [], draft = null, loaded = false;
