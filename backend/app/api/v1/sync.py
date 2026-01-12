from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user_with_db, get_db
from app.models import User
from app.schemas.sync import SyncRequest, SyncResponse
from app.services.sync_service import SyncService

router = APIRouter(prefix="/sync", tags=["sync"])


@router.post("/", response_model=SyncResponse)
async def sync_all(
    request: SyncRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_db),
):
    """
    Bulk sync endpoint - syncs all entity types in one request.

    Client sends:
    - device_id: Unique identifier for this client
    - last_sync_at: Timestamp of last successful sync (null for first sync)
    - exercises, workout_plans, workout_entries: Local entities with changes

    Server returns:
    - server_time: Current server timestamp (use as next last_sync_at)
    - exercises, workout_plans, workout_entries: Merged entities
    - conflicts: List of entities where server version won
    """
    sync_service = SyncService(db, current_user.id, request.device_id)
    all_conflicts = []

    # Sync exercises
    exercises, ex_conflicts = await sync_service.sync_exercises(
        request.exercises, request.last_sync_at
    )
    all_conflicts.extend(ex_conflicts)

    # Sync workout plans
    plans, plan_conflicts = await sync_service.sync_workout_plans(
        request.workout_plans, request.last_sync_at
    )
    all_conflicts.extend(plan_conflicts)

    # Sync workout entries
    entries, entry_conflicts = await sync_service.sync_workout_entries(
        request.workout_entries, request.last_sync_at
    )
    all_conflicts.extend(entry_conflicts)

    return SyncResponse(
        server_time=datetime.utcnow(),
        exercises=exercises,
        workout_plans=plans,
        workout_entries=entries,
        conflicts=all_conflicts,
    )
