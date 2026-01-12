from sqlalchemy import Boolean, Date, String
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.base import UserOwnedMixin


class WorkoutPlan(UserOwnedMixin, Base):
    """Workout plan model."""

    __tablename__ = "workout_plans"

    date: Mapped[str] = mapped_column(Date, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    tags: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)

    # Store exercises array as JSONB for flexibility
    # Format: [{"exerciseId": "...", "sets": [...]}]
    exercises: Mapped[list[dict]] = mapped_column(JSONB, nullable=False, default=list)

    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
