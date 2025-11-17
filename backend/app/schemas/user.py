from datetime import datetime
from typing import List

from pydantic import BaseModel, EmailStr, Field


class RoleRead(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: str | None = None


class UserCreate(UserBase):
    password: str = Field(min_length=8)
    roles: List[str] | None = None


class UserUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    is_active: bool | None = None
    roles: List[str] | None = None


class UserRead(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    roles: List[RoleRead] = []

    model_config = {"from_attributes": True}
