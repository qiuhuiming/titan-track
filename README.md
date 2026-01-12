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

**Frontend:**
- React 19 + TypeScript
- Tailwind CSS v4
- Vite + vite-plugin-pwa
- Bun package manager

**Backend:**
- FastAPI + SQLAlchemy (async)
- PostgreSQL (Supabase)
- JWT authentication (HS256)
- Python 3.12 + uv

## Quick Start

**Frontend:**
```bash
bun install          # Install dependencies
bun run dev          # Start dev server on :5173
bun run build        # Build for production
bun run lint         # Lint code
```

**Backend:**
```bash
cd backend
uv sync                              # Install dependencies
uv run alembic upgrade head          # Run migrations
uv run uvicorn app.main:app --reload # Start dev server on :8000
```

## Project Structure

```
src/                          # Frontend
├── App.tsx                   # Root component, auth, navigation
├── components/
│   ├── Dashboard.tsx         # HOME - calendar, streaks
│   ├── WorkoutLog.tsx        # LOG - workout execution
│   ├── PlanManager.tsx       # PLAN - create/edit plans
│   ├── AICoach.tsx           # AI COACH - chat interface
│   └── AISettingsModal.tsx   # AI provider configuration
├── services/
│   ├── authService.ts        # Email/password auth
│   ├── apiService.ts         # HTTP client
│   ├── dataService.ts        # CRUD via API
│   └── aiService.ts          # Multi-provider AI
├── types.ts                  # TypeScript interfaces
└── translations.ts           # i18n strings (zh/en)

backend/                      # Backend API
├── app/
│   ├── api/v1/              # API routes (auth, exercises, plans, entries)
│   ├── models/              # SQLAlchemy models
│   └── schemas/             # Pydantic schemas
├── alembic/                 # Database migrations
└── fly.toml                 # Fly.io config
```

## Deployment

**Production URLs:**
- Frontend: https://titan-track.vercel.app
- Backend: https://titan-track-api.fly.dev

**Deploy scripts:**
```bash
./scripts/deploy_frontend_vercel.sh  # Deploy to Vercel
./scripts/deploy_backend_fly.sh      # Deploy to Fly.io
```

## License

MIT
