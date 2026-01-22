#!/bin/sh
set -e

cat << 'EOF'
     _       _    __ _ _
  __| | ___ | |_ / _(_) | ___  ___
 / _` |/ _ \| __| |_| | |/ _ \/ __|
| (_| | (_) | |_|  _| | |  __/\__ \
 \__,_|\___/ \__|_| |_|_|\___||___/

EOF

DOTFILES_DIR="$HOME/dotfiles"
ARTIFACT_LINK="https://github.com/kiwamizamurai/dotfiles/archive/refs/heads/main.tar.gz"

# macOS check
if [ "$(uname)" != "Darwin" ]; then
    echo "Error: This script is for macOS only"
    exit 1
fi

# Setup Homebrew
if [ "$(command -v brew)" = "" ]; then
    echo "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Apple Silicon / Intel support
if [ -f "/opt/homebrew/bin/brew" ]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
elif [ -f "/usr/local/bin/brew" ]; then
    eval "$(/usr/local/bin/brew shellenv)"
fi

# Setup zsh as default shell
if [ "$(dscl . -read "$HOME"/ UserShell)" != "UserShell: /bin/zsh" ]; then
    echo "Setting up zsh..."
    chsh -s /bin/zsh
fi

# Create ~/.config if needed
if [ ! -d "$HOME/.config" ]; then
    echo "Creating ~/.config directory..."
    mkdir -p "$HOME/.config"
fi

# Download dotfiles if not exists
if [ ! -d "$DOTFILES_DIR" ]; then
    echo "Fetching dotfiles..."
    cd "$HOME"
    curl -s -L "$ARTIFACT_LINK" | tar zx
    mv dotfiles-main dotfiles
fi

# macOS defaults
echo "Setting up mac configuration..."
/bin/sh "$DOTFILES_DIR/bin/defaults.sh"

# Install packages
echo "Installing some software & library..."
brew bundle -v --file "$DOTFILES_DIR/Brewfile"

# Symlink dotfiles (--restow for idempotent re-runs, --adopt to handle existing files)
echo "Symlinking dotfiles..."
stow --restow --adopt -v -d "$DOTFILES_DIR/packages" -t "$HOME" starship
stow --restow --adopt -v -d "$DOTFILES_DIR/packages" -t "$HOME" wezterm
stow --restow --adopt -v -d "$DOTFILES_DIR/packages" -t "$HOME" atuin
stow --restow --adopt -v -d "$DOTFILES_DIR/packages" -t "$HOME" github
stow --restow --adopt -v -d "$DOTFILES_DIR/packages" -t "$HOME" neofetch
stow --restow --adopt -v -d "$DOTFILES_DIR/packages" -t "$HOME" zsh
stow --restow --adopt -v -d "$DOTFILES_DIR/packages" -t "$HOME" nvim
stow --restow --adopt -v -d "$DOTFILES_DIR/packages" -t "$HOME" opencode

echo "Done! Please restart your terminal."
