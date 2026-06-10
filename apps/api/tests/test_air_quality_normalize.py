"""TDD tests for air_quality normalization — RED first (Slice V3)."""

import pytest

from app.services.air_quality import normalize_air_quality
from app.services.gate import GateValidationError, validate_snapshot


def _valid_snapshot_with_air_quality(*, aqi: int = 3) -> dict:
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
                "temp_c": 30.0,
                "rain_prob": 0.1,
                "condition_code": 800,
                "condition_family": "clear",
            }
            for h in range(8)
        ],
        "air_quality": {
            "aqi": aqi,
            "category": "Moderate",
            "pm2_5": 18.5,
        },
    }


OWM_POLLUTION_RESPONSE = {
    "coord": [17.385, 78.4867],
    "list": [
        {
            "dt": 1606147200,
            "main": {"aqi": 3},
            "components": {
                "co": 203.609,
                "no": 0.0,
                "no2": 0.396,
                "o3": 75.102,
                "so2": 0.648,
                "pm2_5": 18.5,
                "pm10": 92.214,
                "nh3": 0.117,
            },
        }
    ],
}


def test_owm_pollution_json_normalizes_to_air_quality_block():
    result = normalize_air_quality(OWM_POLLUTION_RESPONSE)

    assert result == {
        "aqi": 3,
        "category": "Moderate",
        "pm2_5": 18.5,
    }


def test_gate_rejects_invalid_aqi_zero():
    snapshot = _valid_snapshot_with_air_quality(aqi=0)

    with pytest.raises(GateValidationError, match="aqi"):
        validate_snapshot(snapshot)
