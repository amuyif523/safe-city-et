from typing import Generic, Sequence, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class PageMeta(BaseModel):
    total: int
    page: int
    size: int


class PaginatedResponse(BaseModel, Generic[T]):
    data: Sequence[T]
    meta: PageMeta


def paginate(query, page: int = 1, size: int = 20):
    page = max(page, 1)
    size = min(max(size, 1), 100)
    total = query.count()
    items = query.offset((page - 1) * size).limit(size).all()
    return items, PageMeta(total=total, page=page, size=size)
