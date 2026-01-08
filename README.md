# Tauri v2 App Template

A starter template for building apps with Tauri v2, React, and Tailwind CSS.

## Tech Stack

- **Backend**: Tauri v2.9.5 (Rust)
- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Package Manager**: Bun

## Prerequisites

- [Rust](https://rustup.rs/) (via rustup)
- [Bun](https://bun.sh/)

## Getting Started

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Run development server:**
   ```bash
   bun run tauri dev
   ```

## Platform-Specific Setup

### iOS

Requires macOS with the following:

- [Xcode](https://apps.apple.com/app/xcode/id497799835) (from Mac App Store)
- Cocoapods: `brew install cocoapods`
- iOS Rust targets:
  ```bash
  rustup target add aarch64-apple-ios aarch64-apple-ios-sim x86_64-apple-ios
  ```
- Switch to full Xcode:
  ```bash
  sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
  ```

Run on iOS:
```bash
bun run tauri ios init
bun run tauri ios dev
```

### Android

See [Tauri Android Prerequisites](https://v2.tauri.app/start/prerequisites/#android) for setup instructions.

Run on Android:
```bash
bun run tauri android init
bun run tauri android dev
```

## Project Structure

```
├── src/                  # React frontend
│   ├── App.tsx          # Main component
│   ├── main.tsx         # Entry point
│   └── index.css        # Tailwind CSS
├── src-tauri/           # Rust backend
│   ├── src/             # Rust source
│   ├── Cargo.toml       # Rust dependencies
│   └── tauri.conf.json  # Tauri configuration
├── package.json
└── vite.config.ts
```

## License

MIT
