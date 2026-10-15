// 手習い（見返しの頁）:
//  ・墨で描いた眼が、ポインタを追い、まばたきをする（赤い糸がポインタへ）
//  ・かな鍵盤の下で二つの手が動く。鍵を打つと、その指が鍵へ伸び、糸がぴんと張り、届いた瞬間に鍵が光って、かなが筆で書かれる
//  ・しばらく触らないと、いろはが勝手に書かれる
const cv = document.getElementById("tenarai");
if (!cv) throw new Error("tenarai canvas missing");
const ctx = cv.getContext("2d");
const host = cv.closest(".endpaper"), face = cv.closest(".face");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const root = document.documentElement;

let W = 0, H = 0, dpr = 1;
const pointer = { x: -1, y: -1 };
let rect = null;                    // canvas の位置は、ポインタが動いたときだけ測り直す（毎コマ測ると、毎コマ layout が走る）
addEventListener("pointermove", e => { pointer.x = e.clientX; pointer.y = e.clientY; rect = null; }, { passive: true });

// ---- 色 ----
let C = {}, colorAge = 0;
function colors() {
  const s = getComputedStyle(root), v = n => s.getPropertyValue(n).trim();
  C = { sumi: v("--sumi"), sumi2: v("--sumi2"), shu: v("--shu"), paper: v("--paper"), line: v("--line"), tag: v("--tag") };
}
colors();

// ---- かな鍵盤（ホーム行は、手のすぐ上＝いちばん下の段） ----
const ROWS = ["あいうえおかきくけこ", "なにぬねのはひふへほ", "まみむめもやゆよらり", "るれろわをんー、。　", "さしすせそたちつてと"];
const KEYS = [];                // { ch, r, c, x, y, w, h, lit }
ROWS.forEach((row, r) => [...row].forEach((ch, c) => { if (ch !== "　") KEYS.push({ ch, r, c, lit: 0 }); }));
const byChar = Object.fromEntries(KEYS.map(k => [k.ch, k]));
const LETTERS = "あいうえおかきくけこさしすせそたちつてとなにぬねのは"; // a〜z を、かなに割り当てる
const HOME = [["さ", "し", "す", "せ", "そ"], ["た", "ち", "つ", "て", "と"]]; // 左手・右手（左から右へ）
const IROHA = [..."いろはにほへとちりぬるをわかよたれそつねならむ"];

function layout() {
  const m = W * .075, gap = W * .008, kw = (W - m * 2 - gap * 9) / 10, kh = H * .052, y0 = H * .46;
  KEYS.forEach(k => { k.w = kw; k.h = kh; k.x = m + k.c * (kw + gap); k.y = y0 + k.r * (kh + gap); });
}
function fit() {
  W = host.clientWidth; H = host.clientHeight; rect = null;
  if (!W || !H) return;
  dpr = Math.min(2, devicePixelRatio || 1);
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  layout();
}
new ResizeObserver(fit).observe(host);
fit();

// ---- 手（21 点の骨格）と、指ごとの関節の並び ----
const base = [[.5,1],[.30,.80],[.20,.64],[.14,.52],[.10,.42],[.38,.52],[.38,.34],[.38,.22],[.38,.12],[.5,.50],[.5,.30],[.5,.17],[.5,.06],[.62,.52],[.62,.34],[.62,.23],[.62,.14],[.74,.56],[.74,.42],[.74,.33],[.74,.26]];
const bones = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];
const CHAINS = { 4: [1, 2, 3, 4], 8: [5, 6, 7, 8], 12: [9, 10, 11, 12], 16: [13, 14, 15, 16], 20: [17, 18, 19, 20] };
const WEIGHT = [0, .3, .68, 1];     // 付け根は動かず、指先ほど大きく動く
const TIPS = [4, 8, 12, 16, 20];
const PRESS_MS = 480;               // 指が鍵へ行って、戻るまで
const HIT_AT = .46;                 // その途中（届いた瞬間）に鍵が光る

const reach = [{}, {}];             // 手ごと・指ごとの「いま伸ばしている」鍵
const restTips = [[], []];          // 休んでいるときの指先 [x, y, id]
let boost = 0;

// ---- 書かれたかな ----
const written = [];                 // { ch, t }
let lastUser = -1e9, lastGhost = 0, ghostI = 0;

