-- snacks.nvim dashboard: a koi pond with a nav row on top and a quote in the lower left, after daoho.dev
local pond = require("dashboard-config.pond")

local keys = {
  { key = "f", label = "files", action = ":lua Snacks.picker.files()" },
  { key = "r", label = "recent", action = ":lua Snacks.picker.recent()" },
  { key = "g", label = "grep", action = ":lua Snacks.picker.grep()" },
  { key = "p", label = "projects", action = ":lua Snacks.picker.projects()" },
  { key = "c", label = "config", action = ":lua Snacks.picker.files({ cwd = vim.fn.stdpath('config') })" },
  { key = "l", label = "lazy", action = ":Lazy" },
  { key = "q", label = "quit", action = ":qa" },
}
local GAP = "    "
local QUOTE = { "in an ocean of gluttony,", "cast a fine net" }

local function nav()
  local text = {}
  for i, item in ipairs(keys) do
    table.insert(text, { item.label:sub(1, 1), hl = "DashboardPondKey" })
    table.insert(text, { item.label:sub(2) .. (i < #keys and GAP or ""), hl = "DashboardPondDim" })
  end
  return {
    text = text,
    align = "center",
    render = function(self, pos)
      pond.attach(
        self.buf,
        vim.tbl_map(function(item)
          return {
            row = pos[1] - 1,
            label = item.label,
            action = function()
              self:action(item.action)
            end,
          }
        end, keys)
      )
    end,
  }
end

local function about()
  local stats = require("lazy.stats").stats()
  local version = vim.version()
  return {
    { "neovim " .. version.major .. "." .. version.minor .. "." .. version.patch, hl = "DashboardPondText" },
    { " — " .. vim.fn.pathshorten(vim.fn.fnamemodify(vim.fn.getcwd(), ":~")) .. "\n", hl = "DashboardPondDim" },
    { "loaded " .. stats.loaded .. "/" .. stats.count .. " plugins in ", hl = "DashboardPondText" },
    { (math.floor(stats.startuptime * 100 + 0.5) / 100) .. "ms", hl = "DashboardPondText" },
  }
end

return {
  enabled = true,
  sections = function(self)
    local width, height = self._size.width, vim.api.nvim_win_get_height(self.win)
    -- left edge of the text at 20% of the window, nav centered in the remaining width
    self.opts.width = math.max(50, math.floor(width * 0.6))
    self.opts.row = 1
    local bottom = 3
    local used = 1 + #QUOTE + 1 + 2 + bottom
    local spacer = math.max(1, height - 1 - used)
    return {
      nav(),
      { text = { { (" \n"):rep(spacer - 1) .. " " } } },
      {
        text = { { table.concat(QUOTE, "\n"), hl = "DashboardPondDim" } },
        padding = 1,
        render = function(_, pos)
          pond.set_cursor(pos[1] - 1 + #QUOTE - 1, pos[2] + 2 + #QUOTE[#QUOTE])
        end,
      },
      { text = about(), padding = bottom },
      unpack(vim.tbl_map(function(item)
        return vim.tbl_extend("force", item, { hidden = true })
      end, keys)),
    }
  end,
}
