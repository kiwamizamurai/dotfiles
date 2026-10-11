// 本編のシーン — kiwamizamurai/dotfiles の実際の内容を、帳面（ターミナル）の形で見せる。
//   kind     "home" | "list"
//   title    帳面の上の題
//   cwd      プロンプトに出る場所（branch: 枝名）
//   cmd      プロンプトに打たれる言葉
//   lines    その後に一行ずつ現れる出力（"" は空行）
//   after    { cmd, lines }  二つ目のプロンプトと、その出力（ファイルの木など）
//   cols     下の柱に並ぶ数
// 行の印: .mid .hot .grn .dim は色。<a class="copy" data-copy="…"> は押すとコピー。
//         <a class="rel" href="…"> は外部リンク、<a data-go="id"> は他のタイルへ。

const REPO = "https://github.com/kiwamizamurai/dotfiles";
const kv = (k, v, rest = "") => `<div class="kv"><span class="mid">${k}</span><span>${v}</span>${rest}</div>`;
const go = (id, label) => `<a class="rel" data-go="${id}">${label || id}</a>`;
const ext = (href, label) => `<a class="rel" href="${href}" target="_blank" rel="noopener">${label}</a>`;
const esc = s => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const copy = (text, shown) => `<a class="copy" data-copy="${esc(text)}">${shown || esc(text)}</a>`;

const INSTALL = '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/kiwamizamurai/dotfiles/refs/heads/main/install.sh)"';

// 束（Stow の package）の頁は、同じ型で作る
function pkg(id, lab, desc, files, rows, tree) {
  return {
    id, lab, kind: "list", art: "pkg",
    title: `帳面 — 束 ・ ${id}`, cwd: `~/dotfiles/packages/${id}`, branch: "main",
    cmd: `見る ${id}`,
    cols: [{ label: "設定", to: files, hot: 1 }, { label: "束", to: 1, hot: 1 }],
    lines: [id, `<span class="mid">${desc}</span>`, "", ...rows, "",
      kv("結ぶ", copy(`stow --restow --adopt -d packages -t ~ ${id}`, `stow -d packages -t ~ ${id}`))],
    after: { cmd: `木 ${id}/`, lines: tree },
  };
}

