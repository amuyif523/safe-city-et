from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    environment: str = Field("development", alias="ENVIRONMENT")
    secret_key: str = Field("change-me", alias="SECRET_KEY")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    database_url: str = Field(
        "sqlite:///./safe_city.db",
        alias="DATABASE_URL",
        description="SQLAlchemy database URL.",
    )
    auto_create_schema: bool = Field(True, alias="AUTO_CREATE_SCHEMA")
    cors_allow_origins: List[str] = [
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:5173",
    ]
    rate_limit_login_attempts: int = 5
    rate_limit_window_seconds: int = 300

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
