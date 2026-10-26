require("snacks").setup({
  bigfile = { enabled = true },
  quickfile = { enabled = true },
  dashboard = require("dashboard-config"),
  explorer = { enabled = true, replace_netrw = true },
  picker = {
    enabled = true,
    sources = {
      explorer = {
        hidden = true,
        exclude = { ".git", "node_modules", ".cache" },
      },
    },
  },
  notifier = { enabled = true, timeout = 3000 },
  indent = { enabled = true },
  scope = { enabled = true },
  input = { enabled = true },
  words = { enabled = true },
  terminal = { enabled = true },
  zen = { enabled = true, win = { width = 100 } },
  dim = { enabled = true },
  lazygit = { enabled = true },
})

-- Bottom terminal, toggled from normal and terminal mode
vim.keymap.set({ "n", "t" }, [[<c-\>]], function()
  Snacks.terminal.toggle(nil, { win = { position = "bottom", height = 13 } })
end, { desc = "Toggle terminal" })
