# Project Scope
This repository hosts **TitanTrack**, a PWA fitness tracking application built with React 19, TypeScript, and Tailwind CSS v4.

# App Overview
TitanTrack is a workout planning and logging app that helps users:
- Plan workout sessions with exercises, sets, weights, and reps
- Log completed workouts with RPE tracking
- View training history via an interactive calendar
- Get AI-powered coaching and performance analysis via multiple AI providers

# Tech Stack
- **Frontend**: React 19 with functional components and hooks
- **Backend**: FastAPI + SQLAlchemy (async) + PostgreSQL
- **Authentication**: Email/password with JWT (HS256)
- **Styling**: Tailwind CSS v4 with custom rounded card designs
- **Language**: TypeScript (strict mode), Python 3.12
- **Package Manager**: Bun (frontend), uv (backend)
- **Build Tool**: Vite with PWA plugin
- **Storage**: Backend API (data), localStorage (settings only)
- **AI Integration**: Multi-provider (OpenAI, Anthropic, Gemini, DeepSeek)
- **Deployment**: Vercel (frontend), Fly.io (backend)

# Directory Structure
```
src/                          # Frontend source code
├── App.tsx                   # Root component, navigation, global state
├── main.tsx                  # React entry point
├── index.css                 # Tailwind CSS imports
├── types.ts                  # TypeScript interfaces
├── constants.ts              # Initial seed data (exercises)
├── translations.ts           # i18n strings (zh/en)
├── components/
│   ├── Dashboard.tsx         # HOME tab - calendar view, streak display
│   ├── WorkoutLog.tsx        # LOG tab - log workouts, execute plans
│   ├── PlanManager.tsx       # PLAN tab - create/edit workout plans
│   ├── AICoach.tsx           # AI COACH tab - multi-provider AI chat
│   └── AISettingsModal.tsx   # AI provider/model configuration
└── services/
    ├── authService.ts        # Email/password auth, JWT token management
    ├── apiService.ts         # HTTP client with Bearer token
    ├── dataService.ts        # CRUD operations via backend API
    ├── storageService.ts     # localStorage for UI settings only
    └── aiService.ts          # Multi-provider AI API integration

backend/                      # Backend API (FastAPI)
├── app/
│   ├── api/v1/              # API routes
│   │   ├── auth.py          # /auth/register, /auth/login, /auth/me
│   │   ├── exercises.py     # Exercise CRUD
│   │   ├── workout_plans.py # Plan CRUD
│   │   └── workout_entries.py # Entry CRUD
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic schemas
│   ├── auth.py              # JWT creation/verification
│   └── config.py            # Environment settings
├── alembic/                 # Database migrations
├── fly.toml                 # Fly.io deployment config
└── pyproject.toml           # Python dependencies
```

# Data Models

## TypeScript (`src/types.ts`)
```typescript
MuscleGroup = 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Full Body' | 'Cardio'
Language = 'zh' | 'en'
AIProvider = 'openai' | 'anthropic' | 'gemini' | 'deepseek'

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

AISettings {
  provider, apiKey, model?
}

TabType = 'DASHBOARD' | 'WORKOUT_LOG' | 'PLAN' | 'AI_COACH'
```

# UI/UX Flow

## Navigation
4-tab bottom navigation (mobile) / sidebar (desktop):
1. **HOME** (Dashboard) - Calendar view, streak counter, long-press day preview
2. **LOG** (WorkoutLog) - Execute plans or log ad-hoc workouts
3. **PLAN** (PlanManager) - Create/edit workout plans with set groups
4. **AI COACH** (AICoach) - AI analysis and Q&A with multi-provider support

## Key Interactions
- **Dashboard**: Long-press calendar day → preview popup with exercises and "Go to Plan" button
- **WorkoutLog**: "Start Now" on upcoming plan → full-screen workout execution with set tracking
- **PlanManager**: Add exercises with grouped sets (e.g., 60kg × 8 reps × 4 sets)
- **AICoach**: ChatGPT-style interface with model selection and multi-turn conversations

# Storage Architecture

## Backend API (Primary)
- **Database**: PostgreSQL (Supabase)
- **ORM**: SQLAlchemy (async)
- **Tables**: users, exercises, workout_plans, workout_entries
- **Auth**: JWT tokens stored in localStorage (`titan_track_token`)

