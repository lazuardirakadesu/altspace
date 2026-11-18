# AltSpace 🚨

> **Neo-Brutalist Panic Button & Workspace Switcher for Windows**

AltSpace is a lightweight, local-first desktop application built with Tauri v2 designed for instant privacy preservation and rapid workspace profile switching. With a single global panic hotkey, AltSpace immediately hides target windows, mutes designated application audio streams, and swaps your desktop wallpaper in a split second.

[![Release: v1.0.0](https://img.shields.io/badge/Release-v1.0.0-emerald.svg)](https://github.com/lazuardirakadesu/altspace/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-blue.svg)](https://v2.tauri.app/)
[![Rust](https://img.shields.io/badge/Rust-Backend-orange.svg)](https://www.rust-lang.org/)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Platform Windows](https://img.shields.io/badge/Platform-Windows-0078d4.svg)](https://microsoft.com/windows)

---

## ⚡ Key Features

- 🚨 **Panic Button & Global Hotkeys**: Register system-wide shortcuts to trigger emergency workspace switching and window hiding from anywhere.
- 🔇 **Per-App Audio Muting**: Automatically mute specific target applications via low-level Windows Core Audio API (WASAPI) without muting master system sound.
- 🪟 **Win32 Window Hider**: Conceal targeted application windows instantly from both desktop and taskbar using Windows Win32 API (`ShowWindowAsync`).
- 🖼️ **Dynamic Wallpaper Switcher**: Switch desktop wallpapers on the fly via `SystemParametersInfoW`.
- 📌 **System Tray Integration**: Operates quietly in the background with quick access menus and instant visibility toggles.
- 💾 **Local-First JSON Storage**: All configuration, profiles, and hotkey bindings are persisted locally on your machine—no telemetry, no cloud dependencies.
- 🎨 **Neo-Brutalist UI**: High-contrast, bold, responsive interface built with modern aesthetic styling.

---

## 🛠️ Tech Stack

- **Application Core**: [Tauri v2](https://v2.tauri.app/)
- **Native Backend**: [Rust](https://www.rust-lang.org/) (interfacing with Win32 API via `windows-sys`)
- **Frontend UI**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Bundler & Tooling**: [Vite](https://vite.dev/)

---

## 🚀 Getting Started

### Prerequisites

Ensure the following tools are installed on your machine:
1. [Node.js](https://nodejs.org/) (v18+ recommended) & [pnpm](https://pnpm.io/)
2. [Rust & Cargo](https://www.rust-lang.org/tools/install)
3. C++ Build Tools (via Visual Studio Installer with the "Desktop development with C++" workload)

### Installation & Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/lazuardirakadesu/altspace.git
   cd altspace
   ```

2. **Install frontend dependencies:**
   ```bash
   pnpm install
   ```

3. **Start in development mode:**
   ```bash
   pnpm tauri dev
   ```

4. **Build release binaries:**
   ```bash
   pnpm tauri build
   ```
   Production installers and standalone `.exe` binaries will be located under `src-tauri/target/release/bundle/`.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
