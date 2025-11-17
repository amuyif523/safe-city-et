from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import SessionDep, get_current_user, require_roles
from app.core.pagination import PaginatedResponse, paginate
from app.models.incident import Incident
from app.schemas.incident import IncidentCreate, IncidentRead, IncidentUpdate
from app.services import ai, audit, notifications

router = APIRouter()

ROLE_FILTERS = {
    "police": ["crime", "police"],
    "fire": ["fire"],
    "medical": ["medical"],
    "military": ["military"],
}


def _filter_query_for_user(query, user) -> Session:
    role_names = {role.name for role in user.roles}
    if "admin" in role_names or "super_admin" in role_names:
        return query
    if "public" in role_names:
        return query.filter(Incident.reported_by_id == user.id)

    allowed_types: List[str] = []
    for role in role_names:
        allowed_types.extend(ROLE_FILTERS.get(role, []))
    if allowed_types:
        return query.filter(Incident.incident_type.in_(allowed_types))
    return query


@router.post(
    "/",
    response_model=IncidentRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[
        Depends(
            require_roles(
                "public", "police", "fire", "medical", "military", "admin", "super_admin"
            )
        )
    ],
)
def create_incident(
    incident_in: IncidentCreate,
    db: SessionDep,
    current_user=Depends(get_current_user),
):
    ai_response = ai.classify_incident(
        f"{incident_in.title} {incident_in.description}"
    )
    incident = Incident(
        title=incident_in.title,
        description=incident_in.description,
        incident_type=incident_in.incident_type or ai_response.incident_type,
        priority=incident_in.priority,
        latitude=incident_in.latitude,
        longitude=incident_in.longitude,
        severity_score=ai_response.severity_score,
        reported_by_id=current_user.id,
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)
    audit.log_event(
        db,
        action="incident_created",
        actor_id=current_user.id,
        target_type="incident",
        target_id=incident.id,
    )
    return incident


@router.get("/", response_model=PaginatedResponse[IncidentRead])
def list_incidents(
    db: SessionDep,
    current_user=Depends(get_current_user),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
):
    query = db.query(Incident)
    query = _filter_query_for_user(query, current_user)
    items, meta = paginate(query, page, size)
    return {"data": items, "meta": meta}


@router.get("/{incident_id}", response_model=IncidentRead)
def get_incident(
    incident_id: int,
    db: SessionDep,
    current_user=Depends(get_current_user),
):
    incident = db.get(Incident, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found.")
    query = db.query(Incident).filter(Incident.id == incident_id)
    filtered_query = _filter_query_for_user(query, current_user)
    if not filtered_query.first():
        raise HTTPException(status_code=403, detail="Not authorized to view incident.")
    return incident


@router.patch(
    "/{incident_id}",
    response_model=IncidentRead,
    dependencies=[
        Depends(
            require_roles(
                "police", "fire", "medical", "military", "admin", "super_admin"
            )
        )
    ],
)
def update_incident(
    incident_id: int,
    incident_in: IncidentUpdate,
    db: SessionDep,
    current_user=Depends(get_current_user),
):
    incident = db.get(Incident, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found.")

    data = incident_in.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(incident, field, value)
    db.add(incident)
    db.commit()
    db.refresh(incident)
    notifications.create_notification(
        db,
        user_id=incident.reported_by_id or current_user.id,
        message=f"Incident {incident.id} updated to {incident.status}",
        event_type="status_updated",
    )
    audit.log_event(
        db,
        action="incident_updated",
        actor_id=current_user.id,
        target_type="incident",
        target_id=incident.id,
    )
    return incident


@router.delete(
    "/{incident_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_roles("admin", "super_admin"))],
)
def delete_incident(incident_id: int, db: SessionDep, current_user=Depends(get_current_user)):
    incident = db.get(Incident, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found.")
    db.delete(incident)
    db.commit()
    audit.log_event(
        db,
        action="incident_deleted",
        actor_id=current_user.id,
        target_type="incident",
        target_id=incident_id,
    )
