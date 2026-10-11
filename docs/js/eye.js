// 面: a mask made of characters whose pupil follows the pointer, plus the red thread to the pointer
import { $, css, S } from "./state.js";

const eye = $("#eye"), ex = eye.getContext("2d");
const lc = $("#line"), lx = lc.getContext("2d");
let eyeA = 0, target = { x: 0, y: 0 };

const phrases = [
  "机の上を整える道具は束ねてひとつの庭にする",
  "設定は束にする結び目をひとつずつ",
  "一行ですべてが入る手になじむまで足していく",
  "同じ手順で何度でも元に戻せる",
  "書いて試してまた書きなおす",
  "小さな手入れの積み重ねが机の気配をつくる",
  "stow brew nvim wezterm zsh starship atuin",
  "余白は足さない迷わないという優しさ",
  "道具は自分で整える",
  "静かに結び静かにほどく",
];
const rows = Array.from({ length: 20 }, (_, i) => phrases[(i * 7) % phrases.length]);

export function placeEye() {
  if (S.advanced) { // lives in the pane's right-hand zone, beside the frame
    const t = $(".term").getBoundingClientRect();
    const frameRight = t.right - Math.min(231, Math.max(170, t.width * .29));
    const w = Math.max(0, Math.min(190, innerWidth - frameRight - 16));
    eye.style.width = w + "px";
    eye.style.height = w / 2 + "px";
    eye.style.left = frameRight + 8 + "px";
    eye.style.top = "117px";
  } else {
    const w = Math.min(520, innerWidth - 24);
    eye.style.width = w + "px";
    eye.style.height = w / 2 + "px";
    eye.style.left = Math.max(0, (innerWidth - w) / 2 - innerWidth * .04) + "px";
    eye.style.top = Math.max(60, Math.round(innerHeight * .12)) + "px";
  }
}

export function fitLine() {
  lc.width = innerWidth * devicePixelRatio;
  lc.height = innerHeight * devicePixelRatio;
  lx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}

export function drawEye(t) {
  ex.clearRect(0, 0, eye.width, eye.height);
  eyeA += ((S.eyeOn || S.advanced ? 1 : 0) - eyeA) * .04;
  const ro = $("#ro");
  if (eyeA < .01) { ro.style.opacity = 0; return; }

  // intro: a roundish mask; main: a wide flat eye
  const W = eye.width, H = eye.height, cx = W / 2, cy = H / 2;
  const rx = S.advanced ? W / 2 - 6 : 100, ry = S.advanced ? H / 2 - 26 : 108;
  const r = eye.getBoundingClientRect(), k = (r.width / W) || 1;
  const dx = S.mouse.x - (r.left + cx * k), dy = S.mouse.y - (r.top + cy * k), d = Math.hypot(dx, dy) || 1;
  const px = cx + dx / d * Math.min(44, d * .12 / k), py = cy + dy / d * Math.min(20, d * .08 / k);
  const ink = css("--ink"), hot = css("--hot");

  ex.save();
  ex.beginPath(); ex.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ex.clip();
  ex.font = "11px 'Shippori Mincho',serif"; ex.textAlign = "center"; ex.fillStyle = ink;
  rows.forEach((s, i) => {
    const y = cy - ry + i * 12.4 + 8;
    for (let seg = 0; seg < 2; seg++) {
      const x = cx + (seg ? 1 : -1) * rx * .46 + Math.sin(t * .0004 + i) * 6;
      ex.globalAlpha = eyeA * Math.max(.12, Math.min(1, 1.25 - Math.hypot(x - px, y - py) / 150));
      ex.fillText(s.slice(seg * 8, seg * 8 + 9), x, y);
    }
  });
  ex.restore();

  ex.globalAlpha = eyeA; ex.strokeStyle = hot; ex.fillStyle = hot; ex.lineWidth = 1;
  ex.strokeRect(px - 22, py - 12, 44, 24); ex.fillRect(px - 14, py - 4, 28, 8);
  ex.globalAlpha = 1;

  ro.style.opacity = eyeA * .85;
  if (S.advanced) { // readout sits under the eye, small
    ro.style.fontSize = "10px";
    ro.style.left = r.left + "px";
    ro.style.top = r.bottom + 6 + "px";
  } else {
    ro.style.fontSize = "";
    ro.style.left = r.left + 30 * k + "px";
    ro.style.top = r.top + (cy - 34) * k + "px";
  }
  ro.textContent = `瞳  ${(.27 + dx / d * .01).toFixed(3)}\n    ${(.42 + dy / 9999).toFixed(3)}\n    ${(.0196).toFixed(3)}\n    無`;
  target = { x: r.left + px * k, y: r.top + py * k };
}

// the red thread from the mask to the pointer
export function drawLine() {
  lx.clearRect(0, 0, innerWidth, innerHeight);
  if (eyeA < .05) return;
  lx.strokeStyle = css("--hot"); lx.globalAlpha = eyeA * .8; lx.lineWidth = 1;
  lx.setLineDash([2, 4]);
  lx.beginPath(); lx.moveTo(target.x, target.y); lx.lineTo(S.mouse.x, S.mouse.y); lx.stroke();
  lx.setLineDash([]);
  lx.strokeRect(S.mouse.x - 3, S.mouse.y - 3, 14, 10);
  lx.globalAlpha = 1;
}
