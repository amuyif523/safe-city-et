from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
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

RESPONDER_DIRECTORY = [
    {"id": 1, "name": "Addis Police HQ", "role": "police", "latitude": 9.029, "longitude": 38.749},
    {"id": 2, "name": "Bole Fire Station", "role": "fire", "latitude": 8.989, "longitude": 38.79},
    {"id": 3, "name": "Black Lion Hospital", "role": "medical", "latitude": 9.019, "longitude": 38.75},
    {"id": 4, "name": "National Defense Unit", "role": "military", "latitude": 9.05, "longitude": 38.78},
]


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


def _haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    from math import asin, cos, radians, sin, sqrt

    r = 6371  # km
    d_lat = radians(lat2 - lat1)
    d_lon = radians(lon2 - lon1)
    a = sin(d_lat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(d_lon / 2) ** 2
    c = 2 * asin(sqrt(a))
    return r * c


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
    ai_response = ai.classify_incident(f"{incident_in.title} {incident_in.description}")
    incident = Incident(
        title=incident_in.title,
        description=incident_in.description,
        incident_type=incident_in.incident_type or ai_response.incident_type,
        priority=incident_in.priority,
        latitude=incident_in.latitude,
        longitude=incident_in.longitude,
        severity_score=ai_response.severity_score,
        incident_type_confidence=ai_response.confidence,
        ai_metadata={
            "summary": ai_response.summary,
            "matched_keywords": ai_response.matched_keywords,
        },
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
    reclassify: bool = Query(False, description="Re-run AI classification after update"),
):
    incident = db.get(Incident, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found.")

    data = incident_in.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(incident, field, value)
        if field == "incident_type" and value:
            incident.incident_type_confidence = None
            incident.ai_metadata = (incident.ai_metadata or {}) | {
                "manual_override": True,
                "override_actor": current_user.id,
            }

    if reclassify:
        ai_response = ai.classify_incident(f"{incident.title} {incident.description}")
        incident.incident_type = ai_response.incident_type
        incident.severity_score = ai_response.severity_score
        incident.incident_type_confidence = ai_response.confidence
        incident.ai_metadata = {
            "summary": ai_response.summary,
            "matched_keywords": ai_response.matched_keywords,
            "automatic_reclassification": True,
        }
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


@router.get(
    "/analytics/overview",
    dependencies=[
        Depends(require_roles("police", "fire", "medical", "military", "admin", "super_admin"))
    ],
)
def incident_overview(db: SessionDep):
    return {
        "by_status": dict(
            db.query(Incident.status, func.count(Incident.id)).group_by(Incident.status).all()
        ),
        "by_priority": dict(
            db.query(Incident.priority, func.count(Incident.id)).group_by(Incident.priority).all()
        ),
        "by_type": dict(
            db.query(Incident.incident_type, func.count(Incident.id))
            .group_by(Incident.incident_type)
            .all()
        ),
        "average_severity": db.query(func.avg(Incident.severity_score)).scalar() or 0,
    }


@router.get(
    "/analytics/clusters",
    dependencies=[
        Depends(require_roles("police", "fire", "medical", "military", "admin", "super_admin"))
    ],
)
def incident_clusters(db: SessionDep):
    rows = (
        db.query(
            func.round(Incident.latitude, 2).label("lat"),
            func.round(Incident.longitude, 2).label("lng"),
            func.count(Incident.id).label("count"),
        )
        .filter(Incident.latitude.isnot(None), Incident.longitude.isnot(None))
        .group_by(func.round(Incident.latitude, 2), func.round(Incident.longitude, 2))
        .having(func.count(Incident.id) >= 1)
        .all()
    )
    return [
        {"latitude": row.lat, "longitude": row.lng, "count": row.count}
        for row in rows
        if row.lat is not None and row.lng is not None
    ]


@router.get(
    "/recommendations/nearest-responders",
    dependencies=[
        Depends(require_roles("police", "fire", "medical", "military", "admin", "super_admin"))
    ],
)
def nearest_responders(latitude: float, longitude: float, limit: int = 3):
    responders = sorted(
        RESPONDER_DIRECTORY,
        key=lambda responder: _haversine_distance(
            latitude, longitude, responder["latitude"], responder["longitude"]
        ),
    )
    return responders[:limit]
