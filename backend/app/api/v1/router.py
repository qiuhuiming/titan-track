from fastapi import APIRouter

from app.api.v1.exercises import router as exercises_router
from app.api.v1.sync import router as sync_router
from app.api.v1.workout_entries import router as entries_router
from app.api.v1.workout_plans import router as plans_router

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(exercises_router)
api_router.include_router(plans_router)
api_router.include_router(entries_router)
api_router.include_router(sync_router)
