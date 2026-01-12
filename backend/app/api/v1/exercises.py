from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user_with_db, get_db
from app.models import Exercise, User
from app.schemas import ExerciseCreate, ExerciseResponse, ExerciseUpdate

router = APIRouter(prefix="/exercises", tags=["exercises"])


@router.get("/", response_model=list[ExerciseResponse])
async def list_exercises(
    include_deleted: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_db),
):
    """List all exercises for the current user."""
    query = select(Exercise).where(Exercise.user_id == current_user.id)
    if not include_deleted:
        query = query.where(Exercise.is_deleted == False)  # noqa: E712
    query = query.order_by(Exercise.name)

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{exercise_id}", response_model=ExerciseResponse)
async def get_exercise(
    exercise_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_db),
):
    """Get a single exercise by ID."""
    result = await db.execute(
        select(Exercise).where(
            Exercise.id == exercise_id,
            Exercise.user_id == current_user.id,
        )
    )
    exercise = result.scalar_one_or_none()

    if not exercise:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exercise not found")

    return exercise


@router.post("/", response_model=ExerciseResponse, status_code=status.HTTP_201_CREATED)
async def create_exercise(
    exercise_in: ExerciseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_db),
):
    """Create a new exercise."""
    # Check if ID already exists
    result = await db.execute(select(Exercise).where(Exercise.id == exercise_in.id))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Exercise with this ID already exists",
        )

    exercise = Exercise(
        **exercise_in.model_dump(),
        user_id=current_user.id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(exercise)
    await db.commit()
    await db.refresh(exercise)

    return exercise


@router.put("/{exercise_id}", response_model=ExerciseResponse)
async def update_exercise(
    exercise_id: str,
    exercise_in: ExerciseUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_db),
):
    """Update an exercise."""
    result = await db.execute(
        select(Exercise).where(
            Exercise.id == exercise_id,
            Exercise.user_id == current_user.id,
        )
    )
    exercise = result.scalar_one_or_none()

    if not exercise:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exercise not found")

    # Update fields
    update_data = exercise_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(exercise, field, value)

    exercise.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(exercise)

    return exercise


@router.delete("/{exercise_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_exercise(
    exercise_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_db),
):
    """Soft-delete an exercise."""
    result = await db.execute(
        select(Exercise).where(
            Exercise.id == exercise_id,
            Exercise.user_id == current_user.id,
        )
    )
    exercise = result.scalar_one_or_none()

    if not exercise:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Exercise not found")

    exercise.is_deleted = True
    exercise.deleted_at = datetime.utcnow()
    exercise.updated_at = datetime.utcnow()

    await db.commit()
