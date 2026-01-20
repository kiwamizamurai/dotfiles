-- Setup LSP servers for Neovim 0.11+
local capabilities = require('cmp_nvim_lsp').default_capabilities()

-- Server configurations
local server_configs = {
  lua_ls = {
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
  },
  pyright = {
    settings = {
      python = {
        analysis = {
          autoSearchPaths = true,
          typeCheckingMode = "basic",
          useLibraryCodeForTypes = true,
        }
      }
    }
  },
  ts_ls = {
    settings = {
      completions = {
        completeFunctionCalls = true
      }
    }
  },
  -- Legacy name for TypeScript server
  tsserver = {
    settings = {
      completions = {
        completeFunctionCalls = true
      }
    }
  }
}

-- Function to setup a single LSP server using the new vim.lsp API
local function setup_lsp_server(server_name)
  local config = server_configs[server_name] or {}
  config.capabilities = capabilities

  -- For Neovim 0.11+, use vim.lsp.config if available
  if vim.lsp.config and vim.lsp.config[server_name] then
    vim.lsp.config[server_name] = config
    vim.lsp.enable(server_name)
  else
    -- Fallback to old API for compatibility
    local lspconfig_ok, lspconfig = pcall(require, 'lspconfig')
    if lspconfig_ok and lspconfig[server_name] then
      lspconfig[server_name].setup(config)
    end
  end
end

-- Setup all servers
local function setup_servers()
  -- Check if mason-lspconfig is available
  local mason_ok, mason_lspconfig = pcall(require, 'mason-lspconfig')

  if mason_ok then
    -- Get installed servers from Mason
    local installed_servers = mason_lspconfig.get_installed_servers()

    -- Setup each installed server
    for _, server_name in ipairs(installed_servers) do
      -- Skip non-LSP servers (formatters, linters, etc.)
      if server_configs[server_name] or
         server_name == "lua_ls" or
         server_name == "pyright" or
         server_name == "ts_ls" or
         server_name == "tsserver" then
        setup_lsp_server(server_name)
      end
    end
  else
    -- Fallback: setup basic servers without mason
    local servers = { 'lua_ls', 'pyright', 'ts_ls' }
    for _, server in ipairs(servers) do
      setup_lsp_server(server)
    end
  end
end

-- Call setup_servers
setup_servers()

-- Return module for manual server setup if needed
return {
  setup_server = setup_lsp_server,
  setup_all = setup_servers
}