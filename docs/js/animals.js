// うさぎと蛙: 墨の線で描く、擬人化された動物（鳥獣戯画の精神で、自分で描いた）。
// 姿勢は数式で作り、毎コマ、筆の一画（入りが細く、中ほどが太く、払う）として描き直す。
// 形は「操作（ops）」の列として作るので、キャンバスにも SVG にも、同じ絵を出せる。
import { stroke } from "./sumie.js";

const D2R = Math.PI / 180;
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t * t * (3 - 2 * t);
const round = n => Math.round(n * 10) / 10;

// ---- 形の部品 ----
function rot(pts, ang, pv) {              // pv を中心に回す（y が下向き。負の角は反時計回り）
  if (!ang) return pts;
  const c = Math.cos(ang), s = Math.sin(ang);
  return pts.map(([x, y]) => [pv[0] + (x - pv[0]) * c - (y - pv[1]) * s, pv[1] + (x - pv[0]) * s + (y - pv[1]) * c]);
}
function blob(cx, cy, rx, ry, n = 10, ph = 0) {   // 少しゆがんだ丸
  const out = [];
  for (let i = 0; i < n; i++) { const a = i / n * 6.283; out.push([cx + Math.cos(a) * rx * (1 + .05 * Math.sin(a * 3 + ph)), cy + Math.sin(a) * ry * (1 + .05 * Math.cos(a * 2 + ph))]); }
  return out;
}
function limb(h, a1, l1, a2, l2) {
  const k = [h[0] + Math.cos(a1 * D2R) * l1, h[1] + Math.sin(a1 * D2R) * l1];
  return [h, k, [k[0] + Math.cos(a2 * D2R) * l2, k[1] + Math.sin(a2 * D2R) * l2]];
}
const poly = pts => "M" + pts.map(p => round(p[0]) + " " + round(p[1])).join("L") + "Z";

// 一つの形: 紙の白で塗り、筆の縁を引く
function shape(ops, pts, w, f = "paper", a = 1) {
  const closed = [...pts, pts[0], pts[1]];
  ops.push({ d: poly(closed), f, a });
  ops.push({ d: stroke(closed, { w, start: .04, end: .07, wob: .25 }), f: "ink", a: .9 });
}
const line = (ops, pts, w, a = .9, f = "ink", o = {}) => ops.push({ d: stroke(pts, { w, start: .14, end: .45, wob: .22, ...o }), f, a });

