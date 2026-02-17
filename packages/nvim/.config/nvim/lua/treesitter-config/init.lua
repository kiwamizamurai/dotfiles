-- nvim-treesitter (rewritten API) + nvim-treesitter-textobjects

local parsers = {
  "html", "javascript", "typescript", "tsx", "lua", "python",
  "go", "dockerfile", "rust", "markdown", "markdown_inline", "json",
  "yaml", "toml", "css", "scss", "vim", "vimdoc", "bash", "regex",
}

-- Install parsers
require('nvim-treesitter').install(parsers)

-- Enable treesitter highlighting for common filetypes
vim.api.nvim_create_autocmd('FileType', {
  pattern = parsers,
  callback = function(args)
    local max_filesize = 100 * 1024
    local ok, stats = pcall(vim.uv.fs_stat, vim.api.nvim_buf_get_name(args.buf))
    if ok and stats and stats.size > max_filesize then return end
    vim.treesitter.start()
  end,
})

-- Enable treesitter indentation
vim.api.nvim_create_autocmd('FileType', {
  pattern = {
    'html', 'javascript', 'typescript', 'tsx', 'lua', 'python',
    'go', 'rust', 'json', 'yaml', 'css', 'scss',
  },
  callback = function()
    vim.bo.indentexpr = "v:lua.require'nvim-treesitter'.indentexpr()"
  end,
})

-- Text objects (nvim-treesitter-textobjects new API)
require("nvim-treesitter-textobjects").setup({
  select = {
    enable = true,
    lookahead = true,
    keymaps = {
      ["af"] = "@function.outer",
      ["if"] = "@function.inner",
      ["ac"] = "@class.outer",
      ["ic"] = "@class.inner",
      ["aa"] = "@parameter.outer",
      ["ia"] = "@parameter.inner",
    },
  },
  move = {
    enable = true,
    set_jumps = true,
    goto_next_start = {
      ["]f"] = "@function.outer",
      ["]c"] = "@class.outer",
      ["]a"] = "@parameter.outer",
    },
    goto_next_end = {
      ["]F"] = "@function.outer",
      ["]C"] = "@class.outer",
      ["]A"] = "@parameter.outer",
    },
    goto_previous_start = {
      ["[f"] = "@function.outer",
      ["[c"] = "@class.outer",
      ["[a"] = "@parameter.outer",
    },
    goto_previous_end = {
      ["[F"] = "@function.outer",
      ["[C"] = "@class.outer",
      ["[A"] = "@parameter.outer",
    },
  },
})
