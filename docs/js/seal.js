// 押印: コマンドの札を押すと、朱印が押されて、写しが取れる
export function initSeal() {
  document.addEventListener("click", e => {
    const btn = e.target.closest("[data-copy]");
    if (!btn) return;
    const text = btn.dataset.copy;
    const done = () => stamp(btn, e);
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, done);
    else done();
  });
}

function stamp(btn, e) {
  const r = btn.getBoundingClientRect();
  const x = (e.clientX || r.left + r.width / 2) - r.left, y = (e.clientY || r.top + r.height / 2) - r.top;
  const s = document.createElement("span");
  s.className = "stamp";
  s.textContent = "写";
  s.style.left = `calc(${x}px - 5.5cqw)`;
  s.style.top = `calc(${y}px - 5.5cqw)`;
  btn.append(s);
  setTimeout(() => s.remove(), 2000);
}