// ---- うさぎ（左向き。足もとが y=0、背丈は約 48） ----
// phi: 走りの周期 0..1 / opts.bow: お辞儀 0..1 / opts.ear: 耳のゆれ
export function rabbitOps(phi = 0, o = {}) {
  const ext = (1 + Math.sin(phi * 6.283)) / 2;                 // 0=縮んだ姿勢、1=伸びた姿勢
  const run = o.run === false ? 0 : 1;
  const e = run ? ext : 0;
  const bob = run ? -3.2 * Math.abs(Math.sin(phi * 3.1416)) : -.4 * Math.sin((o.t || 0) * 2.2);
  const sx = 1 + .16 * e, sy = 1 - .08 * e;
  const bowA = -(o.bow || 0) * 26 * D2R, pv = [6, 0];
  const T = pts => rot(pts.map(([x, y]) => [x * sx, y * sy + bob]), bowA, pv);
  const ops = [];

  // 奥の脚（うす墨）
  const hindFar = limb([12, -14], lerp(112, 42, e), 12, lerp(74, 10, e), 12);
  const frontFar = limb([-10, -14], lerp(86, 160, e), 9, lerp(96, 174, e), 9);
  line(ops, T(hindFar), 3.2, .5); line(ops, T(frontFar), 2.6, .5);

  // 体
  shape(ops, T([[-14, -19], [-7, -28], [6, -30], [17, -26], [21, -17], [14, -10], [0, -9], [-11, -11]]), 2.3);
  // 手前の脚
  const hind = limb([14, -14], lerp(104, 34, e), 13, lerp(66, 6, e), 13);
  const front = limb([-12, -13], lerp(80, 168, e), 9, lerp(100, 178, e), 9);
  line(ops, T(hind), 4, .92, "ink", { start: .08, end: .55 }); line(ops, T(front), 3, .92);
  // 頭
  const head = T(blob(-21, -27, 8, 7, 9, 1));
  shape(ops, [...head.slice(0, 5), ...T([[-30, -25.5]]), ...head.slice(5)], 2.2);
  // 耳（うしろへ寝かせ、少しゆれる）
  const ew = Math.sin((o.t || 0) * 5 + 1) * (o.ear ?? 1) * 1.6;
  line(ops, T([[-18, -33], [-12 + ew, -43], [-3 + ew * 1.5, -50 - e * 2]]), 5.2, .9, "ink", { start: .06, end: .55, bow: .3 });
  line(ops, T([[-15, -33], [-8 + ew, -42], [2 + ew * 1.5, -47 - e * 2]]), 4.2, .7, "ink", { start: .06, end: .55, bow: .3 });
  // 目と鼻
  ops.push({ d: poly(T(blob(-24, -29, 1.5, 1.6, 6))), f: "ink", a: 1 });
  ops.push({ d: poly(T(blob(-30.5, -25.8, 1.1, 1, 6))), f: "shu", a: 1 });
  // しっぽ
  shape(ops, T(blob(22, -21, 3.8, 3.6, 8, 2)), 1.5);
  // 首の朱い布
  line(ops, T([[-15, -22.5], [-11, -20.5], [-6, -21.5]]), 3.4, .95, "shu", { start: .3, end: .3 });
  return ops;
}

// ---- 蛙（左向き。足もとが y=0、背丈は約 26） ----
// hop: 跳びの周期 0..1（0=座っている）
export function frogOps(hop = 0, o = {}) {
  const c = hop < .2 ? Math.sin(hop / .2 * 1.5708) : hop > .8 ? Math.sin((1 - hop) / .2 * 1.5708) : 0;  // しゃがみ
  const air = hop >= .2 && hop <= .8 ? Math.sin((hop - .2) / .6 * 3.1416) : 0;                           // 空中
  const lift = -16 * air, breathe = hop === 0 ? Math.sin((o.t || 0) * 2.4) * .5 : 0;
  const bowA = -(o.bow || 0) * 24 * D2R, pv = [4, 0];
  const T = pts => rot(pts.map(([x, y]) => [x * (1 + .07 * c), (y + 10) * (1 - .13 * c) - 10 + lift + c * 2 + breathe]), bowA, pv);
  const ops = [];

  const hindFold = [[8, -6], [16, -13], [5, -1]], hindOut = [[8, -6], [19, -9], [31, -3]];
  const frontPlant = [[-8, -5], [-13, 0], [-19, 0]], frontReach = [[-8, -6], [-17, -9], [-26, -13]];
  const mix = (A, B, t) => A.map((p, i) => [lerp(p[0], B[i][0], t), lerp(p[1], B[i][1], t)]);
  const hind = mix(hindFold, hindOut, air), front = mix(frontPlant, frontReach, air);

  line(ops, T(mix(hindFold, hindOut, air).map(p => [p[0] - 1, p[1]])), 3.4, .5);       // 奥の脚
  shape(ops, T([[-13, -9], [-8, -17], [3, -19], [13, -14], [16, -7], [9, -2], [-6, -2], [-12, -4]]), 2.2);
  line(ops, T(hind), 5, .92, "ink", { start: .08, end: .55 });
  line(ops, T([[hind[2][0], hind[2][1]], [hind[2][0] - 5, hind[2][1] + .4], [hind[2][0] - 9, hind[2][1]]]), 3, .9);   // 足の先
  line(ops, T(front), 3.2, .92);
  // 目（上に出っ張る）
  [[-10, -20, 3.5], [-3.5, -21, 3.2]].forEach(([x, y, r]) => { shape(ops, T(blob(x, y, r, r, 8)), 1.5); ops.push({ d: poly(T(blob(x - .8, y, 1.1, 1.2, 6))), f: "ink", a: 1 }); });
  // 口
  line(ops, T([[-17, -9.5], [-11, -8], [-4, -8.5]]), 1.8, .85, "ink", { start: .2, end: .3 });
  // 首の朱い布
  line(ops, T([[-5, -3.4], [0, -2.2], [5, -3.2]]), 2.6, .95, "shu", { start: .3, end: .3 });
  return ops;
}

