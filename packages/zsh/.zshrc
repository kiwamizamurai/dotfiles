# starship
eval "$(starship init zsh)"

# pyenv
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
if command -v pyenv 1>/dev/null 2>&1; then
  eval "$(pyenv init --path)"
fi

# pipenv
export PIPENV_VENV_IN_PROJECT=1

# alias
alias vim="nvim"
alias vimdiff="nvim -d"
alias ls="lsd"
