from datetime import datetime

from pydantic import BaseModel, Field

from app.models.exercise import MuscleGroup


class ExerciseBase(BaseModel):
    name: str = Field(..., max_length=255)
    muscle_group: MuscleGroup
    equipment: str = Field(..., max_length=255)
    notes: str | None = None
    personal_best: float | None = None


class ExerciseCreate(ExerciseBase):
    id: str = Field(..., max_length=36)  # Client-generated ID


class ExerciseUpdate(BaseModel):
    name: str | None = Field(None, max_length=255)
    muscle_group: MuscleGroup | None = None
    equipment: str | None = Field(None, max_length=255)
    notes: str | None = None
    personal_best: float | None = None


class ExerciseResponse(ExerciseBase):
    id: str
    user_id: str
    updated_at: datetime
    created_at: datetime
    is_deleted: bool

    model_config = {"from_attributes": True}
