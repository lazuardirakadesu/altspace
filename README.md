# AltSpace 🚨

> **Neo-Brutalist Panic Button & Workspace Switcher for Windows**

AltSpace adalah aplikasi desktop open-source berbasis Tauri v2 yang dirancang untuk privasi instan dan pergantian profil workspace dalam sekejap mata. Dengan satu tombol pintasan global (panic button), AltSpace mampu menyembunyikan jendela tertentu, me-mute audio aplikasi target, dan mengganti wallpaper desktop secara instan.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-blue.svg)](https://v2.tauri.app/)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Platform Windows](https://img.shields.io/badge/Platform-Windows-0078d4.svg)](https://microsoft.com/windows)

---

## ⚡ Fitur Utama

- 🚨 **Panic Button & Global Hotkeys**: Sembunyikan window dan lakukan aksi darurat kapan saja melalui global shortcut terdaftar (menggunakan plugin shortcut Tauri).
- 🔇 **Per-App Audio Muting**: Senyapkan audio dari aplikasi tertentu secara otomatis melalui integrasi Windows Core Audio API (WASAPI) tanpa mematikan audio sistem secara keseluruhan.
- 🪟 **Windows API Window Hider**: Menyembunyikan jendela aplikasi target langsung dari taskbar dan layar menggunakan Windows Win32 API (`ShowWindowAsync`).
- 🖼️ **Dynamic Wallpaper Switcher**: Mengubah wallpaper desktop secara dinamis menggunakan API `SystemParametersInfoW`.
- 📌 **System Tray Integration**: Berjalan hening di latar belakang dengan akses cepat via ikon tray.
- 💾 **Local-First JSON Storage**: Semua konfigurasi dan profil workspace disimpan secara lokal di mesin Anda tanpa telemetri atau cloud sync.
- 🎨 **Neo-Brutalist UI**: Antarmuka modern yang berani, kontras tinggi, dan responsif.

---

## 🛠️ Tech Stack

- **Framework Core**: [Tauri v2](https://v2.tauri.app/)
- **Native Backend**: [Rust](https://www.rust-lang.org/) (dengan `windows-sys` untuk interop Win32 API)
- **Frontend UI**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Neo-Brutalist Theme
- **Icons**: [Lucide React](https://lucide.dev/)
- **Bundler**: [Vite](https://vite.dev/)

---

## 🚀 Panduan Instalasi & Menjalankan dari Source

### Prasyarat

Pastikan Anda telah menginstal:
1. [Node.js](https://nodejs.org/) (v18+ disarankan) & [pnpm](https://pnpm.io/)
2. [Rust & Cargo](https://www.rust-lang.org/tools/install)
3. Komponen C++ Build Tools (via Visual Studio Installer untuk kompilasi Windows)

### Langkah-langkah

1. **Clone repository ini:**
   ```bash
   git clone https://github.com/lazuardirakadesu/altspace.git
   cd altspace
   ```

2. **Instal dependensi frontend:**
   ```bash
   pnpm install
   ```

3. **Jalankan dalam mode pengembangan (Development):**
   ```bash
   pnpm tauri dev
   ```

4. **Build untuk produksi (Executable Windows):**
   ```bash
   pnpm tauri build
   ```
   File binary/installer `.exe` atau `.msi` akan dihasilkan di folder `src-tauri/target/release/bundle/`.

---

## 📄 Lisensi

Proyek ini didistribusikan di bawah lisensi **MIT**. Silakan lihat berkas [LICENSE](LICENSE) untuk detail lengkap.
