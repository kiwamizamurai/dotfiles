// 水墨: 掛け紙の景色（日・富士・霞・雲）を、筆の線で描く。
// 一画ずつ、太さに強弱のある多角形（入りは細く、中ほどは太く、終わりは払う）として生成し、
// 紙の目のノイズで「かすれ」を出す。乱数は種を固定するので、毎回、同じ手の跡になる。
const NS = "http://www.w3.org/2000/svg";
let seed = 1;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const R = (a, b) => a + rnd() * (b - a);
const f1 = v => v.toFixed(1);

function el(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.append(e);
  return e;
}

// ---- 曲線 ----
const cr = (a, b, c, d, t) => .5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
function spline(pts, n = 56) {            // 通る点から、なめらかな曲線を取る
  const P = [pts[0], ...pts, pts[pts.length - 1]], seg = pts.length - 1, per = Math.max(2, Math.round(n / seg)), out = [];
  for (let i = 0; i < seg; i++) for (let j = 0; j < per; j++) {
    const t = j / per, [p0, p1, p2, p3] = [P[i], P[i + 1], P[i + 2], P[i + 3]];
    out.push([cr(p0[0], p1[0], p2[0], p3[0], t), cr(p0[1], p1[1], p2[1], p3[1], t)]);
  }
  out.push(pts[pts.length - 1]);
  return out;
}

// ---- 筆の一画 ----
// w: いちばん太いところ / start, end: 入りと払いの長さ（0〜1）/ wob: 太さの揺れ / bow: 筆が横へ流れる量
function stroke(pts, { w = 10, start = .22, end = .3, wob = .1, bow = 0 } = {}) {
  const s = spline(pts), L = [], Rr = [], n = s.length;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1), a = s[Math.max(0, i - 1)], b = s[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
    const ramp = Math.min(1, t / start), tail = Math.min(1, (1 - t) / end);
    let ww = w * (.16 + .84 * Math.pow(ramp, .65)) * (.1 + .9 * Math.pow(tail, .85));
    ww *= 1 + (rnd() - .5) * wob * 2;
    const off = bow * Math.sin(t * Math.PI) * w * .25;   // 筆がふくらんで流れる
    const x = s[i][0] + nx * off, y = s[i][1] + ny * off;
    L.push([x + nx * ww / 2, y + ny * ww / 2]);
    Rr.push([x - nx * ww / 2, y - ny * ww / 2]);
  }
  const P = p => f1(p[0]) + " " + f1(p[1]);
  return "M" + L.map(P).join("L") + "L" + Rr.reverse().map(P).join("L") + "Z";
}
const poly = pts => "M" + pts.map(p => f1(p[0]) + " " + f1(p[1])).join("L") + "Z";


