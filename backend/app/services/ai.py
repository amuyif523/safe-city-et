from __future__ import annotations

from dataclasses import dataclass

KEYWORD_MAP = {
    "fire": ["fire", "smoke", "flame", "burning", "explosion"],
    "medical": ["injury", "medical", "ambulance", "patient", "unconscious"],
    "police": ["crime", "robbery", "assault", "theft", "shooting"],
    "military": ["bomb", "military", "terror", "threat", "explosive"],
    "hazard": ["flood", "hazard", "collapse", "earthquake"],
}


@dataclass
class IncidentAIResponse:
    incident_type: str
    severity_score: int
    confidence: float
    matched_keywords: list[str]
    summary: str


def classify_incident(text: str) -> IncidentAIResponse:
    lower_text = text.lower()
    incident_type = "unknown"
    matched_keywords: list[str] = []
    for label, keywords in KEYWORD_MAP.items():
        matches = [keyword for keyword in keywords if keyword in lower_text]
        if matches and len(matches) > len(matched_keywords):
            incident_type = label
            matched_keywords = matches

    severity = min(10, 3 + len(matched_keywords) * 2)
    if "explosion" in matched_keywords or "bomb" in matched_keywords:
        severity = 9
    confidence = min(0.95, 0.3 + len(matched_keywords) * 0.15)
    if incident_type == "unknown":
        confidence = 0.2

    summary = (
        f"Detected {incident_type} pattern with {len(matched_keywords)} keyword hits."
        if matched_keywords
        else "Insufficient signals; classify as unknown."
    )

    return IncidentAIResponse(
        incident_type=incident_type,
        severity_score=max(1, severity),
        confidence=round(confidence, 2),
        matched_keywords=matched_keywords,
        summary=summary,
    )
