import { clearCss } from "./state.js";

// 墨 / 和紙 / 藍染 / 桜
const themes = ["sumi", "washi", "ai", "sakura"];
let ti = 0;

function apply() {
  document.documentElement.dataset.theme = themes[ti];
  clearCss();
  try { localStorage.setItem("nippon-theme", themes[ti]); } catch (e) {}
}

export function initTheme() {
  try { ti = Math.max(0, themes.indexOf(localStorage.getItem("nippon-theme"))); } catch (e) {}
  apply();
}

export function cycleTheme() {
  ti = (ti + 1) % themes.length;
  apply();
}
