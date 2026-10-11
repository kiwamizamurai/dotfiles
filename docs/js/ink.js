// ink splash down the left edge: a wobbling stem with side shoots and droplets
import { $, css, S } from "./state.js";

const ink = $("#ink"), ctx = ink.getContext("2d");
let shapes = null;

function build() {
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const H = ink.clientHeight || 500;
  shapes = Array.from({ length: 7 }, (_, i) => {
    const y = H * (.05 + i * .14) + rnd() * 20, len = 26 + rnd() * 30;
    return {
      y, len, w: 3 + rnd() * 5,
      dots: Array.from({ length: 14 }, () => ({ a: rnd() * Math.PI * 2, r: rnd() * len * 1.2, s: .8 + rnd() * 2.2 })),
      shoots: Array.from({ length: 5 }, () => ({ dy: (rnd() - .5) * 36, l: len * (.3 + rnd() * .7), a: (rnd() - .5) * .9 })),
    };
  });
}

export function drawInk() {
  const dpr = devicePixelRatio, W = ink.clientWidth, H = ink.clientHeight;
  if (!W || !H) return;
  if (ink.width !== Math.round(W * dpr) || ink.height !== Math.round(H * dpr)) {
    ink.width = Math.round(W * dpr); ink.height = Math.round(H * dpr); shapes = null;
  }
  if (!shapes) build();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

  const c = css("--accent"), sx = W * .395, reach = H * S.inkP;
  ctx.fillStyle = c; ctx.strokeStyle = c; ctx.lineCap = "round";
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(sx, 0);
  for (let y = 0; y <= reach; y += 6) ctx.lineTo(sx + Math.sin(y * .045) * 5, y);
  ctx.stroke();

  for (const s of shapes) {
    if (s.y > reach) continue;
    const k = Math.min(1, (reach - s.y) / 60);
    for (const o of s.shoots) { // left shoots
      const dir = o.a < 0 ? -1 : 1;
      ctx.lineWidth = s.w * .55 * k;
      ctx.beginPath(); ctx.moveTo(sx, s.y + o.dy);
      ctx.quadraticCurveTo(sx - dir * o.l * .5 * k, s.y + o.dy - 8, sx - dir * o.l * k, s.y + o.dy + o.a * 40 * k);
      ctx.stroke();
    }
    for (const o of s.shoots) { // short right shoots
      ctx.lineWidth = s.w * .45 * k;
      ctx.beginPath(); ctx.moveTo(sx, s.y + o.dy); ctx.lineTo(sx + o.l * .5 * k, s.y + o.dy + o.a * 30 * k); ctx.stroke();
    }
    ctx.beginPath(); ctx.ellipse(sx, s.y, s.w * 1.6 * k, s.w * 2.6 * k, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = .7 * k;
    for (const d of s.dots) {
      ctx.beginPath();
      ctx.arc(sx - Math.abs(Math.cos(d.a)) * d.r * k - 6, s.y + Math.sin(d.a) * d.r * .5 * k, d.s * k, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}
