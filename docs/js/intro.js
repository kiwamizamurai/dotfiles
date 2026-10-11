// 序: columns of vertical text are written right → left; a slip (短冊) receives short words;
// one new column is written into the page; then a mask of characters appears and follows the pointer.
import { $, $$, S, sleep, kanji } from "./state.js";
import { press } from "./deck.js";
import { texts, COMMENT, SLIPS } from "./intro-texts.js";

const ln = [];
let total = 1;

// a new column, written to the left of the one at `after`
function insertLine(after) {
  const d = document.createElement("div");
  d.className = "ln on";
  d.innerHTML = '<span class="t"></span>';
  ln[after].after(d);
  ln.splice(after + 1, 0, d);
  total++;
}

function setPos(i) { $("#pos").textContent = `行 ${kanji(i + 1)}／${kanji(total)}`; }

// write into a plain element, one character at a time (the slip)
async function typeInto(el, text, ms = 150) {
  el.textContent = "";
  for (const c of text) {
    el.textContent += c;
    press(c);
    S.typingBoost = 1;
    await sleep(ms + Math.random() * 90);
  }
  S.typingBoost = 0;
}

// write a column with a red caret
async function writeColumn(idx, text) {
  const d = ln[idx], t = d.querySelector(".t");
  d.classList.add("typed", "cur");
  for (let i = 1; i <= text.length; i++) {
    t.innerHTML = text.slice(0, i).replace(/</g, "&lt;") + '<span class="caret"></span>';
    press(text[i - 1]);
    S.typingBoost = 1;
    await sleep(110 + Math.random() * 90);
  }
  t.textContent = text;
  S.typingBoost = 0;
  d.classList.remove("cur");
}

export async function runIntro(goSite) {
  const f = texts[Math.floor(Math.random() * texts.length)];
  total = f.lines.length;
  $("#hpath").textContent = `序 ・ ${f.vol} ・ ${f.title}`;
  $("#pos").textContent = `行 一／${kanji(total)}`;

  const code = $("#code");
  f.lines.forEach(l => {
    const d = document.createElement("div");
    d.className = "ln";
    d.innerHTML = `<span class="t">${l.replace(/</g, "&lt;")}</span>`;
    code.append(d);
    ln.push(d);
  });

  // columns appear one after another, from the right
  await sleep(600);
  for (let i = 0; i < ln.length && S.alive; i++) { ln[i].classList.add("on"); await sleep(520); }

  // the margin title and the slip appear; the first word is written on the slip
  await sleep(600);
  $("#hashira").classList.add("on");
  await sleep(500);
  $("#cmd").classList.add("on");
  await typeInto($("#cmd"), SLIPS[0]);
  await sleep(900);
  if (!S.alive) return;

  // the caret rests on a column; a new column is written to its left
  const at = f.commentAt, row = ln[at];
  row.classList.add("cur");
  setPos(at);
  await sleep(1000);
  row.classList.remove("cur");
  insertLine(at);
  setPos(at + 1);
  await writeColumn(at + 1, COMMENT);
  await sleep(1000);
  if (!S.alive) return;

  // the second word on the slip calls the mask
  await typeInto($("#cmd"), SLIPS[1], 170);
  await sleep(600);
  S.eyeOn = true;
  await sleep(2600);

  // four seals (春夏秋冬) replace one column for a moment
  const ci = Math.min(ln.length - 1, f.chainAt + (f.chainAt > at ? 1 : 0)), keep = ln[ci].innerHTML;
  ln[ci].innerHTML = '<span class="chain"><span class="spin">↻</span><i></i><b>春</b><i></i><b>夏</b><i></i><b class="act">秋</b><i></i><b>冬</b><i></i></span>';
  let k = 0;
  const iv = setInterval(() => { $$(".chain b").forEach((b, j) => b.classList.toggle("act", j === k % 4)); k++; }, 700);
  await sleep(4400);
  clearInterval(iv);
  ln[ci].innerHTML = keep;

  await sleep(5000);
  if (S.alive && !S.advanced) goSite();
}
