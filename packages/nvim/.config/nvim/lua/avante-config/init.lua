local M = {}

function M.setup(opts)
  -- Setup avante with the provided options
  require('avante').setup(opts)

  -- Setup which-key integration for better discoverability
  local ok, wk = pcall(require, 'which-key')
  if ok then
    wk.add({
      -- AI Assistant group
      { "<leader>a", group = "AI Assistant (Avante)" },
      { "<leader>aa", "<cmd>AvanteAsk<cr>", desc = "Ask AI about code" },
      { "<leader>ae", "<cmd>AvanteEdit<cr>", desc = "Edit selected code with AI" },
      { "<leader>ar", "<cmd>AvanteRefresh<cr>", desc = "Refresh AI context" },
      { "<leader>at", "<cmd>AvanteToggle<cr>", desc = "Toggle AI sidebar" },
      { "<leader>ac", "<cmd>AvanteClear<cr>", desc = "Clear chat history" },
      { "<leader>af", "<cmd>AvanteFocus<cr>", desc = "Focus AI sidebar" },
      { "<leader>as", "<cmd>AvanteShowCursor<cr>", desc = "Show cursor in sidebar" },
      { "<leader>ab", "<cmd>AvanteBuild<cr>", desc = "Build/Rebuild index" },
      { "<leader>an", "<cmd>AvanteChat<cr>", desc = "New AI conversation" },
      { "<leader>ah", "<cmd>AvanteSwitchProvider<cr>", desc = "Switch AI provider" },
      { "<leader>a?", "<cmd>AvanteShowProviders<cr>", desc = "Show available providers" },

      -- Debug/Settings subgroup
      { "<leader>ad", group = "Debug/Settings" },
      { "<leader>add", "<cmd>AvanteToggleDebug<cr>", desc = "Toggle debug mode" },
      { "<leader>adh", "<cmd>AvanteToggleHint<cr>", desc = "Toggle hints" },

      -- Harpoon group documentation (actual keymaps set in plugins/init.lua)
      { "<leader>h", group = "Harpoon" },
    })

    -- Register non-leader keymaps for documentation
    wk.add({
      { "<M-l>", desc = "Accept AI suggestion", mode = "i" },
      { "<M-]>", desc = "Next AI suggestion", mode = "i" },
      { "<M-[>", desc = "Previous AI suggestion", mode = "i" },
      { "<C-]>", desc = "Dismiss AI suggestion", mode = "i" },
    })
  end

  -- Print setup confirmation
  vim.notify("Avante.nvim configured successfully! Use <leader>a to access AI features", vim.log.levels.INFO, { title = "Avante" })

  -- Show reminder about API keys if not set
  local function check_api_keys()
    local claude_key = vim.env.ANTHROPIC_API_KEY or vim.env.AVANTE_ANTHROPIC_API_KEY
    local openai_key = vim.env.OPENAI_API_KEY or vim.env.AVANTE_OPENAI_API_KEY

    if not claude_key and opts.provider == "claude" then
      vim.notify(
        "Claude API key not found!\n" ..
        "Please set ANTHROPIC_API_KEY or AVANTE_ANTHROPIC_API_KEY in your environment.\n" ..
        "Add to ~/.zshrc: export ANTHROPIC_API_KEY='your-key-here'",
        vim.log.levels.WARN,
        { title = "Avante" }
      )
    end

    if not openai_key and opts.provider == "openai" then
      vim.notify(
        "OpenAI API key not found!\n" ..
        "Please set OPENAI_API_KEY or AVANTE_OPENAI_API_KEY in your environment.\n" ..
        "Add to ~/.zshrc: export OPENAI_API_KEY='your-key-here'",
        vim.log.levels.WARN,
        { title = "Avante" }
      )
    end
  end

  -- Check API keys after a short delay to not block startup
  vim.defer_fn(function()
    check_api_keys()
  end, 1000)
end

return M
