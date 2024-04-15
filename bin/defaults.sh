#!/bin/sh

# ===================
#                Dock
# ===================
defaults write com.apple.dock "show-recents" -bool "false"
defaults write com.apple.dock persistent-apps -array

# ===================
#              Finder
# ===================
defaults write com.apple.finder DisableAllAnimations -bool true
defaults write com.apple.finder AppleShowAllFiles -bool true
defaults write NSGlobalDomain AppleShowAllExtensions -bool true

# ===================
#         Screenshots
# ===================
if [ ! -d "$HOME/Pictures/Screenshots" ]; then
    mkdir -p "$HOME/Pictures/Screenshots"
fi
defaults write com.apple.screencapture "location" -string "$HOME/Pictures/Screenshots"


# ===================
#           .DS_Store
# ===================
defaults write com.apple.desktopservices DSDontWriteNetworkStores -bool true
defaults write com.apple.desktopservices DSDontWriteUSBStores -bool true

# ===================
#             Battery
# ===================
defaults write com.apple.menuextra.battery ShowPercent -string "YES"

# ===================
#            Trackpad
# ===================
defaults write -g com.apple.trackpad.scaling 3


# ===================
#               Mouse
# ===================
defaults write -g com.apple.mouse.scaling 3


# ===================
#            Keyboard
# ===================
defaults write NSGlobalDomain NSAutomaticCapitalizationEnabled -bool "false"
defaults write NSGlobalDomain NSAutomaticSpellingCorrectionEnabled -bool "false"