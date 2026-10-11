// 傘連判状: 署名に触れると、束の名と設定の数が出る。押す・Enter で、その束の頁へ移る。
export function initKasa() {
  const out = document.getElementById("kasa-out");
  const ribs = document.querySelectorAll(".kasa .rib");
  if (!out || !ribs.length) return;
  const home = out.textContent;
  const show = r => { out.innerHTML = `<b>${r.dataset.name}</b>${r.dataset.en}　${r.dataset.jp}　設定 ${r.dataset.n} ファイル`; };
  const go = r => document.dispatchEvent(new CustomEvent("washo:go", { detail: r.dataset.go }));
  ribs.forEach(r => {
    r.addEventListener("pointerenter", () => show(r));
    r.addEventListener("focus", () => show(r));
    r.addEventListener("pointerleave", () => { out.textContent = home; });
    r.addEventListener("blur", () => { out.textContent = home; });
    r.addEventListener("click", () => go(r));
    r.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(r); } });
  });
}
