-- Koi pond behind the snacks dashboard, after daoho.dev.
-- Each koi is a 20-node spine steered by wander, food, walls and its neighbours. Bodies are
-- rasterized onto terminal cells (cell background = scale tile, glyph = texture) and drawn as
-- `virt_text_win_col` overlays that leave the dashboard text untouched. Click to drop food.
local M = {}

local ns = vim.api.nvim_create_namespace("dashboard_pond")
local TICK_MS = 50
local STEP = 1 / 60
local CW, CH = 10, 20 -- simulated pixels per terminal cell
local N = 20 -- spine nodes
local TAU = math.pi * 2
local GLYPHS = { "t", "%", "S", "X", "8", "@", "#" }
local SUPER = { 0.25, 0.25, 0.75, 0.25, 0.25, 0.75, 0.75, 0.75 }

local P = {
  white = { 236, 228, 218 },
  red = { 232, 96, 56 },
  black = { 92, 90, 108 },
  fin = { 214, 206, 198 },
  eye = { 20, 20, 26 },
  water = { 255, 247, 240 },
  shadow = { 0, 0, 0 },
  pellet = { 236, 170, 92 },
  hi = { { 112, 22, 24 }, { 168, 34, 28 }, { 214, 58, 30 }, { 240, 96, 34 }, { 250, 138, 52 }, { 255, 178, 96 } },
  shadow_alpha = 0.55,
  alpha = 0.8,
  depth_floor = 0.4,
  tile = { 0.68, 0.98 },
  ink = 0.42,
}
local VARIETIES = { { "kohaku", 3 }, { "sanke", 2 }, { "tancho", 1 } }

local S = {
  koi = {},
  pellets = {},
  ripples = {},
  bites = {},
  avoid = {},
  time = 0,
  acc = 0,
  pointer = { x = 0, y = 0, speed = 0, active = false, seen = 0 },
}

-- math helpers -------------------------------------------------------------

local floor, sqrt, sin, cos, abs, min, max = math.floor, math.sqrt, math.sin, math.cos, math.abs, math.min, math.max
local function clamp(x, a, b)
  return x < a and a or x > b and b or x
end
local function rand(a, b)
  return a + math.random() * (b - a)
end
local function smooth(e0, e1, x)
  local t = clamp((x - e0) / (e1 - e0), 0, 1)
  return t * t * (3 - 2 * t)
end
local function angdiff(a, b)
  local d = (b - a) % TAU
  return d > math.pi and d - TAU or d
end
local function hypot(x, y)
  return sqrt(x * x + y * y)
end
local function hash(a, b, c)
  local x = sin(a * 12.9898 + b * 78.233 + c * 37.719) * 43758.5453
  return x - floor(x)
end
local function noise(x, y, seed)
  local ix, iy = floor(x), floor(y)
  local fx, fy = smooth(0, 1, x - ix), smooth(0, 1, y - iy)
  local a, b, c, d = hash(ix, iy, seed), hash(ix + 1, iy, seed), hash(ix, iy + 1, seed), hash(ix + 1, iy + 1, seed)
  return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy
end
local function mix(a, b, t)
  return { a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, a[3] + (b[3] - a[3]) * t }
end
local function scale(c, k)
  return { min(255, c[1] * k), min(255, c[2] * k), min(255, c[3] * k) }
