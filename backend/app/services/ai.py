from __future__ import annotations

from dataclasses import dataclass

from app.services.integrations import AIClient


ai_client = AIClient()


@dataclass
class IncidentAIResponse:
    incident_type: str
    severity_score: int
    confidence: float
    matched_keywords: list[str]
    summary: str


def classify_incident(text: str) -> IncidentAIResponse:
    payload = ai_client.classify(text)
    return IncidentAIResponse(
        incident_type=payload.get("incident_type", "unknown"),
        severity_score=int(payload.get("severity_score", 5)),
        confidence=float(payload.get("confidence", 0.5)),
        matched_keywords=list(payload.get("matched_keywords", [])),
        summary=payload.get("summary", "No summary."),
    )
