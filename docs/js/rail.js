// 掛け軸の列と、帳面に一行ずつ書かれる各ページ
import { $, S, HINT, isWide, sleep } from "./state.js";
import { press } from "./deck.js";
import { cycleTheme } from "./theme.js";
import { setCols, stateCols } from "./stats.js";
import { tiles, arts } from "./scenes.js";

export { tiles };
let sel = Math.max(0, tiles.findIndex(t => t.id === "overview")), shot = 0, run = 0;
const rail = $("#rail"), ptr = $("#ptr"), buf = $("#prompt");

export const selected = () => sel;

export function initRail() {
  tiles.forEach((t, i) => {
    const d = document.createElement("div");
    d.className = "tile";
    d.innerHTML = (typeof arts[t.art] === "function" ? arts[t.art](i + 2) : arts.repo(i + 2)) + `<span class="lab">${t.lab}</span>`;
    d.onclick = () => select(i);
    rail.append(d);
    t.el = d;
  });
  rail.insertAdjacentHTML("beforeend", '<div class="hintline"><span>二〇二六・十・十一</span><span>回して選ぶ ・ <b>ドラッグ</b></span></div>');
  // links inside a page jump to that tile; "copy" lines put their command on the clipboard
  buf.addEventListener("click", e => {
    const go = e.target.closest("[data-go]");
    if (go) { selectId(go.dataset.go); return; }
    const cp = e.target.closest("[data-copy]");
    if (cp) {
      const done = () => { cp.classList.add("done"); setTimeout(() => cp.classList.remove("done"), 1400); };
      if (navigator.clipboard) navigator.clipboard.writeText(cp.dataset.copy).then(done, () => {});
    }
  });
  const fromHash = tiles.findIndex(t => t.id === location.hash.slice(1));
  if (fromHash >= 0) sel = fromHash;
}

export function layoutRail() {
  if (!isWide()) { // phone: tiles are a horizontal strip, CSS owns the geometry
    tiles.forEach((t, i) => t.el.classList.toggle("sel", i === sel));
    const el = tiles[sel].el;
    rail.scrollTo({ left: el.offsetLeft - (rail.clientWidth - el.offsetWidth) / 2, behavior: "smooth" });
    return;
  }
  const base = rail.clientHeight / 2 - 45;
  tiles.forEach((t, i) => {
    const o = i - sel;
    t.el.style.top = base + o * 64 + (o === 0 ? 0 : o > 0 ? 26 : -26) + "px";
    t.el.classList.toggle("sel", o === 0);
    const rot = o === 0 ? 0 : o % 2 ? -3 : 2, sc = o === 0 ? 1 : 1 - Math.min(.12, Math.abs(o) * .05);
    t.el.style.transform = `rotate(${rot}deg) scale(${sc}) translateX(${o === 0 ? 0 : -6}px)`;
    t.el.style.opacity = Math.abs(o) > 2 ? 0 : o === 0 ? 1 : .85;
  });
  ptr.style.top = rail.offsetTop + base + 45 - 6 + "px";
}

export function select(i) {
  if (i < 0 || i >= tiles.length || i === sel) return;
  sel = i;
  shot = 0;
  tiles.forEach(t => (t.el.style.filter = ""));
  layoutRail();
  runScene();
}
const selectId = id => { const i = tiles.findIndex(t => t.id === id || t.lab === id); if (i >= 0) select(i); };

// ← / → : 写真帳の版を切り替える（それ以外は見え方を変える）
export function cycleShot(dir) {
  const t = tiles[sel];
  if (t.kind === "repo") {
    shot = (shot + (dir < 0 ? t.shots.length - 1 : 1)) % t.shots.length;
    paintShot();
  } else {
    shot = (shot + (dir < 0 ? 2 : 1)) % 3;
    t.el.style.filter = ["none", "brightness(1.35)", "contrast(1.4) saturate(0)"][shot];
  }
}

