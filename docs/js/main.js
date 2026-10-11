import { $, S, HINT, sleep } from "./state.js";
import { initTheme } from "./theme.js";
import { initDeck, fitDeck, drawHands, press } from "./deck.js";
import { placeEye, fitLine, drawEye, drawLine } from "./eye.js";
import { runIntro } from "./intro.js";
import { initRail, layoutRail, startScene } from "./rail.js";
import { drawGarden } from "./karesansui.js";
import { drawInk } from "./ink.js";
import { initFamily, countUp, updateNumbers } from "./stats.js";
import { initInput } from "./input.js";

async function goSite() {
  if (S.advanced) return;
  S.advanced = true;
  S.alive = false;
  document.body.classList.add("site");
  $("#enter").style.display = "none";

  // 柱に「開く ~/仕事」が書かれてから、残りの画面が現れる
  const cwd = $("#cwd");
  cwd.textContent = "";
  for (const c of "開く ~/dotfiles") { cwd.textContent += c; press(c); await sleep(80); }
  await sleep(450);
  cwd.textContent = HINT;
  document.body.classList.add("ready");
  placeEye();
  startScene();
  countUp();

  const t0 = performance.now();
  (function grow(n) {
    S.ridgeP = Math.max(0, Math.min(1, (n - t0 - 300) / 3200));
    S.inkP = Math.min(1, S.ridgeP * 1.2);
    updateNumbers(S.ridgeP);
    if (S.ridgeP < 1) requestAnimationFrame(grow);
  })(t0);
}

initTheme();
initDeck();
initRail();
initFamily();
initInput({ goSite });
fitLine();
placeEye();

addEventListener("resize", () => {
  fitDeck();
  fitLine();
  placeEye();
  if (S.advanced) layoutRail();
});

(function loop(t) {
  drawHands(t);
  drawEye(t);
  drawLine();
  if (S.advanced) { drawGarden(); drawInk(); }
  requestAnimationFrame(loop);
})(0);

runIntro(goSite);
