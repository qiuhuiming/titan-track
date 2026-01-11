# Project Scope
This repository hosts **TitanTrack**, a cross-platform fitness tracking application built with Tauri v2, React 19, TypeScript, and Tailwind CSS v4.

# App Overview
TitanTrack is a workout planning and logging app that helps users:
- Plan workout sessions with exercises, sets, weights, and reps
- Log completed workouts with RPE tracking
- View training history via an interactive calendar
- Get AI-powered coaching and performance analysis via Gemini

# Tech Stack
- **Backend**: Tauri v2 (Rust) - file-based JSON storage in app data directory
- **Frontend**: React 19 with functional components and hooks
- **Styling**: Tailwind CSS v4 with custom rounded card designs
- **Language**: TypeScript (strict mode)
- **Package Manager**: Bun
- **AI Integration**: Google Gemini API (`@google/genai`)

# Directory Structure
```
src/                          # Frontend source code
├── App.tsx                   # Root component, navigation, global state
├── main.tsx                  # React entry point
├── index.css                 # Tailwind CSS imports
├── types.ts                  # TypeScript interfaces
├── constants.ts              # Initial seed data (exercises, plans, logs)
├── translations.ts           # i18n strings (zh/en)
├── components/
│   ├── Dashboard.tsx         # HOME tab - calendar view, streak display
│   ├── WorkoutLog.tsx        # LOG tab - log workouts, execute plans
│   ├── PlanManager.tsx       # PLAN tab - create/edit workout plans
│   └── AICoach.tsx           # AI COACH tab - Gemini integration
└── services/
    ├── tauriStorageService.ts  # Tauri invoke wrapper (primary storage)
    ├── storageService.ts       # Legacy localStorage (deprecated)
    └── geminiService.ts        # Gemini AI API integration

src-tauri/                    # Tauri backend (Rust)
├── src/
│   ├── lib.rs                # App entry, plugin setup, command registration
│   ├── models.rs             # Rust data structs (serde camelCase)
│   ├── storage.rs            # File-based JSON storage with Mutex
│   └── commands.rs           # Tauri commands exposed to frontend
├── Cargo.toml                # Rust dependencies
└── tauri.conf.json           # Tauri configuration
```

# Data Models

## TypeScript (`src/types.ts`)
```typescript
MuscleGroup = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Full Body' | 'Cardio'
Language = 'zh' | 'en'

Exercise {
  id, name, muscleGroup, equipment, notes?, personalBest?
}

WorkoutSet {
  id, weight, reps?, timeMinutes?, distance?, rpe?, notes?, completed?
}

WorkoutPlan {
  id, date, title, tags[], exercises[{ exerciseId, sets[] }], isCompleted?
}

WorkoutEntry {
  id, date, exerciseId, workoutType, sets[], planId?
}

TabType = 'DASHBOARD' | 'WORKOUT_LOG' | 'PLAN' | 'AI_COACH'
```

## Rust (`src-tauri/src/models.rs`)
Mirrors TypeScript types with `#[serde(rename_all = "camelCase")]` for JSON compatibility.

# UI/UX Flow

## Navigation
4-tab bottom navigation (mobile) / sidebar (desktop):
1. **HOME** (Dashboard) - Calendar view, streak counter, long-press day preview
2. **LOG** (WorkoutLog) - Execute plans or log ad-hoc workouts
3. **PLAN** (PlanManager) - Create/edit workout plans with set groups
4. **AI COACH** (AICoach) - AI analysis and Q&A

## Key Interactions
- **Dashboard**: Long-press calendar day → preview popup with exercises and "Go to Plan" button
- **WorkoutLog**: "Start Now" on upcoming plan → full-screen workout execution with set tracking
- **PlanManager**: Add exercises with grouped sets (e.g., 60kg × 8 reps × 4 sets)
- **AICoach**: "Weekly Deep Dive" for full analysis, or ask specific questions

# Backend Architecture

## Storage (`src-tauri/src/storage.rs`)
- **Location**: `AppHandle.path().app_data_dir()` (platform-specific)
- **Files**: `exercises.json`, `logs.json`, `plans.json`
- **Thread Safety**: `Mutex<Vec<T>>` for each data type
- **Pattern**: Load on init → keep in memory → write on save

## Commands (`src-tauri/src/commands.rs`)
```rust
get_exercises() -> Vec<Exercise>
save_exercises(exercises: Vec<Exercise>)
get_logs() -> Vec<WorkoutEntry>
save_logs(logs: Vec<WorkoutEntry>)
get_plans() -> Vec<WorkoutPlan>
save_plans(plans: Vec<WorkoutPlan>)
```

## Frontend Integration (`src/services/tauriStorageService.ts`)
- Wraps `invoke()` calls with error handling
- Falls back to `INITIAL_*` constants on error (browser dev mode)
- Auto-seeds empty storage with initial data

# Service Layer

## tauriStorageService
Primary storage service using Tauri commands. Async methods with try/catch and fallback.

## geminiService
AI integration using `@google/genai`:
- `analyzePerformance()` - Weekly training analysis
- `getWorkoutAdvice()` - Answer user questions
- Uses `process.env.API_KEY` (defined via Vite)

