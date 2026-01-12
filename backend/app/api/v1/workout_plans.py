from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user_with_db, get_db
from app.models import User, WorkoutPlan
from app.schemas import WorkoutPlanCreate, WorkoutPlanResponse, WorkoutPlanUpdate

router = APIRouter(prefix="/plans", tags=["workout_plans"])


@router.get("", response_model=list[WorkoutPlanResponse])
async def list_plans(
    include_deleted: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_db),
):
    """List all workout plans for the current user."""
    query = select(WorkoutPlan).where(WorkoutPlan.user_id == current_user.id)
    if not include_deleted:
        query = query.where(WorkoutPlan.is_deleted == False)  # noqa: E712
    query = query.order_by(WorkoutPlan.date.desc())

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{plan_id}", response_model=WorkoutPlanResponse)
async def get_plan(
    plan_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_db),
):
    """Get a single workout plan by ID."""
    result = await db.execute(
        select(WorkoutPlan).where(
            WorkoutPlan.id == plan_id,
            WorkoutPlan.user_id == current_user.id,
        )
    )
    plan = result.scalar_one_or_none()

    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")

    return plan


@router.post("", response_model=WorkoutPlanResponse, status_code=status.HTTP_201_CREATED)
async def create_plan(
    plan_in: WorkoutPlanCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_db),
):
    """Create a new workout plan."""
    # Check if ID already exists
    result = await db.execute(select(WorkoutPlan).where(WorkoutPlan.id == plan_in.id))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Plan with this ID already exists",
        )

    plan = WorkoutPlan(
        **plan_in.model_dump(),
        user_id=current_user.id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(plan)
    await db.commit()
    await db.refresh(plan)

    return plan


@router.put("/{plan_id}", response_model=WorkoutPlanResponse)
async def update_plan(
    plan_id: str,
    plan_in: WorkoutPlanUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_db),
):
    """Update a workout plan."""
    result = await db.execute(
        select(WorkoutPlan).where(
            WorkoutPlan.id == plan_id,
            WorkoutPlan.user_id == current_user.id,
        )
    )
    plan = result.scalar_one_or_none()

    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")

    # Update fields
    update_data = plan_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(plan, field, value)

    plan.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(plan)

    return plan


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_plan(
    plan_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_with_db),
):
    """Soft-delete a workout plan."""
    result = await db.execute(
        select(WorkoutPlan).where(
            WorkoutPlan.id == plan_id,
            WorkoutPlan.user_id == current_user.id,
        )
    )
    plan = result.scalar_one_or_none()

    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")

    plan.is_deleted = True
    plan.deleted_at = datetime.utcnow()
    plan.updated_at = datetime.utcnow()

    await db.commit()
