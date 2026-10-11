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

  layerize(el.querySelector("svg"));
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

// 動く部分を、それぞれ別の <svg>（別レイヤー）へ移す。
// 一つの <svg> の中で動かすと、毎フレーム、全体（歪み・ぼかしのフィルター込み）を描き直すため、とても重い。
// 動きは <svg> 要素そのものに付けるので、描き直さずに、位置と透明度だけで動く。
function layerize(base) {
  if (!base) return;
  const NS = "http://www.w3.org/2000/svg";
  const make = (cls, ...nodes) => {
    const s = document.createElementNS(NS, "svg");
    for (const a of ["viewBox", "preserveAspectRatio", "focusable"]) if (base.hasAttribute(a)) s.setAttribute(a, base.getAttribute(a));
    s.setAttribute("class", "k-layer " + cls);
    nodes.forEach(n => n && s.append(n));
    return s;
  };
  const order = [".k-sun", ".k-band-far", ".k-fuji", ".k-parade-place", ".k-band-m1", ".k-band-m2", ".k-puff-l", ".k-puff-r", ".k-puff-t", ".k-puff-b", ".k-puff-c"];
  const layers = [];
  for (const sel of order) {
    const g = base.querySelector(sel);
    if (!g) continue;
    const cls = g.getAttribute("class") || "";
    g.removeAttribute("class");                       // 動きは <svg> 側に付ける
    layers.push(make(cls.replace("k-parade-place", "k-parade-layer"), g));
  }
  const fiber = base.querySelector(':scope > rect[filter]');
  const mizu = base.querySelector(".k-mizu");
  layers.push(make("k-fiber-layer", fiber), make("k-mizu-layer", mizu));
  base.after(...layers);
}