// 指が届いたとき: 鍵が光り、かなが書かれる
function commit(r) {
  if (r.hit) return;
  r.hit = true;
  r.k.lit = 1;
  boost = 1;
  written.push({ ch: r.k.ch, t: performance.now() });
  if (written.length > 5) written.shift();
}

// 鍵を打つ: いちばん近い指が、その鍵へ伸びはじめる
function write(ch, user) {
  const k = byChar[ch];
  if (!k) return;
  const now = performance.now(), kx = k.x + k.w / 2, h = kx < W / 2 ? 0 : 1;
  const tip = restTips[h].length ? restTips[h].reduce((a, b) => (Math.abs(b[0] - kx) < Math.abs(a[0] - kx) ? b : a)) : null;
  if (user) lastUser = now;
  if (!tip) { commit({ k, hit: false }); return; }
  const prev = reach[h][tip[2]];
  if (prev && !prev.hit) commit(prev);              // 前の打鍵がまだ届いていなければ、先に済ませる
  reach[h][tip[2]] = { k, start: now, hit: false };
}

function visible() { return face && face.classList.contains("is-open") && !document.hidden && !root.classList.contains("kake-cover"); }

addEventListener("keydown", e => {
  if (!visible() || e.metaKey || e.ctrlKey || e.altKey) return;
  if (/^[a-z]$/i.test(e.key)) write(LETTERS[e.key.toLowerCase().charCodeAt(0) - 97], true);
  else if (e.key === "Enter") write("。", true);
  else if (e.key === ",") write("、", true);
});
cv.addEventListener("pointerdown", e => {
  const r = cv.getBoundingClientRect(), s = r.width / W, x = (e.clientX - r.left) / s, y = (e.clientY - r.top) / s;
  const k = KEYS.find(k => x >= k.x && x <= k.x + k.w && y >= k.y && y <= k.y + k.h);
  if (k) write(k.ch, true);
});

// ---- 眼 ----
let blinkAt = performance.now() + 2500, blinkP = -1;
function eye(t, cx, cy, w, px, py) {
  let open = 1;
  if (blinkP >= 0) { blinkP += 1 / 16; open = 1 - Math.sin(Math.min(1, blinkP) * Math.PI); if (blinkP >= 1) blinkP = -1; }
  else if (t > blinkAt) { blinkP = 0; blinkAt = t + 2600 + Math.random() * 3200; }
  const h = w * .27 * Math.max(.04, open);

  ctx.strokeStyle = C.sumi; ctx.lineCap = "round";
  for (let i = 0; i < 3; i++) { // 眉: 墨の一筆（太→細）
    ctx.globalAlpha = .55 - i * .15; ctx.lineWidth = w * (.05 - i * .014);
    ctx.beginPath(); ctx.moveTo(cx - w * .5, cy - w * .27 + i * 2); ctx.quadraticCurveTo(cx - w * .05, cy - w * .44 - i, cx + w * .5, cy - w * .24); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const lid = () => { ctx.beginPath(); ctx.moveTo(cx - w / 2, cy); ctx.quadraticCurveTo(cx, cy - h * 1.9, cx + w / 2, cy); ctx.quadraticCurveTo(cx, cy + h * 1.3, cx - w / 2, cy); ctx.closePath(); };
  lid(); ctx.fillStyle = C.tag; ctx.fill();
  ctx.save(); lid(); ctx.clip();
  const r = w * .165, ix = cx + px, iy = cy + py * .5 - h * .12;
  ctx.fillStyle = C.sumi; ctx.beginPath(); ctx.arc(ix, iy, r, 0, 6.283); ctx.fill();
  ctx.strokeStyle = C.shu; ctx.lineWidth = w * .016; ctx.beginPath(); ctx.arc(ix, iy, r * .78, 0, 6.283); ctx.stroke();
  ctx.fillStyle = C.paper; ctx.globalAlpha = .9; ctx.beginPath(); ctx.arc(ix - r * .32, iy - r * .36, r * .2, 0, 6.283); ctx.fill();
  ctx.beginPath(); ctx.arc(ix + r * .28, iy + r * .3, r * .08, 0, 6.283); ctx.fill(); ctx.globalAlpha = 1;
  ctx.restore();

  ctx.strokeStyle = C.sumi; ctx.lineWidth = w * .03; ctx.lineJoin = "round";
  lid(); ctx.stroke();
  ctx.lineWidth = w * .05; ctx.beginPath(); ctx.moveTo(cx - w / 2, cy); ctx.quadraticCurveTo(cx, cy - h * 1.9, cx + w / 2, cy); ctx.stroke();
  ctx.lineWidth = w * .018;
  for (let i = 0; i < 5; i++) {
    const u = .62 + i * .085, x = cx - w / 2 + w * u, y = cy - h * 1.9 * 2 * u * (1 - u);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w * .035, y - w * .055 * Math.max(.2, open)); ctx.stroke();
  }
}

