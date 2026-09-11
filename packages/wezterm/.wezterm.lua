local wezterm = require("wezterm")
local act = wezterm.action

local config = wezterm.config_builder()

-- =============================================================================
-- Appearance
-- =============================================================================
config.color_scheme = "Builtin Dark"
config.window_background_opacity = 0.97
config.macos_window_background_blur = 20
config.window_decorations = "RESIZE" -- Hide title bar, keep resize handles
config.window_frame = {
	border_left_width = "2px",
	border_right_width = "2px",
	border_top_height = "2px",
	border_bottom_height = "2px",
	border_left_color = "#ffffff",
	border_right_color = "#ffffff",
	border_top_color = "#ffffff",
	border_bottom_color = "#ffffff",
}
config.native_macos_fullscreen_mode = true

-- Window size and padding
config.initial_cols = 120
config.initial_rows = 30
config.window_padding = {
	left = 10,
	right = 10,
	top = 10,
	bottom = 10,
}
config.adjust_window_size_when_changing_font_size = false
config.use_resize_increments = true
config.window_close_confirmation = "NeverPrompt"

-- =============================================================================
-- Font
-- =============================================================================
config.font_dirs = { wezterm.home_dir .. "/Library/Fonts" }
config.font = wezterm.font_with_fallback({
	{ family = "DotGothic16", weight = "Regular" },
	{ family = "Maple Mono NF", weight = "Regular" },
	"Apple Color Emoji",
})
config.font_size = 14.0
config.line_height = 1.1
config.use_ime = true

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
config.front_end = "WebGpu"
config.webgpu_power_preference = "LowPower"
config.max_fps = 60
config.animation_fps = 60
config.default_cursor_style = "BlinkingBlock"
config.cursor_blink_rate = 700
config.cursor_blink_ease_in = "Constant"
config.cursor_blink_ease_out = "Constant"

-- =============================================================================
-- Scrollback
-- =============================================================================
config.scrollback_lines = 10000
config.enable_scroll_bar = false

-- =============================================================================
-- Bell
-- =============================================================================
config.audible_bell = "Disabled"
config.visual_bell = {
	fade_in_duration_ms = 75,
	fade_out_duration_ms = 75,
	target = "CursorColor",
}

-- =============================================================================
-- Misc
-- =============================================================================

-- Dim inactive panes
config.inactive_pane_hsb = {
	saturation = 0.7,
	brightness = 0.65,
}

-- Pane split border colors
config.colors = {
	background = "#090c08",
	foreground = "#d8a657",
	cursor_bg = "#f2bd68",
	cursor_fg = "#090c08",
	selection_bg = "#594521",
	split = "#8a6b35",
	tab_bar = {
		background = "#090c08",
		active_tab = {
			bg_color = "#ffffff",
			fg_color = "#090c08",
			intensity = "Bold",
		},
		inactive_tab = {
			bg_color = "#090c08",
			fg_color = "#8a6b35",
		},
		inactive_tab_hover = {
			bg_color = "#231c0e",
			fg_color = "#ffffff",
		},
	},
}

-- =============================================================================
-- Workspaces (tmux-like sessions)
-- =============================================================================
config.default_workspace = "main"

-- =============================================================================
-- Quick Select patterns (URL / git SHA / JIRA-style ticket key)
-- =============================================================================
config.quick_select_patterns = {
	"[0-9a-f]{7,40}",
	"https?://\\S+",
	"\\b[A-Z]+-\\d+\\b",
}

-- =============================================================================
-- Events
-- =============================================================================

-- OS notification on bell (e.g. background build finished)
wezterm.on("bell", function(window, pane)
	window:toast_notification("WezTerm", "Bell in " .. pane:get_title(), nil, 4000)
end)

-- Right status: workspace / cwd / time
wezterm.on("update-status", function(window, pane)
	local cwd_str = ""
	local cwd = pane:get_current_working_dir()
	if cwd then
		cwd_str = cwd.file_path:match("([^/]+)/?$") or ""
	end
	local workspace = window:active_workspace()
	window:set_right_status(wezterm.format({
		{ Foreground = { Color = "#d8a657" } },
		{ Text = " [" .. workspace .. "] " },
		{ Foreground = { Color = "#b38b4d" } },
		{ Text = "  " .. cwd_str .. " " },
		{ Foreground = { Color = "#f2bd68" } },
		{ Text = " " .. wezterm.strftime("%H:%M") .. " " },
	}))
end)

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
	-- Open URL via Quick Select (mouse-free)
	{
		key = "u",
		mods = "CMD|SHIFT",
		action = act.QuickSelectArgs({
			label = "open url",
			patterns = { "https?://\\S+" },
			action = wezterm.action_callback(function(win, pane)
				local url = win:get_selection_text_for_pane(pane)
				if url and #url > 0 then
					wezterm.open_with(url)
				end
			end),
		}),
	},
	-- Emoji / character picker
	{
		key = "8",
		mods = "CTRL|SHIFT",
		action = act.CharSelect({ copy_on_select = true }),
	},
	-- Workspace switcher (fuzzy)
	{
		key = "s",
		mods = "CMD",
		action = act.ShowLauncherArgs({ flags = "FUZZY|WORKSPACES" }),
	},
	-- Create / switch to a named workspace
	{
		key = "S",
		mods = "CMD|SHIFT",
		action = act.PromptInputLine({
			description = "New workspace name:",
			action = wezterm.action_callback(function(win, pane, line)
				if line and #line > 0 then
					win:perform_action(act.SwitchToWorkspace({ name = line }), pane)
				end
			end),
		}),
	},
	-- Debug overlay (REPL / log)
	{
		key = "L",
		mods = "CMD|SHIFT",
		action = act.ShowDebugOverlay,
	},
	-- Toggle background opacity (handy for screenshots)
	{
		key = "o",
		mods = "CMD|SHIFT",
		action = wezterm.action_callback(function(win)
			local overrides = win:get_config_overrides() or {}
			if overrides.window_background_opacity == 1.0 then
				overrides.window_background_opacity = 0.97
			else
				overrides.window_background_opacity = 1.0
			end
			win:set_config_overrides(overrides)
		end),
	},
}

-- Navigate panes with Vim keys (Ctrl+Shift)
table.insert(config.keys, { key = "h", mods = "CTRL|SHIFT", action = act.ActivatePaneDirection("Left") })
table.insert(config.keys, { key = "j", mods = "CTRL|SHIFT", action = act.ActivatePaneDirection("Down") })
table.insert(config.keys, { key = "k", mods = "CTRL|SHIFT", action = act.ActivatePaneDirection("Up") })
table.insert(config.keys, { key = "l", mods = "CTRL|SHIFT", action = act.ActivatePaneDirection("Right") })

-- Switch tabs with Cmd+number (1..8)
for i = 1, 8 do
	table.insert(config.keys, {
		key = tostring(i),
		mods = "CMD",
		action = act.ActivateTab(i - 1),
	})
end
-- Cmd+9 jumps to the last tab
table.insert(config.keys, { key = "9", mods = "CMD", action = act.ActivateTab(-1) })

return config
