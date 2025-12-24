

## Affiliation

<p align="center">
  <img  width="50%" src="./pic.png" />
</p>

## Usage

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/kiwamizamurai/dotfiles/refs/heads/main/install.sh)"
```

## Status

[![macos](https://github.com/kiwamizamurai/dotfiles/actions/workflows/macos.yml/badge.svg)](https://github.com/kiwamizamurai/dotfiles/actions/workflows/macos.yml)
[![Check shellscript](https://github.com/kiwamizamurai/dotfiles/actions/workflows/shellcheck.yml/badge.svg)](https://github.com/kiwamizamurai/dotfiles/actions/workflows/shellcheck.yml)

## misc

* [Wezterm](https://github.com/wez/wezterm) - Terminal
* [Starship](https://starship.rs/) - Shell Prompt
* [Zen-browser](https://zen-browser.app) - Browser

## Why Not Nix?

This repository uses simple symlinks ([GNU Stow](https://www.gnu.org/software/stow/)) + Homebrew instead of Nix/home-manager.

- **Instant changes** - No rebuild/evaluation required
- **Simple** - Just shell scripts and symlinks
- **Low learning curve** - No need to learn Nix language

Reference: [You don't have to use nix to manage your dotfiles](https://jade.fyi/blog/use-nix-less/)

## Repository Metrics
![Alt](https://repobeats.axiom.co/api/embed/58623918fbc323ae6ced987e218c83fede9f243a.svg "Repobeats analytics image")
