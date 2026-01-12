from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.deps import get_current_user_with_db
from app.api.v1 import api_router
from app.config import settings
from app.database import async_engine
from app.models import User


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    yield
    # Shutdown
    await async_engine.dispose()


app = FastAPI(
    title="TitanTrack API",
    description="Backend API for TitanTrack fitness tracking app",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router)


@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "0.1.0"}


@app.get("/")
async def root():
    return {"message": "TitanTrack API", "docs": "/docs"}


@app.get("/me")
async def get_me(current_user: User = Depends(get_current_user_with_db)):
    """Get current authenticated user info."""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "created_at": current_user.created_at.isoformat(),
    }
