// 庭（枯山水）: 白砂に熊手の筋、石の周りは同心円。七つの石は七つの束で、大きさは設定ファイルの数に比例する。
// 指（ポインタ）が熊手になり、動いた跡に五本歯の筋が付いて、しばらくして砂に戻る。石を押すと、その束の頁へ。
import { stroke } from "./sumie.js";
import { frogOps, drawOps, drawShadow } from "./animals.js";

const cv = document.getElementById("niwa-canvas");
if (!cv) throw new Error("niwa canvas missing");
const ctx = cv.getContext("2d");
const garden = document.getElementById("garden"), leaf = garden.closest(".leaf"), face = leaf.closest(".face");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const root = document.documentElement;

// id・石の名・設定ファイルの数・位置（庭の幅と高さに対する割合）
const DEF = [
  { id: "nvim", name: "筆", files: 25, x: .40, y: .58 },
  { id: "opencode", name: "智", files: 5, x: .70, y: .40 },
  { id: "wezterm", name: "窓", files: 1, x: .22, y: .33 },
  { id: "zsh", name: "殻", files: 1, x: .64, y: .77 },
  { id: "starship", name: "標", files: 1, x: .83, y: .66 },
  { id: "atuin", name: "記", files: 1, x: .47, y: .27 },
  { id: "github", name: "縁", files: 1, x: .19, y: .80 },
];

let W = 0, H = 0, u = 1, dpr = 1, stones = [], hover = null, dirty = true, C = {};
const base = document.createElement("canvas"), bx = base.getContext("2d");
const rake = [];                                   // { x, y, t }
const RAKE_MS = 2600;

let seed = 1;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

function colors() {
  const s = getComputedStyle(root), v = n => s.getPropertyValue(n).trim();
  const night = root.dataset.toki === "yoru";
  C = { night, sumi: v("--sumi"), sumi2: v("--sumi2"), paper: v("--paper"), shu: v("--shu"),
        stone: night ? "#2b303b" : "#4b473f", stoneHi: night ? "#5d687f" : "#8a8476", moss: "#6f8a56" };
}

function layout() {
  W = garden.clientWidth; H = garden.clientHeight;
  if (!W || !H) return;
  u = leaf.clientWidth / 100;
  dpr = Math.min(2, devicePixelRatio || 1);
  for (const c of [cv, base]) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  bx.setTransform(dpr, 0, 0, dpr, 0, 0);
  stones = DEF.map(d => {
    const rc = 4.2 + 8.8 * Math.sqrt(d.files / 25);   // 石の半径（頁の幅に対する %）
    return { ...d, px: d.x * W, py: d.y * H, r: rc * u, gap: 1.6 * u, rings: d.files > 10 ? 5 : 4 };
  });
  buildButtons();
  dirty = true;
}

// キーボードで石を選べるように、見えないボタンを重ねる
function buildButtons() {
  garden.querySelectorAll(".stone").forEach(b => b.remove());
  stones.forEach(s => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "stone";
    b.setAttribute("aria-label", `${s.name}（${s.id}）— 設定 ${s.files} ファイル。押すとその束の頁へ`);
    Object.assign(b.style, { left: s.px + "px", top: s.py + "px", width: s.r * 2 + "px", height: s.r * 1.7 + "px" });
    b.addEventListener("click", () => go(s.id));
    b.addEventListener("focus", () => setHover(s.id));
    b.addEventListener("blur", () => setHover(null));
    garden.append(b);
  });
}

