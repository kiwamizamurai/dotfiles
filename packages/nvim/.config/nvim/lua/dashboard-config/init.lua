local dashboard = require('dashboard')

dashboard.setup({
  theme = 'doom',
  config = {
    header = {
      '',
      ' ⣿⠟⣽⣿⣿⣿⣿⣿⢣⠟⠋⡜⠄⢸⣿⣿⡟⣬⢁⠠⠁⣤⠄⢰⠄⠇⢻⢸ ',
      ' ⢏⣾⣿⣿⣿⠿⣟⢁⡴⡀⡜⣠⣶⢸⣿⣿⢃⡇⠂⢁⣶⣦⣅⠈⠇⠄⢸⢸ ',
      ' ⣹⣿⣿⣿⡗⣾⡟⡜⣵⠃⣴⣿⣿⢸⣿⣿⢸⠘⢰⣿⣿⣿⣿⡀⢱⠄⠨⢸ ',
      ' ⣿⣿⣿⣿⡇⣿⢁⣾⣿⣾⣿⣿⣿⣿⣸⣿⡎⠐⠒⠚⠛⠛⠿⢧⠄⠄⢠⣼ ',
      ' ⣿⣿⣿⣿⠃⠿⢸⡿⠭⠭⢽⣿⣿⣿⢂⣿⠃⣤⠄⠄⠄⠄⠄⠄⠄⠄⣿⡾ ',
      ' ⣼⠏⣿⡏⠄⠄⢠⣤⣶⣶⣾⣿⣿⣟⣾⣾⣼⣿⠒⠄⠄⠄⡠⣴⡄⢠⣿⣵ ',
      ' ⣳⠄⣿⠄⠄⢣⠸⣹⣿⡟⣻⣿⣿⣿⣿⣿⣿⡿⡻⡖⠦⢤⣔⣯⡅⣼⡿⣹ ',
      ' ⡿⣼⢸⠄⠄⣷⣷⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣕⡜⡌⡝⡸⠙⣼⠟⢱⠏ ',
      ' ⡇⣿⣧⡰⡄⣿⣿⣿⣿⡿⠿⠿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣋⣪⣥⢠⠏⠄ ',
      ' ⣧⢻⣿⣷⣧⢻⣿⣿⣿⡇⠄⢀⣀⣀⡙⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠂⠄⠄ ',
      ' ⢹⣼⣿⣿⣿⣧⡻⣿⣿⣇⣴⣿⣿⣿⣷⢸⣿⣿⣿⣿⣿⣿⣿⣿⣰⠄⠄⠄ ',
      ' ⣼⡟⡟⣿⢸⣿⣿⣝⢿⣿⣾⣿⣿⣿⢟⣾⣿⣿⣿⣿⣿⣿⣿⣿⠟⠄⡀⡀ ',
      ' ⣿⢰⣿⢹⢸⣿⣿⣿⣷⣝⢿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠿⠛⠉⠄⠄⣸⢰⡇ ',
      ' ⣿⣾⣹⣏⢸⣿⣿⣿⣿⣿⣷⣍⡻⣛⣛⣛⡉⠁⠄⠄⠄⠄⠄⠄⢀⢇⡏⠄ ',
      '',
      '',
    },
    center = {
      {
        icon = '  ',
        icon_hl = 'Title',
        desc = 'Find File           ',
        desc_hl = 'String',
        key = 'f',
        keymap = 'SPC f f',
        key_hl = 'Number',
        key_format = ' %s',
        action = 'Telescope find_files'
      },
      {
        icon = '  ',
        desc = 'Recent Files',
        key = 'r',
        keymap = 'SPC f r',
        key_format = ' %s',
        action = 'Telescope oldfiles'
      },
      {
        icon = '  ',
        desc = 'Search Text',
        key = 's',
        keymap = 'SPC f g',
        key_format = ' %s',
        action = 'Telescope live_grep'
      },
      {
        icon = '  ',
        desc = 'Config',
        key = 'c',
        keymap = 'SPC f c',
        key_format = ' %s',
        action = 'edit ~/.config/nvim/init.lua'
      },
      {
        icon = '  ',
        desc = 'Update Plugins',
        key = 'u',
        keymap = 'SPC p u',
        key_format = ' %s',
        action = 'Lazy update'
      },
      {
        icon = '󰩈  ',
        desc = 'Quit',
        key = 'q',
        keymap = 'SPC q',
        key_format = ' %s',
        action = 'qa'
      },
    },
    footer = {
      '',
      'Made with ❤️ by kiwamizamurai',
      '',
    }
  }
})

-- Set colorscheme after dashboard loads
vim.api.nvim_create_autocmd("User", {
  pattern = "DashboardReady",
  callback = function()
    vim.cmd("highlight DashboardHeader guifg=#9ece6a")
    vim.cmd("highlight DashboardCenter guifg=#7aa2f7")
    vim.cmd("highlight DashboardFooter guifg=#bb9af7")
  end,
})