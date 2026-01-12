import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class BaseMixin:
    """Base mixin for all entities."""

    # Client-generated ID (preserved from frontend)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)

    # Timestamps for audit
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Soft delete support
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class UserOwnedMixin(BaseMixin):
    """Mixin for entities owned by a user."""

    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
