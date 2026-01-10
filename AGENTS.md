# Project Scope
This repository hosts a cross-platform application built with Tauri v2, React 19, TypeScript, and Tailwind CSS v4.

# Tech Stack
- **Backend**: Tauri v2 (Rust)
- **Frontend**: React 19
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Package Manager**: Bun

# Directory Structure
- `src/`: Frontend source code (React components, styles, UI logic).
- `src-tauri/`: Tauri backend source code (Rust configuration and commands).

# Scripts
Use `bun run <script>`:
- `dev`: Start the Vite development server.
- `build`: Build the app (`tsc -b` + `vite build`).
- `lint`: Run ESLint (`eslint .`).
- `preview`: Preview the production build.
- `tauri`: Execute Tauri CLI commands.
- `ios:init`: Initialize iOS platform support.
- `ios:dev`: Run iOS dev build (includes Xcode version fix script).

# Tooling Conventions
## ESLint
- Config: `eslint.config.js` (Flat Config).
- Uses recommended configs for JS, TypeScript, React hooks, and React refresh.
- Browser globals enabled; `dist/` is ignored.

## TypeScript
- `tsconfig.app.json`: Frontend settings (strict, noEmit, `react-jsx`, bundler resolution).
- `tsconfig.node.json`: Node/Vite settings (strict, noEmit).

## Vite
- Env prefix: `VITE_` and `TAURI_`.
- `process.env.GEMINI_API_KEY` is defined from `GEMINI_API_KEY` env at build time.
- Path alias: `@` → `src`.

# Guidelines
- Do not commit `.env` or secrets.
- Keep frontend and backend concerns separated by directory.