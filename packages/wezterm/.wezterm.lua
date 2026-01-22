local wezterm = require("wezterm")
local act = wezterm.action

local config = wezterm.config_builder()

-- =============================================================================
-- Appearance
-- =============================================================================
config.color_scheme = "Catppuccin Mocha"
config.window_background_opacity = 0.97
config.window_decorations = "RESIZE" -- Hide title bar, keep resize handles

-- Window size and padding
config.initial_cols = 120
config.initial_rows = 30
config.window_padding = {
	left = 10,
	right = 10,
	top = 10,
	bottom = 10,
}

-- =============================================================================
-- Font
-- =============================================================================
config.font = wezterm.font("Hack Nerd Font")
config.font_size = 14.0
config.line_height = 1.2

-- =============================================================================
-- Tab bar
-- =============================================================================
config.enable_tab_bar = true
config.hide_tab_bar_if_only_one_tab = true
config.show_new_tab_button_in_tab_bar = false
config.use_fancy_tab_bar = false -- Simple tab bar style
config.tab_bar_at_bottom = true

-- =============================================================================
-- Performance
-- =============================================================================
config.max_fps = 120
config.animation_fps = 60
config.cursor_blink_rate = 500

-- =============================================================================
-- Scrollback
-- =============================================================================
config.scrollback_lines = 10000
config.enable_scroll_bar = false

-- =============================================================================
-- Misc
-- =============================================================================
config.audible_bell = "Disabled"

-- Dim inactive panes
config.inactive_pane_hsb = {
	saturation = 0.5,
	brightness = 0.6,
}

-- =============================================================================
-- Key bindings
-- =============================================================================
config.keys = {
	-- Close current pane
	{
		key = "w",
		mods = "CMD",
		action = act.CloseCurrentPane({ confirm = true }),
	},
	-- Split pane horizontally
	{
		key = "d",
		mods = "CMD",
		action = act.SplitHorizontal({ domain = "CurrentPaneDomain" }),
	},
	-- Split pane vertically
	{
		key = "d",
		mods = "CMD|SHIFT",
		action = act.SplitVertical({ domain = "CurrentPaneDomain" }),
	},
	-- Toggle full screen
	{
		key = "n",
		mods = "SHIFT|CTRL",
		action = act.ToggleFullScreen,
	},
	-- Toggle pane zoom
	{
		key = "z",
		mods = "CMD",
		action = act.TogglePaneZoomState,
	},
	-- Search
	{
		key = "f",
		mods = "CMD",
		action = act.Search("CurrentSelectionOrEmptyString"),
	},
}

-- Navigate panes with Vim keys (Ctrl)
-- table.insert(config.keys, { key = "h", mods = "CTRL", action = act.ActivatePaneDirection("Left") })
-- table.insert(config.keys, { key = "j", mods = "CTRL", action = act.ActivatePaneDirection("Down") })
-- table.insert(config.keys, { key = "k", mods = "CTRL", action = act.ActivatePaneDirection("Up") })
-- table.insert(config.keys, { key = "l", mods = "CTRL", action = act.ActivatePaneDirection("Right") })

-- Navigate panes with Vim keys (Ctrl+Shift)
table.insert(config.keys, { key = "h", mods = "CTRL|SHIFT", action = act.ActivatePaneDirection("Left") })
table.insert(config.keys, { key = "j", mods = "CTRL|SHIFT", action = act.ActivatePaneDirection("Down") })
table.insert(config.keys, { key = "k", mods = "CTRL|SHIFT", action = act.ActivatePaneDirection("Up") })
table.insert(config.keys, { key = "l", mods = "CTRL|SHIFT", action = act.ActivatePaneDirection("Right") })

-- Switch tabs with Cmd+number
for i = 1, 8 do
	table.insert(config.keys, {
		key = tostring(i),
		mods = "CMD",
		action = act.ActivateTab(i - 1),
	})
end

return config
