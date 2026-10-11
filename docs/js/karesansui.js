// 枯山水: raked sand lines that rise around three stones, and ink-brush twigs that grow on the stones
import { $, css, S, kanji } from "./state.js";

const rc = $("#ridge"), rx = rc.getContext("2d");
let heights = null, mask = null;
export const growth = { segs: [], tips: 0, junc: 0 };

// seeded random walk that stays inside the stones
function growBranches() {
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const inside = (x, y) => x >= 0 && y >= 0 && x < mask.w && y < mask.h && mask.d[((y | 0) * mask.w + (x | 0)) * 4] > 140;
  const segs = [];
  let tips = 0, junc = 0;
  // one root at the foot of every stone; they take turns so the whole garden fills evenly
  const queue = mask.roots.map(([x, y]) => ({ x, y, a: -Math.PI / 2, a0: -Math.PI / 2, t: 0, gen: 0 }));
  const STEP = 3, TURNS = [.5, -.5, 1, -1, 1.6, -1.6, 2.4, -2.4];
  while (queue.length && segs.length < 1500) {
    let { x, y, a, a0, t, gen } = queue.shift();
    const len = 30 + Math.floor(rnd() * 40);
    for (let i = 0; i < len; i++) {
      a += (rnd() - .5) * .34 + (a0 - a) * .12;
      let nx = x + Math.cos(a) * STEP, ny = y + Math.sin(a) * STEP;
      if (!inside(nx, ny)) { // blocked by the stone's edge: adopt the first free turn
        let ok = false;
        for (const d of TURNS) {
          const b = a0 + d * (rnd() < .5 ? 1 : -1) * .6;
          nx = x + Math.cos(b) * STEP; ny = y + Math.sin(b) * STEP;
          if (inside(nx, ny)) { a = a0 = b; ok = true; break; }
        }
        if (!ok) break;
      }
      segs.push({ x1: x, y1: y, x2: nx, y2: ny, t: t++, w: Math.max(.5, 2.8 - gen * .5) });
      x = nx; y = ny;
      if (rnd() < .06 && gen < 6 && queue.length < 90) {
        junc++;
        const b = a + (rnd() < .5 ? -1 : 1) * (.5 + rnd() * .8);
        queue.push({ x, y, a: b, a0: b, t, gen: gen + 1 });
      }
    }
    tips++;
  }
  const mx = Math.max(1, ...segs.map(s => s.t));
  segs.forEach(s => (s.k = s.t / mx));
  Object.assign(growth, { segs, tips, junc });
}

function build() {
  const w = 300, h = 200, o = document.createElement("canvas");
  o.width = w; o.height = h;
  const c = o.getContext("2d");
  c.fillStyle = "#000"; c.fillRect(0, 0, w, h);
  c.fillStyle = "#fff";
  // three stones: large, medium, small
  [[100, 125, 74, 44], [212, 108, 52, 38], [160, 170, 34, 20]].forEach(([x, y, a, b]) => {
    c.beginPath(); c.ellipse(x, y, a, b, -.08, 0, Math.PI * 2); c.fill();
  });
  const d = c.getImageData(0, 0, w, h).data, rowsN = 54, cols = 140;
  mask = { d, w, h, roots: [[100, 158], [212, 138], [160, 184]] };
  growBranches();
  heights = [];
  for (let r = 0; r < rowsN; r++) {
    const y = Math.floor(10 + (h - 20) * r / (rowsN - 1)), row = [];
    for (let i = 0; i < cols; i++) {
      let s = 0;
      const x0 = Math.floor(i / cols * w);
      for (let k = -4; k <= 4; k++) s += d[(y * w + Math.min(w - 1, Math.max(0, x0 + k))) * 4];
      row.push(s / 9 / 255);
    }
    heights.push(row);
  }
}

export function drawGarden() {
  if (!heights) build();
  const dpr = devicePixelRatio, W = rc.clientWidth, H = rc.clientHeight;
  if (!W || !H) return;
  if (rc.width !== Math.round(W * dpr)) { rc.width = Math.round(W * dpr); rc.height = Math.round(H * dpr); }
  rx.setTransform(dpr, 0, 0, dpr, 0, 0);
  rx.clearRect(0, 0, W, H);

  const P = S.ridgeP, rowsN = heights.length, cols = heights[0].length;
  const amp = H * .12 * P, stepY = (H - amp - 10) / rowsN;
  const mid = css("--mid"), ink = css("--ink"), bg = css("--bg"), accent = css("--accent"), hot = css("--hot");
  const line = (r, base) => {
    rx.beginPath();
    for (let i = 0; i < cols; i++) {
      const x = i / (cols - 1) * W;
      // gentle rake waves in the sand, steeper over the stones
      const y = base - heights[r][i] * amp * (1 + Math.sin(r * .7 + i * .1) * .04) + Math.sin(i * .09 + r * .35) * 1.1 * (1 - heights[r][i]);
      i ? rx.lineTo(x, y) : rx.moveTo(x, y);
    }
  };

  rx.lineWidth = 1.1;
  for (let r = 0; r < rowsN; r++) {
    const base = amp + 8 + r * stepY;
    line(r, base); rx.strokeStyle = mid; rx.globalAlpha = .75; rx.stroke(); rx.globalAlpha = 1;
    rx.lineTo(W, H); rx.lineTo(0, H); rx.closePath();
    rx.fillStyle = bg; rx.globalAlpha = .94; rx.fill(); rx.globalAlpha = 1;
    line(r, base); rx.strokeStyle = ink; rx.globalAlpha = .45 + .55 * r / rowsN; rx.stroke(); rx.globalAlpha = 1;
  }

  // ink-brush twigs growing over the stones
  const top = amp + 8, hh = H - top - 6;
  rx.strokeStyle = accent; rx.lineCap = "round";
  for (const s of growth.segs) {
    if (s.k > P) continue;
    rx.lineWidth = s.w;
    rx.beginPath();
    rx.moveTo(s.x1 / mask.w * W, top + (s.y1 - 10) / (mask.h - 20) * hh);
    rx.lineTo(s.x2 / mask.w * W, top + (s.y2 - 10) / (mask.h - 20) * hh);
    rx.stroke();
  }
  rx.lineCap = "butt";

  // section A–A cut line + labels
  const sy = H * .5;
  rx.setLineDash([14, 4, 2, 4]); rx.strokeStyle = hot;
  rx.beginPath(); rx.moveTo(0, sy); rx.lineTo(W, sy); rx.stroke(); rx.setLineDash([]);
  rx.font = "12px 'Shippori Mincho',serif";
  rx.fillStyle = hot; rx.fillText("A", 2, sy - 10); rx.fillText("A", W - 12, sy - 10);
  rx.fillStyle = mid;
  rx.fillText("頂 ・ 十三段", W * .28, H * .82);
  rx.fillText("根が運ぶ ・ " + kanji(growth.segs.length * P / 8), W * .24, H * .97);

  // side panel profile of the cut row
  const row = heights[Math.floor(rowsN * .5)];
  $("#prof").setAttribute("d", `M0,80 L${row.map((v, i) => `${i / (cols - 1) * 290},${74 - v * 58}`).join(" L")} L290,80 Z`);
}
