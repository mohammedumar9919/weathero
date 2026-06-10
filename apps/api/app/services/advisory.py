"""Rule-based weather advisories from snapshot (Slice C)."""

from __future__ import annotations

RAIN_INFO_THRESHOLD = 0.30
RAIN_WARN_THRESHOLD = 0.60
RAIN_DANGER_THRESHOLD = 0.80

HEAT_WARN_THRESHOLD = 38.0
HEAT_DANGER_THRESHOLD = 42.0

WIND_WARN_THRESHOLD = 10.0
WIND_DANGER_THRESHOLD = 15.0


def _rain_advisory(rain_prob: float) -> dict | None:
    if rain_prob >= RAIN_DANGER_THRESHOLD:
        return {
            "text": "Heavy rain likely — plan indoor activities",
            "severity": "danger",
            "icon": "rain",
        }
    if rain_prob >= RAIN_WARN_THRESHOLD:
        return {
            "text": "Rain expected — carry an umbrella",
            "severity": "warn",
            "icon": "rain",
        }
    if rain_prob >= RAIN_INFO_THRESHOLD:
        return {
            "text": "Chance of rain later",
            "severity": "info",
            "icon": "rain",
        }
    return None


def _heat_advisory(temp_c: float) -> dict | None:
    if temp_c >= HEAT_DANGER_THRESHOLD:
        return {
            "text": "Extreme heat — stay hydrated and avoid midday sun",
            "severity": "danger",
            "icon": "heat",
        }
    if temp_c >= HEAT_WARN_THRESHOLD:
        return {
            "text": "High temperature — drink water regularly",
            "severity": "warn",
            "icon": "heat",
        }
    return None


def _wind_advisory(wind_speed_mps: float) -> dict | None:
    if wind_speed_mps >= WIND_DANGER_THRESHOLD:
        return {
            "text": "Dangerous winds — secure loose items",
            "severity": "danger",
            "icon": "wind",
        }
    if wind_speed_mps >= WIND_WARN_THRESHOLD:
        return {
            "text": "Strong winds — take care outdoors",
            "severity": "warn",
            "icon": "wind",
        }
    return None


def build_advisories(snapshot: dict) -> list[dict]:
    """Return rule-based advisory chips for rain, heat, and wind."""
    current = snapshot["current"]
    advisories: list[dict] = []

    for builder in (
        lambda: _rain_advisory(float(current["rain_prob"])),
        lambda: _heat_advisory(float(current["temp_c"])),
        lambda: _wind_advisory(float(current["wind_speed_mps"])),
    ):
        advisory = builder()
        if advisory is not None:
            advisories.append(advisory)

    return advisories
