local wezterm = require 'wezterm'
local act = wezterm.action

local config = wezterm.config_builder()

config.color_scheme = 'Catppuccin Mocha'

config.inactive_pane_hsb = {
  saturation = 0.5,
  brightness = 0.6,
}

config.keys = {
--   -- Disable Up arrow key
--   { key = 'UpArrow', action = wezterm.action.Nop },
--   -- Disable Down arrow key
--   { key = 'DownArrow', action = wezterm.action.Nop },
--   -- Disable Left arrow key
--   { key = 'LeftArrow', action = wezterm.action.Nop },
--   -- Disable Right arrow key
--   { key = 'RightArrow', action = wezterm.action.Nop },
  {
    key = 'w',
    mods = 'CMD',
    action = act.CloseCurrentPane { confirm = true },
  },
  {
    key = 'd',
    mods = 'CMD',
    action = act.SplitHorizontal { domain = 'CurrentPaneDomain' },
  },
  {
    key = 'd',
    mods = 'CMD|SHIFT',
    action = act.SplitVertical { domain = 'CurrentPaneDomain' },
  },
  {
  key = 'h',
  mods = 'CTRL|SHIFT',
  action = wezterm.action.ActivatePaneDirection 'Left',
},
{
  key = 'l',
  mods = 'CTRL|SHIFT',
  action = wezterm.action.ActivatePaneDirection 'Right',
},
{
  key = 'k',
  mods = 'CTRL|SHIFT',
  action = wezterm.action.ActivatePaneDirection 'Up',
},
{
  key = 'j',
  mods = 'CTRL|SHIFT',
  action = wezterm.action.ActivatePaneDirection 'Down',
},
}

-- Navigate panes with Vim keys
table.insert(config.keys, { key = 'h', mods = 'CTRL', action = act.ActivatePaneDirection 'Left' })
table.insert(config.keys, { key = 'j', mods = 'CTRL', action = act.ActivatePaneDirection 'Down' })
table.insert(config.keys, { key = 'k', mods = 'CTRL', action = act.ActivatePaneDirection 'Up' })
table.insert(config.keys, { key = 'l', mods = 'CTRL', action = act.ActivatePaneDirection 'Right' })

return config
