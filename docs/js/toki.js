// 刻: 時刻で紙と墨の色が変わる。朝・昼・夕・夜。ボタンで手動の切り替えもできる。
const NAMES = { asa: "朝", hiru: "昼", yuu: "夕", yoru: "夜" };
const ORDER = ["asa", "hiru", "yuu", "yoru"];
const KEY = "washo-toki";

function byClock(d = new Date()) {
  const h = d.getHours();
  return h >= 5 && h < 9 ? "asa" : h >= 9 && h < 16 ? "hiru" : h >= 16 && h < 19 ? "yuu" : "yoru";
}

function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
function write(v) { try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY); } catch (e) {} }

function apply(t) {
  document.documentElement.dataset.toki = t;
  const el = document.getElementById("toki-name");
  if (el) el.textContent = NAMES[t];
  document.dispatchEvent(new CustomEvent("toki", { detail: t }));
}

export function initToki() {
  const saved = read();
  apply(ORDER.includes(saved) ? saved : byClock());
  // 手動で選んでいなければ、時が進むにつれて自然に移ろう
  setInterval(() => { if (!ORDER.includes(read())) apply(byClock()); }, 5 * 60 * 1000);
  const btn = document.getElementById("toki");
  if (btn) btn.addEventListener("click", () => {
    const cur = document.documentElement.dataset.toki;
    const next = ORDER[(ORDER.indexOf(cur) + 1) % ORDER.length];
    write(next);
    apply(next);
  });
}
