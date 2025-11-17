from __future__ import annotations

import json
import logging
from typing import Any

import requests

from app.core.config import settings

logger = logging.getLogger(__name__)


class ExternalAIError(Exception):
    """Raised when the external AI provider fails."""


def _heuristic_analysis(text: str) -> dict[str, Any]:
    keywords = {
        "fire": ["fire", "smoke", "flame", "burning", "explosion"],
        "medical": ["injury", "medical", "ambulance", "patient", "unconscious"],
        "police": ["crime", "robbery", "assault", "theft", "shooting"],
        "military": ["bomb", "military", "terror", "threat", "explosive"],
        "hazard": ["flood", "hazard", "collapse", "earthquake"],
    }
    lower = text.lower()
    matched = []
    label = "unknown"
    for candidate, words in keywords.items():
        hits = [word for word in words if word in lower]
        if hits and len(hits) > len(matched):
            label = candidate
            matched = hits
    severity = min(10, 3 + len(matched) * 2)
    if "bomb" in matched or "explosion" in matched:
        severity = 9
    confidence = 0.2 if label == "unknown" else min(0.95, 0.3 + len(matched) * 0.15)
    return {
        "incident_type": label,
        "severity_score": max(1, severity),
        "confidence": round(confidence, 2),
        "summary": (
            f"Detected {label} with {len(matched)} keyword hits." if matched else "Unknown pattern."
        ),
        "matched_keywords": matched,
    }


class AIClient:
    def classify(self, text: str) -> dict[str, Any]:
        if settings.ai_provider == "external" and settings.ai_endpoint:
            try:
                response = requests.post(
                    settings.ai_endpoint,
                    headers={
                        "Content-Type": "application/json",
                        **({"Authorization": f"Bearer {settings.ai_api_key}"} if settings.ai_api_key else {}),
                    },
                    json={"text": text},
                    timeout=10,
                )
                response.raise_for_status()
                payload = response.json()
                return {
                    "incident_type": payload.get("incident_type", "unknown"),
                    "severity_score": payload.get("severity_score", 5),
                    "confidence": payload.get("confidence", 0.5),
                    "summary": payload.get("summary", "External provider result"),
                    "matched_keywords": payload.get("matched_keywords", []),
                }
            except Exception as exc:  # pragma: no cover - fallback path
                logger.warning("External AI request failed: %s", exc)
        return _heuristic_analysis(text)


class EmailAdapter:
    def send(self, recipient: str, subject: str, body: str) -> None:
        if not settings.notification_email_enabled:
            return
        logger.info(
            "Email notification → %s\nSubject: %s\nBody: %s",
            recipient,
            subject,
            body,
        )


class SMSAdapter:
    def send(self, phone: str, message: str) -> None:
        if not settings.notification_sms_enabled:
            return
        logger.info("SMS notification → %s\nMessage: %s", phone, message)
