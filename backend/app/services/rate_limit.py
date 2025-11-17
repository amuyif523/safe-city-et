from __future__ import annotations

from collections import defaultdict, deque
from time import monotonic

from fastapi import HTTPException, status

from app.core.config import settings


class LoginRateLimiter:
    def __init__(self) -> None:
        self._attempts: dict[str, deque[float]] = defaultdict(deque)

    def hit(self, key: str) -> None:
        window = settings.rate_limit_window_seconds
        limit = settings.rate_limit_login_attempts
        now = monotonic()
        queue = self._attempts[key]
        while queue and now - queue[0] > window:
            queue.popleft()
        if len(queue) >= limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many login attempts. Please wait and try again.",
            )
        queue.append(now)

    def reset(self, key: str) -> None:
        self._attempts.pop(key, None)