const navigate = id => document.dispatchEvent(new CustomEvent("washo:go", { detail: id }));
// 石を押すと、蛙がその石へ跳んでから、束の頁へ移る
const frog = { at: 0, from: 0, to: 0, t0: 0, hopping: false, flip: false, next: 0, then: null };
function stoneTop(i) { const s = stones[i]; return s ? [s.px, s.py - s.r * .58] : [0, 0]; }
function hopTo(i, then) {
  if (frog.hopping || i === frog.at) { if (then) then(); return; }
  frog.from = frog.at; frog.to = i; frog.t0 = performance.now(); frog.hopping = true; frog.then = then || null;
  frog.flip = stoneTop(i)[0] > stoneTop(frog.at)[0];
}
const go = id => {
  const i = stones.findIndex(s => s.id === id);
  if (reduce || i < 0) { navigate(id); return; }
  hopTo(i, () => setTimeout(() => navigate(id), 140));
};
function setHover(id) { if (hover !== id) { hover = id; dirty = true; cv.style.cursor = id ? "pointer" : ""; } }

// ---- 砂・波紋・石（静かな部分は、別の紙に一度だけ描く） ----
function drawBase() {
  colors();
  bx.clearRect(0, 0, W, H);
  // 月あかり
  if (C.night) { const g = bx.createRadialGradient(W * .2, H * .1, 0, W * .2, H * .1, W * .9); g.addColorStop(0, "rgba(232,226,200,.16)"); g.addColorStop(1, "rgba(232,226,200,0)"); bx.fillStyle = g; bx.fillRect(0, 0, W, H); }

  // 熊手の筋: 横に、ゆるく揺れる線
  const gap = 1.55 * u;
  bx.strokeStyle = C.sumi2; bx.lineWidth = Math.max(.9, u * .13); bx.lineCap = "round";
  for (let y = gap * .6, i = 0; y < H; y += gap, i++) {
    bx.globalAlpha = i % 3 === 0 ? .42 : .3;
    bx.beginPath();
    for (let x = 0; x <= W + 4; x += 5) { const yy = y + Math.sin(x * .034 + i * .9) * u * .22; x ? bx.lineTo(x, yy) : bx.moveTo(x, yy); }
    bx.stroke();
  }
  bx.globalAlpha = 1;

  // 石の周りの砂を、いったん消し、同心円を引き直す
  bx.globalCompositeOperation = "destination-out";
  stones.forEach(s => { bx.beginPath(); bx.ellipse(s.px, s.py, s.r + (s.rings + .55) * s.gap, (s.r + (s.rings + .55) * s.gap) * .9, 0, 0, 6.283); bx.fill(); });
  bx.globalCompositeOperation = "source-over";
  stones.forEach((s, si) => {
    seed = 40 + si * 7;
    for (let k = 1; k <= s.rings; k++) {
      const rr = s.r + k * s.gap, ph = rnd() * 6;
      bx.globalAlpha = .52 - k * .05; bx.strokeStyle = C.sumi2; bx.lineWidth = Math.max(.9, u * .13);
      bx.beginPath();
      for (let a = 0; a <= 6.4; a += .08) {
        const r2 = rr + Math.sin(a * 3 + ph) * u * .16 + Math.sin(a * 7 + ph * 2) * u * .08;
        const x = s.px + Math.cos(a) * r2, y = s.py + Math.sin(a) * r2 * .9;
        a ? bx.lineTo(x, y) : bx.moveTo(x, y);
      }
      bx.stroke();
    }
  });
  bx.globalAlpha = 1;

  // 石: 影、体、筆の縁、皴、苔
  stones.forEach((s, si) => stone(s, si));
}

