-- Modern nvim-tree configuration
require('nvim-tree').setup({
  -- Window settings
  view = {
    width = 30,
    side = "left",
    number = false,
    relativenumber = false,
  },

  -- Renderer settings
  renderer = {
    indent_markers = {
      enable = true,
      icons = {
        corner = "└",
        edge = "│",
        item = "│",
        none = " ",
      },
    },
    icons = {
      glyphs = {
        default = "",
        symlink = "",
        folder = {
          arrow_closed = "",
          arrow_open = "",
          default = "",
          open = "",
          empty = "",
          empty_open = "",
          symlink = "",
          symlink_open = "",
        },
        git = {
          unstaged = "✗",
          staged = "✓",
          unmerged = "",
          renamed = "➜",
          untracked = "★",
          deleted = "",
          ignored = "◌",
        },
      },
    },
  },

  -- Git integration
  git = {
    enable = true,
    ignore = false,
    timeout = 400,
  },

  -- Filtering
  filters = {
    dotfiles = false,
    git_ignored = true,  -- This replaces the old 'gitignore' option
    custom = { ".git", "node_modules", ".cache" },
  },

  -- Actions
  actions = {
    open_file = {
      quit_on_open = false,
      resize_window = true,
      window_picker = {
        enable = true,
        chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
        exclude = {
          filetype = { "notify", "packer", "qf", "diff", "fugitive", "fugitiveblame" },
          buftype = { "nofile", "terminal", "help" },
        },
      },
    },
  },

  -- Update focused file
  update_focused_file = {
    enable = true,
    update_root = true,
  },

  -- System open command
  system_open = {
    cmd = nil,
    args = {},
  },

  -- Diagnostics
  diagnostics = {
    enable = true,
    show_on_dirs = true,
    icons = {
      hint = "",
      info = "",
      warning = "",
      error = "",
    },
  },
})