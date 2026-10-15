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

  const ready = layerize(el.querySelector("svg"));
  const scale = () => el.style.setProperty("--ks", Math.max(innerWidth / 1200, innerHeight / 800).toFixed(4));
  scale();
  addEventListener("resize", scale);
  html.classList.add("kake-on", "kake-cover");     // kake-cover: 紙が全面を覆っている（裏の canvas は描かない）
  let done = false, auto = 0;
  const finish = () => {
    if (done) return;
    done = true;
    clearTimeout(auto);
    html.classList.remove("kake-cover");
    flyBirds();
    el.classList.add("out");                       // 雲と題が溶け、本が現れる（景色は背景に残る）
    setTimeout(() => { el.remove(); html.classList.remove("kake-on"); }, 2300);
  };
  // 画像ができてから動かしはじめる（遅くとも 1.5 秒で始める）
  Promise.race([ready, new Promise(r => setTimeout(r, 1500))]).then(() => {
    if (done) return;
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("go")));
    auto = setTimeout(finish, 8200);
  });
  el.addEventListener("click", finish);
  addEventListener("keydown", e => { if (!done && (e.key === "Escape" || e.key === "Enter" || e.key === " ")) { e.preventDefault(); finish(); } }, true);
}

// 動く部分を、それぞれ別のレイヤーへ移す。
// フィルター（ぼかし・歪み・紙の目）の付いたレイヤーは、はじめに一度だけ画像（SVG の <img>）にする。
// iPhone の Safari は SVG のフィルターを CPU で描くため、生きた <svg> のまま動かすと、描き直しが追いつかず、表紙が出ないことがある。
// 画像にしておけば、動きは位置と透明度だけになり、描き直しは起きない。
// 中で動くもの（行列の足踏み、水引の線）は、フィルターを持たないので、<svg> のまま残す。
function layerize(base) {
  if (!base) return Promise.resolve();
  const NS = "http://www.w3.org/2000/svg";
  const vb = base.getAttribute("viewBox"), par = base.getAttribute("preserveAspectRatio");
  const cs = getComputedStyle(document.documentElement);
  const tovar = str => str.replace(/var\((--[\w-]+)\)/g, (_, v) => cs.getPropertyValue(v).trim());
  const live = (cls, node) => {
    const s = document.createElementNS(NS, "svg");
    s.setAttribute("viewBox", vb); s.setAttribute("preserveAspectRatio", par); s.setAttribute("focusable", "false");
    s.setAttribute("class", "k-layer " + cls);
    s.append(node);
    return s;
  };
  // 参照している <filter> や <linearGradient> を、入れ子の参照もたどって集める
  const defsFor = node => {
    const ids = new Set(), out = [];
    const scan = el => {
      const html = el.outerHTML;
      for (const [, id] of html.matchAll(/url\(#([\w-]+)\)/g)) {
        if (ids.has(id)) continue;
        ids.add(id);
        const d = document.getElementById(id);
        if (d) { out.push(d.outerHTML); scan(d); }
      }
    };
    scan(node);
    return out.join("");
  };
  const raster = (cls, node) => {
    const img = new Image();
    img.className = "k-layer " + cls;
    img.alt = "";
    img.decoding = "async";
    const src = `<svg xmlns="${NS}" viewBox="${vb}" preserveAspectRatio="${par}" width="1200" height="800"><defs>${defsFor(node)}</defs>${node.outerHTML}</svg>`;
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(tovar(src));
    return img;
  };

  const order = [".k-sun", ".k-band-far", ".k-fuji", ".k-parade-place", ".k-band-m1", ".k-band-m2", ".k-puff-l", ".k-puff-r", ".k-puff-t", ".k-puff-b", ".k-puff-c"];
  const layers = [];
  for (const sel of order) {
    const g = base.querySelector(sel);
    if (!g) continue;
    const cls = g.getAttribute("class") || "";
    g.removeAttribute("class");                       // 動きはレイヤー側に付ける
    if (sel === ".k-parade-place") { layers.push(live("k-parade-layer", g)); continue; }
    g.remove();
    layers.push(raster(cls, g));
  }
  // 紙の目: 全面のノイズを一枚の画像に（乗算はやめ、薄い墨色を重ねるだけにする）
  const fiber = base.querySelector(':scope > rect[filter]');
  if (fiber) { fiber.remove(); fiber.removeAttribute("style"); layers.push(raster("k-fiber-layer", fiber)); }
  const mizu = base.querySelector(".k-mizu");
  if (mizu) layers.push(live("k-mizu-layer", mizu));
  base.after(...layers);

  // 消えきった雲は、レイヤーごと外す（メモリを返す）
  layers.forEach(l => { if (/k-puff/.test(l.className.baseVal ?? l.className)) l.addEventListener("animationend", () => l.remove(), { once: true }); });

  const imgs = layers.filter(l => l instanceof HTMLImageElement);
  return Promise.all(imgs.map(i => i.decode().catch(() => {})));
}
