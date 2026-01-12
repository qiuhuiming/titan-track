from datetime import date as date_type
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class WorkoutPlanBase(BaseModel):
    date: date_type
    title: str = Field(..., max_length=255)
    tags: list[str] = Field(default_factory=list)
    exercises: list[dict[str, Any]] = Field(default_factory=list)
    is_completed: bool = False


class WorkoutPlanCreate(WorkoutPlanBase):
    id: str = Field(..., max_length=36)  # Client-generated ID


class WorkoutPlanUpdate(BaseModel):
    date: date_type | None = None
    title: str | None = Field(None, max_length=255)
    tags: list[str] | None = None
    exercises: list[dict[str, Any]] | None = None
    is_completed: bool | None = None


class WorkoutPlanResponse(WorkoutPlanBase):
    id: str
    user_id: str
    version: int
    updated_at: datetime
    created_at: datetime
    is_deleted: bool

    model_config = {"from_attributes": True}
