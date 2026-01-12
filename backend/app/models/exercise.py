import enum

from sqlalchemy import Enum, Float, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.base import UserOwnedMixin


class MuscleGroup(str, enum.Enum):
    CHEST = "Chest"
    BACK = "Back"
    LEGS = "Legs"
    SHOULDERS = "Shoulders"
    ARMS = "Arms"
    CORE = "Core"
    FULL_BODY = "Full Body"
    CARDIO = "Cardio"


class Exercise(UserOwnedMixin, Base):
    """Exercise model."""

    __tablename__ = "exercises"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    muscle_group: Mapped[MuscleGroup] = mapped_column(Enum(MuscleGroup), nullable=False)
    equipment: Mapped[str] = mapped_column(String(255), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    personal_best: Mapped[float | None] = mapped_column(Float, nullable=True)
