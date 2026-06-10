"""TDD tests for today_brief rule templates — RED first (Slice V3)."""

from unittest.mock import patch

from app.services.today_brief import build_today_brief


def _snapshot(
    *,
    temp_c: float = 28.0,
    rain_prob: float = 0.1,
    condition_family: str = "clear",
    aqi: int | None = None,
) -> dict:
    snap = {
        "city": "Hyderabad",
        "country": "IN",
        "lat": 17.385,
        "lon": 78.4867,
        "fetched_at": "2026-06-08T12:00:00Z",
        "current": {
            "temp_c": temp_c,
            "feels_like_c": temp_c + 2,
            "humidity_pct": 55,
            "wind_speed_mps": 3.0,
            "condition_code": 800,
            "condition_family": condition_family,
            "rain_prob": rain_prob,
        },
        "hours_strip": [
            {
                "offset_hours": h * 3,
                "temp_c": temp_c,
                "rain_prob": rain_prob,
                "condition_code": 800,
                "condition_family": condition_family,
            }
            for h in range(8)
        ],
    }
    if aqi is not None:
        snap["air_quality"] = {"aqi": aqi, "category": "Moderate", "pm2_5": 18.5}
    return snap


def test_build_today_brief_returns_non_empty_rule_string_without_network():
    with patch("httpx.AsyncClient.get") as mock_get:
        result = build_today_brief(_snapshot())

    assert isinstance(result, str)
    assert len(result.strip()) > 0
    mock_get.assert_not_called()


def test_today_brief_changes_with_aqi_band():
    good = build_today_brief(_snapshot(aqi=1))
    poor = build_today_brief(_snapshot(aqi=5))

    assert good != poor
    assert "air" in poor.lower() or "outdoor" in poor.lower()
