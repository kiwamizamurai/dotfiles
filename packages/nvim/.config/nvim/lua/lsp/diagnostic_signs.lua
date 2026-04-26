-- Configure diagnostics display
vim.diagnostic.config({
  signs = {
    text = {
      [vim.diagnostic.severity.ERROR] = "󰅚 ",
      [vim.diagnostic.severity.WARN]  = "󰀪 ",
      [vim.diagnostic.severity.HINT]  = "󰌶 ",
      [vim.diagnostic.severity.INFO]  = "󰋽 ",
    },
  },
  virtual_text = {
    prefix = "●",
    spacing = 4,
    source = "if_many",
  },
  float = {
    source = "always",
    border = "rounded",
  },
  underline = true,
  update_in_insert = false,
  severity_sort = true,
})

