"""TDD tests for gate.py — written FIRST (Slice A)."""

import pytest

from app.services.gate import GateValidationError, validate_snapshot


def _valid_snapshot() -> dict:
    return {
        "city": "Hyderabad",
        "country": "IN",
        "lat": 17.385,
        "lon": 78.4867,
        "fetched_at": "2026-06-08T12:00:00Z",
        "current": {
            "temp_c": 32.0,
            "feels_like_c": 35.0,
            "humidity_pct": 65,
            "wind_speed_mps": 3.5,
            "condition_code": 800,
            "condition_family": "clear",
            "rain_prob": 0.1,
        },
        "hours_strip": [
            {
                "offset_hours": h * 3,
                "temp_c": 30.0 + h,
                "rain_prob": 0.1 + h * 0.05,
                "condition_code": 800,
                "condition_family": "clear",
            }
            for h in range(8)
        ],
    }


def test_valid_snapshot_passes_gate():
    result = validate_snapshot(_valid_snapshot())
    assert result is True


def test_missing_required_snapshot_field_raises():
    snapshot = _valid_snapshot()
    del snapshot["city"]
    with pytest.raises(GateValidationError, match="city"):
        validate_snapshot(snapshot)


def test_rain_prob_above_one_raises():
    snapshot = _valid_snapshot()
    snapshot["current"]["rain_prob"] = 1.5
    with pytest.raises(GateValidationError, match="rain_prob"):
        validate_snapshot(snapshot)


def test_rain_prob_below_zero_raises():
    snapshot = _valid_snapshot()
    snapshot["current"]["rain_prob"] = -0.01
    with pytest.raises(GateValidationError, match="rain_prob"):
        validate_snapshot(snapshot)


def test_hours_strip_wrong_length_raises():
    snapshot = _valid_snapshot()
    snapshot["hours_strip"] = snapshot["hours_strip"][:6]
    with pytest.raises(GateValidationError, match="hours_strip"):
        validate_snapshot(snapshot)


def test_hours_strip_slot_missing_field_raises():
    snapshot = _valid_snapshot()
    del snapshot["hours_strip"][2]["condition_family"]
    with pytest.raises(GateValidationError, match="condition_family"):
        validate_snapshot(snapshot)
