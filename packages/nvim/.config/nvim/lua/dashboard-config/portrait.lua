-- A chibi shrine maiden dozing by the koi pond, drawn as colour pixels (two per cell with half blocks).
-- She sleeps with a nose bubble and nods off, wakes with a pop, watches the koi, blinks,
-- then gets drowsy and falls asleep again.
local M = {}

local C = {
  H = "#3a3150", -- black hair
  h = "#615a8e", -- hair highlight
  S = "#f8e1d2", -- skin
  s = "#e9c4b0", -- skin shadow
  B = "#f4a3ad", -- blush
  E = "#2b1e2a", -- eyes
  I = "#a8475e", -- iris
  W = "#fbf7f0", -- highlight, paper ribbon
  w = "#f6f3ee", -- white kosode
  g = "#d8d2ca", -- kosode folds
  r = "#d8443c", -- red under-collar
  R = "#c8372f", -- hakama
  Q = "#9e2a25", -- hakama pleats
  M = "#d4707a", -- mouth
  U = "#a8d8ea", -- nose bubble
}

-- stylua: ignore
local AHOGE = { "..HH.", ".H...", ".HH..", "..H.." }
-- stylua: ignore
local HEAD = {
  ".........HHHHHHHH.........",
  "......HHHHHHHHHHHHHH......",
  "....HHHHHhhHHHHHHHHHHH....",
  "...HHHHhhHHHHHHHHHHHHHH...",
  "..HHHHhHHHHHHHHHHHHHHHHH..",
  "..HHHHHHHHHHHHHHHHHHHHHHH.",
  ".HHHHHHHHHHHHHHHHHHHHHHHH.",
  ".HHHHHHHHHHHHHHHHHHHHHHHH.",
  ".HHHHHHHHHHHHHHHHHHHHHHHHH",
  "HHHHSSSSSSSSHSSSSSSSSSHHHH",
  "HHHHSSSSSSSSSSSSSSSSSSHHHH",
  "HHHSSSSSSSSSSSSSSSSSSSSHHH",
  "HHHSSSSSSSSSSSSSSSSSSSSHHH",
  "HHHSSSSSSSSSSSSSSSSSSSSHHH",
  "HHHSSSSSSSSSSSSSSSSSSSSHHH",
  "HHHHSSSSSSSSSSSSSSSSSSHHHH",
  "HHHH..SSSSSSSSSSSSSS..HHHH",
  "HHHH....ssSSSSSSss....HHHH",
}
-- stylua: ignore
local BODY = {
  "HHHH......sSSSSs......HHHH",
  "HHHH.......SSSS.......HHHH",
  "HHHH...wwrrSSSSrrww...HHHH",
  "....wwwwwwrrSSrrwwwwww....",
  "..wwwwwwwwwwrrrwwwwwwwww..",
  ".wwgwwwwwwwwwrwwwwwwwwgww.",
  "wwwgwwwwwwwwwwwwwwwwwwgwww",
  "RRRRQRRRRRQRRRRQRRRRRQRRRR",
}
-- stylua: ignore
local RIBBON = { "W...W", "WWRWW", "R...R" }

local TOP = #AHOGE -- pixels above the head for the ahoge
local W, H = #HEAD[1], TOP + #HEAD + #BODY
M.width, M.height = W, math.ceil(H / 2)

-- one cycle of her day, in seconds
local CYCLE = 16
local WAKE, AWAKE, DROWSY, ASLEEP = 10, 10.3, 13.5, 15

local function smooth(x)
  x = math.max(0, math.min(1, x))
  return x * x * (3 - 2 * x)
end

local function blit(canvas, sprite, ox, oy, shift)
  for y, line in ipairs(sprite) do
    for x = 1, #line do
      local key = line:sub(x, x)
      if key ~= "." then
        local px, py = ox + x - 1 + (shift and shift(y - 1, x - 1) or 0), oy + y - 1
        if px >= 0 and px < W and py >= 0 and py < H then
          canvas[py] = canvas[py] or {}
          canvas[py][px] = C[key]
        end
      end
    end
  end
end

local function dot(canvas, x, y, key)
  if x >= 0 and x < W and y >= 0 and y < H then
    canvas[y] = canvas[y] or {}
    canvas[y][x] = C[key]
  end
end

