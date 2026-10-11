// 下の柱: 場面ごとの数、漢数字のカウントアップ、数の写し、訪れの棒
import { $, $$, kanji } from "./state.js";
const easeOut = p => 1 - Math.pow(1 - p, 3);

function tween(el, to, ms) {
  const t0 = performance.now();
  (function f(n) {
    const p = Math.min(1, (n - t0) / ms);
    el.textContent = kanji(to * easeOut(p));
    if (p < 1) requestAnimationFrame(f);
  })(t0);
}

// 虫 / 目 / 霊 は、どの場面でも柱の末尾に並ぶ
const WORM = ["眠る", "身じろぐ", "這う"], EYE = ["凝らす", "見回す", "瞬く", "追う"], GHOST = ["打つ", "待つ", "眺める"];
export const stateCols = () => [
  { label: "虫", st: WORM, x: 1 }, { label: "目", st: EYE, x: 1 }, { label: "霊", st: GHOST, x: 1 },
];

export function setCols(cols, ms = 800) {
  $("#cols").innerHTML = cols.map(c =>
    `<p class="col${c.x ? " x" : ""}"><span class="label">${c.label}</span>` +
    `<span class="value${c.hot ? " hot" : ""}"${c.st ? ` data-st="${c.st.join("|")}"` : ""}>${c.st ? c.st[0] : "〇"}</span></p>`).join("");
  $$("#cols .value").forEach((el, i) => { if (cols[i].to != null) tween(el, cols[i].to, ms); });
}

// 縮尺の箱の中: 七つの束を、小さな札として並べる
export function initFamily() {
  const names = ["nv", "wz", "zs", "st", "at", "oc", "gh"];
  $("#fam").innerHTML = names.map((n, i) =>
    `<g transform="translate(${28 + i * 36},18)"><rect width="28" height="24" rx="2"/><text x="14" y="16" text-anchor="middle" font-size="10" fill="currentColor" stroke="none">${n}</text></g>`).join("");
}

export function countUp() {
  // 虫・目・霊は、いくつかの状態をゆっくり行き来する
  setInterval(() => $$("[data-st]").forEach(el => {
    if (Math.random() < .4) { const a = el.dataset.st.split("|"); el.textContent = a[Math.floor(Math.random() * a.length)]; }
  }), 2200);
}

// p = 庭の育ち 0..1。右の「数の写し」は dotfiles の実際の数に向かって増える
export const FACTS = { packages: 7, tools: 78, apps: 41, fonts: 5, files: 35, stars: 2 };
export function updateNumbers(p) {
  $("#n1").textContent = kanji(FACTS.packages * p);
  $("#n2").textContent = kanji(FACTS.tools * p);
  $("#n3").textContent = kanji(FACTS.apps * p);
  $("#n4").textContent = kanji(FACTS.fonts * p);
  $("#gr").textContent = kanji(FACTS.files * p);
  $("#rc").textContent = kanji(FACTS.stars * p);
}
