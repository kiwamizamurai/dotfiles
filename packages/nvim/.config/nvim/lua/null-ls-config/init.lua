-- Formatting is handled by conform.nvim; null-ls is only used for diagnostics
local null_ls = require('null-ls')

null_ls.setup({
  sources = {
    null_ls.builtins.diagnostics.codespell.with({ filetypes = { 'markdown' } }),
  },
})
