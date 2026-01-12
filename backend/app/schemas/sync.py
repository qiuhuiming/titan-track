from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class SyncEntityBase(BaseModel):
    """Base schema for syncable entities."""

    id: str
    version: int = 1
    updated_at: datetime | None = None
    created_at: datetime | None = None
    is_deleted: bool = False
    deleted_at: datetime | None = None


class SyncExercise(SyncEntityBase):
    """Exercise data for sync."""

    name: str
    muscle_group: str  # Use string to avoid enum serialization issues
    equipment: str
    notes: str | None = None
    personal_best: float | None = None


class SyncWorkoutPlan(SyncEntityBase):
    """Workout plan data for sync."""

    date: str  # ISO date string
    title: str
    tags: list[str] = Field(default_factory=list)
    exercises: list[dict[str, Any]] = Field(default_factory=list)
    is_completed: bool = False


class SyncWorkoutEntry(SyncEntityBase):
    """Workout entry data for sync."""

    date: str  # ISO date string
    exercise_id: str
    workout_type: str
    sets: list[dict[str, Any]] = Field(default_factory=list)
    plan_id: str | None = None


class SyncRequest(BaseModel):
    """Bulk sync request from client."""

    device_id: str = Field(..., max_length=64)
    last_sync_at: datetime | None = None
    exercises: list[dict[str, Any]] = Field(default_factory=list)
    workout_plans: list[dict[str, Any]] = Field(default_factory=list)
    workout_entries: list[dict[str, Any]] = Field(default_factory=list)


class SyncConflict(BaseModel):
    """Information about a sync conflict."""

    entity_type: str
    entity_id: str
    resolution: str  # 'server_wins' or 'client_wins'
    server_version: int
    client_version: int


class SyncResponse(BaseModel):
    """Bulk sync response to client."""

    server_time: datetime
    exercises: list[dict[str, Any]]
    workout_plans: list[dict[str, Any]]
    workout_entries: list[dict[str, Any]]
    conflicts: list[SyncConflict] = Field(default_factory=list)
