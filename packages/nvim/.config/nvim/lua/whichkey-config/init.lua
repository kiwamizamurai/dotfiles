local wk = require("which-key")

wk.setup({
  plugins = {
    marks = false,
    registers = false,
    spelling = { enabled = false, suggestions = 20 },
    presets = {
      operators = false,
      motions = false,
      text_objects = false,
      windows = false,
      nav = false,
      z = false,
      g = false,
    },
  },
})

local toggle_vertical = function()
  Snacks.terminal.toggle(nil, { count = 2, win = { position = "right", width = 80 } })
end
local toggle_float = function()
  Snacks.terminal.toggle(nil, { count = 3, win = { position = "float" } })
end

wk.add({
  -- Basic commands
  { "<leader>q", ":q<cr>", desc = "Quit" },
  { "<leader>Q", ":wq<cr>", desc = "Save & Quit" },
  { "<leader>w", ":w<cr>", desc = "Save" },
  {
    "<leader>x",
    function()
      Snacks.bufdelete()
    end,
    desc = "Close",
  },
  { "<leader>E", ":e ~/.config/nvim/init.lua<cr>", desc = "Edit config" },

  -- Find group
  { "<leader>f", group = "Find" },
  {
    "<leader>ff",
    function()
      Snacks.picker.files()
    end,
    desc = "Find Files",
  },
  {
    "<leader>fg",
    function()
      Snacks.picker.grep()
    end,
    desc = "Live Grep",
  },
  {
    "<leader>fb",
    function()
      Snacks.picker.buffers()
    end,
    desc = "Buffers",
  },
  {
    "<leader>fh",
    function()
      Snacks.picker.help()
    end,
    desc = "Help Tags",
  },
  {
    "<leader>fr",
    function()
      Snacks.picker.recent()
    end,
    desc = "Recent Files",
  },
  {
    "<leader>fd",
    function()
      Snacks.picker.diagnostics()
    end,
    desc = "Diagnostics",
  },
  {
    "<leader>fs",
    function()
      Snacks.picker.git_status()
    end,
    desc = "Git Status",
  },
  {
    "<leader>fc",
    function()
      Snacks.picker.git_log()
    end,
    desc = "Git Commits",
  },
  {
    "<leader>fp",
    function()
      Snacks.picker.projects()
    end,
    desc = "Projects",
  },
  {
    "<leader>fn",
    function()
      Snacks.picker.notifications()
    end,
    desc = "Notification History",
  },

  -- Quick live grep
  {
    "<leader>r",
    function()
      Snacks.picker.grep()
    end,
    desc = "Live Grep (quick)",
  },

  -- Terminal group
  { "<leader>t", group = "Terminal" },
  {
    "<leader>th",
    function()
      Snacks.terminal.toggle(nil, { win = { position = "bottom", height = 13 } })
    end,
    desc = "Horizontal (bottom)",
  },
  { "<leader>tv", toggle_vertical, desc = "Vertical (right)" },
  { "<leader>tf", toggle_float, desc = "Floating (center)" },
  {
    "<leader>tl",
    function()
      Snacks.lazygit()
    end,
    desc = "LazyGit",
  },

  -- LSP group
  { "<leader>l", group = "LSP" },
  { "<leader>li", ":LspInfo<cr>", desc = "Connected Language Servers" },
  { "<leader>lk", "<cmd>lua vim.lsp.buf.signature_help()<cr>", desc = "Signature Help" },
  { "<leader>lK", "<cmd>lua vim.lsp.buf.hover()<cr>", desc = "Hover Commands" },
  { "<leader>lw", "<cmd>lua vim.lsp.buf.add_workspace_folder()<cr>", desc = "Add Workspace Folder" },
  { "<leader>lW", "<cmd>lua vim.lsp.buf.remove_workspace_folder()<cr>", desc = "Remove Workspace Folder" },
  {
    "<leader>ll",
    "<cmd>lua print(vim.inspect(vim.lsp.buf.list_workspace_folders()))<cr>",
    desc = "List Workspace Folders",
  },
  { "<leader>lt", "<cmd>lua vim.lsp.buf.type_definition()<cr>", desc = "Type Definition" },
  { "<leader>ld", "<cmd>lua vim.lsp.buf.definition()<cr>", desc = "Go To Definition" },
  { "<leader>lD", "<cmd>lua vim.lsp.buf.declaration()<cr>", desc = "Go To Declaration" },
  { "<leader>lr", "<cmd>lua vim.lsp.buf.references()<cr>", desc = "References" },

  -- Zen mode (nested under LSP for now)
  { "<leader>lz", group = "Focus" },
  {
    "<leader>lzz",
    function()
      Snacks.zen()
    end,
    desc = "Toggle Zen Mode",
  },
  {
    "<leader>lzt",
    function()
      Snacks.toggle.dim():toggle()
    end,
    desc = "Toggle Dim",
  },
})
