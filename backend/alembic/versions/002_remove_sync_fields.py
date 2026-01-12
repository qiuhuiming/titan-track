"""Remove sync-specific fields

Revision ID: 002
Revises: 001
Create Date: 2026-01-12

"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "002"
down_revision: str | None = "001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Drop sync-specific columns from all tables
    op.drop_column("exercises", "version")
    op.drop_column("exercises", "last_modified_by_device")

    op.drop_column("workout_plans", "version")
    op.drop_column("workout_plans", "last_modified_by_device")

    op.drop_column("workout_entries", "version")
    op.drop_column("workout_entries", "last_modified_by_device")


def downgrade() -> None:
    # Re-add sync-specific columns (for rollback)
    import sqlalchemy as sa

    op.add_column(
        "exercises",
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
    )
    op.add_column(
        "exercises",
        sa.Column("last_modified_by_device", sa.String(64), nullable=True),
    )

    op.add_column(
        "workout_plans",
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
    )
    op.add_column(
        "workout_plans",
        sa.Column("last_modified_by_device", sa.String(64), nullable=True),
    )

    op.add_column(
        "workout_entries",
        sa.Column("version", sa.Integer(), nullable=False, server_default="1"),
    )
    op.add_column(
        "workout_entries",
        sa.Column("last_modified_by_device", sa.String(64), nullable=True),
    )
