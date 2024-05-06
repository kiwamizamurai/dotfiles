source $(brew --prefix)/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
source $(brew --prefix)/share/zsh-autosuggestions/zsh-autosuggestions.zsh

alias vim="nvim"
alias ls="lsd"

alias k=kubectl
compdef __start_kubectl k

eval "$(mise activate zsh)"
eval "$(atuin init zsh)"
eval "$(zoxide init zsh)"
eval "$(starship init zsh)"

zstyle ':completion:*' matcher-list 'm:{a-z}={A-Z}'
