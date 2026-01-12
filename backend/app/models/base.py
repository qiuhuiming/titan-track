import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class SyncMixin:
    """Mixin for entities that sync with offline clients."""

    # Client-generated ID (preserved from frontend)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)

    # Sync metadata
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Soft delete for sync (never hard delete synced entities)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Device tracking for conflict resolution
    last_modified_by_device: Mapped[str | None] = mapped_column(String(64), nullable=True)


class UserOwnedMixin(SyncMixin):
    """Mixin for entities owned by a user."""

    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
