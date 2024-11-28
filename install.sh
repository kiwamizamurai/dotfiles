#!/bin/sh
set -e

DOTFILES_DIR="$HOME/dotfiles"
ARTIFACT_LINK="https://github.com/kiwamizamurai/dotfiles/archive/refs/heads/main.tar.gz"


if [ "$(dscl . -read "$HOME"/ UserShell)" != "UserShell: /bin/zsh" ]; then
    echo "Setting up zsh...\n\n"
    chsh -s /bin/zsh
    chmod -R 755 /usr/local/share/zsh
fi

if [ "$(command -v brew)" = "" ]; then
    echo "Installing Homebrew...\n\n"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
fi

if [ -d "$DOTFILES_DIR" ]; then
    echo "$DOTFILES_DIR already exists...\n\n"
    exit 0
fi

if [ ! -d "$HOME/.config" ]; then
    echo "Creating ~/.config directory...\n\n"
    mkdir "$HOME/.config/"
fi

if [ "$(command -v curl)" != "" ]; then
    echo "Fetching dotfiles by curl...\n\n"
    cd "$HOME"
    curl -s -L $ARTIFACT_LINK | tar zx
    echo "Extracting dotfiles...\n\n"
    mv dotfiles-main dotfiles
fi

if [ "$(uname)" = "Darwin" ] ; then
    echo "Setting up mac configuration...\n\n"
	/bin/sh "$DOTFILES_DIR/bin/defaults.sh"
fi

echo "Installing some software & library...\n\n"
brew bundle -v --file "$DOTFILES_DIR/Brewfile"

echo "Symlinking dotfiles...\n\n"
stow -v -d "$DOTFILES_DIR/packages" -t "$HOME" starship
stow -v -d "$DOTFILES_DIR/packages" -t "$HOME" aerospace
stow -v -d "$DOTFILES_DIR/packages" -t "$HOME" wezterm
stow -v -d "$DOTFILES_DIR/packages" -t "$HOME" atuin
stow -v -d "$DOTFILES_DIR/packages" -t "$HOME" github
stow -v -d "$DOTFILES_DIR/packages" -t "$HOME" neofetch
# stow -v -d "$DOTFILES_DIR/packages" -t "$HOME" nvim