// ---- キャンバスへ描く ----
let C = null, cAge = 0;
function colors() {
  const s = getComputedStyle(document.documentElement), v = n => s.getPropertyValue(n).trim();
  C = { ink: v("--k-ink") || v("--sumi"), paper: v("--k-cfill") || v("--paper"), shu: v("--shu") };
}
export function drawOps(ctx, ops, x, y, k = 1, flip = false) {
  if (!C || ++cAge > 120) { colors(); cAge = 0; }
  ctx.save();
  ctx.translate(x, y); ctx.scale(flip ? -k : k, k);
  for (const op of ops) { ctx.fillStyle = C[op.f]; ctx.globalAlpha = op.a ?? 1; ctx.fill(new Path2D(op.d)); }
  ctx.restore();
}
// 影: 足もとの、淡いぼかし
export function drawShadow(ctx, x, y, w) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, w);
  g.addColorStop(0, "rgba(20,16,10,.22)"); g.addColorStop(1, "rgba(20,16,10,0)");
  ctx.save(); ctx.translate(x, y); ctx.scale(1, .22); ctx.translate(-x, -y); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, w, 0, 6.283); ctx.fill(); ctx.restore();
}

// ---- SVG（掛け紙の行列）へ ----
const FILL = { ink: "var(--k-ink)", paper: "var(--k-cfill)", shu: "#c23a22" };
export function opsToSvg(parent, ops, tf) {
  const NS = "http://www.w3.org/2000/svg", g = document.createElementNS(NS, "g");
  g.setAttribute("transform", tf);
  for (const op of ops) { const p = document.createElementNS(NS, "path"); p.setAttribute("d", op.d); p.setAttribute("fill", FILL[op.f]); if (op.a != null && op.a < 1) p.setAttribute("opacity", op.a); g.append(p); }
  parent.append(g);
  return g;
}

// 掛け紙の行列: 富士の麓を、うさぎと蛙が、右から左へ横切る（姿勢を二つ、交互に見せる）
export function paintParade(svg) {
  const NS = "http://www.w3.org/2000/svg";
  const mist = svg.querySelector(".k-band-m1");
  const parade = document.createElementNS(NS, "g");
  parade.setAttribute("class", "k-parade");
  const cast = [
    { kind: "rabbit", x: 0, k: 1.75, poses: [rabbitOps(.2, { t: 0 }), rabbitOps(.7, { t: 1 })] },
    { kind: "frog", x: 150, k: 1.9, poses: [frogOps(.5), frogOps(0)] },
    { kind: "rabbit", x: 270, k: 1.35, poses: [rabbitOps(.25, { t: 2 }), rabbitOps(.75, { t: 3 })] },
  ];
  cast.forEach((a, i) => {
    const unit = document.createElementNS(NS, "g");
    unit.setAttribute("class", "k-walker k-walker-" + a.kind);
    unit.style.setProperty("--d", i * .18 + "s");
    a.poses.forEach((ops, j) => {
      const holder = document.createElementNS(NS, "g");
      holder.setAttribute("class", j ? "k-pose-b" : "k-pose-a");
      opsToSvg(holder, ops, `translate(${a.x} 0) scale(${a.k})`);
      unit.append(holder);
    });
    parade.append(unit);
  });
  const place = document.createElementNS(NS, "g");
  place.setAttribute("class", "k-parade-place");
  place.setAttribute("transform", "translate(0 652)");
  place.append(parade);
  mist.before(place);
}

// ============ 組み込み ============
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const docVisible = () => !document.hidden;

