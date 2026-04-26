-- Setup LSP server configurations (Neovim 0.11+ / nvim-lspconfig v2 / mason-lspconfig v2)
-- - vim.lsp.config()  to configure servers  (replaces lspconfig[server].setup())
-- - vim.lsp.enable()  to enable servers     (called automatically by mason-lspconfig)

local capabilities = require('cmp_nvim_lsp').default_capabilities()

vim.lsp.config('*', {
  capabilities = capabilities,
})

-- Rounded borders for hover / signature_help (Neovim 0.11+: pass border via opts; vim.lsp.with removed)
vim.api.nvim_create_autocmd('LspAttach', {
  callback = function(args)
    local opts = { buffer = args.buf }
    vim.keymap.set('n', 'K', function() vim.lsp.buf.hover({ border = 'rounded' }) end, opts)
    vim.keymap.set({ 'n', 'i' }, '<C-k>', function() vim.lsp.buf.signature_help({ border = 'rounded' }) end, opts)
  end,
})

-- Server-specific configurations
vim.lsp.config('lua_ls', {
  settings = {
    Lua = {
      runtime = { version = 'LuaJIT' },
      diagnostics = {
        globals = { 'vim' },
      },
      workspace = {
        library = vim.api.nvim_get_runtime_file("", true),
        checkThirdParty = false,
      },
      telemetry = { enable = false },
    }
  }
})

vim.lsp.config('pyright', {
  settings = {
    python = {
      analysis = {
        autoSearchPaths = true,
        typeCheckingMode = "basic",
        useLibraryCodeForTypes = true,
      }
    }
  }
})

vim.lsp.config('ts_ls', {
  settings = {
    completions = {
      completeFunctionCalls = true
    }
  }
})
