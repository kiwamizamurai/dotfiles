#!/bin/sh

set -e

if [ "$(dscl . -read ~/ UserShell)" = "UserShell: /bin/bash" ]; then
    chsh -s /bin/zsh
    chmod -R 755 /usr/local/share/zsh
    chown -R root:staff zsh
fi

if [ ! -f /usr/local/bin/brew ]; then
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
fi

CLONE_PATH=~/omoya
if [ ! -d "$CLONE_PATH" ]; then
    mkdir -p "$CLONE_PATH"
fi

if [ ! -d "$CLONE_PATH"/dotfiles ]; then
    cd "$CLONE_PATH"
    git clone git@github.com:kiwamizamurai/dotfiles.git
fi

brew bundle -v --file "$CLONE_PATH"/dotfiles/Brewfile

if [ ! -d ~/.config ]; then
    mkdir ~/.config/
fi

stow -v -d "$CLONE_PATH"/dotfiles/packages -t $HOME zsh starship
