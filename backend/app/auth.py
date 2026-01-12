from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.config import settings

security = HTTPBearer()


class TokenPayload:
    """Parsed JWT token payload."""

    def __init__(self, payload: dict[str, Any]):
        self.sub: str = payload.get("sub", "")
        self.email: str = payload.get("email", "")
        self.aud: str = payload.get("aud", "")
        self.role: str = payload.get("role", "")


async def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> TokenPayload:
    """
    Verify Supabase JWT token and extract payload.

    Supabase JWTs contain:
    - sub: User ID (UUID)
    - email: User email
    - aud: Audience (should be "authenticated")
    - role: User role (usually "authenticated")
    """
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
        return TokenPayload(payload)
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(token: TokenPayload = Depends(verify_token)) -> dict[str, str]:
    """
    Get current user from verified token.

    Returns dict with user info:
    - id: User ID from Supabase Auth
    - email: User email
    """
    if not token.sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: missing user ID",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return {
        "id": token.sub,
        "email": token.email,
    }
