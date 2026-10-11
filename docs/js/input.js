// keyboard, wheel and drag handling + the ":" command line
import { $, S, HINT, isWide } from "./state.js";
import { press } from "./deck.js";
import { cycleTheme } from "./theme.js";
import { select, cycleShot, runCmd, selected } from "./rail.js";

let cmdBuf = null; // null = not in command mode
const sel = selected;

export function initInput({ goSite }) {
  $("#themeBtn").onclick = cycleTheme;
  $("#enter").onclick = goSite;
  // 落款: closes (or opens) the mask's eye
  $("#den").onclick = () => $("#eye").classList.toggle("closed");

  addEventListener("keydown", e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const cwd = $("#cwd");

    if (cmdBuf !== null) { // ":theme", ":whoami", ...
      e.preventDefault();
      if (e.key === "Enter") { const c = cmdBuf; cmdBuf = null; cwd.textContent = HINT; runCmd(c); return; }
      if (e.key === "Escape") { cmdBuf = null; cwd.textContent = HINT; return; }
      if (e.key === "Backspace") cmdBuf = cmdBuf.slice(0, -1);
      else if (e.key.length === 1) { cmdBuf += e.key; press(e.key); }
      cwd.textContent = ":" + cmdBuf + "▌";
      return;
    }
    if (e.key === "Enter" && !S.advanced) { goSite(); return; }
    if (e.key === "t" && !S.advanced) { cycleTheme(); return; }

    if (S.advanced) {
      if (e.key === ":") { e.preventDefault(); cmdBuf = ""; cwd.textContent = ":▌"; return; }
      if (e.key === "ArrowDown" || e.key === "j") { e.preventDefault(); select(sel() + 1); }
      if (e.key === "ArrowUp" || e.key === "k") { e.preventDefault(); select(sel() - 1); }
      if (e.key === "ArrowRight" || e.key === "l") cycleShot(1);
      if (e.key === "ArrowLeft" || e.key === "h") cycleShot(-1);
    }
    if (e.key.length === 1) press(e.key);
  });

  // mouse wheel / drag move the tile selection (desktop only; phones scroll natively)
  let acc = 0;
  addEventListener("wheel", e => {
    if (!S.advanced || !isWide()) return;
    acc += e.deltaY;
    if (Math.abs(acc) > 70) { select(sel() + Math.sign(acc)); acc = 0; }
  }, { passive: true });

  $("#site").addEventListener("pointerdown", e => {
    if (!isWide() || e.target.closest("a")) return;
    let y0 = e.clientY;
    const mv = ev => { if (Math.abs(ev.clientY - y0) > 60) { select(sel() + (ev.clientY < y0 ? 1 : -1)); y0 = ev.clientY; } };
    const up = () => { removeEventListener("pointermove", mv); removeEventListener("pointerup", up); };
    addEventListener("pointermove", mv);
    addEventListener("pointerup", up);
  });
}
