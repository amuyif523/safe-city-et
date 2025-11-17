from __future__ import annotations

from dataclasses import dataclass

KEYWORD_MAP = {
    "fire": ["fire", "smoke", "flame"],
    "medical": ["injury", "medical", "ambulance", "patient"],
    "police": ["crime", "robbery", "assault", "theft"],
    "military": ["bomb", "military", "terror"],
}


@dataclass
class IncidentAIResponse:
    incident_type: str
    severity_score: int


def classify_incident(text: str) -> IncidentAIResponse:
    lower_text = text.lower()
    incident_type = "unknown"
    severity = 3
    for label, keywords in KEYWORD_MAP.items():
        if any(keyword in lower_text for keyword in keywords):
            incident_type = label
            severity = min(10, 5 + len(keywords))
            break
    return IncidentAIResponse(incident_type=incident_type, severity_score=severity)
