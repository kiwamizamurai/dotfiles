-- Setup LSP server configurations (Neovim 0.11+ / nvim-lspconfig v2 / mason-lspconfig v2)
-- - vim.lsp.config()  to configure servers  (replaces lspconfig[server].setup())
-- - vim.lsp.enable()  to enable servers     (called automatically by mason-lspconfig)

local capabilities = require('cmp_nvim_lsp').default_capabilities()

-- Apply capabilities to all servers globally
vim.lsp.config('*', {
  capabilities = capabilities,
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
