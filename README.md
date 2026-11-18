# ⚡ AltSpace

**Local-first Panic Button & Workspace Switcher for Windows**

AltSpace lets you instantly hide/minimize distracting apps, mute specific apps, switch wallpapers, and launch work apps using a global hotkey or system tray menu. 100% local, zero telemetry.

## Features

- 🚨 **Panic Mode** — One hotkey to hide all distracting windows instantly
- 💼 **Workspace Profiles** — Create multiple profiles with different rules
- 🔇 **Per-App Audio Muting** — Mute Spotify/Steam without muting Zoom
- 🖼️ **Wallpaper Switching** — Change desktop wallpaper per profile
- 🚀 **App Launcher** — Auto-launch work apps when switching profiles
- ⌨️ **Global Hotkey** — Customizable keyboard shortcut works anywhere
- 🖥️ **System Tray** — Runs in background, accessible from tray icon
- 📦 **100% Offline** — All settings stored locally, no cloud, no telemetry

## Tech Stack

- **Tauri v2** (Rust backend + React 19 frontend)
- **TypeScript** + **Tailwind CSS v4** (Neo-Brutalist aesthetic)
- **Windows APIs** via the `windows` crate (window management, audio control)

## Development

```bash
pnpm install
pnpm tauri dev
```

## Build

```bash
pnpm tauri build
```

The compiled `.exe` installer will be in `src-tauri/target/release/bundle/`.

## License

MIT