--- Pixel canvas for time `t`: canvas[y][x] = "#rrggbb" or nil, `W` x `H` pixels
---@param look? number -1, 0 or 1: which way to glance while awake
function M.frame(t, look)
  local p = t % CYCLE
  local asleep = p < WAKE or p >= ASLEEP
  local canvas = {}

  -- head motion: breathing, nodding off while asleep, sinking while drowsy
  local breath = 0.5 + 0.5 * math.sin(t * 1.4)
  local nod = asleep and smooth(((p % 5) - 3) / 1.5) * (1 - smooth(((p % 5) - 4.6) / 0.2)) or 0
  local droop = (p >= DROWSY and p < ASLEEP) and smooth((p - DROWSY) / (ASLEEP - DROWSY)) or 0
  local dip = math.floor((asleep and breath or 0) + 2 * nod + droop + 0.5)
  local tilt = asleep and math.floor(math.sin(t * 0.5) + 0.5) or 0
  local hy = TOP + dip

  local function hair_sway(y, x)
    if x < 4 or x > W - 5 then
      return math.floor(0.9 * math.sin(t * 1.3 + y * 0.35) + 0.5)
    end
    return 0
  end

  blit(canvas, BODY, 0, TOP + #HEAD, hair_sway)
  blit(canvas, HEAD, tilt, hy, function(y, x)
    return y > 8 and hair_sway(y, x) or 0
  end)
  blit(canvas, AHOGE, 10 + tilt, hy - TOP, function(y)
    return math.floor(math.sin(t * 2.2 - y * 0.6) * (1 - y / TOP) * 1.6 + 0.5)
  end)
  blit(canvas, RIBBON, 18 + tilt, hy + 1)

  local ex, ey = tilt, hy + 11 -- eye row (left eye starts at x = 5)
  local function both(fn)
    fn(ex + 5)
    fn(ex + 15)
  end
  if asleep then
    -- closed, content eyes
    both(function(x)
      dot(canvas, x, ey, "E")
      dot(canvas, x + 4, ey, "E")
      for i = 1, 3 do
        dot(canvas, x + i, ey + 1, "E")
      end
    end)
    dot(canvas, ex + 12, ey + 4, "M")
    dot(canvas, ex + 13, ey + 4, "M")
    -- nose bubble, breathing in and out
    local r = 1 + 1.5 * breath
    local cx, cy = ex + 13 + r, ey + 3.5 + r * 0.5
    for y = math.floor(cy - r - 1), math.ceil(cy + r + 1) do
      for x = math.floor(cx - r - 1), math.ceil(cx + r + 1) do
        if math.abs(math.sqrt((x - cx) ^ 2 + (y - cy) ^ 2) - r) < 0.6 then
          dot(canvas, x, y, "U")
        end
      end
    end
    dot(canvas, math.floor(cx - r * 0.4), math.floor(cy - r * 0.5), "W")
  else
    local blink = (p > 11.6 and p < 11.75) or (p > 12.8 and p < 12.95)
    local startled = p < AWAKE + 0.4
    local lidded = droop > 0.35
    local gaze = startled and 0 or (look or 0)
    both(function(x)
      if blink then
        for i = 0, 4 do
          dot(canvas, x + i, ey + 1, "E")
        end
        return
      end
      -- big round eyes: dark top, lighter iris below, highlights that follow her gaze
      if lidded then
        for dx = 0, 4 do
          dot(canvas, x + dx, ey, "E")
        end
        for dx = 1, 3 do
          dot(canvas, x + dx, ey + 1, "I")
        end
        return
      end
      -- stylua: ignore
      local EYE = { ".EEE.", "EEEEE", "EEEEE", "EIIIE", ".III." }
      for dy, line in ipairs(EYE) do
        for dx = 1, 5 do
          if line:sub(dx, dx) ~= "." then
            dot(canvas, x + dx - 1, ey - 3 + dy, line:sub(dx, dx))
          end
        end
      end
      dot(canvas, x + 1 + gaze, ey - 1, "W")
      dot(canvas, x + 2 + gaze, ey - 1, "W")
      dot(canvas, x + 1 + gaze, ey, "W")
      dot(canvas, x + 3 + gaze, ey + 1, "W")
    end)
    -- smile, or a little "o" right after waking
    if startled then
      dot(canvas, ex + 12, ey + 4, "M")
      dot(canvas, ex + 13, ey + 4, "M")
    else
      dot(canvas, ex + 11, ey + 3, "M")
      dot(canvas, ex + 12, ey + 4, "M")
      dot(canvas, ex + 13, ey + 4, "M")
      dot(canvas, ex + 14, ey + 3, "M")
    end
  end
  for i = 0, 2 do
    dot(canvas, ex + 3 + i, ey + 3, "B")
    dot(canvas, ex + 19 + i, ey + 3, "B")
  end
  return canvas, W, H
end

--- Text decorations in cell coordinates relative to the top left: floating z's while asleep,
--- a pop when the bubble bursts
function M.marks(t)
  local p = t % CYCLE
  local ret = {}
  if p >= WAKE and p < AWAKE + 0.2 then
    table.insert(ret, { row = 7, col = W - 4, char = p < WAKE + 0.15 and "*" or "+", alpha = 1 })
    table.insert(ret, { row = 2, col = W, char = "!", alpha = 1 })
  elseif p < WAKE or p >= ASLEEP then
    for i = 0, 2 do
      local k = (t / 4 + i / 3) % 1
      table.insert(ret, {
        row = math.floor(2 - k * 4 + 0.5),
        col = W + 1 + math.floor(k * 5 + math.sin(t * 2 + i) * 0.6 + 0.5),
        char = k < 0.35 and "z" or "Z",
        alpha = math.sin(k * math.pi),
      })
    end
  end
  return ret
end

return M