export const tiles = [
  {
    id: "overview", lab: "概要", kind: "home", art: "who",
    title: "帳面 — dotfiles", cwd: "~", cmd: "見る dotfiles",
    out: "macOS の開発環境。Stow で束ね、一行で入る。",
    cols: [{ label: "道具", to: 78, hot: 1 }, { label: "アプリ", to: 41, hot: 1 }, { label: "束", to: 7, hot: 1 }, { label: "星", to: 2, hot: 1 }],
  },
  {
    id: "install", lab: "入れ方", kind: "list", art: "word1",
    title: "帳面 — 入れ方", cwd: "~", cmd: "入れる",
    cols: [{ label: "手順", to: 8, hot: 1 }],
    lines: [
      '<span class="mid">一行で、すべてが入る（押すとコピー）</span>',
      copy(INSTALL, '/bin/bash -c "$(curl -fsSL …/install.sh)"'),
      "",
      kv("一", "macOS であることを確かめる"),
      kv("二", "Homebrew がなければ入れる"),
      kv("三", "zsh を既定のシェルにする"),
      kv("四", "<span class='mid'>~/.config</span> をつくる"),
      kv("五", "dotfiles を <span class='mid'>~/dotfiles</span> に取得する"),
      kv("六", "macOS の設定（<span class='mid'>bin/defaults.sh</span>）"),
      kv("七", "<span class='mid'>Brewfile</span> をまとめて入れる"),
      kv("八", "Stow で束を結び、Neovim のプラグインを入れる"),
      "",
      `<span class="mid">macOS 専用です。もう一度走らせても、同じ結果になります。</span>`,
    ],
  },
  {
    id: "usage", lab: "手引き", kind: "list", art: "word2",
    title: "帳面 — Neovim の手引き", cwd: "~/dotfiles", cmd: "読む USAGE.md",
    cols: [{ label: "章", to: 6, hot: 1 }],
    lines: [
      '<span class="mid">はじめての人のための、Neovim 設定の案内</span>',
      "",
      kv("一", ext(`${REPO}/blob/main/USAGE.md#introduction`, "はじめに")),
      kv("二", ext(`${REPO}/blob/main/USAGE.md#basic-concepts`, "基本の考え方")),
      kv("三", ext(`${REPO}/blob/main/USAGE.md#essential-keybindings`, "大事なキー")),
      kv("四", ext(`${REPO}/blob/main/USAGE.md#plugin-guide`, "プラグインの案内")),
      kv("五", ext(`${REPO}/blob/main/USAGE.md#common-workflows`, "よくある流れ")),
      kv("六", ext(`${REPO}/blob/main/USAGE.md#troubleshooting`, "困ったとき")),
      "",
      kv("Leader", "<span class='hot'>Space</span>", '<span class="mid">&lt;leader&gt;e = Space のあと e</span>'),
      kv("戻る", "<span class='hot'>jk</span> / <span class='hot'>kj</span>", '<span class="mid">挿入モードからノーマルへ</span>'),
      kv("窓", "<span class='hot'>Ctrl + h j k l</span>", '<span class="mid">窓の間を移る</span>'),
    ],
  },
  {
    id: "tools", lab: "道具", kind: "list", art: "stack",
    title: "帳面 — Brewfile", cwd: "~/dotfiles", cmd: "数える Brewfile",
    cols: [{ label: "道具", to: 78, hot: 1 }, { label: "アプリ", to: 41, hot: 1 }, { label: "tap", to: 4, hot: 1 }],
    lines: [
      kv("シェル", "zsh  starship  atuin  zoxide  eza  bat  fd  ripgrep  tree"),
      kv("git", "git  gh  git-delta  gitleaks  git-lfs  onefetch"),
      kv("基盤", "k3d  k9s  kubernetes-cli  awscli  wrangler  cloudflared"),
      kv("監視", "bottom  btop  glances  sniffnet"),
      kv("開発", "neovim  mise  uv  cmake  rust  go-task  hugo  d2  stylua  shfmt"),
      kv("知恵", "opencode  llama.cpp  gemini-cli  llm  whisper-cpp"),
      kv("文書", "typst  pandoc  imagemagick  vhs  freeze  tectonic"),
      kv("画面", "wezterm  cursor  visual-studio-code  orbstack  helium-browser  zen"),
      kv("書体", "hack-nerd  dotgothic16  maple-mono-nf  hackgen  hackgen-nerd"),
      "",
      `<span class="mid">全体は ${ext(REPO + "/blob/main/Brewfile", "Brewfile")} に。</span>`,
    ],
  },
  pkg("nvim", "nvim", "LSP・Treesitter・Telescope を備えた Neovim。起動は init.lua から。", 25, [
    kv("設定", "25 ファイル"), kv("言語", "<span class='grn'>Lua</span>"), kv("部品", "lua/ に 二十三の部屋"),
    kv("鍵", "Leader は <span class='hot'>Space</span>", `<span class="mid">手引きは ${go("usage", "手引き")}</span>`),
  ], [
    "├─ init.lua", "├─ lazy-lock.json", "└─ lua/",
    "   ├─ options  keybindings  plugins", "   ├─ lsp（cmp  language_servers  diagnostic_signs）",
    "   ├─ telescope  treesitter  nvim-tree  which-key", "   └─ lualine  bufferline  dashboard  zen-mode  …",
  ]),
  pkg("wezterm", "wezterm", "GPU で描く端末。設定はすべて Lua で書く。", 1, [
    kv("配色", "Builtin Dark"), kv("透明", "0.97", '<span class="mid">背景のぼかし 20</span>'),
    kv("文字", "14 pt", '<span class="mid">DotGothic16 ほか</span>'), kv("窓", "枠なし（RESIZE）"),
    kv("タブ", "下端に置き、一枚のときは隠す"),
  ], ["└─ .wezterm.lua"]),
  pkg("zsh", "zsh", "既定のシェル。補完と色づけを足し、道具は別名で呼ぶ。", 1, [
    kv("履歴", "10,000", '<span class="mid">保存は 100,000</span>'),
    kv("別名", "vim → nvim", '<span class="mid">ls → eza ・ cat → bat ・ ll / la</span>'),
  ], ["└─ .zshrc"]),
  pkg("starship", "starship", "速くて軽いプロンプト。gruvbox の暗い配色。", 1, [
    kv("配色", "gruvbox_dark"),
    kv("並び", "gcloud  aws  directory  git  python  docker  time"),
  ], ["└─ .config/starship.toml"]),
  pkg("atuin", "atuin", "シェルの履歴を SQLite に残し、あいまい検索する。", 1, [
    kv("役目", "履歴の検索と、機械をまたぐ同期"),
  ], ["└─ .config/atuin/config.toml"]),
  pkg("opencode", "opencode", "端末の中で使う AI の道具。手元のモデルにもつながる。", 5, [
    kv("手元", "oMLX", '<span class="mid">127.0.0.1:8000</span>'),
    kv("手元", "llama-server", '<span class="mid">127.0.0.1:11444</span>'),
    kv("許し", "読む・書く <span class='grn'>許可</span>", '<span class="mid">bash は 都度たずねる</span>'),
    kv("部品", "agents/reviewer ・ commands/commit ・ commands/test"),
  ], [
    "└─ .config/opencode/", "   ├─ opencode.json  tui.json", "   ├─ agents/reviewer.md", "   └─ commands/commit.md  test.md",
  ]),
  pkg("github", "github", "git の設定ひとつだけを入れた束。", 1, [kv("役目", "git の名前と、日々の既定")], ["└─ .gitconfig"]),
  {
    id: "why", lab: "問い", kind: "list", art: "word3",
    title: "帳面 — なぜ Nix ではないか", cwd: "~/dotfiles", cmd: "問う nix",
    cols: [{ label: "答え", to: 1, hot: 1 }],
    lines: [
      "単純で、手入れしやすいから。",
      `<span class="mid">道具は Homebrew、結ぶのは Stow。覚えることを、少なくしておく。</span>`,
      "",
      kv("参考", ext("https://jade.fyi/blog/use-nix-less/", "You don't have to use nix to manage your dotfiles")),
    ],
  },
  {
    id: "status", lab: "検証", kind: "list", art: "word4",
    title: "帳面 — 検証", cwd: "~/dotfiles", cmd: "確かめる",
    cols: [{ label: "仕掛け", to: 3, hot: 1 }],
    lines: [
      kv("macos", "macOS で入れ方を通し直す", `<span class="mid">${ext(REPO + "/actions", "Actions")}</span>`),
      kv("shell", "shellcheck でスクリプトを見張る"),
      kv("更新", "dependabot が依存を見守る"),
      "",
      `<span class="mid">最終更新 二〇二六・十・三 ・ 星 二 ・ 作られたのは 二〇二二・三</span>`,
    ],
  },
];

// 小さな絵
const wave = seed => `<svg viewBox="0 0 84 48" fill="none" stroke="currentColor" stroke-width="1">${[0, 1, 2, 3].map(i =>
  `<path d="M2 ${10 + i * 10} q 10 -${5 + (seed + i) % 4} 20 0 t 20 0 t 20 0 t 20 0" opacity="${.85 - i * .15}"/>`).join("")}</svg>`;
const word = t => `<div class="art word"><span>${t}</span></div>`;

export const arts = {
  who: () => '<div class="art who"><span class="seal">庵</span></div>',
  word1: () => word("入れ方"), word2: () => word("手引き"), word3: () => word("問い"), word4: () => word("検証"),
  stack: () => `<div class="art stack">${["言", "具", "知", "道", "筆", "墨", "硯", "紙", "線", "点", "間", "和"].map(s => `<span>${s}</span>`).join("")}</div>`,
  pkg: seed => `<div class="art repo">${wave(seed || 3)}</div>`,
};
