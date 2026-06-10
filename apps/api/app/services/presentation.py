"""Presentation layer for weather bundle envelope (Slice C)."""

from __future__ import annotations

from datetime import datetime, timezone

from app.services.advisory import build_advisories
from app.services.today_brief import build_today_brief

FAMILY_TO_AMBIENT: dict[str, str] = {
    "clear": "clear",
    "clouds": "cloud",
    "rain": "rain",
    "drizzle": "rain",
    "thunderstorm": "storm",
    "snow": "snow",
    "fog": "fog",
    "atmosphere": "atmosphere",
}

PROVIDER_BADGES: dict[str, str] = {
    "openweather": "OpenWeather",
    "open_meteo": "Open-Meteo",
}

PROVENANCE_TONES: dict[str, str] = {
    "live": "live",
    "cache": "cache",
    "stale_fallback": "stale",
}


def _temp_band(temp_c: float) -> str:
    if temp_c < 20:
        return "mild"
    if temp_c <= 30:
        return "warm"
    return "hot"


def _format_age_minutes(cached_at: str) -> str:
    try:
        cached_dt = datetime.fromisoformat(cached_at.replace("Z", "+00:00"))
        if cached_dt.tzinfo is None:
            cached_dt = cached_dt.replace(tzinfo=timezone.utc)
        now = datetime.now(timezone.utc)
        minutes = max(0, int((now - cached_dt).total_seconds() // 60))
        if minutes < 1:
            return "just now"
        if minutes == 1:
            return "1m ago"
        return f"{minutes}m ago"
    except (TypeError, ValueError):
        return "recently"


def _provenance_label(data_source: str, cached_at: str) -> str:
    if data_source == "live":
        return "Live · just now"
    if data_source == "cache":
        return f"Cached · {_format_age_minutes(cached_at)}"
    return "Stale · fallback data"


def build(snapshot: dict, meta: dict) -> dict:
    """Build presentation object from snapshot and meta."""
    current = snapshot["current"]
    family = current.get("condition_family", "clear")
    data_source = meta["data_source"]
    provider = meta["provider"]

    return {
        "ambient_theme": FAMILY_TO_AMBIENT.get(family, "clear"),
        "temp_band": _temp_band(float(current["temp_c"])),
        "source_badge": PROVIDER_BADGES.get(provider, "OpenWeather"),
        "advisories": build_advisories(snapshot),
        "provenance_label": _provenance_label(data_source, meta.get("cached_at", snapshot["fetched_at"])),
        "provenance_pulse": data_source == "live",
        "provenance_tone": PROVENANCE_TONES.get(data_source, "live"),
        "today_brief": build_today_brief(snapshot),
    }
