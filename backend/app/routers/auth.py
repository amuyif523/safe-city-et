from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core import security
from app.core.config import settings
from app.core.deps import get_current_user
from app.database import get_session
from app.models.user import Role, User
from app.schemas import auth as auth_schema
from app.schemas.user import UserCreate, UserRead
from app.services import audit, notifications, token_service
from app.services.integrations import EmailAdapter
from app.services.rate_limit import LoginRateLimiter

router = APIRouter()
email_adapter = EmailAdapter()
login_limiter = LoginRateLimiter()


def _get_or_create_role(db: Session, role_name: str) -> Role:
    role = db.query(Role).filter_by(name=role_name).first()
    if not role:
        role = Role(name=role_name)
        db.add(role)
        db.flush()
    return role


@router.post("/signup", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def signup(user_in: UserCreate, request: Request, db: Session = Depends(get_session)):
    existing = db.query(User).filter_by(email=user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered.")

    invite_codes = (
        [code.strip() for code in settings.registration_invite_codes.split(",")]
        if settings.registration_invite_codes
        else []
    )
    requested_roles = user_in.roles or ["public"]
    assigned_roles: list[str] = []

    if set(requested_roles) == {"public"}:
        assigned_roles = ["public"]
    else:
        if not user_in.invite_code or user_in.invite_code not in invite_codes:
            assigned_roles = ["public"]
        else:
            assigned_roles = requested_roles

    user = User(
        full_name=user_in.full_name,
        email=user_in.email,
        phone=user_in.phone,
        hashed_password=security.get_password_hash(user_in.password),
        desired_roles=",".join(requested_roles) if requested_roles else None,
        is_email_verified=not settings.email_verification_required,
    )
    user.roles = [_get_or_create_role(db, role) for role in assigned_roles]
    db.add(user)
    db.commit()
    db.refresh(user)
    audit.log_event(
        db,
        action="user_signup",
        actor_id=user.id,
        target_type="user",
        target_id=user.id,
        details=f"Assigned roles: {', '.join(assigned_roles)}; requested: {', '.join(requested_roles)}",
    )
    if settings.email_verification_required:
        token = token_service.create_email_verification_token(db, user.id)
        verification_link = f"{request.base_url}verify-email?token={token}"
        email_adapter.send(
            user.email,
            "Verify your SafeCity account",
            f"Use the link to verify your account:\n{verification_link}",
        )
    return user


@router.post("/login", response_model=auth_schema.Token)
def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_session),
):
    key = f"{request.client.host}:{form_data.username}"
    login_limiter.hit(key)
    user = db.query(User).filter_by(email=form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password.")
    if not user.is_email_verified and settings.email_verification_required:
        raise HTTPException(status_code=403, detail="Please verify your email before signing in.")
    if not user.is_active or user.is_disabled:
        raise HTTPException(status_code=403, detail="Account disabled. Contact administrator.")
    if user.is_suspended:
        raise HTTPException(
            status_code=403,
            detail=f"Account suspended: {user.suspension_reason or 'No reason provided.'}",
        )
    login_limiter.reset(key)
    access_token = security.create_access_token(str(user.id))
    refresh_token = token_service.create_refresh_token(db, user.id)
    audit.log_event(
        db,
        action="user_login",
        actor_id=user.id,
        target_type="user",
        target_id=user.id,
    )
    return auth_schema.Token(access_token=access_token, refresh_token=refresh_token)


@router.get("/me", response_model=UserRead)
def read_me(current_user=Depends(get_current_user)):
    return current_user


@router.post("/refresh", response_model=auth_schema.Token)
def refresh_token(payload: auth_schema.RefreshRequest, db: Session = Depends(get_session)):
    user, new_refresh = token_service.rotate_refresh_token(db, payload.refresh_token)
    if not user.is_active or user.is_disabled or user.is_suspended:
        raise HTTPException(status_code=403, detail="Account not allowed to refresh tokens.")
    access_token = security.create_access_token(str(user.id))
    return auth_schema.Token(access_token=access_token, refresh_token=new_refresh)


@router.post("/request-password-reset")
def request_password_reset(
    body: auth_schema.PasswordResetRequest, db: Session = Depends(get_session)
):
    user = db.query(User).filter_by(email=body.email).first()
    if user:
        token = token_service.create_password_reset_token(db, user.id)
        email_adapter.send(
            user.email,
            "SafeCity Password Reset",
            f"Use this token to reset your password: {token}",
        )
        audit.log_event(
            db,
            action="password_reset_requested",
            actor_id=user.id,
            target_type="user",
            target_id=user.id,
        )
    return {"message": "If an account exists, a reset token has been sent."}


@router.post("/reset-password")
def reset_password(body: auth_schema.PasswordResetConfirm, db: Session = Depends(get_session)):
    user = token_service.consume_password_reset_token(db, body.token)
    user.hashed_password = security.get_password_hash(body.new_password)
    user.is_suspended = False
    user.suspension_reason = None
    db.add(user)
    db.commit()
    token_service.revoke_user_refresh_tokens(db, user.id)
    audit.log_event(
        db,
        action="password_reset",
        actor_id=user.id,
        target_type="user",
        target_id=user.id,
    )
    return {"message": "Password updated successfully."}


@router.post("/verify-email")
def verify_email(payload: auth_schema.RefreshRequest, db: Session = Depends(get_session)):
    user = token_service.consume_email_verification_token(db, payload.refresh_token)
    user.is_email_verified = True
    db.add(user)
    db.commit()
    audit.log_event(
        db,
        action="email_verified",
        actor_id=user.id,
        target_type="user",
        target_id=user.id,
    )
    return {"message": "Email verified successfully."}
