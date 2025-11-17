from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database import Base, engine
from app.routers import admin, audit, auth, health, incidents, notifications, users


def create_application() -> FastAPI:
    app = FastAPI(
        title="Safe City ET Platform",
        description="Multi-agency emergency coordination platform for Ethiopia.",
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(auth.router, prefix="/auth", tags=["auth"])
    app.include_router(users.router, prefix="/users", tags=["users"])
    app.include_router(incidents.router, prefix="/incidents", tags=["incidents"])
    app.include_router(admin.router, prefix="/admin", tags=["admin"])
    app.include_router(
        notifications.router, prefix="/notifications", tags=["notifications"]
    )
    app.include_router(audit.router)
    return app


app = create_application()


@app.on_event("startup")
def on_startup() -> None:
    if settings.auto_create_schema:
        Base.metadata.create_all(bind=engine)
