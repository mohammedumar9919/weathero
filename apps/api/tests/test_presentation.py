"""TDD tests for presentation.py — RED first (Slice C)."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from app.services.presentation import build

PRESENTATION_FIELDS = (
    "ambient_theme",
    "temp_band",
    "source_badge",
    "advisories",
    "provenance_label",
    "provenance_pulse",
    "provenance_tone",
)


def _snapshot(
    *,
    condition_family: str = "clear",
    temp_c: float = 25.0,
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
            "wind_speed_mps": 3.0,
            "condition_code": 800,
            "condition_family": condition_family,
            "rain_prob": 0.05,
        },
        "hours_strip": [
            {
                "offset_hours": h * 3,
                "temp_c": temp_c,
                "rain_prob": 0.05,
                "condition_code": 800,
                "condition_family": condition_family,
            }
            for h in range(8)
        ],
    }


def _meta(
    *,
    data_source: str = "live",
    provider: str = "openweather",
    cached_at: str = "2026-06-08T12:00:00Z",
) -> dict:
    return {
        "data_source": data_source,
        "provider": provider,
        "cached_at": cached_at,
        "stale_fallback": data_source == "stale_fallback",
    }


def test_build_returns_required_presentation_fields():
    result = build(_snapshot(), _meta())

    for field in PRESENTATION_FIELDS:
        assert field in result


def test_ambient_theme_maps_condition_family():
    assert build(_snapshot(condition_family="clear"), _meta())["ambient_theme"] == "clear"
    assert build(_snapshot(condition_family="clouds"), _meta())["ambient_theme"] == "cloud"
    assert build(_snapshot(condition_family="rain"), _meta())["ambient_theme"] == "rain"
    assert build(_snapshot(condition_family="thunderstorm"), _meta())["ambient_theme"] == "storm"


def test_temp_band_from_current_temperature():
    assert build(_snapshot(temp_c=15.0), _meta())["temp_band"] == "mild"
    assert build(_snapshot(temp_c=25.0), _meta())["temp_band"] == "warm"
    assert build(_snapshot(temp_c=35.0), _meta())["temp_band"] == "hot"


def test_provenance_live_vs_cache_tone_and_pulse():
    live = build(_snapshot(), _meta(data_source="live"))
    assert live["provenance_tone"] == "live"
    assert live["provenance_pulse"] is True
    assert "Live" in live["provenance_label"]

    cached_at = (datetime.now(timezone.utc) - timedelta(minutes=12)).strftime("%Y-%m-%dT%H:%M:%SZ")
    cached = build(_snapshot(), _meta(data_source="cache", cached_at=cached_at))
    assert cached["provenance_tone"] == "cache"
    assert cached["provenance_pulse"] is False
    assert "Cached" in cached["provenance_label"]


def test_source_badge_reflects_provider():
    owm = build(_snapshot(), _meta(provider="openweather"))
    om = build(_snapshot(), _meta(provider="open_meteo"))

    assert owm["source_badge"] == "OpenWeather"
    assert om["source_badge"] == "Open-Meteo"
