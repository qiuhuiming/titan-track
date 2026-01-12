from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user_with_db, get_db
from app.models import User, WorkoutEntry
from app.schemas import WorkoutEntryCreate, WorkoutEntryResponse, WorkoutEntryUpdate

router = APIRouter(prefix="/entries", tags=["workout_entries"])


@router.get("/", response_model=list[WorkoutEntryResponse])
async def list_entries(
    include_deleted: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_db),
):
    """List all workout entries for the current user."""
    query = select(WorkoutEntry).where(WorkoutEntry.user_id == current_user.id)
    if not include_deleted:
        query = query.where(WorkoutEntry.is_deleted == False)  # noqa: E712
    query = query.order_by(WorkoutEntry.date.desc())

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{entry_id}", response_model=WorkoutEntryResponse)
async def get_entry(
    entry_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_db),
):
    """Get a single workout entry by ID."""
    result = await db.execute(
        select(WorkoutEntry).where(
            WorkoutEntry.id == entry_id,
            WorkoutEntry.user_id == current_user.id,
        )
    )
    entry = result.scalar_one_or_none()

    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found")

    return entry


@router.post("/", response_model=WorkoutEntryResponse, status_code=status.HTTP_201_CREATED)
async def create_entry(
    entry_in: WorkoutEntryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_db),
):
    """Create a new workout entry."""
    # Check if ID already exists
    result = await db.execute(select(WorkoutEntry).where(WorkoutEntry.id == entry_in.id))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Entry with this ID already exists",
        )

    entry = WorkoutEntry(
        **entry_in.model_dump(),
        user_id=current_user.id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)

    return entry


@router.put("/{entry_id}", response_model=WorkoutEntryResponse)
async def update_entry(
    entry_id: str,
    entry_in: WorkoutEntryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_db),
):
    """Update a workout entry."""
    result = await db.execute(
        select(WorkoutEntry).where(
            WorkoutEntry.id == entry_id,
            WorkoutEntry.user_id == current_user.id,
        )
    )
    entry = result.scalar_one_or_none()

    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found")

    # Update fields
    update_data = entry_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(entry, field, value)

    entry.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(entry)

    return entry


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_entry(
    entry_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_db),
):
    """Soft-delete a workout entry."""
    result = await db.execute(
        select(WorkoutEntry).where(
            WorkoutEntry.id == entry_id,
            WorkoutEntry.user_id == current_user.id,
        )
    )
    entry = result.scalar_one_or_none()

    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entry not found")

    entry.is_deleted = True
    entry.deleted_at = datetime.utcnow()
    entry.updated_at = datetime.utcnow()

    await db.commit()