// ---- 手と糸 ----
function hands(now) {
  const hs = W * .3, base0 = H * .985;
  [[W * .3, 0], [W * .7, 1]].forEach(([cx, h]) => {
    const ox = cx - hs / 2, oy = base0 - hs;
    // 左手は小指が外（左）、右手は親指が内（左）。実際の手の向きに合わせる
    const pts = base.map((p, i) => {
      const f = i > 4 ? Math.floor((i - 5) / 4) : -1, tip = i > 4 ? ((i - 5) % 4) / 3 : 0;
      const wave = Math.sin(now * .0021 + h * 2 + f * 1.3) * (.015 + boost * .05) * tip;
      return [ox + (h ? p[0] : 1 - p[0]) * hs, oy + (p[1] + wave) * hs];
    });
    // 休んでいるときの指先の並び（鍵への割り当ては、この順で左から右へ）
    const rest = TIPS.map(i => [pts[i][0], pts[i][1], i]).sort((a, b) => a[0] - b[0]);
    restTips[h] = rest;

    // 打鍵中の指: 鍵の方へ伸び、関節が付け根から順につられて動く
    const act = {};
    for (const id of TIPS) {
      const r = reach[h][id];
      if (!r) continue;
      const p = (now - r.start) / PRESS_MS;
      if (p >= 1) { commit(r); delete reach[h][id]; continue; }
      if (p >= HIT_AT) commit(r);
      const a = Math.sin(p * Math.PI);                    // 0 → 1 → 0
      const tx = r.k.x + r.k.w / 2, ty = r.k.y + r.k.h * .62;
      const dx = (tx - pts[id][0]) * a * .95, dy = (ty - pts[id][1]) * a * .95;
      CHAINS[id].forEach((j, n) => { pts[j][0] += dx * WEIGHT[n]; pts[j][1] += dy * WEIGHT[n]; });
      act[id] = { r, a };
    }

    // 糸: 指先から鍵へ。休んでいるときはたるみ、打つときはぴんと張る
    rest.forEach(([, , id], n) => {
      const a = act[id], k = a ? a.r.k : byChar[HOME[h][n]];
      if (!k) return;
      const tip = pts[id], kx = k.x + k.w / 2, ky = a ? k.y + k.h * .62 : k.y + k.h;
      const dist = Math.hypot(kx - tip[0], ky - tip[1]), tense = a ? a.a : 0;
      const sag = (1 - tense) * (6 + dist * .16) + Math.sin(now * .003 + n + h) * 1.6 * (1 - tense);
      ctx.strokeStyle = a ? C.shu : C.sumi2; ctx.globalAlpha = a ? .55 + .45 * tense : .45; ctx.lineWidth = a ? 1.2 + tense * .9 : 1;
      ctx.beginPath(); ctx.moveTo(tip[0], tip[1]); ctx.quadraticCurveTo((tip[0] + kx) / 2, (tip[1] + ky) / 2 + sag, kx, ky); ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = a ? C.shu : C.sumi2; ctx.beginPath(); ctx.arc(kx, ky, a ? 2.4 : 1.6, 0, 6.283); ctx.fill();   // 鍵の側の結び目
    });

    ctx.strokeStyle = C.sumi2; ctx.lineWidth = 1.1; ctx.beginPath();
    bones.forEach(([a, b]) => { ctx.moveTo(...pts[a]); ctx.lineTo(...pts[b]); });
    ctx.stroke();
    pts.forEach((p, i) => { ctx.fillStyle = TIPS.includes(i) && act[i] ? C.shu : C.sumi; ctx.fillRect(p[0] - 1.8, p[1] - 1.8, 3.6, 3.6); });
  });
}

