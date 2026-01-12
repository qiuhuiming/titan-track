from datetime import datetime, timedelta
from typing import Any

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.config import settings

security = HTTPBearer()


class JWKSClient:
    """Fetches and caches JWKS from Supabase for ES256 JWT verification."""

    def __init__(self, jwks_url: str, cache_duration: int = 3600):
        self.jwks_url = jwks_url
        self.cache_duration = cache_duration
        self._keys: dict[str, dict[str, Any]] = {}
        self._last_fetch: datetime | None = None

    async def get_signing_key(self, kid: str) -> dict[str, Any]:
        """Get public key by key ID, fetching JWKS if needed."""
        if self._should_refresh():
            await self._fetch_jwks()

        if kid not in self._keys:
            # Key not found, try refreshing once more
            await self._fetch_jwks()

        if kid not in self._keys:
            raise ValueError(f"Key {kid} not found in JWKS")

        return self._keys[kid]

    def _should_refresh(self) -> bool:
        if not self._last_fetch:
            return True
        return datetime.utcnow() - self._last_fetch > timedelta(seconds=self.cache_duration)

    async def _fetch_jwks(self) -> None:
        async with httpx.AsyncClient() as client:
            response = await client.get(self.jwks_url, timeout=10.0)
            response.raise_for_status()
            jwks = response.json()

        self._keys = {key["kid"]: key for key in jwks.get("keys", [])}
        self._last_fetch = datetime.utcnow()


# Initialize JWKS client at module level
_jwks_client: JWKSClient | None = None


def get_jwks_client() -> JWKSClient:
    """Get or create JWKS client singleton."""
    global _jwks_client
    if _jwks_client is None:
        jwks_url = f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json"
        _jwks_client = JWKSClient(jwks_url)
    return _jwks_client


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
    Verify Supabase JWT token using JWKS (ES256 asymmetric keys).

    Supabase JWTs contain:
    - sub: User ID (UUID)
    - email: User email
    - aud: Audience (should be "authenticated")
    - role: User role (usually "authenticated")
    """
    token = credentials.credentials

    try:
        # Decode header to get key ID (kid)
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")

        if not kid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token missing key ID (kid)",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Get public key from JWKS
        jwks_client = get_jwks_client()
        key = await jwks_client.get_signing_key(kid)

        # Verify token with ES256
        payload = jwt.decode(
            token,
            key,
            algorithms=["ES256"],
            audience="authenticated",
        )
        return TokenPayload(payload)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"JWKS error: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )
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