## localStorage (Settings Only)
- **Keys**: `titan_track_lang`, `titan_track_ai_settings`, `titan_track_token`, `titan_track_user`
- **Purpose**: UI preferences and authentication state

# Service Layer

## authService
Email/password authentication:
- `register(email, password)` - Create new user account
- `login(email, password)` - Authenticate and get JWT token
- `signOut()` - Clear stored tokens
- `getAccessToken()` - Get JWT for API requests
- `initialize()` - Restore session from localStorage

## apiService
HTTP client for backend API:
- Automatically attaches Bearer token to requests
- Methods: `get()`, `post()`, `put()`, `delete()`
- Base URL: `VITE_API_URL` env var

## dataService
CRUD operations via backend API:
- `getExercises()`, `createExercise()`, `updateExercise()`, `deleteExercise()`
- `getPlans()`, `createPlan()`, `updatePlan()`, `deletePlan()`
- `getEntries()`, `createEntry()`, `updateEntry()`, `deleteEntry()`

## storageService
localStorage for UI settings only:
- `getAISettings()`, `saveAISettings()`
- `clearLegacyData()` - Remove old localStorage data

## aiService
Multi-provider AI integration:
- Supports OpenAI, Anthropic, Gemini, DeepSeek
- `createAIService()` - Factory for provider-specific clients
- `getAIResponse()` - Unified API for all providers
- Multi-turn conversation support with message history

# State Management
- **App.tsx**: Holds global state (`user`, `authLoading`, `exercises`, `logs`, `plans`, `language`, `aiSettings`)
- **Auth state**: `user` (current user), `authLoading` (initializing)
- **Loading state**: Shows spinner while loading data
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

# UI Testing
Agents should use the Chrome DevTools MCP to verify UI/UX changes.
- **Default Host**: `http://localhost:5173` (Vite dev server)
- **Test Account**: Use the credentials provided in the environment variables `TITAN_TRACK_EMAIL` and `TITAN_TRACK_PASSWORD`.
- **Scope**: Verify core workflows (Login, Plan Creation, Workout Logging) on both mobile (390x844) and desktop viewports.
- **Verification**: Capture screenshots or snapshots after significant UI modifications to ensure visual consistency with the "rounded card" design system.

# Tooling Conventions

## ESLint
- Config: `eslint.config.js` (Flat Config).
- Uses recommended configs for JS, TypeScript, React hooks, and React refresh.
- Browser globals enabled; `dist/` is ignored.

## TypeScript
- `tsconfig.app.json`: Frontend settings (strict, noEmit, `react-jsx`, bundler resolution).
- `tsconfig.node.json`: Node/Vite settings (strict, noEmit).

## Vite
- Env prefix: `VITE_`.
- `process.env.GEMINI_API_KEY` is defined from env at build time.
- Path alias: `@` → `src`.
- PWA plugin for offline support.

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
  - Key architectural decisions (prop drilling, localStorage, mobile-first)
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

- **docs/UI_PATTERNS.md** (~150 lines)
  - Design system (colors, typography, shapes), reusable patterns
  - Modal patterns, animations, responsive design, accessibility
  - **Read for:** Frontend UI work, styling changes

- **docs/DATA_MODELS.md** (~80 lines)
  - TypeScript interfaces
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
| **Frontend/UI** | ARCHITECTURE.md | COMPONENT_GUIDE.md | - |
| **State Changes** | STATE_MANAGEMENT.md | ARCHITECTURE.md | UI_PATTERNS |
| **Bug Fixes** | ARCHITECTURE.md → [Component] | TASK_WORKFLOWS.md | - |
| **New Features** | ARCHITECTURE.md → [Domain doc] | TASK_WORKFLOWS.md | - |

## Context Window Considerations

**Total Documentation Size:** ~660 lines across 6 files

The documentation is designed to fit within context windows while providing:
- Efficient: Agents only read relevant docs
- Context-aware: Essential docs prioritized
- Maintainable: Clear ownership, no redundancy between docs

---

# Guidelines
- Do not commit `.env` or secrets.
- Data persisted via backend API; localStorage for settings only.
- Match existing component patterns when adding new features.
- Test on both desktop and mobile viewports.
- PWA: App works offline after first load (except AI and data sync features).
