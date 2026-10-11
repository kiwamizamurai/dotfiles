// かな鍵盤 + two procedural hands + red threads (水引) from fingertips to keys
import { $, css, S } from "./state.js";

const rows = [
  "あ い う え お か き く け こ",
  "さ し す せ そ た ち つ て と",
  "な に ぬ ね の は ひ ふ へ ほ",
  "ま み む め も や ゆ よ ら り る れ ろ わ を ん",
];
const keyMap = {};
const kanaKeys = [];

export function initDeck() {
  const keysEl = $("#keys");
  rows.forEach(r => {
    const d = document.createElement("div");
    r.split(" ").forEach(k => {
      const s = document.createElement("span");
      s.textContent = k;
      d.append(s, " ");
      keyMap[k] = s;
      kanaKeys.push(s);
    });
    keysEl.append(d);
  });
  fitDeck();
}

// scale the 640px-wide deck down on narrow screens
export function fitDeck() {
  document.documentElement.style.setProperty("--s", Math.min(1, (innerWidth - 24) / 660).toFixed(3));
}

// a finger that has just reached for a key: { hand -> { fingertip -> { el, until } } }
const reach = [{}, {}];
const TIPS = [4, 8, 12, 16, 20];
const HOME = [["さ", "し", "す", "せ", "そ"], ["た", "ち", "つ", "て", "と"]]; // left / right hand, left→right
const lastTips = [[], []];

// centre of a key in hands-canvas coordinates
function keyPos(el) {
  const d = $("#deck");
  return [(el.offsetLeft + el.offsetWidth / 2) * hc.width / d.clientWidth,
          (el.offsetTop + el.offsetHeight / 2) * hc.height / d.clientHeight];
}

// any character lands on a key: kana on their own key, everything else on a key chosen from its code
function keyFor(ch) {
  return keyMap[ch] || kanaKeys[ch.codePointAt(0) % kanaKeys.length];
}

export function press(ch) {
  const s = keyFor(ch);
  if (!s) return;
  s.classList.add("p");
  setTimeout(() => s.classList.remove("p"), 180);
  const [kx] = keyPos(s), h = kx < hc.width / 2 ? 0 : 1;
  const tip = lastTips[h].reduce((a, b) => (Math.abs(b[0] - kx) < Math.abs(a[0] - kx) ? b : a), lastTips[h][0]);
  if (tip) reach[h][tip[2]] = { el: s, until: performance.now() + 280 };
}

const hc = $("#hands"), hx = hc.getContext("2d");
// 21-landmark hand (wrist, thumb×4, four fingers×4) in a unit box
const base = [[.5,1],[.30,.80],[.20,.64],[.14,.52],[.10,.42],[.38,.52],[.38,.34],[.38,.22],[.38,.12],[.5,.50],[.5,.30],[.5,.17],[.5,.06],[.62,.52],[.62,.34],[.62,.23],[.62,.14],[.74,.56],[.74,.42],[.74,.33],[.74,.26]];
const bones = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[17,18],[18,19],[19,20],[0,17]];
const FONT = "20px 'Shippori Mincho',serif";

export function drawHands(t) {
  hx.clearRect(0, 0, hc.width, hc.height);
  const mid = css("--mid"), dim = css("--dim"), hot = css("--hot");
  [[300, 0], [760, 1]].forEach(([ox, h]) => {
    const W = 190, H = 290, oy = 150;
    hx.strokeStyle = dim; hx.lineWidth = 1.4; hx.strokeRect(ox, oy - 8, W + 40, H);
    const pts = base.map((p, i) => {
      const f = i > 4 ? Math.floor((i - 5) / 4) : -1, tip = i > 4 ? ((i - 5) % 4) / 3 : 0;
      const wave = Math.sin(t * .0021 + h * 2 + f * 1.3) * (.02 + S.typingBoost * .05) * tip
                 + (Math.sin(t * .011 * (1 + f * .3) + h) > .9 ? S.typingBoost * .08 * tip : 0);
      return [ox + 20 + (h ? 1 - p[0] : p[0]) * W,
              oy + (p[1] + wave + (1 - p[1]) * .02 * Math.sin(t * .001 + h)) * (H - 30)];
    });
    // threads from every fingertip to its key: faint at home, red when a key was just pressed
    const tips = TIPS.map(i => [pts[i][0], pts[i][1], i]).sort((a, b) => a[0] - b[0]);
    lastTips[h] = tips;
    const now = performance.now();
    tips.forEach(([x, y, id], n) => {
      const r = reach[h][id], active = r && r.until > now;
      const el = active ? r.el : keyMap[HOME[h][n]];
      if (!el) return;
      const [kx, ky] = keyPos(el);
      hx.strokeStyle = active ? hot : dim; hx.lineWidth = active ? 1.8 : 1;
      hx.globalAlpha = active ? .95 : .55;
      hx.beginPath(); hx.moveTo(x, y);
      hx.quadraticCurveTo((x + kx) / 2 + Math.sin(t * .003 + n) * 4, (y + ky) / 2, kx, ky);
      hx.stroke();
      if (active) { hx.fillStyle = hot; hx.fillRect(kx - 3, ky - 3, 6, 6); }
      hx.globalAlpha = 1;
    });
    hx.strokeStyle = mid; hx.lineWidth = 1.2; hx.beginPath();
    bones.forEach(([a, b]) => { hx.moveTo(...pts[a]); hx.lineTo(...pts[b]); });
    hx.stroke();
    hx.fillStyle = mid; pts.forEach(p => hx.fillRect(p[0] - 2.5, p[1] - 2.5, 5, 5));
    hx.font = FONT;
    hx.fillText(`${h ? "右手" : "左手"}  ${(.42 + .1 * Math.sin(t * .0007 + h * 3)).toFixed(3)}`, h ? ox + 60 : ox - 250, oy + 55);
  });
  if (S.advanced) { // pointer tracker: a small mouse outline with live coordinates
    const mx = 1060, my = 170;
    hx.strokeStyle = dim; hx.lineWidth = 1.4; hx.beginPath(); hx.roundRect(mx, my, 90, 150, 45); hx.stroke();
    hx.beginPath(); hx.moveTo(mx + 45, my + 24); hx.lineTo(mx + 45, my + 54); hx.stroke();
    hx.fillStyle = hot;
    hx.fillRect(mx + 36 + (S.mouse.x / innerWidth - .5) * 8, my + 60 + (S.mouse.y / innerHeight - .5) * 8, 18, 18);
    hx.fillStyle = mid; hx.font = FONT;
    hx.fillText(`指  ${(S.mouse.x / innerWidth).toFixed(3)}`, mx - 40, my - 14);
    hx.fillText(`    ${(S.mouse.y / innerHeight).toFixed(3)}`, mx - 40, my + 8);
  }
}
