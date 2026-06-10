"""Snapshot gate — validates weather bundle snapshot fields (Slice A)."""

from __future__ import annotations

HOURS_STRIP_LENGTH = 8

SNAPSHOT_REQUIRED_FIELDS = ("city", "country", "lat", "lon", "fetched_at", "current", "hours_strip")

CURRENT_REQUIRED_FIELDS = (
    "temp_c",
    "feels_like_c",
    "humidity_pct",
    "wind_speed_mps",
    "condition_code",
    "condition_family",
    "rain_prob",
)

HOURS_STRIP_SLOT_FIELDS = (
    "offset_hours",
    "temp_c",
    "rain_prob",
    "condition_code",
    "condition_family",
)


class GateValidationError(ValueError):
    """Raised when a snapshot fails gate validation."""


def _validate_rain_prob(value: float, *, field: str) -> None:
    if not isinstance(value, (int, float)):
        raise GateValidationError(f"{field} must be numeric")
    if value < 0 or value > 1:
        raise GateValidationError(f"{field} must be in [0, 1], got {value}")


def validate_snapshot(snapshot: dict) -> bool:
    if not isinstance(snapshot, dict):
        raise GateValidationError("snapshot must be a dict")

    for field in SNAPSHOT_REQUIRED_FIELDS:
        if field not in snapshot:
            raise GateValidationError(f"missing required field: {field}")

    current = snapshot["current"]
    if not isinstance(current, dict):
        raise GateValidationError("current must be a dict")

    for field in CURRENT_REQUIRED_FIELDS:
        if field not in current:
            raise GateValidationError(f"missing required field: {field}")

    _validate_rain_prob(current["rain_prob"], field="current.rain_prob")

    hours_strip = snapshot["hours_strip"]
    if not isinstance(hours_strip, list):
        raise GateValidationError("hours_strip must be a list")

    if len(hours_strip) != HOURS_STRIP_LENGTH:
        raise GateValidationError(
            f"hours_strip must have {HOURS_STRIP_LENGTH} slots, got {len(hours_strip)}"
        )

    for idx, slot in enumerate(hours_strip):
        if not isinstance(slot, dict):
            raise GateValidationError(f"hours_strip[{idx}] must be a dict")
        for field in HOURS_STRIP_SLOT_FIELDS:
            if field not in slot:
                raise GateValidationError(f"missing required field: {field}")
        _validate_rain_prob(slot["rain_prob"], field=f"hours_strip[{idx}].rain_prob")

    if "air_quality" in snapshot:
        _validate_air_quality(snapshot["air_quality"])

    return True


def _validate_air_quality(air_quality: dict) -> None:
    if not isinstance(air_quality, dict):
        raise GateValidationError("air_quality must be a dict")

    for field in ("aqi", "category", "pm2_5"):
        if field not in air_quality:
            raise GateValidationError(f"missing required field: air_quality.{field}")

    aqi = air_quality["aqi"]
    if not isinstance(aqi, int) or aqi < 1 or aqi > 5:
        raise GateValidationError(f"air_quality.aqi must be in [1, 5], got {aqi}")

    pm2_5 = air_quality["pm2_5"]
    if not isinstance(pm2_5, (int, float)) or pm2_5 < 0:
        raise GateValidationError(f"air_quality.pm2_5 must be >= 0, got {pm2_5}")
