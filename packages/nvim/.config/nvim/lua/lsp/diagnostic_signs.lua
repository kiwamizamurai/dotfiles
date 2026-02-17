-- Configure diagnostics display
vim.diagnostic.config({
  signs = {
    text = {
      [vim.diagnostic.severity.ERROR] = " ",
      [vim.diagnostic.severity.WARN]  = " ",
      [vim.diagnostic.severity.HINT]  = " ",
      [vim.diagnostic.severity.INFO]  = " ",
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
  signs = false, -- handled above via signs.text
  underline = true,
  update_in_insert = false,
  severity_sort = true,
})

-- Hover window borders
if vim.lsp.handlers then
  vim.lsp.handlers["textDocument/hover"] = vim.lsp.with(
    vim.lsp.handlers.hover, {
      border = "rounded",
    }
  )

  vim.lsp.handlers["textDocument/signatureHelp"] = vim.lsp.with(
    vim.lsp.handlers.signature_help, {
      border = "rounded",
    }
  )
end