function stone(s, si) {
  seed = 100 + si * 13;
  const hov = hover === s.id;
  // 影（夜は長く、昼は短い）
  const dx = C.night ? s.r * .9 : s.r * .2, dy = C.night ? s.r * .5 : s.r * .3;
  const sg = bx.createRadialGradient(s.px + dx, s.py + s.r * .55 + dy, 0, s.px + dx, s.py + s.r * .55 + dy, s.r * (C.night ? 1.7 : 1.15));
  sg.addColorStop(0, `rgba(20,16,10,${C.night ? .4 : .28})`); sg.addColorStop(1, "rgba(20,16,10,0)");
  bx.save(); bx.translate(s.px, s.py + s.r * .55); bx.scale(1, .38); bx.translate(-s.px, -(s.py + s.r * .55)); bx.fillStyle = sg;
  bx.beginPath(); bx.arc(s.px + dx, s.py + s.r * .55 + dy / .38 * .4, s.r * (C.night ? 1.7 : 1.15), 0, 6.283); bx.fill(); bx.restore();

  // 体: ゆがんだ楕円
  const ph1 = rnd() * 6, ph2 = rnd() * 6, pts = [];
  for (let i = 0; i < 28; i++) {
    const a = i / 28 * 6.283, r = s.r * (1 + .07 * Math.sin(a * 2 + ph1) + .05 * Math.sin(a * 5 + ph2) + rnd() * .02);
    pts.push([s.px + Math.cos(a) * r, s.py + Math.sin(a) * r * .78]);
  }
  const path = new Path2D(); pts.forEach((p, i) => (i ? path.lineTo(p[0], p[1]) : path.moveTo(p[0], p[1]))); path.closePath();
  const g = bx.createRadialGradient(s.px - s.r * .3, s.py - s.r * .4, s.r * .1, s.px, s.py, s.r * 1.1);
  g.addColorStop(0, hov ? C.sumi2 : C.stoneHi); g.addColorStop(1, hov ? C.sumi : C.stone);
  bx.fillStyle = g; bx.fill(path);

  // 皴（石の肌の筆）と、苔
  bx.save(); bx.clip(path);
  bx.fillStyle = C.sumi;
  for (let k = 0; k < 4; k++) {
    const x0 = s.px + (rnd() - .5) * s.r * 1.4, y0 = s.py + (rnd() - .2) * s.r * .5, l = s.r * (.4 + rnd() * .5);
    bx.globalAlpha = .22 + rnd() * .2;
    bx.fill(new Path2D(stroke([[x0, y0], [x0 + l * .5, y0 + l * .35], [x0 + l, y0 + l * .5]], { w: s.r * .09, start: .2, end: .5, wob: .25 })));
  }
  bx.globalAlpha = .85; bx.fillStyle = C.moss;
  for (let k = 0; k < 3; k++) {
    const x0 = s.px + (rnd() - .5) * s.r * 1.1, y0 = s.py - s.r * (.5 + rnd() * .12);
    bx.fill(new Path2D(stroke([[x0 - s.r * .16, y0 + 1], [x0, y0 - s.r * .06], [x0 + s.r * .18, y0 + 1]], { w: s.r * .13, start: .3, end: .3, wob: .3 })));
  }
  bx.restore(); bx.globalAlpha = 1;

  // 縁: 筆の一周
  bx.fillStyle = C.sumi; bx.globalAlpha = hov ? .95 : .78;
  bx.fill(new Path2D(stroke([...pts, pts[0], pts[1]], { w: Math.max(2, s.r * .12), start: .04, end: .06, wob: .3 })));
  bx.globalAlpha = 1;
}

// ---- 一コマ: 基の紙 + 熊手の跡 + 名札 ----
const visible = () => face && face.classList.contains("is-open") && !document.hidden;

function frame(now) {
  requestAnimationFrame(frame);
  if (!visible() || !W) return;
  if (dirty) { drawBase(); dirty = false; }
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(base, 0, 0, W, H);
  drawRake(now);
  drawLabel();
  drawFrog(now);
}

