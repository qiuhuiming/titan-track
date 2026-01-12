from datetime import date as date_type
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class WorkoutEntryBase(BaseModel):
    date: date_type
    exercise_id: str = Field(..., max_length=36)
    workout_type: str = Field(..., max_length=100)
    sets: list[dict[str, Any]] = Field(default_factory=list)
    plan_id: str | None = Field(None, max_length=36)


class WorkoutEntryCreate(WorkoutEntryBase):
    id: str = Field(..., max_length=36)  # Client-generated ID


class WorkoutEntryUpdate(BaseModel):
    date: date_type | None = None
    exercise_id: str | None = Field(None, max_length=36)
    workout_type: str | None = Field(None, max_length=100)
    sets: list[dict[str, Any]] | None = None
    plan_id: str | None = None


class WorkoutEntryResponse(WorkoutEntryBase):
    id: str
    user_id: str
    version: int
    updated_at: datetime
    created_at: datetime
    is_deleted: bool

    model_config = {"from_attributes": True}
