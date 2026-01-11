# TitanTrack Architecture

## Tech Stack
- Frontend: React 19 + TypeScript + Tailwind CSS v4
- Backend: Tauri v2 + Rust
- Storage: File-based JSON with Mutex in-memory cache
- Package Manager: Bun
- AI: Google Gemini API (@google/genai)

## Component Tree
```
App.tsx (Root - 222 lines)
├── Dashboard.tsx (373 lines) - Calendar view + preview
├── WorkoutLog.tsx (446 lines) - Workout logging + execution
├── PlanManager.tsx (417 lines) - Plan CRUD + grouping
├── AICoach.tsx (114 lines) - AI interface
└── ExerciseManager.tsx (182 lines) - Exercise catalog
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
Tauri Storage Service (tauriStorageService.ts)
    ↓
Tauri Bridge (@tauri-apps/api/core)
    ↓
Rust Command (commands.rs)
    ↓
Rust Storage Layer (storage.rs - Mutex<Vec<T>>)
    ↓
File System (AppDataDir/exercises.json, logs.json, plans.json)
```

## Storage Architecture
- **Files:** exercises.json, logs.json, plans.json
- **Location:** AppHandle.path().app_data_dir()
- **Thread Safety:** Mutex<Vec<T>> for in-memory caching
- **Persistence:** Auto-save on state updates
- **Initialization:** Load on app start, seed if empty

## Key Architectural Decisions

### Why Prop Drilling?
- **Trade-off:** Simplicity vs Context API
- **Reasoning:** App has 5 components, prop depth is 1-2 levels
- **Future Consideration:** May need Context if component count grows to 10+

### Why File-Based Storage?
- **Advantages:** Simple, no database dependencies, easy debugging
- **Disadvantages:** No queries, limited to full data loads
- **Trade-off:** Acceptable for current scale (<1000 records per type)

### Why Mobile-First?
- **Primary Use Case:** Fitness apps used primarily on mobile
- **Implementation:** Bottom navigation on mobile, sidebar on desktop
- **Responsive:** Tailwind breakpoints (sm:, md:, lg:)

## Navigation Pattern
- **Mobile:** Bottom tab bar with 4 tabs (Home, Log, Plan, AI Coach)
- **Desktop:** Sidebar navigation with same 4 tabs
- **State Management:** activeTab state + activeTabParams for navigation with data

## Internationalization
- **Languages:** Chinese (zh) and English (en)
- **Storage:** localStorage key "titan_track_lang"
- **Usage:** translations[language] object accessed across components

## AI Integration
- **Service:** geminiService.ts wraps Google GenAI SDK
- **Model:** gemini-3-flash-preview
- **Features:** Weekly deep dive analysis + Q&A chat
- **Language:** Responds in user's selected language

## Design System
- **Primary Color:** indigo-600
- **Success Color:** emerald-500
- **Danger Color:** rose-500
- **Neutral Colors:** slate-50 to slate-900
- **Rounded Corners:** rounded-2xl, rounded-[2.5rem]
- **Shadows:** shadow-sm, shadow-lg, shadow-2xl
