from __future__ import annotations

import argparse

from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.database import SessionLocal
from app.models.user import Role, User

DEFAULT_ROLES = [
    "public",
    "police",
    "fire",
    "medical",
    "military",
    "admin",
    "super_admin",
]


def seed_roles(session: Session) -> None:
    for role_name in DEFAULT_ROLES:
        if not session.query(Role).filter_by(name=role_name).first():
            session.add(Role(name=role_name))
    session.commit()


def seed_admin(session: Session, email: str, password: str, full_name: str = "SafeCity Admin") -> None:
    admin = session.query(User).filter_by(email=email).first()
    if admin:
        return
    roles = (
        session.query(Role).filter(Role.name.in_(["admin", "super_admin"])).all()
    )
    admin = User(
        full_name=full_name,
        email=email,
        hashed_password=get_password_hash(password),
        is_active=True,
    )
    admin.roles = roles
    session.add(admin)
    session.commit()


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed Safe City data.")
    parser.add_argument("--admin-email", required=True)
    parser.add_argument("--admin-password", required=True)
    parser.add_argument("--admin-name", default="SafeCity Admin")
    args = parser.parse_args()

    with SessionLocal() as session:
        seed_roles(session)
        seed_admin(session, args.admin_email, args.admin_password, args.admin_name)
        print("Seed completed.")


if __name__ == "__main__":
    main()
