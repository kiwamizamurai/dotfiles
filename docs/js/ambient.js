// 刻ごとの舞い（朝＝桜、昼＝光の粒と雲、夕＝紅葉、夜＝蛍）と、ポインタについてくる筆跡・蛍。
// 本の後ろ（#ambient）と、本の前（#trail）の二枚の透明な層に描く。動きを減らす設定では何も動かさない。
const bg = document.getElementById("ambient"), tr = document.getElementById("trail");
if (!bg || !tr) throw new Error("ambient canvases missing");
const bx = bg.getContext("2d"), tx = tr.getContext("2d");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const root = document.documentElement;

let W = 0, H = 0, dpr = 1, kind = root.dataset.toki || "hiru", parts = [];
const mouse = { x: -999, y: -999, seen: false };
const trail = [];            // 筆跡: { x, y, t }
const orb = { x: 0, y: 0 }; // 夜の蛍: ポインタに遅れてついてくる

const rnd = (a, b) => a + Math.random() * (b - a);
const cssVar = n => getComputedStyle(root).getPropertyValue(n).trim();

function fit() {
  dpr = Math.min(2, devicePixelRatio || 1);
  W = innerWidth; H = innerHeight;
  for (const c of [bg, tr]) { c.width = W * dpr; c.height = H * dpr; c.style.width = W + "px"; c.style.height = H + "px"; }
  bx.setTransform(dpr, 0, 0, dpr, 0, 0);
  tx.setTransform(dpr, 0, 0, dpr, 0, 0);
  seed();
}

// ---- 粒の種 ----
function seed() {
  const area = W * H / 1e6; // 画面の広さに比例して数を決める
  const n = { asa: 26, hiru: 22, yuu: 20, yoru: 30 }[kind] || 20;
  parts = Array.from({ length: Math.round(n * Math.max(.6, area)) }, () => make(true));
}
function make(anywhere) {
  const p = { x: rnd(0, W), y: anywhere ? rnd(0, H) : -20, ph: rnd(0, 6.28), rot: rnd(0, 6.28), vr: rnd(-1.2, 1.2), s: rnd(5, 11) };
  if (kind === "asa") { p.vy = rnd(18, 42); p.vx = rnd(-8, 18); }
  else if (kind === "yuu") { p.vy = rnd(24, 52); p.vx = rnd(-22, 10); p.s = rnd(7, 14); p.hue = rnd(0, 1); }
  else if (kind === "yoru") { p.vy = rnd(-4, 4); p.vx = rnd(-4, 4); p.s = rnd(1.4, 3.2); p.y = rnd(H * .1, H); }
  else { p.vy = rnd(-4, 5); p.vx = rnd(2, 10); p.s = rnd(1, 2.6); p.big = Math.random() < .12; if (p.big) p.s = rnd(150, 300); }
  return p;
}

// ---- 形 ----
function petal(c, s) { // 桜の花びら（先に切れ込み）
  c.beginPath();
  c.moveTo(0, -s);
  c.bezierCurveTo(s * 1.0, -s * .8, s * .9, s * .6, 0, s);
  c.bezierCurveTo(-s * .9, s * .6, -s * 1.0, -s * .8, 0, -s);
  c.fill();
}
function maple(c, s) { // 紅葉（五つの尖り）
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = i / 10 * Math.PI * 2 - Math.PI / 2, r = i % 2 ? s * .46 : s;
    i ? c.lineTo(Math.cos(a) * r, Math.sin(a) * r) : c.moveTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  c.closePath(); c.fill();
  c.strokeStyle = c.fillStyle; c.lineWidth = .8; c.beginPath(); c.moveTo(0, s * .2); c.lineTo(0, s * 1.1); c.stroke();
}
function glow(c, x, y, r, rgb, a) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
}

// ---- 一コマ ----
let last = performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  if (document.hidden || root.classList.contains("kake-cover")) { last = now; return; }
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  drawBg(now / 1000, dt);
  drawTrail(now, dt);
}

