# TitanTrack Deployment Guide

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Vercel      │     │     Fly.io      │     │    Supabase     │
│   (Frontend)    │────▶│    (Backend)    │────▶│   (Database)    │
│  React PWA      │     │  FastAPI API    │     │   PostgreSQL    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │    Supabase     │
                        │     Auth        │
                        │  (Google OAuth) │
                        └─────────────────┘
```

## Production URLs

| Service | URL |
|---------|-----|
| Frontend | https://titan-track.vercel.app |
| Backend API | https://titan-track-api.fly.dev |
| Health Check | https://titan-track-api.fly.dev/health |
| API Docs | https://titan-track-api.fly.dev/docs |

## Environment Variables

### Frontend (Vercel)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL (`https://titan-track-api.fly.dev`) |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase publishable key |

### Backend (Fly.io Secrets)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (Supabase pooler) |
| `SUPABASE_URL` | Supabase project URL (for JWKS endpoint) |
| `CORS_ORIGINS` | Allowed origins JSON array |

## Deployment Commands

### Backend (Fly.io)

```bash
cd backend

# First-time setup
fly auth login
fly launch --no-deploy --name titan-track-api --region sin

# Set secrets
fly secrets set \
  DATABASE_URL="postgresql://..." \
  SUPABASE_URL="https://xxx.supabase.co" \
  CORS_ORIGINS='["https://titan-track.vercel.app","http://localhost:5173"]'

# Deploy
fly deploy

# View logs
fly logs

# Check status
fly status
```

### Frontend (Vercel)

Frontend auto-deploys on push to `main` branch:

```bash
git push origin main
```

## Local Development

### Frontend

```bash
bun dev                    # Start Vite dev server on :5173
```

### Backend

```bash
cd backend
uv sync                              # Install dependencies
uv run alembic upgrade head          # Run migrations
uv run uvicorn app.main:app --reload # Start dev server on :8000
```

### Environment Setup

Create `.env.local` in project root:

```env
# Database
DATABASE_URL=postgresql://...

# Supabase Auth
SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...

# CORS
CORS_ORIGINS=["http://localhost:5173"]
```

## Infrastructure Details

### Fly.io Configuration

- **Region**: Singapore (`sin`)
- **VM**: shared-cpu-1x, 1GB RAM
- **Auto-scaling**: Stops when idle, starts on request
- **Health check**: `GET /health` every 30s
- **Release command**: `uv run alembic upgrade head` (runs migrations before deploy)

### Database

- **Provider**: Supabase PostgreSQL
- **Connection**: Supabase Pooler (pgBouncer compatible)
- **Region**: AWS ap-southeast-1

### Authentication

- **Provider**: Supabase Auth
- **Method**: Google OAuth
- **JWT**: ES256 asymmetric keys (JWKS verification)
- **JWKS Endpoint**: `https://xxx.supabase.co/auth/v1/.well-known/jwks.json`

## Supabase Configuration

### OAuth Redirect URLs

In Supabase Dashboard → Authentication → URL Configuration:

- **Site URL**: `https://titan-track.vercel.app`
- **Redirect URLs**:
  - `https://titan-track.vercel.app`
  - `https://titan-track.vercel.app/**`
  - `http://localhost:5173` (dev)

## Troubleshooting

### Backend not starting

```bash
fly logs                    # Check application logs
fly status                  # Check machine status
fly ssh console             # SSH into machine
```

### Database connection issues

1. Verify `DATABASE_URL` format: `postgresql://user:pass@host:port/db`
2. Check Supabase pooler is accessible
3. Ensure pgBouncer compatibility (prepared statements disabled)

### OAuth not working

1. Check redirect URLs in Supabase dashboard
2. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
3. Check browser console for auth errors

### CORS errors

1. Verify `CORS_ORIGINS` includes the frontend URL
2. Redeploy backend: `fly deploy`
