from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core import security
from app.core.deps import get_current_user
from app.database import get_session
from app.models.user import Role, User
from app.schemas import auth as auth_schema
from app.schemas.user import UserCreate, UserRead
from app.services import audit

router = APIRouter()


def _get_or_create_role(db: Session, role_name: str) -> Role:
    role = db.query(Role).filter_by(name=role_name).first()
    if not role:
        role = Role(name=role_name)
        db.add(role)
        db.flush()
    return role


@router.post("/signup", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def signup(user_in: UserCreate, db: Session = Depends(get_session)):
    existing = db.query(User).filter_by(email=user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered.")

    user = User(
        full_name=user_in.full_name,
        email=user_in.email,
        phone=user_in.phone,
        hashed_password=security.get_password_hash(user_in.password),
    )
    role_names = user_in.roles or ["public"]
    user.roles = [_get_or_create_role(db, role) for role in role_names]
    db.add(user)
    db.commit()
    db.refresh(user)
    audit.log_event(
        db,
        action="user_signup",
        actor_id=user.id,
        target_type="user",
        target_id=user.id,
        details=f"Roles: {', '.join(role_names)}",
    )
    return user


@router.post("/login", response_model=auth_schema.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_session),
):
    user = db.query(User).filter_by(email=form_data.username).first()
    if not user or not security.verify_password(
        form_data.password, user.hashed_password
    ):
        raise HTTPException(status_code=400, detail="Incorrect email or password.")

    token = security.create_access_token(str(user.id))
    audit.log_event(
        db,
        action="user_login",
        actor_id=user.id,
        target_type="user",
        target_id=user.id,
    )
    return auth_schema.Token(access_token=token)


@router.get("/me", response_model=UserRead)
def read_me(current_user=Depends(get_current_user)):
    return current_user


@router.post("/refresh", response_model=auth_schema.Token, deprecated=True)
def refresh_token():
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Refresh token endpoint is planned for a future sprint.",
    )
