#!/bin/sh
set -e

DOTFILES_DIR="$HOME/dotfiles"
ARTIFACT_LINK="https://github.com/kiwamizamurai/dotfiles/archive/refs/heads/main.tar.gz"


if [ "$(dscl . -read "$HOME"/ UserShell)" != "UserShell: /bin/zsh" ]; then
    echo "Setting up zsh..."
    chsh -s /bin/zsh
    chmod -R 755 /usr/local/share/zsh
fi

if [ "$(command -v brew)" = "" ]; then
    echo "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
fi

if [ -d "$DOTFILES_DIR" ]; then
    echo "$DOTFILES_DIR already exists..."
    exit 0
fi

if [ ! -d "$HOME/.config" ]; then
    echo "Creating ~/.config directory..."
    mkdir "$HOME/.config/"
fi

if [ "$(command -v curl)" = "" ]; then
    echo "Fetching dotfiles by curl..."
    cd "$HOME"
    curl -s -L $ARTIFACT_LINK | tar zx
    echo "Extracting dotfiles..."
    mv dotfiles-main dotfiles
fi

if [ "$(uname)" = "Darwin" ] ; then
    echo "Setting up mac configuration..."
	/bin/sh "$DOTFILES_DIR/bin/defaults.sh"
fi

echo "Installing some software & library..."
brew bundle -v --file "$DOTFILES_DIR/Brewfile"

echo "Symlinking dotfiles..."
stow -v -d "$DOTFILES_DIR/packages" -t "$HOME" ./*
