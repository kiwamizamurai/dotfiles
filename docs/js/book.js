// 頁めくり。右綴じの本なので、「次へ」は左の頁を右へめくる。
// s = めくり終えた紙の枚数。見開きは「右＝s-1 枚目の裏、左＝s 枚目の表」。
const html = document.documentElement;
const book = document.getElementById("book");
const sheets = [...book.querySelectorAll(".sheet")];
const N = sheets.length;
const tabs = [...document.querySelectorAll("#tabs a")];
const countEl = document.getElementById("count");
const nextBtn = document.getElementById("next"), prevBtn = document.getElementById("prev");
const MQ = matchMedia("(min-width:960px) and (min-height:620px)");
const DUR = 1100;

let s = 0, wide = false, timer = 0;

// 漢数字（二十まで）
const K = n => n <= 10 ? "〇一二三四五六七八九十"[n] : n < 20 ? "十" + "〇一二三四五六七八九"[n - 10] : "二十" + (n % 10 ? "〇一二三四五六七八九"[n % 10] : "");

// id → その頁が見える見開き（s）
function spreadOf(id) {
  const el = document.getElementById(id);
  const face = el && el.closest(".face");
  if (!face) return null;
  const k = +face.parentElement.dataset.i;
  return k + (face.classList.contains("back") ? 1 : 0);
}

function visibleFaces() {
  const out = [];
  if (s > 0) out.push(sheets[s - 1].querySelector(".face.back"));
  if (s < N) out.push(sheets[s].querySelector(".face.front"));
  return out;
}

function settle() {
  sheets.forEach((sh, i) => {
    sh.classList.remove("turning");
    sh.style.zIndex = i < s ? i + 1 : N - i;
  });
}

function paint(animate) {
  book.dataset.s = s;
  book.classList.toggle("at-end", s === N);
  book.classList.toggle("no-anim", !animate);
  sheets.forEach((sh, i) => {
    const flipped = wide && i < s;
    if (animate && wide && sh.classList.contains("flipped") !== flipped) {
      sh.classList.add("turning");
      sh.style.zIndex = 200 + (flipped ? i : N - i);
    }
    sh.classList.toggle("flipped", flipped);
  });
  clearTimeout(timer);
  timer = setTimeout(settle, animate ? DUR + 150 : 0);
  if (!animate) settle();

  // 見えている二頁に印をつける（結び図などの動きの合図）
  document.querySelectorAll(".face.is-open").forEach(f => f.classList.remove("is-open"));
  visibleFaces().forEach(f => f && f.classList.add("is-open"));

  // 栞と、下の表示
  let cur = -1;
  tabs.forEach((a, i) => { const t = spreadOf(a.hash.slice(1)); if (t != null && t <= s) cur = i; });
  tabs.forEach((a, i) => a.setAttribute("aria-current", i === cur ? "true" : "false"));
  countEl.textContent = s === 0 ? "表紙" : s === N ? "裏表紙" : `見開き ${K(s)}／${K(N - 1)}`;
  document.dispatchEvent(new CustomEvent("washo:spread", { detail: { s, N } }));   // 進み具合の動物へ
  nextBtn.disabled = s >= N;
  prevBtn.disabled = s <= 0;
}

export function go(target, animate = true) {
  target = Math.max(0, Math.min(N, target));
  if (!wide) { s = target; return; }
  // いくつも飛ぶときは、一枚ずつ少しずらしてめくる
  const from = s, step = target > from ? 1 : -1;
  s = target;
  if (animate && Math.abs(target - from) > 1) {
    sheets.forEach((sh, i) => {
      const moving = step > 0 ? (i >= from && i < target) : (i >= target && i < from);
      sh.style.transitionDelay = moving ? `${Math.abs(step > 0 ? i - from : from - 1 - i) * 90}ms` : "";
    });
    setTimeout(() => sheets.forEach(sh => (sh.style.transitionDelay = "")), DUR + 90 * Math.abs(target - from));
  }
  paint(animate);
}

function goToId(id, animate = true) {
  const t = spreadOf(id);
  if (t == null) return false;
  go(t, animate);
  return true;
}

function remember() {
  if (!wide) return;
  const face = s < N ? sheets[s].querySelector(".face.front") : sheets[N - 1].querySelector(".face.back");
  const el = face && face.firstElementChild;
  if (el && el.id) history.replaceState(null, "", "#" + el.id);
}
const next = () => { go(s + 1); remember(); };
const prev = () => { go(s - 1); remember(); };

function setMode() {
  const was = wide;
  wide = MQ.matches;
  html.classList.toggle("book-mode", wide);
  if (was !== wide || !book.dataset.s) paint(false);
}

export function initBook() {
  // 墨が流れる順番（列ごと、札ごと）を、CSS の変数に渡す
  book.querySelectorAll(".prose").forEach(pr => [...pr.children].forEach((p, i) => p.style.setProperty("--i", i)));
  book.querySelectorAll(".plates").forEach(pl => [...pl.children].forEach((f, i) => f.style.setProperty("--k", i)));
  setMode();
  MQ.addEventListener("change", setMode);

  // 初めの見開き: URL の # があれば、そこを開く
  const id = location.hash.slice(1);
  if (id) goToId(id, false); else paint(false);
  requestAnimationFrame(() => book.classList.remove("no-anim"));

  nextBtn.addEventListener("click", next);
  prevBtn.addEventListener("click", prev);

  addEventListener("keydown", e => {
    if (!wide || e.metaKey || e.ctrlKey || e.altKey || html.classList.contains("kake-on")) return;
    if (e.key === "ArrowLeft" || e.key === "PageDown" || (e.key === " " && !e.shiftKey)) { e.preventDefault(); next(); }
    else if (e.key === "ArrowRight" || e.key === "PageUp" || (e.key === " " && e.shiftKey)) { e.preventDefault(); prev(); }
    else if (e.key === "Home") { e.preventDefault(); go(0); remember(); }
    else if (e.key === "End") { e.preventDefault(); go(N); remember(); }
  });

  // 頁の左端で次へ、右端で前へ
  document.querySelector(".stage").addEventListener("click", e => {
    if (!wide || e.target.closest("a,button")) return;
    const r = book.getBoundingClientRect(), x = (e.clientX - r.left) / r.width;
    if (e.clientY < r.top || e.clientY > r.bottom) return;
    if (x < .2) next(); else if (x > .8) prev();
  });

  // なぞって、めくる（左から右へ＝次へ）
  let sx = null, sy = 0;
  document.querySelector(".stage").addEventListener("pointerdown", e => { sx = e.clientX; sy = e.clientY; });
  addEventListener("pointerup", e => {
    if (!wide || sx == null) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    sx = null;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) (dx > 0 ? next : prev)();
  });

  // 頁の中のリンク・栞・目次
  document.addEventListener("click", e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || !wide) return;
    const id = a.hash.slice(1);
    if (spreadOf(id) == null) return;
    e.preventDefault();
    goToId(id);
    history.replaceState(null, "", "#" + id);
  });
  addEventListener("hashchange", () => { if (wide) goToId(location.hash.slice(1)); });
  // 庭の石など、ほかの部品から「この頁へ」と頼まれたとき
  document.addEventListener("washo:go", e => {
    const id = e.detail;
    if (wide) { if (goToId(id)) history.replaceState(null, "", "#" + id); }
    else document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // 縦に読むときは、見えた頁から順に「開いた」印をつける
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (!wide && en.isIntersecting) { en.target.classList.add("is-open"); io.unobserve(en.target); }
    }), { threshold: .25 });
    book.querySelectorAll(".face").forEach(f => io.observe(f));
  }
}