// ---- 下の道: 進み具合。うさぎは頁に合わせて右から左へ走り、蛙が少し遅れて跳ねてついてくる ----
export function initRoad() {
  const cv = document.getElementById("road");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  const cw = 300, ch = 46, dpr = Math.min(2, devicePixelRatio || 1);
  cv.width = cw * dpr; cv.height = ch * dpr; cv.style.width = cw + "px"; cv.style.height = ch + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  let spread = 0, total = 13;
  const xR = cw - 26, xL = 26, ground = ch - 9, K = .5;
  const xAt = s => xR - (s / total) * (xR - xL);
  const rab = { x: xAt(0), face: 1, phi: 0 }, frog = { x: xAt(0) + 30, j: 0 };
  document.addEventListener("washo:spread", e => { spread = e.detail.s; total = e.detail.N; });

  // 道: 筆の一本線と、見開きごとの小さな点
  function road(c) {
    c.fillStyle = C ? C.ink : "#1c2432";
    c.globalAlpha = .55;
    c.fill(new Path2D(stroke([[xL - 10, ground + 2], [cw * .35, ground + 3.2], [cw * .7, ground + 1.6], [xR + 12, ground + 2.6]], { w: 2.6, start: .1, end: .3, wob: .3 })));
    c.globalAlpha = .7;
    for (let i = 0; i <= total; i++) { const x = xAt(i); c.beginPath(); c.arc(x, ground + 2.4, i === spread ? 2.4 : 1.2, 0, 6.283); c.fill(); }
    c.globalAlpha = 1;
  }

  let prev = performance.now(), t = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    if (!docVisible() || cv.offsetParent === null) { prev = now; return; }
    const dt = Math.min(.05, (now - prev) / 1000); prev = now; t += dt;
    const tx = xAt(spread), dx = tx - rab.x, moving = Math.abs(dx) > .6;
    if (moving) { rab.x += Math.sign(dx) * Math.min(Math.abs(dx), (60 + Math.abs(dx) * 3.2) * dt); rab.face = dx < 0 ? 1 : -1; rab.phi = (rab.phi + dt * 2.6) % 1; }
    // 蛙: うさぎの少しうしろ（進む向きの反対側）を、跳びながら追う
    const fx = rab.x - rab.face * 30, fd = fx - frog.x, fmoving = Math.abs(fd) > 2.5;
    if (fmoving || frog.j > 0) {
      frog.j += dt * 2.1;
      if (frog.j >= 1) frog.j = fmoving ? 0.001 : 0;
      if (fmoving) frog.x += Math.sign(fd) * Math.min(Math.abs(fd), (40 + Math.abs(fd) * 2.4) * dt);
    }
    ctx.clearRect(0, 0, cw, ch);
    road(ctx);
    drawShadow(ctx, frog.x, ground + 2, 9); drawOps(ctx, frogOps(frog.j, { t }), frog.x, ground + 1, K * .9, fd > 0 ? true : false);
    drawShadow(ctx, rab.x, ground + 2, 12); drawOps(ctx, rabbitOps(rab.phi, { run: moving, t, ear: moving ? .4 : 1 }), rab.x, ground + 1, K, rab.face < 0);
  }
  if (reduceMotion) { rab.x = xAt(0); ctx.clearRect(0, 0, cw, ch); road(ctx); drawOps(ctx, rabbitOps(0, { run: false }), rab.x, ground + 1, K); }
  else requestAnimationFrame(frame);
}

