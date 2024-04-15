autoload -U compinit
compinit
source /opt/homebrew/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

source $(brew --prefix)/share/zsh-autosuggestions/zsh-autosuggestions.zsh

eval "$(zoxide init zsh)"

eval "$(starship init zsh)"

alias vim="nvim"

eval "$(mise activate zsh)"

alias k=kubectl
compdef __start_kubectl k

eval "$(atuin init zsh)"