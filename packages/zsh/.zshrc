# =============================================================================
# Zsh Configuration
# =============================================================================

# -----------------------------------------------------------------------------
# Completions
# -----------------------------------------------------------------------------
# Add zsh-completions to FPATH
if type brew &>/dev/null; then
  FPATH="$(brew --prefix)/share/zsh-completions:$FPATH"
  FPATH="$(brew --prefix)/share/zsh/site-functions:$FPATH"
fi

# Initialize completion system
# -u: skip security check for insecure directories
autoload -Uz compinit && compinit -u

# Case-insensitive completion
zstyle ':completion:*' matcher-list 'm:{a-zA-Z}={A-Za-z}'

# Compact completion list
setopt list_packed

# Complete environment variables
setopt AUTO_PARAM_KEYS

# -----------------------------------------------------------------------------
# History
# -----------------------------------------------------------------------------
HISTFILE=~/.zsh_history
export HISTSIZE=10000
export SAVEHIST=100000

# Don't record duplicates
setopt hist_ignore_dups
setopt hist_ignore_all_dups
setopt hist_save_no_dups

# Record timestamp
setopt EXTENDED_HISTORY

# Ignore commands starting with space
setopt hist_ignore_space

# Allow editing before execution
setopt hist_verify

# Remove extra blanks
setopt hist_reduce_blanks

# -----------------------------------------------------------------------------
# Aliases
# -----------------------------------------------------------------------------
alias vim="nvim"
alias ls="eza"
alias ll="eza -la"
alias la="eza -a"
alias cat="bat"

# -----------------------------------------------------------------------------
# Tools
# -----------------------------------------------------------------------------
if command -v mise &>/dev/null; then
  eval "$(mise activate zsh)"
fi

if command -v atuin &>/dev/null; then
  eval "$(atuin init zsh)"
fi

if command -v zoxide &>/dev/null; then
  eval "$(zoxide init zsh)"
fi

if command -v starship &>/dev/null; then
  eval "$(starship init zsh)"
fi

# -----------------------------------------------------------------------------
# Plugins (must be last)
# -----------------------------------------------------------------------------
if type brew &>/dev/null; then
  if [ -f "$(brew --prefix)/share/zsh-autosuggestions/zsh-autosuggestions.zsh" ]; then
    source "$(brew --prefix)/share/zsh-autosuggestions/zsh-autosuggestions.zsh"
  fi
  
  if [ -f "$(brew --prefix)/share/zsh-fast-syntax-highlighting/fast-syntax-highlighting.plugin.zsh" ]; then
    source "$(brew --prefix)/share/zsh-fast-syntax-highlighting/fast-syntax-highlighting.plugin.zsh"
  fi
fi
