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
  L.forEach(c => { c.url = "data:image/svg+xml;utf8," + encodeURIComponent(c.s.replace("<svg ", "<svg xmlns='http://www.w3.org/2000/svg' ")); });
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