// ---- 一コマ ----
let prev = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  if (!visible() || !W) { prev = now; return; }
  const dt = Math.min(.05, (now - prev) / 1000); prev = now;
  if (++colorAge > 40) { colorAge = 0; colors(); }
  boost = Math.max(0, boost - dt * 1.6);
  if (now - lastUser > 2800 && now - lastGhost > 820) { write(IROHA[ghostI++ % IROHA.length], false); lastGhost = now; }
  ctx.clearRect(0, 0, W, H);

  // 眼と、ポインタへの糸
  if (pointer.x >= 0 && !rect) rect = cv.getBoundingClientRect();
  const r = rect || { left: 0, top: 0, width: W }, s = r.width / W || 1;
  const mx = (pointer.x - r.left) / s, my = (pointer.y - r.top) / s;
  const ecx = W * .5, ecy = H * .16, ew = W * .6;
  let px = 0, py = 0;
  if (pointer.x >= 0) { const dx = mx - ecx, dy = my - ecy, d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / (W * .6)); px = dx / d * ew * .12 * k; py = dy / d * ew * .12 * k; }
  else { px = Math.sin(now / 1800) * ew * .08; py = Math.cos(now / 2300) * ew * .03; }
  eye(now, ecx, ecy, ew, px, py);
  if (pointer.x >= 0) {
    ctx.save(); ctx.strokeStyle = C.shu; ctx.globalAlpha = .55; ctx.lineWidth = 1; ctx.setLineDash([2, 4]);
    ctx.beginPath(); ctx.moveTo(ecx + px, ecy + py * .5); ctx.lineTo(mx, my); ctx.stroke(); ctx.restore();
  }

  // 筆で書かれたかな: 眼の右の余白に、縦に
  const fs = W * .086, colx = W * .9;
  written.forEach((w, i) => {
    const age = Math.min(1, (now - w.t) / 520), y = H * .08 + fs * .5 + i * fs * 1.12;
    ctx.save();
    ctx.font = `${fs * (1.25 - .25 * age)}px "Yuji Syuku","Zen Old Mincho",serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = i === written.length - 1 ? C.sumi : C.sumi2;
    ctx.globalAlpha = (.35 + .65 * age) * (.55 + .45 * (i + 1) / written.length);
    ctx.shadowColor = C.sumi; ctx.shadowBlur = (1 - age) * 9;
    ctx.fillText(w.ch, colx, y);
    ctx.restore();
  });

  // 鍵盤
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  KEYS.forEach(k => {
    k.lit = Math.max(0, k.lit - dt * 2.2);
    ctx.lineWidth = .8;
    ctx.fillStyle = k.lit > 0 ? C.shu : "transparent";
    ctx.globalAlpha = k.lit > 0 ? .25 + .7 * k.lit : 1;
    ctx.beginPath(); ctx.roundRect(k.x, k.y + k.lit * 1.4, k.w, k.h, 2); ctx.fill();   // 押されると、少し沈む
    ctx.globalAlpha = 1; ctx.strokeStyle = C.line; ctx.stroke();
    ctx.fillStyle = k.lit > .35 ? C.paper : C.sumi2;
    ctx.font = `${k.h * .55}px "Zen Old Mincho",serif`;
    ctx.fillText(k.ch, k.x + k.w / 2, k.y + k.h / 2 + 1 + k.lit * 1.4);
  });

  hands(now);
}
if (!reduce) requestAnimationFrame(frame);
else { // 動きを減らす設定: 眼と鍵盤を一度だけ描く
  const once = () => { if (W) { ctx.clearRect(0, 0, W, H); eye(0, W * .5, H * .16, W * .6, 0, 0); KEYS.forEach(k => { ctx.strokeStyle = C.line; ctx.strokeRect(k.x, k.y, k.w, k.h); ctx.fillStyle = C.sumi2; ctx.font = `${k.h * .55}px serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(k.ch, k.x + k.w / 2, k.y + k.h / 2); }); } };
  new ResizeObserver(once).observe(host); once();
}