// 濃い芯と、流れに沿った毛の筋。毛ごとに入りと払いの位置が違い、端がほぐれる。
function bristles(parent, pts, o = {}) {
  const w = o.w || 12, n = o.n || 7, s = spline(pts, 64), m = s.length;
  const g = el("g", { fill: o.fill || "var(--k-ink)" }, parent);
  el("path", { d: stroke(pts, { w: w * .6, start: o.start ?? .1, end: o.end ?? .4, wob: .1, bow: o.bow || 0 }), opacity: o.op ?? .9 }, g);
  for (let j = 0; j < n; j++) {
    const off = (j / (n - 1) - .5) * w * 1.1 + R(-.7, .7);
    const i0 = Math.floor(R(0, .14) * (m - 1)), i1 = Math.floor(R(.5, 1) * (m - 1)), line = [];
    for (let i = i0; i <= i1; i += 3) {
      const a = s[Math.max(0, i - 1)], b = s[Math.min(m - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1;
      line.push([s[i][0] - dy / d * off, s[i][1] + dx / d * off]);
    }
    if (line.length < 3) continue;
    el("path", { d: stroke(line, { w: w / n * R(.9, 1.7), start: .15, end: .5, wob: .3 }), opacity: R(.3, .8).toFixed(2) }, g);
  }
  return g;
}

// ---- 雲 ----
// 一筆で縁取った、手描きの雲。上は丸い山をいくつも重ね、下は、ゆるくうねる。
function cloud(parent, cx, cy, w, h, sd) {
  seed = sd;
  const lobes = Math.round(R(4, 7)), ph = R(0, 3), N = 72, top = [], bot = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N, env = Math.pow(Math.sin(Math.PI * u), .5), bump = Math.pow(Math.abs(Math.sin(Math.PI * u * lobes + ph)), .75);
    top.push([cx + (u - .5) * w, cy - Math.min(h * .86, w / lobes * .46) * bump * env - h * .12 * Math.pow(Math.sin(Math.PI * u), .6) + R(-1.2, 1.2)]);
  }
  for (let i = N; i >= 0; i--) {
    const u = i / N;
    bot.push([cx + (u - .5) * w, cy + h * .17 * Math.pow(Math.sin(Math.PI * u), .6) + Math.sin(u * 8 + ph) * h * .04 * Math.sin(Math.PI * u) + R(-1, 1)]);
  }
  const g = el("g", {}, parent);
  // ぼかした、墨の影
  el("ellipse", { cx, cy: cy + h * .2, rx: w * .52, ry: h * .3, fill: "var(--k-ink)", opacity: ".22", filter: "url(#k-soft2)" }, g);
  // 雲の体（紙の白）
  el("path", { d: poly([...top, ...bot]), fill: "var(--k-cfill)", opacity: ".96", filter: "url(#rough2)" }, g);
  // 縁の筆: 上は、いくつかに分けて、太く入り細く払う
  const ink = el("g", { fill: "var(--k-ink)", filter: "url(#brush)" }, g);
  const pick = (a, i0, i1) => { const out = []; for (let i = i0; i <= i1; i += 4) out.push(a[i]); out.push(a[i1]); return out; };
  const cuts = [0, Math.round(N * .34), Math.round(N * .68), N];
  for (let k = 0; k < 3; k++) bristles(ink, pick(top, cuts[k], cuts[k + 1]), { w: R(8.5, 11.5), n: 6, start: .18, end: .4, bow: R(-.4, .4), op: R(.72, .9) });
  el("path", { d: stroke(pick(bot, 0, N), { w: R(4, 6), start: .3, end: .35, wob: .2 }), opacity: ".6" }, ink);
  // 巻き（雲の中の渦）
  for (let k = 0; k < 3; k++) {
    const cxk = cx + (k - 1) * w * .24 + R(-14, 14), cyk = cy - h * R(.28, .5), r0 = h * R(.13, .2), a0 = R(0, 6.28), pts = [];
    for (let i = 0; i < 7; i++) { const a = a0 + i * .8, r = r0 * (1 - i * .11); pts.push([cxk + Math.cos(a) * r, cyk + Math.sin(a) * r * .8]); }
    el("path", { d: stroke(pts, { w: R(3, 4.6), start: .2, end: .5, wob: .2 }), opacity: R(.4, .62).toFixed(2) }, ink);
  }
  return g;
}

// ---- 富士 ----
const LEFT = [[598, 300], [570, 322], [520, 392], [446, 486], [330, 574], [150, 646]];
const RIGHT = [[602, 300], [632, 324], [684, 396], [764, 490], [884, 580], [1060, 646]];

function fuji(g) {
  seed = 11;
  const L = spline(LEFT, 60), Rt = spline(RIGHT, 60);
  // 山肌: 薄墨の面（縁は、紙に染みたように揺れる）
  el("path", { d: poly([...L, [90, 664], [90, 810], [1110, 810], [1110, 664], ...Rt.slice().reverse()]), fill: "url(#k-fuji)", opacity: ".93", filter: "url(#rough2)" }, g);
  // 遠い山の、淡いぼかし
  el("path", { d: poly([[0, 640], [120, 560], [260, 520], [380, 590], [470, 650], [0, 650]]), fill: "var(--k-fuji2)", opacity: ".26", filter: "url(#k-soft3)" }, g);
  el("path", { d: poly([[1200, 640], [1100, 570], [980, 536], [860, 596], [780, 650], [1200, 650]]), fill: "var(--k-fuji2)", opacity: ".26", filter: "url(#k-soft3)" }, g);

  // 雪: 紙の白を残す。下の縁は、筆を置いたようにぎざぎざ
  const snowY = 376, lx = L.find(p => p[1] >= snowY)[0], rx = Rt.find(p => p[1] >= snowY)[0];
  const rag = []; const K = 11;
  for (let i = 0; i <= K; i++) rag.push([lx + (rx - lx) * i / K, snowY + (i % 2 ? R(14, 40) : R(-8, 8))]);
  el("path", { d: poly([...L.filter(p => p[1] <= snowY), ...rag, ...Rt.filter(p => p[1] <= snowY).reverse()]), fill: "var(--k-snow)", opacity: ".97", filter: "url(#rough2)" }, g);

  // 山肌のぼかし: 右は陰、左は光。筆を寝かせて、水を含ませたように
  el("path", { d: poly([[602, 304], ...Rt.filter(p => p[1] > 330), [1060, 650], [820, 650], [700, 520], [640, 420]]), fill: "var(--k-fline)", opacity: ".22", filter: "url(#k-soft2)" }, g);
  el("path", { d: poly([[596, 304], ...L.filter(p => p[1] > 330), [150, 650], [330, 650], [470, 520], [545, 420]]), fill: "#fff", opacity: ".16", filter: "url(#k-soft2)" }, g);
  // 稜線の筆
  const line = el("g", { fill: "var(--k-fline)", filter: "url(#brush)" }, g);
  bristles(line, LEFT, { w: 17, n: 9, start: .06, end: .42, bow: .4, fill: "var(--k-fline)", op: .92 });
  bristles(line, RIGHT, { w: 17, n: 9, start: .06, end: .42, bow: -.4, fill: "var(--k-fline)", op: .92 });
  el("path", { d: stroke(LEFT.map(p => [p[0] + 5, p[1] + 4]), { w: 5, start: .2, end: .5, wob: .2 }), opacity: ".45" }, line);
  el("path", { d: stroke(RIGHT.map(p => [p[0] - 5, p[1] + 4]), { w: 5, start: .2, end: .5, wob: .2 }), opacity: ".45" }, line);
  // 雪の下縁に、墨の点
  rag.forEach((p, i) => { if (i % 2) el("path", { d: stroke([[p[0] - 8, p[1] - 4], [p[0], p[1] + 2], [p[0] + 8, p[1] - 3]], { w: R(4, 7), start: .3, end: .3 }), opacity: ".55" }, line); });

  // 皴: 山肌をなぞる、細い筆
  const shun = el("g", { fill: "var(--k-fline)", filter: "url(#kasure)" }, g);
  for (let i = 0; i < 22; i++) {
    const side = i % 2 ? 1 : -1, y0 = R(410, 560), t = (y0 - 300) / 346;
    const x0 = 600 + side * (t * 480 * R(.18, .8)), len = R(60, 150);
    el("path", { d: stroke([[x0, y0], [x0 + side * len * .35, y0 + len * .5], [x0 + side * len * .6, y0 + len]], { w: R(3, 5.6), start: .2, end: .55, wob: .25 }), opacity: R(.22, .5).toFixed(2) }, shun);
  }
  // 麓の、点苔（木々の墨点）
  for (let i = 0; i < 46; i++) {
    const x = R(110, 1090), y = 640 + R(-8, 22), l = R(16, 44);
    el("path", { d: stroke([[x, y], [x + l * .5, y - R(0, 5)], [x + l, y + R(-2, 3)]], { w: R(5, 9), start: .25, end: .35, wob: .3 }), opacity: R(.45, .8).toFixed(2) }, shun);
  }
}

// ---- 日・霞 ----
function sun(g) {
  seed = 5;
  const pts = []; const n = 64;
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, r = 132 + R(-2.5, 2.5) + Math.sin(a * 3) * 1.6; pts.push([600 + Math.cos(a) * r, 392 + Math.sin(a) * r]); }
  el("circle", { cx: 600, cy: 392, r: 330, fill: "url(#k-glow)", opacity: ".7" }, g);
  el("path", { d: poly(pts), style: "fill:var(--k-sun);opacity:var(--k-sunop)", filter: "url(#kasure2)" }, g);
}
function mist(inner, spots) {
  seed = 21;
  const g = el("g", { filter: "url(#k-soft2)" }, inner);
  spots.forEach(([x, y, rx, ry]) => el("ellipse", { cx: x, cy: y, rx, ry, fill: "var(--k-sky3)", opacity: R(.75, .95).toFixed(2) }, g));
}

// ---- 一枚の景色 ----
export function paintScene(svg) {
  const q = s => svg.querySelector(s);
  sun(q(".k-sun"));
  mist(q(".k-band-far>g"), [[250, 470, 300, 22], [930, 506, 320, 24]]);
  fuji(q(".k-fuji"));
  mist(q(".k-band-m1>g"), [[300, 566, 380, 30], [900, 612, 400, 32]]);
  mist(q(".k-band-m2>g"), [[240, 696, 420, 36], [980, 706, 440, 38]]);
  const groups = {
    l: [[200, 320, 520, 230], [150, 540, 480, 200], [340, 450, 420, 190]],
    r: [[1000, 320, 520, 230], [1060, 540, 480, 200], [860, 450, 440, 200]],
    t: [[600, 130, 700, 230], [240, 120, 420, 170], [960, 110, 430, 170]],
    b: [[600, 720, 760, 230], [180, 700, 420, 190], [1030, 710, 430, 190]],
    c: [[600, 430, 520, 240], [500, 370, 360, 170], [710, 480, 380, 180]],
  };
  let sd = 30;
  for (const k in groups) groups[k].forEach(c => cloud(q(".k-puff-" + k), c[0], c[1], c[2], c[3], sd += 7));
}
