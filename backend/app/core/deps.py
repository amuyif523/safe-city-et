from collections.abc import Callable
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database import get_session
from app.models.user import Role, User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
SessionDep = Annotated[Session, Depends(get_session)]


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)], db: SessionDep
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.secret_key, algorithms=[settings.algorithm]
        )
        user_id: str | None = payload.get("sub")
    except JWTError as exc:  # pragma: no cover - defensive
        raise credentials_exception from exc
    if user_id is None:
        raise credentials_exception

    user = db.get(User, int(user_id))
    if not user or not user.is_active:
        raise credentials_exception
    return user


def require_roles(*allowed_roles: str) -> Callable:
    def wrapper(current_user: Annotated[User, Depends(get_current_user)]) -> User:
        role_names = {role.name for role in current_user.roles}
        if not role_names.intersection(set(allowed_roles)):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions.",
            )
        return current_user

    return wrapper


def require_admin(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    return require_roles("admin", "super_admin")(current_user)
