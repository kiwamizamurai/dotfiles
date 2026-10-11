// shared helpers + the one mutable state object every module reads
export const $ = s => document.querySelector(s);
export const $$ = s => [...document.querySelectorAll(s)];

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
export const sleep = ms => new Promise(r => setTimeout(r, reduce ? Math.min(ms, 30) : ms));

// CSS custom property lookup, cached until the theme changes
const cache = new Map();
export const css = n => {
  let v = cache.get(n);
  if (v === undefined) {
    v = getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    cache.set(n, v);
  }
  return v;
};
export const clearCss = () => cache.clear();

export const HINT = "↑↓ 選ぶ ・ ←→ 写 ・ ↵ 入る ・ : 命令";
export const isWide = () => matchMedia("(min-width:701px)").matches;

// 漢数字: 2216 → 二千二百十六, 30470 → 三万四百七十
const D = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
function below10k(n) {
  let out = "";
  [[1000, "千"], [100, "百"], [10, "十"]].forEach(([u, ch]) => {
    const d = Math.floor(n / u) % 10;
    if (d) out += (d === 1 ? "" : D[d]) + ch;
  });
  const one = n % 10;
  return out + (one ? D[one] : "");
}
export function kanji(n) {
  n = Math.max(0, Math.round(n));
  if (n === 0) return "〇";
  const man = Math.floor(n / 10000), rest = n % 10000;
  return (man ? below10k(man) + "万" : "") + (rest ? below10k(rest) : "");
}
export const num = kanji;

export const S = {
  advanced: false,   // false = 序, true = 本編
  alive: true,       // intro script still running
  eyeOn: false,
  typingBoost: 0,    // 0..1, makes the hand skeletons twitch
  ridgeP: 0,         // sand garden growth progress 0..1
  inkP: 0,           // ink splash progress 0..1
  mouse: { x: innerWidth * .7, y: innerHeight * .5 },
};
addEventListener("pointermove", e => { S.mouse.x = e.clientX; S.mouse.y = e.clientY; });
