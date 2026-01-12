# TitanTrack

AI-powered fitness tracking PWA for planning workouts, logging progress, and getting personalized coaching.

## Features

- **Workout Planning** - Create plans with exercises, sets, weights, and reps
- **Progress Logging** - Log completed workouts with RPE tracking
- **Training History** - Interactive calendar view with streak tracking
- **AI Coaching** - Multi-provider support (OpenAI, Anthropic, Gemini, DeepSeek)
- **Offline Support** - Works offline as a PWA
- **Bilingual** - English and Chinese

## UI/UX Flow

4-tab navigation (bottom nav on mobile, sidebar on desktop):

| Tab | Description |
|-----|-------------|
| **HOME** | Calendar view, streak counter, long-press day to preview |
| **LOG** | Execute planned workouts or log ad-hoc sessions |
| **PLAN** | Create/edit workout plans with grouped sets |
| **AI COACH** | ChatGPT-style AI assistant for fitness advice |

### Key Interactions

- **Dashboard**: Long-press a calendar day to preview exercises
- **WorkoutLog**: Tap "Start Now" on a plan to begin workout execution
- **PlanManager**: Add exercises with grouped sets (e.g., 60kg × 8 reps × 4 sets)
- **AICoach**: Chat with AI, select model, multi-turn conversations

## Tech Stack

- React 19 + TypeScript
- Tailwind CSS v4
- Vite + vite-plugin-pwa
- localStorage for data persistence
- Bun package manager

## Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Lint
bun run lint
```

## Project Structure

```
src/
├── App.tsx                   # Root component, navigation, global state
├── components/
│   ├── Dashboard.tsx         # HOME - calendar, streaks
│   ├── WorkoutLog.tsx        # LOG - workout execution
│   ├── PlanManager.tsx       # PLAN - create/edit plans
│   ├── AICoach.tsx           # AI COACH - chat interface
│   └── AISettingsModal.tsx   # AI provider configuration
├── services/
│   ├── storageService.ts     # localStorage wrapper
│   └── aiService.ts          # Multi-provider AI integration
├── types.ts                  # TypeScript interfaces
├── constants.ts              # Initial seed data
└── translations.ts           # i18n strings (zh/en)
```

## License

MIT