# State Management
- **App.tsx**: Holds global state (`exercises`, `logs`, `plans`, `language`)
- **Loading state**: Shows spinner while fetching from Tauri backend
- **Prop drilling**: State passed to child components with update callbacks
- **Local component state**: Forms, modals, UI interactions

# Internationalization
- Languages: Chinese (`zh`) and English (`en`)
- Stored in `localStorage` as `titan_track_lang`
- Toggle button in header/sidebar
- Translations in `src/translations.ts`

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
- `process.env.API_KEY` is defined from `GEMINI_API_KEY` env at build time.
- Path alias: `@` → `src`.

# Development Patterns

## Component Pattern
- Functional components with hooks
- Props interfaces defined inline or in types.ts
- Event handlers passed as callbacks from parent

## Form Handling
- Controlled inputs with `useState`
- Form submission via `onSubmit` with `e.preventDefault()`
- Validation before save (e.g., title required, exercises non-empty)

## Styling Pattern
- Tailwind utility classes
- Rounded cards (`rounded-[2rem]`, `rounded-[2.5rem]`)
- Consistent color scheme: indigo primary, slate neutrals, emerald success, rose danger
- Mobile-first with responsive breakpoints (`md:`, `sm:`)

## Error Handling
- Try/catch in async service calls
- Console.error for debugging
- Graceful fallbacks (initial data, error messages)

# Documentation for AI Agents

A comprehensive documentation suite is available in `docs/` directory to guide AI agent work:

## Documentation Index

### Essential Context (Read First)
- **docs/ARCHITECTURE.md** (~150 lines)
  - System overview, tech stack, component tree, data flow
  - Key architectural decisions (prop drilling, file-based storage, mobile-first)
  - **Always read first** for any task to understand context

### Domain-Specific References
- **docs/STATE_MANAGEMENT.md** (~150 lines)
  - Global state patterns (App.tsx), update callbacks, loading states
  - Language state management, anti-patterns to avoid
  - **Read for:** State changes, global data updates

- **docs/COMPONENT_GUIDE.md** (~180 lines)
  - Component patterns, props interfaces, styling patterns
  - Button types, form inputs, responsive design, animations
  - **Read for:** Adding/editing components, UI changes

- **docs/TAURI_BACKEND.md** (~120 lines)
  - Rust storage architecture, thread safety, adding new commands
  - TypeScript ↔ Rust type mapping, error handling patterns
  - **Read for:** Backend changes, Tauri integration

- **docs/UI_PATTERNS.md** (~150 lines)
  - Design system (colors, typography, shapes), reusable patterns
  - Modal patterns, animations, responsive design, accessibility
  - **Read for:** Frontend UI work, styling changes

- **docs/DATA_MODELS.md** (~80 lines)
  - TypeScript interfaces and Rust structs
  - Muscle groups, RPE scale, set grouping pattern
  - **Read for:** Quick type reference, data structure questions

### Workflow Guidance
- **docs/TASK_WORKFLOWS.md** (~100 lines)
  - Step-by-step guides for common tasks (add feature, fix bug, refactor)
  - Diagnostics commands, git workflow, agent-specific reading strategies
  - **Read for:** "How to start" questions, task execution guidance

## Agent Reading Strategy

### Small Context Window (<32k tokens)
1. **ALWAYS read:** `docs/ARCHITECTURE.md` (context foundation)
2. **THEN read:** 1 domain-specific doc relevant to task
3. **OPTIONAL:** Quick reference from `DATA_MODELS.md` if needed
4. **SKIP:** Other docs until specifically needed

### Large Context Window (>64k tokens)
1. **ALWAYS read:** `docs/ARCHITECTURE.md` (context foundation)
2. **THEN read:** 2-3 domain-specific docs based on task type
3. **REFERENCE:** `TASK_WORKFLOWS.md` for workflow guidance
4. **BOOKMARK:** Other docs for future reference

### Agent-Specific Mapping

| Agent Type | Read First | Then Read | Skip |
|-------------|-------------|------------|-------|
| **Frontend/UI** | ARCHITECTURE.md | COMPONENT_GUIDE.md | TAURI_BACKEND |
| **State Changes** | STATE_MANAGEMENT.md | ARCHITECTURE.md | UI_PATTERNS |
| **Backend/Rust** | ARCHITECTURE.md | TAURI_BACKEND.md | COMPONENT_GUIDE, UI_PATTERNS |
| **Bug Fixes** | ARCHITECTURE.md → [Component/Backend] | TASK_WORKFLOWS.md | - |
| **New Features** | ARCHITECTURE.md → [Domain doc] | TASK_WORKFLOWS.md | - |

## Context Window Considerations

**Total Documentation Size:** ~830 lines across 7 files

The documentation is designed to fit within context windows while providing:
- ✅ **Efficient**: Agents only read relevant docs
- ✅ **Context-aware**: Essential docs prioritized
- ✅ **Domain-separated**: Backend agents skip UI docs, frontend agents skip backend docs
- ✅ **Maintainable**: Clear ownership, no redundancy between docs

---

# Guidelines
- Do not commit `.env` or secrets.
- Keep frontend and backend concerns separated by directory.
- Use Tauri storage for persistence, not localStorage (except language preference).
- Match existing component patterns when adding new features.
- Test on both desktop and mobile viewports.
