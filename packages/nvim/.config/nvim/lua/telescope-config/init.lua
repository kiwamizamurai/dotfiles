local actions = require('telescope.actions')
local previewers = require('telescope.previewers')

-- Custom buffer previewer that handles binary files
local buffer_previewer_maker = function(filepath, bufnr, opts)
  opts = opts or {}

  -- Check if file is binary (images, etc.)
  local binary_patterns = { '%.png$', '%.jpg$', '%.jpeg$', '%.gif$', '%.webp$', '%.ico$', '%.svg$', '%.pdf$' }
  local is_binary = false
  for _, pattern in ipairs(binary_patterns) do
    if filepath:match(pattern) then
      is_binary = true
      break
    end
  end

  if is_binary then
    -- Show a message for binary files instead of trying to preview
    vim.api.nvim_buf_set_lines(bufnr, 0, -1, false, {
      '',
      '  Image/Binary File',
      '',
      '  File: ' .. vim.fn.fnamemodify(filepath, ':t'),
      '  Type: ' .. (filepath:match('%.([^%.]+)$') or 'unknown'):upper(),
      '',
      '  Press <Enter> to open with image.nvim',
      '',
      '  Note: Image preview in Telescope is not supported.',
      '  The file will open normally when selected.',
    })
    vim.bo[bufnr].filetype = 'text'
  else
    -- Use default previewer for text files
    previewers.buffer_previewer_maker(filepath, bufnr, opts)
  end
end

require('telescope').setup {
    defaults = {
        layout_config = {
          width = 0.75,
          prompt_position = "top",
          preview_cutoff = 120,
          horizontal = {mirror = false},
          vertical = {mirror = false},
        },
        find_command = {'rg', '--no-heading', '--with-filename', '--line-number', '--column', '--smart-case'},
        prompt_prefix = " ",
        selection_caret = " ",
        entry_prefix = "  ",
        initial_mode = "insert",
        selection_strategy = "reset",
        sorting_strategy = "descending",
        layout_strategy = "horizontal",
        file_sorter = require'telescope.sorters'.get_fuzzy_file,
        file_ignore_patterns = {
          'node_modules/.*',
          '.git/.*',
          '.cache/.*',
        },
        generic_sorter = require'telescope.sorters'.get_generic_fuzzy_sorter,
        path_display = { "truncate" },
        winblend = 0,
        border = {},
        borderchars = {'─', '│', '─', '│', '╭', '╮', '╯', '╰'},
        color_devicons = true,
        use_less = true,
        set_env = {['COLORTERM'] = 'truecolor'}, -- default = nil,
        file_previewer = require'telescope.previewers'.vim_buffer_cat.new,
        grep_previewer = require'telescope.previewers'.vim_buffer_vimgrep.new,
        qflist_previewer = require'telescope.previewers'.vim_buffer_qflist.new,
        -- Use custom buffer previewer for handling binary files
        buffer_previewer_maker = buffer_previewer_maker,
        mappings = {
            i = {
                ["<C-j>"] = actions.move_selection_next,
                ["<C-k>"] = actions.move_selection_previous,
                ["<C-q>"] = actions.smart_send_to_qflist + actions.open_qflist,
                ["<esc>"] = actions.close,
                ["<CR>"] = actions.select_default + actions.center
            },
            n = {
                ["<C-j>"] = actions.move_selection_next,
                ["<C-k>"] = actions.move_selection_previous,
                ["<C-q>"] = actions.smart_send_to_qflist + actions.open_qflist,
            }
        }
    },
    -- Extensions configuration
    extensions = {
        -- Add extension configurations here if needed
    }
}