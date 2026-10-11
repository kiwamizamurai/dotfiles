// 掛け紙: 一度だけ、雲の間から富士が現れる。クリック・Esc・「はじめる」で飛ばせる。
// 景色（空・日・富士・霞）は、紙が消えたあとも背景（#sansui）に残る。
// 動きを減らす設定のとき、または特定の頁へ直接来たときは、掛け紙は出さず、背景だけ置く。
import { paintScene } from "./sumie.js";
import { paintParade, flyBirds } from "./animals.js";

export function initKake() {
  const el = document.getElementById("kake");
  const bg = document.getElementById("sansui");
  const html = document.documentElement;

  // 背景: 掛け紙の景色を筆で描いてから複製し、雲と水引だけ外す
  if (el && bg) {
    const src = el.querySelector("svg");
    if (src) {
      paintScene(src);
      paintParade(src);
      const c = src.cloneNode(true);
      c.querySelectorAll(".k-puff,.k-mizu,.k-parade-place").forEach(n => n.remove());
      bg.append(c);
    }
    // ポインタに合わせて、背景がわずかに動く（奥行き）
    addEventListener("pointermove", e => {
      bg.style.setProperty("--px", (e.clientX / innerWidth - .5).toFixed(3));
      bg.style.setProperty("--py", (e.clientY / innerHeight - .5).toFixed(3));
    }, { passive: true });
  }
  if (!el) return;

  const deep = location.hash && location.hash !== "#hyoshi";
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || deep) { el.remove(); return; }

  html.classList.add("kake-on");
  let done = false, auto = 0;
  const finish = () => {
    if (done) return;
    done = true;
    clearTimeout(auto);
    flyBirds();
    el.classList.add("out");                       // 雲と題が溶け、本が現れる（景色は背景に残る）
    setTimeout(() => { el.remove(); html.classList.remove("kake-on"); }, 2300);
  };
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("go")));
  auto = setTimeout(finish, 8200);
  el.addEventListener("click", finish);
  addEventListener("keydown", e => { if (!done && (e.key === "Escape" || e.key === "Enter" || e.key === " ")) { e.preventDefault(); finish(); } }, true);
}
