"""TDD tests for advisory.py — RED first (Slice C)."""

from __future__ import annotations

from app.services.advisory import build_advisories

ADVISORY_FIELDS = ("text", "severity", "icon")


def _snapshot(
    *,
    rain_prob: float = 0.05,
    temp_c: float = 25.0,
    wind_speed_mps: float = 3.0,
) -> dict:
    return {
        "city": "Hyderabad",
        "country": "IN",
        "lat": 17.385,
        "lon": 78.4867,
        "fetched_at": "2026-06-08T12:00:00Z",
        "current": {
            "temp_c": temp_c,
            "feels_like_c": temp_c + 2,
            "humidity_pct": 55,
            "wind_speed_mps": wind_speed_mps,
            "condition_code": 800,
            "condition_family": "clear",
            "rain_prob": rain_prob,
        },
        "hours_strip": [
            {
                "offset_hours": h * 3,
                "temp_c": temp_c,
                "rain_prob": rain_prob,
                "condition_code": 800,
                "condition_family": "clear",
            }
            for h in range(8)
        ],
    }


def _find_by_icon(advisories: list[dict], icon: str) -> dict | None:
    return next((a for a in advisories if a["icon"] == icon), None)


def test_no_advisories_for_calm_conditions():
    advisories = build_advisories(_snapshot())
    assert advisories == []


def test_rain_info_at_moderate_probability():
    advisories = build_advisories(_snapshot(rain_prob=0.35))
    rain = _find_by_icon(advisories, "rain")
    assert rain is not None
    assert rain["severity"] == "info"
    for field in ADVISORY_FIELDS:
        assert field in rain


def test_rain_warn_at_high_probability():
    advisories = build_advisories(_snapshot(rain_prob=0.65))
    rain = _find_by_icon(advisories, "rain")
    assert rain is not None
    assert rain["severity"] == "warn"


def test_rain_danger_at_very_high_probability():
    advisories = build_advisories(_snapshot(rain_prob=0.85))
    rain = _find_by_icon(advisories, "rain")
    assert rain is not None
    assert rain["severity"] == "danger"


def test_heat_warn_at_high_temperature():
    advisories = build_advisories(_snapshot(temp_c=38.0))
    heat = _find_by_icon(advisories, "heat")
    assert heat is not None
    assert heat["severity"] == "warn"


def test_heat_danger_at_extreme_temperature():
    advisories = build_advisories(_snapshot(temp_c=43.0))
    heat = _find_by_icon(advisories, "heat")
    assert heat is not None
    assert heat["severity"] == "danger"


def test_wind_warn_at_strong_wind():
    advisories = build_advisories(_snapshot(wind_speed_mps=12.0))
    wind = _find_by_icon(advisories, "wind")
    assert wind is not None
    assert wind["severity"] == "warn"


def test_multiple_advisories_can_coexist():
    advisories = build_advisories(
        _snapshot(rain_prob=0.7, temp_c=40.0, wind_speed_mps=14.0)
    )
    icons = {a["icon"] for a in advisories}
    assert "rain" in icons
    assert "heat" in icons
    assert "wind" in icons