// 蛙: ふだんは、石の上に座り、ときどき、ほかの石へ跳ぶ
function drawFrog(now) {
  if (!stones.length) return;
  const k = u * .3, t = now / 1000;
  if (!frog.hopping && now > frog.next) {
    frog.next = now + 3800 + Math.random() * 3200;
    if (frog.next - now > 0 && now > 4000) { let j = Math.floor(Math.random() * stones.length); if (j === frog.at) j = (j + 1) % stones.length; hopTo(j); }
  }
  let x, y, j = 0;
  if (frog.hopping) {
    const p = Math.min(1, (now - frog.t0) / 820); j = p;
    const mv = Math.max(0, Math.min(1, (p - .2) / .6)), e = mv * mv * (3 - 2 * mv);
    const A = stoneTop(frog.from), B = stoneTop(frog.to);
    x = A[0] + (B[0] - A[0]) * e; y = A[1] + (B[1] - A[1]) * e;
    if (p >= 1) { frog.hopping = false; frog.at = frog.to; const cb = frog.then; frog.then = null; if (cb) cb(); j = 0; }
  } else { [x, y] = stoneTop(frog.at); }
  drawShadow(ctx, x, y + 1, k * 16);
  drawOps(ctx, frogOps(j, { t }), x, y, k, frog.flip);
}

function drawRake(now) {
  while (rake.length && now - rake[0].t > RAKE_MS) rake.shift();
  if (rake.length < 2) return;
  const gap = u * .62;
  ctx.lineCap = "round"; ctx.strokeStyle = C.sumi2;
  for (let i = 1; i < rake.length; i++) {
    const a = rake[i - 1], b = rake[i], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
    const age = 1 - (now - b.t) / RAKE_MS;
    ctx.globalAlpha = Math.max(0, age) * .6; ctx.lineWidth = Math.max(1, u * .16);
    for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(a.x + nx * k * gap, a.y + ny * k * gap); ctx.lineTo(b.x + nx * k * gap, b.y + ny * k * gap); ctx.stroke(); }
  }
  ctx.globalAlpha = 1;
}

function drawLabel() {
  const s = stones.find(t => t.id === hover);
  if (!s) return;
  ctx.save();
  ctx.textBaseline = "middle";
  const x = Math.min(W - u * 9, s.px + s.r * .95), y = Math.max(u * 8, s.py - s.r * 1.05);
  ctx.font = `${u * 8}px "Yuji Syuku","Zen Old Mincho",serif`;
  ctx.lineJoin = "round"; ctx.lineWidth = u * 1.4; ctx.strokeStyle = C.paper; ctx.globalAlpha = .85; ctx.strokeText(s.name, x, y);
  ctx.globalAlpha = 1; ctx.fillStyle = C.sumi; ctx.fillText(s.name, x, y);
  ctx.font = `${u * 2.7}px ui-monospace,Menlo,monospace`;
  const t = `${s.id}  ${s.files}`; ctx.strokeText(t, x + u * .4, y + u * 6.2); ctx.fillText(t, x + u * .4, y + u * 6.2);
  ctx.restore();
}

// ---- 入力: 指が熊手になる ----
function local(e) { const r = cv.getBoundingClientRect(), k = r.width / W || 1; return [(e.clientX - r.left) / k, (e.clientY - r.top) / k]; }
function hit(x, y) {
  let best = null, bd = 1e9;
  stones.forEach(s => { const d = Math.hypot((x - s.px) / 1, (y - s.py) / .8); if (d < s.r * 1.05 && d < bd) { best = s; bd = d; } });
  return best;
}
cv.addEventListener("pointermove", e => {
  const [x, y] = local(e), now = performance.now(), last = rake[rake.length - 1];
  if (!last || Math.hypot(x - last.x, y - last.y) > u * .8) rake.push({ x, y, t: now });
  const s = hit(x, y); setHover(s ? s.id : null);
});
cv.addEventListener("pointerleave", () => setHover(null));
cv.addEventListener("click", e => { const [x, y] = local(e), s = hit(x, y); if (s) go(s.id); });

document.addEventListener("toki", () => { dirty = true; });
new ResizeObserver(layout).observe(garden);
layout();
if (!reduce) requestAnimationFrame(frame);
else new ResizeObserver(() => { if (W) { drawBase(); ctx.clearRect(0, 0, W, H); ctx.drawImage(base, 0, 0, W, H); } }).observe(garden);
