from fastapi import APIRouter, Depends

from app.core.deps import SessionDep, require_roles
from app.models.incident import Incident
from app.models.user import User

router = APIRouter(
    dependencies=[Depends(require_roles("admin", "super_admin"))],
)


@router.get("/summary")
def admin_summary(db: SessionDep):
    return {
        "users": db.query(User).count(),
        "incidents": db.query(Incident).count(),
        "active_incidents": db.query(Incident).filter(Incident.status != "resolved").count(),
    }
