from __future__ import annotations

import secrets
from datetime import datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.token import PasswordResetToken, RefreshToken
from app.models.user import User


def _generate_token() -> str:
    return secrets.token_urlsafe(48)


def create_refresh_token(db: Session, user_id: int) -> str:
    token = _generate_token()
    expires = datetime.utcnow() + timedelta(minutes=settings.refresh_token_expire_minutes)
    entry = RefreshToken(user_id=user_id, token=token, expires_at=expires)
    db.add(entry)
    db.commit()
    return token


def rotate_refresh_token(db: Session, token_str: str) -> tuple[User, str]:
    entry = db.query(RefreshToken).filter_by(token=token_str).first()
    if not entry or entry.expires_at < datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token.")
    user = db.get(User, entry.user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token.")
    db.delete(entry)
    db.commit()
    new_token = create_refresh_token(db, user.id)
    return user, new_token


def revoke_user_refresh_tokens(db: Session, user_id: int) -> None:
    db.query(RefreshToken).filter(RefreshToken.user_id == user_id).delete()
    db.commit()


def create_password_reset_token(db: Session, user_id: int) -> str:
    token = _generate_token()
    expires = datetime.utcnow() + timedelta(minutes=30)
    db.query(PasswordResetToken).filter(PasswordResetToken.user_id == user_id).delete()
    entry = PasswordResetToken(user_id=user_id, token=token, expires_at=expires)
    db.add(entry)
    db.commit()
    return token


def consume_password_reset_token(db: Session, token_str: str) -> User:
    entry = db.query(PasswordResetToken).filter_by(token=token_str).first()
    if not entry or entry.expires_at < datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token.")
    user = db.get(User, entry.user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token.")
    db.delete(entry)
    db.commit()
    return user
