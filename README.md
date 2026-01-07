# Tauri v2 iOS App Template

A starter template for building iOS apps with Tauri v2, React, and Tailwind CSS.

## Tech Stack

- **Backend**: Tauri v2.9.5 (Rust)
- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **Package Manager**: Bun

## Prerequisites

### Required for Desktop Development

- [Rust](https://rustup.rs/) (via rustup)
- [Bun](https://bun.sh/)

### Required for iOS Development

- macOS
- [Xcode](https://apps.apple.com/app/xcode/id497799835) (from Mac App Store)
- Cocoapods:
  ```bash
  brew install cocoapods
  ```
- iOS Rust targets:
  ```bash
  rustup target add aarch64-apple-ios aarch64-apple-ios-sim x86_64-apple-ios
  ```
- Switch to full Xcode (after installation):
  ```bash
  sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
  ```

## Getting Started

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Run on desktop:**
   ```bash
   bun run tauri dev
   ```

3. **Run on iOS** (after installing iOS prerequisites):
   ```bash
   bun run tauri ios init
   bun run tauri ios dev
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