function paintShot() {
  const t = tiles[sel], bar = buf.querySelector(".shotver"), img = buf.querySelector(".shotimg");
  if (!bar) return;
  bar.textContent = `${t.shots[shot]}  ${shot + 1}/${t.shots.length}`;
  img.dataset.v = shot;
}

// ":" 命令
export function runCmd(c) {
  c = c.trim();
  if (c === "theme" || c === "彩" || c === "色") { cycleTheme(); return; }
  selectId(c);
}

export function startScene() { layoutRail(); runScene(); }

const head = t => `<span class="u">dotfiles</span><span class="h">@庵 ${t.cwd} </span>${t.branch ? `<span class="g">(${t.branch})</span>` : ""}`;

async function typeCmd(text, tok) {
  const line = document.createElement("div");
  line.className = "pl";
  line.innerHTML = '<span class="u">› </span><span class="typed"></span>';
  buf.append(line);
  const out = line.querySelector(".typed");
  for (const c of text) {
    if (tok !== run) return false;
    out.textContent += c;
    press(c);
    S.typingBoost = 1;
    await sleep(60 + Math.random() * 60);
  }
  S.typingBoost = 0;
  await sleep(300);
  return tok === run;
}

async function addLine(html, tok, ms = 120) {
  const d = document.createElement("div");
  d.className = "bl";
  d.style.whiteSpace = "pre"; // keeps the indentation of file trees
  d.innerHTML = html || "&nbsp;";
  buf.append(d);
  requestAnimationFrame(() => d.classList.add("in"));
  await sleep(ms);
  return tok === run;
}

// タイルを替えると、下の柱に「開く <場所>」が一瞬書かれ、案内が戻る
let firstRun = true;
async function bootBar(t, tok) {
  const el = $("#cwd");
  el.textContent = "";
  for (const c of "開く " + t.cwd) {
    if (tok !== run) return;
    el.textContent += c;
    await sleep(34);
  }
  await sleep(300);
  if (tok === run) el.textContent = HINT;
}

async function runScene() {
  const tok = ++run, t = tiles[sel];
  if (!firstRun) bootBar(t, tok);
  firstRun = false;
  history.replaceState(null, "", "#" + t.id);
  document.body.dataset.scene = t.kind;
  $(".term .ttl").textContent = t.title;
  setCols([...t.cols, ...stateCols()], 700);
  buf.innerHTML = "";
  S.typingBoost = 0;

  for (const l of t.pre || []) if (!await addLine(l, tok, 100)) return;
  const h = document.createElement("div");
  h.className = "pl";
  h.innerHTML = head(t);
  buf.append(h);
  if (!await typeCmd(t.cmd, tok)) return;

  if (t.kind === "home") { // 一言の答え。庭が育つ
    const o = document.createElement("div");
    o.className = "bl in";
    buf.append(o);
    for (const c of t.out) { if (tok !== run) return; o.textContent += c; await sleep(50); }
    return;
  }
  for (const l of t.lines) if (!await addLine(l, tok)) return;

  if (t.after) { // a second prompt: a tree of files, or any follow-up output
    const h2 = document.createElement("div");
    h2.className = "pl";
    h2.innerHTML = head(t);
    buf.append(h2);
    if (!await typeCmd(t.after.cmd, tok)) return;
    for (const l of t.after.lines) if (!await addLine(l, tok, 90)) return;
    return;
  }

  if (t.tail) { // 最後に、自分で「開く」を打つ行（実行はしない）
    const h3 = document.createElement("div");
    h3.className = "pl";
    h3.innerHTML = head(t);
    buf.append(h3);
    await typeCmd(t.tail, tok);
    return;
  }

  if (t.kind === "repo") { // 二つ目のプロンプトと写真帳
    const h2 = document.createElement("div");
    h2.className = "pl";
    h2.innerHTML = head(t);
    buf.append(h2);
    if (!await typeCmd("見る 写真/", tok)) return;
    buf.insertAdjacentHTML("beforeend",
      '<div class="shots bl in"><div class="shotbar"><span class="shotver"></span><span class="mid">← → 写</span></div><div class="shotimg"></div></div>');
    paintShot();
  }
}