function drawBg(t, dt) {
  bx.clearRect(0, 0, W, H);
  if (kind === "yoru") { // 月あかり
    glow(bx, W * .14, H * .16, Math.min(W, H) * .34, "232,224,190", .16);
    glow(bx, W * .14, H * .16, 30, "255,250,220", .5);
  }
  for (const p of parts) {
    p.ph += dt;
    if (kind === "asa") { p.x += (p.vx + Math.sin(p.ph * 1.6) * 16) * dt; p.y += p.vy * dt; p.rot += p.vr * dt; }
    else if (kind === "yuu") { p.x += (p.vx + Math.sin(p.ph * 1.2) * 20) * dt; p.y += p.vy * dt; p.rot += p.vr * dt * 1.4; }
    else if (kind === "yoru") { p.x += (p.vx + Math.sin(p.ph * .9) * 10) * dt; p.y += (p.vy + Math.cos(p.ph * 1.1) * 8) * dt; }
    else { p.x += p.vx * dt; p.y += p.vy * dt + Math.sin(p.ph * .5) * .1; }
    // はみ出したら、反対側から戻る
    if (p.y > H + 30) { p.y = -20; p.x = rnd(0, W); }
    if (p.y < -40 && kind !== "asa" && kind !== "yuu") p.y = H + 20;
    if (p.x > W + 40 + (p.big ? 300 : 0)) p.x = -40 - (p.big ? 300 : 0);
    if (p.x < -50) p.x = W + 30;

    if (kind === "asa") {
      bx.save(); bx.translate(p.x, p.y); bx.rotate(p.rot); bx.scale(1, .55 + .45 * Math.abs(Math.sin(p.ph * 1.3)));
      bx.fillStyle = "rgba(244,184,200,.78)"; petal(bx, p.s); bx.restore();
    } else if (kind === "yuu") {
      bx.save(); bx.translate(p.x, p.y); bx.rotate(p.rot); bx.scale(1, .6 + .4 * Math.abs(Math.sin(p.ph * 1.1)));
      bx.fillStyle = p.hue > .5 ? "rgba(196,62,34,.82)" : "rgba(224,120,40,.82)"; maple(bx, p.s); bx.restore();
    } else if (kind === "yoru") {
      const a = .35 + .65 * Math.max(0, Math.sin(p.ph * 2.1 + p.x * .01));
      glow(bx, p.x, p.y, p.s * 7, "214,236,120", a * .5);
      bx.fillStyle = `rgba(240,250,170,${a})`; bx.beginPath(); bx.arc(p.x, p.y, p.s * .8, 0, Math.PI * 2); bx.fill();
    } else if (p.big) { // 昼: 雲の影がゆっくり渡る
      glow(bx, p.x, p.y * .6 + H * .2, p.s, "255,255,240", .1);
    } else { // 昼: 光の粒
      bx.fillStyle = `rgba(255,252,230,${.25 + .25 * Math.sin(p.ph * 1.5)})`; bx.beginPath(); bx.arc(p.x, p.y, p.s, 0, Math.PI * 2); bx.fill();
    }
  }
}

function drawTrail(now, dt) {
  tx.clearRect(0, 0, W, H);
  if (!mouse.seen) return;
  if (kind === "yoru") { // 蛍が、遅れてついてくる
    orb.x += (mouse.x - orb.x) * Math.min(1, dt * 4.5); orb.y += (mouse.y - orb.y) * Math.min(1, dt * 4.5);
    trail.push({ x: orb.x, y: orb.y, t: now });
    while (trail.length && now - trail[0].t > 700) trail.shift();
    trail.forEach(p => { const k = 1 - (now - p.t) / 700; glow(tx, p.x, p.y, 10 * k + 2, "214,236,120", .35 * k); });
    glow(tx, orb.x, orb.y, 22, "226,244,140", .55);
    tx.fillStyle = "rgba(250,255,200,.95)"; tx.beginPath(); tx.arc(orb.x, orb.y, 2.4, 0, Math.PI * 2); tx.fill();
    return;
  }
  // 墨の筆跡: 細く始まり、ポインタの側で太く、すぐに消える
  trail.push({ x: mouse.x, y: mouse.y, t: now });
  while (trail.length && now - trail[0].t > 520) trail.shift();
  if (trail.length < 2) return;
  const col = cssVar("--sumi2") || "#444";
  tx.strokeStyle = col; tx.lineCap = "round"; tx.lineJoin = "round";
  for (let i = 1; i < trail.length; i++) {
    const a = trail[i - 1], b = trail[i], k = i / trail.length, age = 1 - (now - b.t) / 520;
    tx.globalAlpha = Math.max(0, age) * .42; tx.lineWidth = .8 + k * 3.4;
    tx.beginPath(); tx.moveTo(a.x, a.y); tx.lineTo(b.x, b.y); tx.stroke();
  }
  tx.globalAlpha = 1;
}

export function initAmbient() {
  if (reduce) { bg.hidden = tr.hidden = true; return; }
  kind = root.dataset.toki || "hiru";   // 刻の初期化のあとで読む
  fit();
  addEventListener("resize", fit);
  addEventListener("pointermove", e => { mouse.x = e.clientX; mouse.y = e.clientY; if (!mouse.seen) { mouse.seen = true; orb.x = e.clientX; orb.y = e.clientY; } }, { passive: true });
  document.addEventListener("pointerleave", () => { mouse.seen = false; trail.length = 0; });
  document.addEventListener("toki", e => { kind = e.detail; seed(); trail.length = 0; });
  requestAnimationFrame(frame);
}
