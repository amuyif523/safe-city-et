from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import SessionDep, get_current_user, require_roles
from app.core.security import get_password_hash
from app.models.user import Role, User
from app.schemas.user import UserCreate, UserRead, UserUpdate
from app.services import audit

router = APIRouter()


def _assign_roles(db: Session, role_names: List[str]) -> List[Role]:
    roles: List[Role] = []
    for name in role_names:
        role = db.query(Role).filter_by(name=name).first()
        if not role:
            role = Role(name=name)
            db.add(role)
            db.flush()
        roles.append(role)
    return roles


@router.get(
    "/", response_model=List[UserRead], dependencies=[Depends(require_roles("admin", "super_admin"))]
)
def list_users(
    db: SessionDep,
    pending_only: bool | None = None,
):
    query = db.query(User)
    if pending_only:
        query = query.filter(User.desired_roles.isnot(None))
    return query.all()


@router.post(
    "/",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("admin", "super_admin"))],
)
def create_user(user_in: UserCreate, db: SessionDep, current_user=Depends(get_current_user)):
    if db.query(User).filter_by(email=user_in.email).first():
        raise HTTPException(status_code=400, detail="Email already used.")
    user = User(
        full_name=user_in.full_name,
        email=user_in.email,
        phone=user_in.phone,
        hashed_password=get_password_hash(user_in.password),
    )
    role_names = user_in.roles or ["public"]
    user.roles = _assign_roles(db, role_names)
    db.add(user)
    db.commit()
    db.refresh(user)
    audit.log_event(
        db,
        action="user_created",
        actor_id=current_user.id,
        target_type="user",
        target_id=user.id,
        details=f"Roles: {', '.join(role_names)}",
    )
    return user


@router.patch(
    "/{user_id}",
    response_model=UserRead,
    dependencies=[Depends(require_roles("admin", "super_admin"))],
)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: SessionDep,
    current_user=Depends(get_current_user),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    changes = []
    for field, value in user_in.model_dump(exclude_unset=True).items():
        if field == "roles" and value:
            user.roles = _assign_roles(db, value)
            changes.append("roles")
        else:
            setattr(user, field, value)
            changes.append(field)
    db.add(user)
    db.commit()
    db.refresh(user)
    audit.log_event(
        db,
        action="user_updated",
        actor_id=current_user.id,
        target_type="user",
        target_id=user.id,
        details=f"Fields: {', '.join(changes) if changes else 'none'}",
    )
    return user


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_roles("admin", "super_admin"))],
)
def disable_user(user_id: int, db: SessionDep, current_user=Depends(get_current_user)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    user.is_active = False
    user.is_disabled = True
    db.add(user)
    db.commit()
    audit.log_event(
        db,
        action="user_disabled",
        actor_id=current_user.id,
        target_type="user",
        target_id=user_id,
    )
