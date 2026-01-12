"""initial schema

Revision ID: 001
Revises:
Create Date: 2025-01-12

"""

from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create MuscleGroup enum
    muscle_group_enum = postgresql.ENUM(
        "Chest",
        "Back",
        "Legs",
        "Shoulders",
        "Arms",
        "Core",
        "Full Body",
        "Cardio",
        name="musclegroup",
        create_type=True,
    )
    muscle_group_enum.create(op.get_bind(), checkfirst=True)

    # Create users table
    op.create_table(
        "users",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("last_login_at", sa.DateTime(), nullable=True),
    )

    # Create exercises table
    op.create_table(
        "exercises",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), nullable=False, index=True),
        sa.Column("version", sa.Integer(), nullable=False, default=1),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, default=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.Column("last_modified_by_device", sa.String(64), nullable=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column(
            "muscle_group",
            muscle_group_enum,
            nullable=False,
        ),
        sa.Column("equipment", sa.String(255), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("personal_best", sa.Float(), nullable=True),
    )

    # Create workout_plans table
    op.create_table(
        "workout_plans",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), nullable=False, index=True),
        sa.Column("version", sa.Integer(), nullable=False, default=1),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, default=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.Column("last_modified_by_device", sa.String(64), nullable=True),
        sa.Column("date", sa.Date(), nullable=False, index=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("tags", postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column("exercises", postgresql.JSONB(), nullable=False),
        sa.Column("is_completed", sa.Boolean(), nullable=False, default=False),
    )

    # Create workout_entries table
    op.create_table(
        "workout_entries",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), nullable=False, index=True),
        sa.Column("version", sa.Integer(), nullable=False, default=1),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("is_deleted", sa.Boolean(), nullable=False, default=False),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.Column("last_modified_by_device", sa.String(64), nullable=True),
        sa.Column("date", sa.Date(), nullable=False, index=True),
        sa.Column(
            "exercise_id",
            sa.String(36),
            sa.ForeignKey("exercises.id"),
            nullable=False,
        ),
        sa.Column("workout_type", sa.String(100), nullable=False),
        sa.Column("sets", postgresql.JSONB(), nullable=False),
        sa.Column(
            "plan_id",
            sa.String(36),
            sa.ForeignKey("workout_plans.id"),
            nullable=True,
        ),
    )


def downgrade() -> None:
    op.drop_table("workout_entries")
    op.drop_table("workout_plans")
    op.drop_table("exercises")
    op.drop_table("users")

    # Drop MuscleGroup enum
    postgresql.ENUM(name="musclegroup").drop(op.get_bind(), checkfirst=True)
