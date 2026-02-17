local wk = require("which-key")

wk.setup {
  plugins = {
    marks = false,
    registers = false,
    spelling = {enabled = false, suggestions = 20},
    presets = {operators = false, motions = false, text_objects = false, windows = false, nav = false, z = false, g = false}
  }
}

local Terminal = require('toggleterm.terminal').Terminal
local toggle_float = function()
  local float = Terminal:new({direction = "float"})
  return float:toggle()
end
local toggle_vertical = function()
  local vertical = Terminal:new({direction = "vertical", size = 80})
  return vertical:toggle()
end
local toggle_lazygit = function()
  local lazygit = Terminal:new({cmd = 'lazygit', direction = "float"})
  return lazygit:toggle()
end

wk.add({
  -- Basic commands
  { "<leader>q", ":q<cr>", desc = "Quit" },
  { "<leader>Q", ":wq<cr>", desc = "Save & Quit" },
  { "<leader>w", ":w<cr>", desc = "Save" },
  { "<leader>x", ":bdelete<cr>", desc = "Close" },
  { "<leader>E", ":e ~/.config/nvim/init.lua<cr>", desc = "Edit config" },

  -- Find group
  { "<leader>f", group = "Find" },
  { "<leader>ff", ":Telescope find_files<cr>", desc = "Find Files" },
  { "<leader>fg", ":Telescope live_grep<cr>", desc = "Live Grep" },
  { "<leader>fb", ":Telescope buffers<cr>", desc = "Buffers" },
  { "<leader>fh", ":Telescope help_tags<cr>", desc = "Help Tags" },
  { "<leader>fr", ":Telescope oldfiles<cr>", desc = "Recent Files" },
  { "<leader>fd", ":Telescope diagnostics<cr>", desc = "Diagnostics" },
  { "<leader>fs", ":Telescope git_status<cr>", desc = "Git Status" },
  { "<leader>fc", ":Telescope git_commits<cr>", desc = "Git Commits" },

  -- Quick live grep
  { "<leader>r", ":Telescope live_grep<cr>", desc = "Live Grep (quick)" },

  -- Terminal group
  { "<leader>t", group = "Terminal" },
  { "<leader>th", ":ToggleTerm<cr>", desc = "Horizontal (bottom)" },
  { "<leader>tv", toggle_vertical, desc = "Vertical (right)" },
  { "<leader>tf", toggle_float, desc = "Floating (center)" },
  { "<leader>tl", toggle_lazygit, desc = "LazyGit" },

  -- LSP group
  { "<leader>l", group = "LSP" },
  { "<leader>li", ":LspInfo<cr>", desc = "Connected Language Servers" },
  { "<leader>lk", "<cmd>lua vim.lsp.buf.signature_help()<cr>", desc = "Signature Help" },
  { "<leader>lK", "<cmd>lua vim.lsp.buf.hover()<cr>", desc = "Hover Commands" },
  { "<leader>lw", "<cmd>lua vim.lsp.buf.add_workspace_folder()<cr>", desc = "Add Workspace Folder" },
  { "<leader>lW", "<cmd>lua vim.lsp.buf.remove_workspace_folder()<cr>", desc = "Remove Workspace Folder" },
  { "<leader>ll", "<cmd>lua print(vim.inspect(vim.lsp.buf.list_workspace_folders()))<cr>", desc = "List Workspace Folders" },
  { "<leader>lt", "<cmd>lua vim.lsp.buf.type_definition()<cr>", desc = "Type Definition" },
  { "<leader>ld", "<cmd>lua vim.lsp.buf.definition()<cr>", desc = "Go To Definition" },
  { "<leader>lD", "<cmd>lua vim.lsp.buf.declaration()<cr>", desc = "Go To Declaration" },
  { "<leader>lr", "<cmd>lua vim.lsp.buf.references()<cr>", desc = "References" },

  -- Zen mode (nested under LSP for now)
  { "<leader>lz", group = "Focus" },
  { "<leader>lzz", ":ZenMode<cr>", desc = "Toggle Zen Mode" },
  { "<leader>lzt", ":Twilight<cr>", desc = "Toggle Twilight" },
})
