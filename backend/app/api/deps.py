from collections.abc import AsyncGenerator
from datetime import datetime

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.database import AsyncSessionLocal
from app.models import User


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for getting async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def get_current_user_with_db(
    db: AsyncSession = Depends(get_db),
    current_user: dict[str, str] = Depends(get_current_user),
) -> User:
    """
    Get current user, creating if doesn't exist (first login).

    This upserts the user from Supabase Auth into our database.
    """
    user_id = current_user["id"]
    email = current_user["email"]

    # Try to get existing user
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if user is None:
        # First login - create user
        user = User(id=user_id, email=email, created_at=datetime.utcnow())
        db.add(user)
        await db.commit()
        await db.refresh(user)
    else:
        # Update last login
        user.last_login_at = datetime.utcnow()
        await db.commit()

    return user
