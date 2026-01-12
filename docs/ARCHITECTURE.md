# TitanTrack Architecture

## Tech Stack
- **Frontend**: React 19 + TypeScript + Tailwind CSS v4
- **Backend**: FastAPI + SQLAlchemy (async) + PostgreSQL
- **Authentication**: Email/password with JWT (HS256)
- **Package Manager**: Bun (frontend), uv (backend)
- **Build Tool**: Vite with PWA plugin
- **AI**: Multi-provider (OpenAI, Anthropic, Gemini, DeepSeek)

## Component Tree
```
App.tsx (Root - 394 lines)
├── Dashboard.tsx (492 lines) - Calendar view + preview
├── WorkoutLog.tsx (710 lines) - Workout logging + execution
├── PlanManager.tsx (790 lines) - Plan CRUD + grouping
├── AICoach.tsx (138 lines) - AI chat interface
├── AISettingsModal.tsx - AI provider configuration
└── ExerciseManager.tsx (251 lines) - Exercise catalog (modal)
```

## Data Flow Architecture
```
User Interaction
    ↓
Local Component State (useState)
    ↓
Callback Function (onUpdateXxx)
    ↓
Parent State Update (App.tsx)
    ↓
Storage Service (storageService.ts)
    ↓
localStorage (Browser)
```

## Storage Architecture
- **Keys:** titan_track_exercises, titan_track_logs, titan_track_plans, titan_track_ai_settings
- **Location:** Browser localStorage
- **Persistence:** Auto-save on state updates
- **Initialization:** Load on app start, seed with initial data if empty

## Key Architectural Decisions

### Why Prop Drilling?
- **Trade-off:** Simplicity vs Context API
- **Reasoning:** App has 5 components, prop depth is 1-2 levels
- **Future Consideration:** May need Context if component count grows to 10+

### Why localStorage?
- **Advantages:** Simple, no backend dependencies, works offline
- **Disadvantages:** Limited to ~5MB, no cross-device sync
- **Trade-off:** Acceptable for current scale (<1000 records per type)

### Why Mobile-First?
- **Primary Use Case:** Fitness apps used primarily on mobile
- **Implementation:** Bottom navigation on mobile, sidebar on desktop
- **Responsive:** Tailwind breakpoints (sm:, md:, lg:)

## Navigation Pattern
- **Mobile:** Bottom tab bar with 4 tabs (Home, Log, Plan, AI Coach) + Settings menu
- **Desktop:** Sidebar navigation with same 4 tabs
- **State Management:** activeTab state + activeTabParams for navigation with data
- **Settings Menu:** Dropdown menu with language toggle, exercise manager, and data reset options

## Internationalization
- **Languages:** Chinese (zh) and English (en)
- **Storage:** localStorage key "titan_track_lang"
- **Usage:** translations[language] object accessed across components

## AI Integration
- **Service:** aiService.ts wraps multiple AI provider SDKs
- **Providers:** OpenAI, Anthropic, Gemini, DeepSeek
- **Features:** Multi-turn conversation with ChatGPT-style UI
- **Language:** Responds in user's selected language

## Design System
- **Primary Color:** indigo-600
- **Success Color:** emerald-500
- **Danger Color:** rose-500
- **Neutral Colors:** slate-50 to slate-900
- **Rounded Corners:** rounded-2xl, rounded-[2.5rem]
- **Shadows:** shadow-sm, shadow-lg, shadow-2xl