end
local function ramp(stops, t)
  local i = clamp(t, 0, 1) * (#stops - 1)
  local r = min(#stops - 2, floor(i))
  return mix(stops[r + 1], stops[r + 2], i - r)
end
-- terminal line glyph for a direction
local function line_glyph(x, y)
  local d = hypot(x, y)
  if d == 0 then
    return "-"
  end
  if abs(y) < 0.38 * d then
    return "-"
  elseif abs(x) < 0.38 * d then
    return "|"
  end
  return x * y > 0 and "\\" or "/"
end

-- body profile: half width (fraction of length) at arc position s
local function profile(s)
  if s < 0.12 then
    return 0.11 * sin(s / 0.12 * math.pi / 2) ^ 0.55
  elseif s < 0.3 then
    return 0.11 + 0.025 * smooth(0.12, 0.3, s)
  end
  return 0.033 + 0.102 * (1 - smooth(0.3, 0.74, s))
end

-- world --------------------------------------------------------------------

local function seed()
  local w, h = S.w, S.h
  local base = clamp(0.5 * min(w, h), 170, 420)
  local big = clamp(floor(w * h / 240000 + 0.5), 3, 6)
  local small = w >= 1024 and 2 or 0
  S.koi = {}
  local total = 0
  for _, v in ipairs(VARIETIES) do
    total = total + v[2]
  end
  for i = 1, big + small do
    local is_small = i > big
    local len = base * (is_small and rand(0.32, 0.45) or rand(0.6, 1))
    local depth_max = is_small and 0.72 or 1
    local heading, x, y = rand(0, TAU), rand(0.1 * w, 0.9 * w), rand(0.1 * h, 0.9 * h)
    local nx, ny = {}, {}
    for n = 1, N do
      nx[n] = x - cos(heading) * len / 19 * (n - 1)
      ny[n] = y - sin(heading) * len / 19 * (n - 1)
    end
    local pick, variety = math.random() * total, "kohaku"
    for _, v in ipairs(VARIETIES) do
      pick = pick - v[2]
      if pick <= 0 then
        variety = v[1]
        break
      end
    end
    table.insert(S.koi, {
      id = i,
      variety = variety,
      len = len,
      nx = nx,
      ny = ny,
      heading = heading,
      speed = 20,
      phase = rand(0, TAU),
      turn = 0,
      wander = 0,
      depth = rand(0.5, depth_max),
      depth_target = rand(0.5, depth_max),
      depth_max = depth_max,
      next_dive = rand(6, 18),
      next_surface = rand(3, 14),
      next_wake = rand(0, 2),
      beat = 0,
      rush = 0,
      burst_until = 0,
      next_burst = rand(0, 3),
      fin_phase = rand(0, TAU),
      gulp = 0,
      curiosity = rand(0.35, 1),
      startle = 0,
      flee_x = 0,
      flee_y = 0,
    })
  end
end

local function ripple(x, y, strength)
  table.insert(S.ripples, { x = x, y = y, born = S.time, strength = strength })
end
local function ripple_life(r)
  return 2.2 + 1.6 * r.strength
end

function M.feed(x, y)
  S.last_feed = S.time
  ripple(x, y, 0.35)
  for _ = 1, min(5 + floor(3 * math.random()), 24 - #S.pellets) do
    local a, r, v = rand(0, TAU), 34 * sqrt(math.random()), rand(2, 6)
    table.insert(S.pellets, {
      x = x + cos(a) * r * 1.3,
      y = y + sin(a) * r,
      born = S.time,
      land_at = rand(0.15, 0.45),
      vx = cos(a) * v,
      vy = sin(a) * v,
    })
  end
end

local function nearest_pellet(x, y, range)
  local best, bd = nil, range * range
  for _, p in ipairs(S.pellets) do
    if p.landed then
      local d = (p.x - x) ^ 2 + (p.y - y) ^ 2
      if d < bd then
        best, bd = p, d
      end
    end
  end
  return best
end

local function pick_food(k, x, y, range)
  if k.food and not vim.tbl_contains(S.pellets, k.food) then
    k.food = nil
  end
  local near = nearest_pellet(x, y, range)
  if not k.food then
    k.food = near
  elseif hypot(k.food.x - x, k.food.y - y) > 1.3 * range then
    k.food = near
  elseif near and hypot(near.x - x, near.y - y) < 0.5 * hypot(k.food.x - x, k.food.y - y) then
    k.food = near
  end
  return k.food
end

local function step_koi(k, dt)
  local w, h, t, n = S.w, S.h, S.time, k.len
  local hx, hy = k.nx[1], k.ny[1]
  local cx, cy = cos(k.heading), sin(k.heading)
  k.wander = clamp(k.wander + (math.random() - 0.5) * dt * 2.4, -0.9, 0.9)
  cx, cy = cx + 0.6 * cos(k.heading + k.wander), cy + 0.6 * sin(k.heading + k.wander)

  local food = pick_food(k, hx, hy, max(1.6 * n + 220, k.rush > 0 and 650 or 0))
  local ptr = S.pointer
  local fed_recently = t - (S.last_feed or -math.huge) < 2
  if not food and not fed_recently and ptr.active and ptr.speed > 1100 and hypot(ptr.x - hx, ptr.y - hy) < 0.9 * n then
    k.startle, k.flee_x, k.flee_y = 1, ptr.x, ptr.y
  end
  k.startle = max(0, k.startle - 0.6 * dt)
  local fleeing = k.startle > 0.3 and not food
  local eating, curious, closeness = false, false, 0
  if fleeing then
    local dx, dy = hx - k.flee_x, hy - k.flee_y
    local d = hypot(dx, dy)
    d = d > 0 and d or 1
    cx, cy = cx + dx / d * 4 * k.startle, cy + dy / d * 4 * k.startle
  elseif food then
    local dx, dy = food.x - hx, food.y - hy
    local d = hypot(dx, dy)
    d = d > 0 and d or 1
    cx, cy = cx + dx / d * 3, cy + dy / d * 3
    eating, closeness = true, clamp(1 - d / (1.2 * n), 0, 1)
  elseif ptr.active then
    -- drift over to the pointer, then circle it
    local dx, dy = ptr.x - hx, ptr.y - hy
    local d = hypot(dx, dy)
    d = d > 0 and d or 1
    if d < 300 then
      local pull, toward = k.curiosity * (1 - d / 300) * 2.2, clamp(d / (0.6 * n), 0, 1)
      cx = cx + (dx / d * toward - dy / d * (1 - toward)) * pull
      cy = cy + (dy / d * toward + dx / d * (1 - toward)) * pull
      curious = true
    end
  end

  -- keep a little distance from the others, loosely school with them
  for _, o in ipairs(S.koi) do
    if o ~= k and abs(o.nx[1] - hx) <= 2 * n and abs(o.ny[1] - hy) <= 2 * n then
      for i = 1, N, 3 do
        local dx, dy = hx - o.nx[i], hy - o.ny[i]
        local d, reach = hypot(dx, dy), (n + o.len) * (food and 0.12 or 0.28)
        if d < reach and d > 0.001 then
          local f = (1 - d / reach) * 2.4
          cx, cy = cx + dx / d * f, cy + dy / d * f
        end
      end
      if not eating and hypot(o.nx[1] - hx, o.ny[1] - hy) < 1.6 * n then
        cx, cy = cx + 0.18 * cos(o.heading), cy + 0.18 * sin(o.heading)
      end
    end
  end

  -- swim around the text
  local ax, ay, reach = 0, 0, 0.4 * n
  for _, b in ipairs(S.avoid) do
    local dx, dy = hx - clamp(hx, b.left, b.right), hy - clamp(hy, b.top, b.bottom)
    local d = hypot(dx, dy)
    if d <= reach then
      if d < 0.001 then
        local sides = { b.left - hx, hx - b.right, b.top - hy, hy - b.bottom }
        local best = 1
        for i = 2, 4 do
          best = sides[i] > sides[best] and i or best
        end
        dx, dy = best == 1 and -1 or best == 2 and 1 or 0, best == 3 and -1 or best == 4 and 1 or 0
        d = 0
      end
      local l = hypot(dx, dy)
      l = l > 0 and l or 1
      ax, ay = ax + dx / l * (1 - d / reach), ay + dy / l * (1 - d / reach)
    end
  end
  local avoid = (eating or curious) and 0.5 or 1.8
  cx, cy = cx + ax * avoid, cy + ay * avoid

  -- turn back before the walls
  local out = max(-hx, hx - w, -hy, hy - h)
  if out > -(0.25 * n) then
    local f = 3.5 * clamp((out + 0.25 * n) / (0.5 * n), 0, 1)
    local dx, dy = w / 2 - hx, h / 2 - hy
    local d = hypot(dx, dy)
    d = d > 0 and d or 1
    cx, cy = cx + dx / d * f, cy + dy / d * f
  end

  local agility = fleeing and 3 or eating and 1.9 + closeness or curious and 1.2 or 0.7
  local rate = (1 + 0.6 * k.rush) * min(agility, k.speed / n * 4) * dt
  local turn = clamp(angdiff(k.heading, math.atan2(cy, cx)), -rate, rate)
  k.heading = k.heading + turn
  k.turn = k.turn + (turn / dt - k.turn) * min(1, 3 * dt)

  if t > k.next_burst and t > k.burst_until then
    k.burst_until = t + rand(0.7, 1.6)
    k.next_burst = k.burst_until + rand(1.2, 4)
  end
  local active = fleeing or eating or t < k.burst_until
  k.beat = k.beat + ((active and 1 or 0) - k.beat) * min(1, 3 * dt)
  if k.beat > 0.6 and k.depth > 0.65 and t > k.next_wake then
    ripple(k.nx[18], k.ny[18], 0.25 + 0.2 * k.depth)
    k.next_wake = t + rand(0.8, 1.6) / k.beat
  end
  k.rush = max(0, k.rush - 0.7 * dt)

  local cruise = 12 + 0.05 * n
  local target = (1 + 0.8 * k.rush)
    * (
      fleeing and 3.2 * cruise
      or eating and cruise * (1.9 + closeness)
      or active and cruise * (curious and 1.6 or 1.35)
      or 0.45 * cruise
    )
  k.speed = k.speed + (target - k.speed) * min(1, dt * (active and 1.6 + 3 * k.rush or 0.35))
  k.phase = k.phase + dt * (0.6 + k.beat * (2.2 + k.speed / 11))
  k.fin_phase = k.fin_phase + 2.4 * dt
  k.gulp = k.gulp + ((eating and closeness > 0.55 and 1 or 0) - k.gulp) * min(1, 6 * dt)
  if t > k.next_dive then
    k.depth_target = rand(0.5, k.depth_max)
    k.next_dive = t + rand(8, 20)
  end
  k.depth = k.depth + ((eating and 1 or k.depth_target) - k.depth) * min(1, dt * (eating and 0.8 or 0.15))

  -- head moves, the body follows with a limited bend per joint
  k.nx[1], k.ny[1] = hx + cos(k.heading) * k.speed * dt, hy + sin(k.heading) * k.speed * dt
  local seg, back = n / 19, k.heading + math.pi
  for i = 2, N do
    local px, py = k.nx[i - 1], k.ny[i - 1]
    local a = math.atan2(k.ny[i] - py, k.nx[i] - px)
    a = back + clamp(angdiff(back, a), -0.16, 0.16)
    k.nx[i], k.ny[i] = px + cos(a) * seg, py + sin(a) * seg
    back = a
  end

  local bite, before = 0.08 * n + 6, #S.pellets
  S.pellets = vim.tbl_filter(function(p)
    return not p.landed or (p.x - k.nx[1]) ^ 2 + (p.y - k.ny[1]) ^ 2 > bite * bite
  end, S.pellets)
  if #S.pellets < before then
    ripple(k.nx[1], k.ny[1], 0.6)
    table.insert(S.bites, { x = k.nx[1], y = k.ny[1], born = t })
    k.next_surface = t + rand(6, 16)
  elseif t > k.next_surface then
    ripple(k.nx[1], k.ny[1], 0.3)
    k.next_surface = t + rand(8, 20)
  end
end

local function step(dt)
  S.time = S.time + dt
  local ptr = S.pointer
  ptr.speed = ptr.speed * math.exp(-8 * dt)
  if ptr.active and S.time - ptr.seen > 4 then
    ptr.active = false
  end
  for _, k in ipairs(S.koi) do
    step_koi(k, dt)
  end
  local t = S.time
  S.pellets = vim.tbl_filter(function(p)
    return t - p.born < 14
  end, S.pellets)
  for _, p in ipairs(S.pellets) do
    if not p.landed then
      if t - p.born >= p.land_at then
        p.landed = true
        ripple(p.x, p.y, 0.1)
        for _, k in ipairs(S.koi) do
          if hypot(k.nx[1] - p.x, k.ny[1] - p.y) < 650 then
            k.rush = 1
          end
        end
      end
    else
      local damp = math.exp(-0.2 * dt)
      p.vx, p.vy = p.vx * damp, p.vy * damp
      p.x, p.y = p.x + p.vx * dt, p.y + p.vy * dt
    end
  end
  S.ripples = vim.tbl_filter(function(r)
    return t - r.born < ripple_life(r)
  end, S.ripples)
  S.bites = vim.tbl_filter(function(b)
    return t - b.born < 0.45
  end, S.bites)
end

-- rasterizer ---------------------------------------------------------------

local R = { sx = {}, sy = {}, arc = {} }

local function markings(k)
  if k.marks then
    return k.marks
  end
  local h = function(i)
    return hash(k.id, i, 41)
  end
  local red, black = {}, {}
  if k.variety == "tancho" then
    red = { { s = 0.11, v = 0, rs = 0.05, rv = 0.055 } }
  else
    if h(0) < 0.75 then
      table.insert(red, { s = 0.1, v = (h(1) - 0.5) * 0.03, rs = 0.055 + 0.03 * h(2), rv = 0.11 })
    end
    local count = 2 + floor(2 * h(3))
    for e = 0, count - 1 do
      local span = 0.42 / count
      table.insert(red, {
        s = 0.25 + span * (e + 0.5) + (h(10 + e) - 0.5) * span * 0.3,
        v = (h(20 + e) - 0.5) * 0.05,
        rs = span * (0.32 + 0.12 * h(30 + e)),
        rv = 0.09 + 0.05 * h(40 + e),
      })
    end
    if k.variety == "sanke" then
      for i = 0, 3 + floor(3 * h(50)) do
        table.insert(black, { s = 0.24 + 0.44 * h(60 + i), v = (h(70 + i) - 0.5) * 0.16, rs = 0.022, rv = 0.026 })
      end
    end
  end
  k.marks = { red = red, black = black }
  return k.marks
end

local function in_mark(m, s, v, jitter)
  return ((s - m.s) / m.rs) ^ 2 + ((v - m.v) / m.rv) ^ 2 < 1 + jitter
end

local function skin(k, s, v, across)
  if across > 0.9 or s > 0.74 then
    return P.white
  end
  local a = v / k.len
  local jitter = (noise(14 * s + k.id, 30 * a, k.id + 3) - 0.5) * 0.6
  local marks = markings(k)
  for _, m in ipairs(marks.black) do
    if in_mark(m, s, a, jitter) then
      return P.black
    end
  end
  for _, m in ipairs(marks.red) do
    if in_mark(m, s, a, jitter) then
      return P.red
    end
  end
  return P.white
end

local function fin_ellipse(s, t, s0, angle, a, b, hit)
  local o = 0.85 * profile(s0)
  local c, d = s - s0, t - o
  local ca, sa = cos(angle), sin(angle)
  if ((c * ca + d * sa - a) / a) ^ 2 + ((-c * sa + d * ca) / b) ^ 2 > 1 then
    return false
  end
  hit.flag = "fin"
  return true
end

-- classify the point (x, y) against the current koi spine; fills `hit`
local hit = {}
local function sample(x, y, len, first, last)
  local sx, sy, arc = R.sx, R.sy, R.arc
  local best, s, side, tail, head, perp = math.huge, 0, 1, 0, 0, 0
  for i = first or 1, last or N - 1 do
    local x0, y0 = sx[i], sy[i]
    local dx, dy = sx[i + 1] - x0, sy[i + 1] - y0
    local l2 = dx * dx + dy * dy
    l2 = l2 > 0 and l2 or 1
    local m = ((x - x0) * dx + (y - y0) * dy) / l2
    local u = clamp(m, 0, 1)
    local d2 = (x - x0 - dx * u) ^ 2 + (y - y0 - dy * u) ^ 2
    if d2 < best then
      local l = sqrt(l2)
      local cross = dx * (y - y0) - dy * (x - x0)
      best = d2
      s = (arc[i] + u * l) / R.arc_total
      side = cross >= 0 and 1 or -1
      tail = i == N - 1 and max(0, m - 1) * l or 0
      head = i == 1 and max(0, -m) * l or 0
      perp = abs(cross) / l
      R.tx, R.ty, R.seg = dx / l, dy / l, i
    end
  end
  local dist = sqrt(best)
  R.dist, R.s, R.v = dist, s, dist * side

  hit.flag, hit.across = nil, 1
  local t = dist / len
  if head > 0 then
    -- barbels
    local a = head / len
    if a < 0.05 and abs(perp / len - (0.045 + 0.7 * a)) < 0.016 then
      hit.flag = "whisker"
      return true
    end
    return false
  end
  local o = profile(s)
  if s <= 0.74 and t <= o then
    local across = t / o
    hit.across = across
    if s > 0.055 and s < 0.1 and across > 0.5 and across < 0.85 then
      hit.flag = "eye"
    else
      hit.flag = "body"
    end
    return true
  end
  local flare = side > 0 and R.flare_left or R.flare_right
  if s > 0.68 and tail / len <= 0 then
    local width = (0.03 + 0.15 * smooth(0.7, 1, s) ^ 0.8) * flare
    if t <= width and s <= 0.86 + t / width * 0.14 then
      hit.flag = "fin"
      return true
    end
  end
  return fin_ellipse(s, t, 0.19, 0.85 + 0.5 * (flare - 1), 0.066 * flare, 0.04, hit)
    or fin_ellipse(s, t, 0.47, 0.75, 0.036, 0.018, hit)
end

local cells -- [idx] = { glyph, fg, fg_alpha, tile, tile_alpha }
local shadow

local function rasterize(k)
  local len, nx, ny = k.len, k.nx, k.ny
  local sx, sy, arc = R.sx, R.sy, R.arc
  local amp = 0.2 + 1.1 * k.beat
  for i = 1, N do
    local r = (i - 1) / 19
    local a, b = max(1, i - 1), min(N, i + 1)
    local dx, dy = nx[a] - nx[b], ny[a] - ny[b]
    local l = hypot(dx, dy)
    l = l > 0 and l or 1
    local off = 0.04 * len * (0.05 + 0.95 * r ^ 2.2) * amp * sin(k.phase - 4.6 * r)
    sx[i], sy[i] = nx[i] - dy / l * off, ny[i] + dx / l * off
  end
  arc[1] = 0
  for i = 2, N do
    arc[i] = arc[i - 1] + hypot(sx[i] - sx[i - 1], sy[i] - sy[i - 1])
  end
  R.arc_total = arc[N] > 0 and arc[N] or 1
  local open = 1 - 0.25 * k.beat
  local sway = 0.18 * (1 - k.beat) * sin(k.fin_phase)
  local steer = clamp(0.6 * k.turn, -0.35, 0.35)
  R.flare_left, R.flare_right = open + sway - steer, open - sway + steer

  local x0, x1, y0, y1 = math.huge, -math.huge, math.huge, -math.huge
  for i = 1, N do
    x0, x1, y0, y1 = min(x0, sx[i]), max(x1, sx[i]), min(y0, sy[i]), max(y1, sy[i])
  end
  local pad = 0.26 * len
  local c0, c1 = max(0, floor((x0 - pad) / CW)), min(S.cols - 1, floor((x1 + pad) / CW))
  local r0, r1 = max(0, floor((y0 - pad) / CH)), min(S.rows - 1, floor((y1 + pad) / CH))
  if c0 > c1 or r0 > r1 then
    return
  end

  local diag = hypot(CW, CH)
  local sh_dx, sh_dy = floor(0.07 * len * k.depth / CW + 0.5) + 1, floor(0.05 * len * k.depth / CH + 0.5) + 1
  local alpha = P.alpha * (P.depth_floor + (1 - P.depth_floor) * k.depth)
  local tile_lo, tile_hi = P.tile[1], P.tile[2]
  for row = r0, r1 do
    local col = c0
    while col <= c1 do
      local px, py = col * CW, row * CH
      local inside = sample(px + CW / 2, py + CH / 2, len)
      local skip = not inside and R.dist > len * ((R.s > 0.4 and R.s < 0.62) and 0.15 or 0.25) + diag
      if skip then
        col = col + 1 + max(0, floor((R.dist - 0.25 * len - diag) / CW))
      else
        local flag, across, s, v, tx, ty = hit.flag, hit.across, R.s, R.v, R.tx, R.ty
        local covered = inside and 1 or 0
        local ox, oy, top, bot = 0, 0, 0, 0
        local solid = inside
          and flag ~= "fin"
          and flag ~= "whisker"
          and s > 0.04
          and s < 0.72
          and profile(s) * len - R.dist > 0.35 * diag
        if solid then
          covered = 5
        else
          local lo, hi = max(1, R.seg - 2), min(N - 1, R.seg + 2)
          for e = 1, #SUPER, 2 do
            if sample(px + SUPER[e] * CW, py + SUPER[e + 1] * CH, len, lo, hi) then
              ox, oy = ox + (SUPER[e] - 0.5) * CW, oy + (SUPER[e + 1] - 0.5) * CH
              if SUPER[e + 1] < 0.5 then
                top = top + 1
              else
                bot = bot + 1
              end
              if covered == 0 then
                flag, across, s, v, tx, ty = hit.flag, hit.across, R.s, R.v, R.tx, R.ty
              end
              covered = covered + 1
            end
          end
        end
        if covered > 0 then
          local q = covered / 5
          local side = v >= 0 and 1 or -1
          local idx = row * S.cols + col
          local j = floor(hash(floor(90 * s + 0.5), floor(v / (0.8 * CW) + 0.5), k.id) * 4294967295)
          local glyph, fg, fg_a, tile, tile_a = " ", P.fin, alpha, nil, 0
          if flag == "whisker" then
            glyph = line_glyph(-tx - side * ty * 0.7, -ty + side * tx * 0.7)
            fg = scale(mix(S.bg, P.fin, 0.9), P.ink + 0.3)
          elseif flag == "eye" and inside and q >= 0.6 then
            tile, tile_a, glyph, fg = mix(S.bg, P.eye, 0.85), alpha, "o", mix(S.bg, P.white, 0.9)
          elseif flag == "fin" then
            tile, tile_a = mix(S.bg, P.fin, 0.55), 0.45 * alpha * q
            if covered < 5 and (top == 0) ~= (bot == 0) then
              -- half block: a sub-cell edge instead of a ragged full cell
              glyph, fg, fg_a, tile, tile_a = top > 0 and "▀" or "▄", tile, 0.6 * alpha, nil, 0
            elseif j % 2 == 0 then
              glyph, fg_a = ".", fg_a * 0.6 * q
            end
          else
            local color = skin(k, s, v, across)
            local light = side * (0.6 * ty - 0.8 * tx) * across
            local h = clamp(0.22 + 0.5 * sqrt(max(0, 1 - across * across)) + 0.18 * light, 0, 1)
            if color == P.red then
              local wobble = (hash(k.id, 5, 17) - 0.5) * 0.3
                + (noise(9 * s + k.id, v / len * 18, k.id + 21) - 0.5) * 0.25
              local shimmer = max(0, sin(11 * s - 1.8 * S.time + k.id) - 0.7) / 0.3
              tile = ramp(P.hi, 0.15 + 0.8 * h + wobble + 0.35 * shimmer)
            else
              tile = mix(S.bg, color, tile_lo + (tile_hi - tile_lo) * h)
            end
            if covered == 5 then
              shadow[(row + sh_dy) * S.cols + col + sh_dx] = true
              tile_a = alpha
              if s < 0.035 and across < 0.6 and k.gulp > 0.5 then
                glyph, fg = "o", P.eye
              else
                glyph = GLYPHS[clamp(floor((1 - h) * 4 + 0.5) + floor(j / 16) % 3, 0, #GLYPHS - 1) + 1]
                fg = scale(tile, P.ink)
                if color == P.white then
                  fg_a = fg_a * 0.6
                end
                if hash(j, floor(1.4 * S.time + j % 997 / 97), 7) < 0.03 then
                  tile = mix(tile, S.bg, 0.45)
                end
              end
            elseif (top == 0) ~= (bot == 0) then
              glyph, fg, fg_a, tile, tile_a =
                top > 0 and "▀" or "▄", tile, alpha * (0.55 + 0.2 * (top + bot)), nil, 0
            else
              tile_a = alpha * (0.55 + 0.45 * q)
              if hypot(ox, oy) > 0.2 * CW and j % 3 == 0 then
                glyph, fg = ".", scale(tile, P.ink)
              end
            end
          end
          if glyph ~= " " or tile_a > 0 then
            cells[idx] = { glyph, fg, fg_a, tile, tile_a }
          end
        end
        col = col + 1
      end
    end
  end
end

local function put(idx, glyph, color, alpha)
  if not cells[idx] then
    cells[idx] = { glyph, color, alpha }
  end
end

local function cell_at(x, y)
  local c, r = floor(x / CW), floor(y / CH)
  if c < 0 or r < 0 or c >= S.cols or r >= S.rows then
    return
  end
  return r * S.cols + c
end

-- wake: tails and the pointer stir the water, which spreads out and settles
local function wake(dt)
  local cols, rows = S.cols, S.rows
  local energy = S.energy
  for _, k in ipairs(S.koi) do
    for i = 17, N do
      local idx = floor(k.ny[i] / CH) * cols + floor(k.nx[i] / CW)
      if k.nx[i] >= 0 and k.ny[i] >= 0 and k.nx[i] < S.w and k.ny[i] < S.h then
        energy[idx] = min(1.5, (energy[idx] or 0) + 0.035 + 0.0012 * k.speed)
      end
    end
  end
  local ptr = S.pointer
  if ptr.active then
    local idx = floor(ptr.y / CH) * cols + floor(ptr.x / CW)
    energy[idx] = min(1.5, (energy[idx] or 0) + 0.12)
  end
  local decay, next = math.exp(-1.1 * dt), {}
  for row = 0, rows - 1 do
    for col = 0, cols - 1 do
      local idx = row * cols + col
      local e = energy[idx] or 0
      local l = col > 0 and (energy[idx - 1] or 0) or e
      local r = col < cols - 1 and (energy[idx + 1] or 0) or e
      local u = row > 0 and (energy[idx - cols] or 0) or e
      local d = row < rows - 1 and (energy[idx + cols] or 0) or e
      local v = (4 * e + l + r + u + d) * 0.125 * decay
      if v > 0.01 then
        next[idx] = v
      end
    end
  end
  S.energy = next
end

local function draw_effects()
  local t = S.time
  -- pellets and bites
  for _, b in ipairs(S.bites) do
    local idx = cell_at(b.x, b.y)
    local f = (t - b.born) / 0.45
    if idx then
      cells[idx] = { f < 0.35 and "*" or f < 0.7 and "+" or ".", P.pellet, min(1, 1.6 * P.alpha) * (1 - f * f) }
    end
  end
  for _, p in ipairs(S.pellets) do
    local age = t - p.born
    if not p.landed then
      local f = age / p.land_at
      local idx = cell_at(p.x, p.y - (1 - f) * CH * 1.5)
      if idx then
        put(idx, f < 0.5 and "'" or ".", P.pellet, P.alpha * (0.5 + 0.4 * f))
      end
    else
      local idx = cell_at(p.x, p.y)
      if idx then
        local fade = smooth(9, 14, age)
        put(idx, fade > 0.55 and "." or "o", P.pellet, P.alpha * (0.8 + 0.2 * sin(3 * age + p.x)) * (1 - 0.85 * fade))
      end
    end
  end
  -- ripples: a sharp ring and a dotted echo
  for _, r in ipairs(S.ripples) do
    local age = t - r.born
    local strength = (1 - age / ripple_life(r)) ^ 1.5 * r.strength
    for e = 0, 1 do
      local radius = 52 * max(0, age - 0.45 * e) * (0.7 + 0.5 * r.strength)
      if radius >= 2 then
        local c0, c1 = max(0, floor((r.x - radius - CW) / CW)), min(S.cols - 1, floor((r.x + radius + CW) / CW))
        local r0, r1 = max(0, floor((r.y - radius - CH) / CH)), min(S.rows - 1, floor((r.y + radius + CH) / CH))
        for row = r0, r1 do
          for col = c0, c1 do
            local dx, dy = col * CW + CW / 2 - r.x, row * CH + CH / 2 - r.y
            local d = hypot(dx, dy)
            local tol = d > 0 and 0.5 * (abs(dx) / d * CW + abs(dy) / d * CH) or CW
            if abs(d - radius) <= tol then
              put(
                row * S.cols + col,
                e == 1 and "." or line_glyph(-dy, dx),
                P.water,
                strength * (e == 0 and 0.55 or 0.3)
              )
            end
          end
        end
      end
    end
  end
  -- shadows below the bodies
  for idx in pairs(shadow) do
    if idx >= 0 and idx < S.cols * S.rows then
      put(idx, ":", P.shadow, P.shadow_alpha)
    end
  end
  for idx, e in pairs(S.energy) do
    if e >= 0.22 then
      put(idx, e > 0.5 and "-" or ".", P.water, 0.35 * min(1, (e - 0.22) * 1.4))
    end
  end
end

-- terminal output ----------------------------------------------------------

local hl_cache = {}
local function hex(c)
  -- quantize to keep the number of highlight groups bounded
  local q = function(x)
    return clamp(floor(x / 8 + 0.5) * 8, 0, 255)
  end
  return string.format("#%02x%02x%02x", q(c[1]), q(c[2]), q(c[3]))
end
local function hl(fg, bg)
  local key = fg .. (bg or "")
  local name = hl_cache[key]
  if not name then
    name = "DashboardPond" .. fg:sub(2) .. (bg and bg:sub(2) or "")
    vim.api.nvim_set_hl(0, name, { fg = fg, bg = bg or S.bg_hex, bold = true })
    hl_cache[key] = name
  end
  return name
end

local function draw()
  local cols, rows = S.cols, S.rows
  vim.api.nvim_buf_clear_namespace(S.buf, ns, 0, -1)
  local lines = vim.api.nvim_buf_line_count(S.buf)
  for row = 0, min(rows, lines) - 1 do
    local mask, dims = S.text_mask[row] or {}, S.dim[row]
    local start, chunks = nil, nil
    local function flush(col)
      if start then
        vim.api.nvim_buf_set_extmark(S.buf, ns, row, 0, {
          virt_text = chunks,
          virt_text_win_col = start,
          priority = 100,
        })
        start = nil
      end
    end
    for col = 0, cols - 1 do
      local cell = cells[row * cols + col]
      if cell and not mask[col] then
        local dim = dims and dims[col] or 1
        local glyph, fg, fg_a, tile, tile_a = cell[1], cell[2], cell[3], cell[4], cell[5] or 0
        local bg = tile and tile_a > 0 and hex(mix(S.bg, tile, tile_a * dim)) or nil
        local text = glyph
        local group = hl(hex(mix(bg and tile or S.bg, fg, fg_a * dim)), bg)
        if not start then
          start, chunks = col, {}
        end
        local last = chunks[#chunks]
        if last and last[2] == group then
          last[1] = last[1] .. text
        else
          chunks[#chunks + 1] = { text, group }
        end
      else
        flush(col)
      end
    end
    flush(cols)
  end

  local stats = { tostring(#S.koi), tostring(#S.pellets) }
  for i, text in ipairs(stats) do
    if S.stats_row + i - 1 < lines then
      vim.api.nvim_buf_set_extmark(S.buf, ns, S.stats_row + i - 1, 0, {
        virt_text = { { text, i == 1 and "DashboardPondDim" or "DashboardPondText" } },
        virt_text_win_col = S.stats_col,
        priority = 200,
      })
    end
  end
  if S.cursor and floor(S.time * 1.8) % 2 == 0 then
    vim.api.nvim_buf_set_extmark(S.buf, ns, S.cursor[1], 0, {
      virt_text = { { "█", "DashboardPondDim" } },
      virt_text_win_col = S.cursor[2],
      priority = 200,
    })
  end
end

-- text on the dashboard: mask it out, dim fish around it, and steer koi away from it
local function measure()
  local lines = vim.api.nvim_buf_get_lines(S.buf, 0, -1, false)
  S.text_mask, S.dim, S.avoid = {}, {}, {}
  for _, link in ipairs(S.links) do
    local from = (lines[link.row + 1] or ""):find(link.label, 1, true)
    link.col, link.width = from and from - 1 or -1, #link.label
  end
  local boxes = {}
  for row, line in ipairs(lines) do
    local mask, col, first, last = {}, 0, nil, nil
    for ch in line:gmatch("[%z\1-\127\194-\244][\128-\191]*") do
      local width = vim.fn.strdisplaywidth(ch)
      if ch ~= " " then
        for c = col, col + width - 1 do
          mask[c] = true
        end
        first, last = first or col, col + width - 1
      end
      col = col + width
    end
    S.text_mask[row - 1] = mask
    if first then
      table.insert(boxes, { left = first * CW, right = (last + 1) * CW, top = (row - 1) * CH, bottom = row * CH })
    end
  end
  table.insert(
    boxes,
    { left = S.stats_col * CW, right = (S.stats_col + 4) * CW, top = S.stats_row * CH, bottom = (S.stats_row + 2) * CH }
  )
  -- merge nearby boxes, like paragraphs
  for _, b in ipairs(boxes) do
    local merged = false
    for _, a in ipairs(S.avoid) do
      if b.top - a.bottom < 3 * CH and b.left - a.right < 8 * CW and a.left - b.right < 8 * CW then
        a.left, a.right, a.bottom = min(a.left, b.left), max(a.right, b.right), max(a.bottom, b.bottom)
        merged = true
        break
      end
    end
    if not merged then
      table.insert(S.avoid, vim.deepcopy(b))
    end
  end
  local reach = 4 * CW
  for _, b in ipairs(S.avoid) do
    for row = max(0, floor((b.top - reach) / CH)), min(S.rows - 1, floor((b.bottom + reach) / CH)) do
      S.dim[row] = S.dim[row] or {}
      for col = max(0, floor((b.left - reach) / CW)), min(S.cols - 1, floor((b.right + reach) / CW)) do
        local x, y = col * CW + CW / 2, row * CH + CH / 2
        local d = hypot(max(b.left - x, 0, x - b.right), max(b.top - y, 0, y - b.bottom))
        S.dim[row][col] = min(S.dim[row][col] or 1, 0.15 + 0.85 * smooth(0, reach, d))
      end
    end
  end
end

local function frame()
  if not (S.buf and vim.api.nvim_buf_is_valid(S.buf)) then
    return M.stop()
  end
  local win = vim.fn.bufwinid(S.buf)
  if win == -1 then
    return
  end
  local cols, rows = vim.api.nvim_win_get_width(win), vim.api.nvim_win_get_height(win)
  if cols ~= S.cols or rows ~= S.rows then
    S.cols, S.rows, S.w, S.h, S.energy = cols, rows, cols * CW, rows * CH, {}
    S.stats_col, S.stats_row = floor(cols * 0.8), 1
    S.pellets, S.ripples, S.bites = {}, {}, {}
    seed()
    S.measured = nil
  end
  local tick = vim.api.nvim_buf_get_changedtick(S.buf)
  if S.measured ~= tick then
    S.measured = tick
    measure()
  end

  local now = vim.uv.hrtime() / 1e9
  local dt = min(0.1, now - (S.last or now))
  S.acc = S.acc + dt
  S.last = now
  local steps = 0
  while S.acc >= STEP and steps < 4 do
    step(STEP)
    S.acc, steps = S.acc - STEP, steps + 1
  end
  if steps == 4 then
    S.acc = 0
  end

  wake(dt)
  cells, shadow = {}, {}
  local order = vim.list_slice(S.koi)
  table.sort(order, function(a, b)
    return a.depth < b.depth
  end)
  for _, k in ipairs(order) do
    rasterize(k)
  end
  draw_effects()
  draw()
end

local function set_hls()
  hl_cache = {}
  local function attr(name)
    local ok, h = pcall(vim.api.nvim_get_hl, 0, { name = name, link = false })
    return ok and h.bg or nil
  end
  local bg = attr("SnacksDashboardNormal") or attr("Normal") or 0x1a1921
  S.bg_hex = string.format("#%06x", bg)
  S.bg = { floor(bg / 65536) % 256, floor(bg / 256) % 256, bg % 256 }
  vim.api.nvim_set_hl(0, "DashboardPondText", { fg = "#ece4da", default = true })
  vim.api.nvim_set_hl(0, "DashboardPondDim", { fg = "#8e8a86", default = true })
  vim.api.nvim_set_hl(0, "DashboardPondKey", { fg = "#8e8a86", underline = true, default = true })
end

-- dashboard integration ----------------------------------------------------

--- Remember where the blinking cursor goes (end of the quote)
function M.set_cursor(row, col)
  S.cursor = { row, col }
end

---@param buf number
---@param links? {row:number, col:number, width:number, action:fun()}[] clickable nav labels
function M.attach(buf, links)
  S.buf, S.links = buf, links or {}
  if not S.bg then
    set_hls()
  end
  vim.keymap.set("n", "<LeftMouse>", function()
    local mouse = vim.fn.getmousepos()
    if mouse.winid ~= vim.fn.bufwinid(S.buf) then
      return "<LeftMouse>"
    end
    vim.schedule(function()
      local row, col = mouse.winrow - 1, mouse.wincol - 1
      for _, link in ipairs(S.links) do
        if link.row == row and col >= link.col and col < link.col + link.width then
          return link.action()
        end
      end
      M.feed(col * CW + CW / 2, row * CH + CH / 2)
    end)
    return ""
  end, { buffer = buf, expr = true, desc = "Feed the koi" })

  -- the koi notice the mouse: they come over to circle it and bolt when it moves fast
  vim.keymap.set({ "n", "i" }, "<MouseMove>", function()
    local mouse = vim.fn.getmousepos()
    local ptr, now = S.pointer, vim.uv.hrtime() / 1e9
    if mouse.winid ~= vim.fn.bufwinid(S.buf) then
      ptr.active = false
      return
    end
    local x, y = (mouse.wincol - 1) * CW + CW / 2, (mouse.winrow - 1) * CH + CH / 2
    local speed = hypot(x - ptr.x, y - ptr.y) / max(0.001, now - (ptr.moved or 0))
    ptr.speed = ptr.speed + (min(speed, 5000) - ptr.speed) * 0.5
    ptr.x, ptr.y, ptr.moved, ptr.seen, ptr.active = x, y, now, S.time, true
  end, { buffer = buf, desc = "Koi follow the mouse" })

  if S.timer then
    return
  end
  S.timer = vim.uv.new_timer()
  S.timer:start(0, TICK_MS, vim.schedule_wrap(frame))
  S.augroup = vim.api.nvim_create_augroup("dashboard_pond", { clear = true })
  vim.api.nvim_create_autocmd("ColorScheme", { group = S.augroup, callback = set_hls })
  vim.api.nvim_create_autocmd({ "BufWipeout", "BufDelete" }, { group = S.augroup, buffer = buf, callback = M.stop })
  -- mouse move events only while the pond is in front
  S.mousemove = vim.o.mousemoveevent
  vim.o.mousemoveevent = true
  vim.api.nvim_create_autocmd("BufEnter", {
    group = S.augroup,
    buffer = buf,
    callback = function()
      vim.o.mousemoveevent = true
    end,
  })
  vim.api.nvim_create_autocmd("BufLeave", {
    group = S.augroup,
    buffer = buf,
    callback = function()
      vim.o.mousemoveevent = S.mousemove
      S.pointer.active = false
    end,
  })
end

function M.stop()
  if S.timer then
    S.timer:stop()
    S.timer:close()
    S.timer = nil
  end
  if S.augroup then
    pcall(vim.api.nvim_del_augroup_by_id, S.augroup)
    S.augroup = nil
    vim.o.mousemoveevent = S.mousemove
  end
  S.pointer.active = false
  S.koi, S.pellets, S.ripples, S.bites, S.cols, S.rows, S.last = {}, {}, {}, {}, nil, nil, nil
end

return M
