local null_ls = require('null-ls')

local formatting = null_ls.builtins.formatting
local diagnostics = null_ls.builtins.diagnostics

null_ls.setup({
  sources = {
    formatting.prettier,
    formatting.black,
    formatting.gofmt,
    formatting.shfmt,
    formatting.clang_format,
    formatting.cmake_format,
    formatting.dart_format,
    formatting.stylua,
    formatting.isort,
    diagnostics.codespell.with({ filetypes = { 'markdown' } }),
  },
})