// ---- 奥付: 二匹が向かい合って、お辞儀をする ----
export function initBow() {
  const cv = document.getElementById("bow");
  if (!cv) return;
  const ctx = cv.getContext("2d"), face = cv.closest(".face");
  const host = cv.parentElement;
  let W = 0, H = 0, t = 0, since = null, prev = performance.now();
  const fit = () => { W = host.clientWidth; H = Math.round(W * .36); cv.style.height = H + "px"; const d = Math.min(2, devicePixelRatio || 1); cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
  new ResizeObserver(fit).observe(host); fit();
  function frame(now) {
    requestAnimationFrame(frame);
    const open = face && face.classList.contains("is-open") && docVisible();
    if (!open || !W) { since = null; prev = now; return; }
    if (since === null) since = now;
    const dt = Math.min(.05, (now - prev) / 1000); prev = now; t += dt;
    // 開いて 1.2 秒後に一度お辞儀（1.8 秒）。そのあと 7 秒おき
    const cyc = ((now - since) / 1000 - 1.2) % 7, p = cyc >= 0 && cyc < 1.8 ? cyc / 1.8 : -1;
    const bow = p < 0 ? 0 : Math.sin(Math.min(1, p) * Math.PI);
    ctx.clearRect(0, 0, W, H);
    const k = W / 190, gy = H - 8;
    drawShadow(ctx, W * .3, gy, 20 * k * .6); drawOps(ctx, frogOps(0, { t, bow }), W * .3, gy, k * 1.15, true);
    drawShadow(ctx, W * .68, gy, 24 * k * .6); drawOps(ctx, rabbitOps(0, { run: false, bow, t }), W * .68, gy, k);
  }
  if (!reduceMotion) requestAnimationFrame(frame);
}

// ---- 庭の蛙のために ----
export const hopArc = frogOps;

// ---- 掛け紙が外れるとき: 墨の鳥の群れが、足もとから、ばーっと飛び立つ ----
export function flyBirds() {
  if (reduceMotion) return;
  const cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  cv.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:60";
  const dpr = Math.min(2, devicePixelRatio || 1), W = innerWidth, H = innerHeight;
  cv.width = W * dpr; cv.height = H * dpr;
  document.body.append(cv);
  const ctx = cv.getContext("2d");
  ctx.scale(dpr, dpr);
  const ink = getComputedStyle(document.documentElement).getPropertyValue("--k-ink").trim() || "#26262c";
  const S = Math.min(W, H * 1.4) / 1334;
  const birds = Array.from({ length: 26 }, (_, i) => {
    const a = -Math.PI / 2 + (Math.random() - .5) * 2.3;        // 上向きに扇状へ
    const v = (260 + Math.random() * 520) * S * 1.4;
    return {
      x: W * (.5 + (Math.random() - .5) * .34), y: H * (.78 + Math.random() * .12),
      vx: Math.cos(a) * v, vy: Math.sin(a) * v * .9, s: (14 + Math.random() * 16) * S * 1.5,
      f: 6 + Math.random() * 3.5, ph: Math.random() * 6.28, late: i * .028 + Math.random() * .12,
    };
  });
  const T = 3000, t0 = performance.now();
  (function tick(now) {
    const t = now - t0;
    ctx.clearRect(0, 0, W, H);
    for (const b of birds) {
      const u = t / 1000 - b.late;
      if (u < 0) continue;
      const x = b.x + b.vx * u, y = b.y + b.vy * u - 40 * u * u;
      const sc = Math.max(.35, 1 - u * .3);
      const alpha = Math.min(1, u * 8) * Math.max(0, Math.min(1, (T / 1000 - b.late - u) / .8));
      if (alpha <= 0) continue;
      const fl = Math.sin(u * b.f * 6.28 + b.ph), L = b.s * sc, ang = Math.atan2(b.vy, b.vx) + Math.PI / 2;
      ctx.save();
      ctx.translate(x, y); ctx.rotate(ang * .35); ctx.globalAlpha = alpha; ctx.fillStyle = ink;
      for (const d of [-1, 1]) {               // 翼: 付け根が太く、先が細い三日月
        const tx = d * L, ty = -fl * L * .75;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(d * L * .5, ty * .2 - L * .32, tx, ty);
        ctx.quadraticCurveTo(d * L * .52, ty * .2 + L * .12, 0, L * .13);
        ctx.fill();
      }
      ctx.beginPath(); ctx.ellipse(0, L * .05, L * .12, L * .2, 0, 0, 6.28); ctx.fill();   // 胴
      ctx.restore();
    }
    if (t < T + 400) requestAnimationFrame(tick); else cv.remove();
  })(t0);
}
