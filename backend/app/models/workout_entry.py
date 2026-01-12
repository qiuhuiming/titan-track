from sqlalchemy import Date, ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.base import UserOwnedMixin


class WorkoutEntry(UserOwnedMixin, Base):
    """Workout log entry model."""

    __tablename__ = "workout_entries"

    date: Mapped[str] = mapped_column(Date, nullable=False, index=True)
    exercise_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("exercises.id"), nullable=False
    )
    workout_type: Mapped[str] = mapped_column(String(100), nullable=False)

    # Store sets as JSONB for flexibility with WorkoutSet structure
    # Format: [{"id": "...", "weight": 60, "reps": 8, ...}]
    sets: Mapped[list[dict]] = mapped_column(JSONB, nullable=False, default=list)

    plan_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("workout_plans.id"), nullable=True
    )
