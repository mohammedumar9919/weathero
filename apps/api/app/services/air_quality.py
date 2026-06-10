"""Normalize OWM Air Pollution API response to snapshot.air_quality block."""

from __future__ import annotations

AQI_CATEGORIES: dict[int, str] = {
    1: "Good",
    2: "Fair",
    3: "Moderate",
    4: "Poor",
    5: "Very Poor",
}


def normalize_air_quality(pollution_data: dict) -> dict:
    """Map OWM air pollution JSON to {aqi, category, pm2_5}."""
    entries = pollution_data.get("list")
    if not entries:
        raise ValueError("pollution response missing list")

    entry = entries[0]
    aqi = int(entry["main"]["aqi"])
    pm2_5 = float(entry["components"]["pm2_5"])

    return {
        "aqi": aqi,
        "category": AQI_CATEGORIES.get(aqi, "Unknown"),
        "pm2_5": pm2_5,
    }
