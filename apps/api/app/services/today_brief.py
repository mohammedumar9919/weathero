"""Rule-based today_brief templates — no LLM (Slice V3, S-A03)."""

from __future__ import annotations

AQI_ADVISORY: dict[int, str] = {
    1: "good air quality",
    2: "fair air quality",
    3: "moderate air quality — limit outdoor exertion if sensitive",
    4: "poor air quality — limit outdoor exertion",
    5: "very poor air quality — avoid prolonged outdoor exertion",
}


def _temp_phrase(temp_c: float) -> str:
    if temp_c < 20:
        return "Cool day"
    if temp_c <= 30:
        return "Warm afternoon"
    return "Hot day"


def _weather_phrase(condition_family: str, rain_prob: float) -> str:
    if condition_family == "thunderstorm":
        return "with storms possible"
    if condition_family in ("rain", "drizzle") or rain_prob >= 0.5:
        return "with rain likely"
    if condition_family == "clear":
        return "with clear skies"
    if condition_family == "fog":
        return "with foggy conditions"
    if condition_family == "snow":
        return "with snow conditions"
    return f"with {condition_family} conditions"


def build_today_brief(snapshot: dict) -> str:
    """Build a human-readable brief from snapshot fields (pure rules, no network)."""
    current = snapshot["current"]
    temp_c = float(current["temp_c"])
    rain_prob = float(current["rain_prob"])
    family = str(current.get("condition_family", "clear"))

    air_quality = snapshot.get("air_quality")
    if isinstance(air_quality, dict) and "aqi" in air_quality:
        aqi = int(air_quality["aqi"])
        advisory = AQI_ADVISORY.get(aqi)
        if advisory:
            return f"{_temp_phrase(temp_c)} with {advisory}."

    weather = _weather_phrase(family, rain_prob)
    return f"{_temp_phrase(temp_c)} {weather}."
