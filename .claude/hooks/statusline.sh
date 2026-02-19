#!/bin/bash
input=$(cat)

MODEL=$(echo "$input" | jq -r '.model.display_name')
DIR=$(echo "$input" | jq -r '.workspace.current_dir')
COST=$(echo "$input" | jq -r '.cost.total_cost_usd // 0')
PCT=$(echo "$input" | jq -r '.context_window.used_percentage // 0' | cut -d. -f1)
DURATION_MS=$(echo "$input" | jq -r '.cost.total_duration_ms // 0')

CYAN='\033[36m'
GREEN='\033[32m'
YELLOW='\033[33m'
RED='\033[31m'
RESET='\033[0m'

# Git info with cache (refresh every 5 seconds)
CACHE_FILE="/tmp/claude-statusline-git-cache"
cache_is_stale() {
    [ ! -f "$CACHE_FILE" ] || \
    [ $(( $(date +%s) - $(stat -f %m "$CACHE_FILE" 2>/dev/null || stat -c %Y "$CACHE_FILE" 2>/dev/null || echo 0) )) -gt 5 ]
}

if cache_is_stale; then
    if git -C "$DIR" rev-parse --git-dir > /dev/null 2>&1; then
        BRANCH=$(git -C "$DIR" branch --show-current 2>/dev/null)
        STAGED=$(git -C "$DIR" diff --cached --numstat 2>/dev/null | wc -l | tr -d ' ')
        MODIFIED=$(git -C "$DIR" diff --numstat 2>/dev/null | wc -l | tr -d ' ')
        printf "%s|%s|%s" "$BRANCH" "$STAGED" "$MODIFIED" > "$CACHE_FILE"
    else
        printf "||" > "$CACHE_FILE"
    fi
fi

IFS='|' read -r BRANCH STAGED MODIFIED < "$CACHE_FILE"

# Line 1: model, dir, git
GIT_INFO=""
if [ -n "$BRANCH" ]; then
    GIT_STAGED=""
    GIT_MODIFIED=""
    [ "$STAGED" -gt 0 ] && GIT_STAGED="${GREEN}+${STAGED}${RESET}"
    [ "$MODIFIED" -gt 0 ] && GIT_MODIFIED="${YELLOW}~${MODIFIED}${RESET}"
    GIT_INFO=" | 🌿 ${BRANCH} ${GIT_STAGED}${GIT_MODIFIED}"
fi
if [ "$PCT" -ge 90 ]; then BAR_COLOR="$RED"
elif [ "$PCT" -ge 70 ]; then BAR_COLOR="$YELLOW"
else BAR_COLOR="$GREEN"; fi

MINS=$((DURATION_MS / 60000))
SECS=$(( (DURATION_MS % 60000) / 1000 ))
COST_FMT=$(printf '$%.4f' "$COST")

GIT_PART="$(printf '%b' "$GIT_INFO")"
echo -e "${CYAN}[${MODEL}]${RESET} 📁 ${DIR##*/}${GIT_PART} | ${BAR_COLOR}${PCT}%${RESET} | ${YELLOW}${COST_FMT}${RESET} | ⏱️ ${MINS}m ${SECS}s"
