"""TDD tests for OWM → OM fallback — RED first (Slice B)."""

from __future__ import annotations

import asyncio
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, patch

import httpx
import pytest

from app.models.forecast_cache import ForecastCache
from app.services.gate import validate_snapshot
from app.services.weather_service import WeatherService
from tests.fixtures.owm_responses import (
    HYDERABAD_CURRENT,
    HYDERABAD_FORECAST,
    HYDERABAD_GEOCODE,
    OPEN_METEO_RESPONSE,
)


@pytest.fixture
def weather_service(db_session, http_client):
    return WeatherService(db=db_session, http_client=http_client, api_key="test-key")


def test_owm_transient_failure_falls_back_to_open_meteo(weather_service, db_session):
    owm = weather_service._owm
    om = weather_service._om

    owm.geocode = AsyncMock(return_value=HYDERABAD_GEOCODE[0])
    owm.fetch_current = AsyncMock(
        side_effect=httpx.HTTPStatusError(
            "503",
            request=httpx.Request("GET", "http://owm"),
            response=httpx.Response(503, request=httpx.Request("GET", "http://owm")),
        )
    )
    owm.fetch_forecast = AsyncMock(return_value=HYDERABAD_FORECAST)
    om.fetch = AsyncMock(return_value=OPEN_METEO_RESPONSE)

    envelope = asyncio.run(weather_service.get_bundle("Hyderabad"))

    assert validate_snapshot(envelope["snapshot"]) is True
    assert envelope["meta"]["provider"] == "open_meteo"
    om.fetch.assert_awaited_once()
    owm.fetch_current.assert_awaited()


def test_weather_force_fail_env_triggers_open_meteo_fallback(
    weather_service, db_session, monkeypatch
):
    monkeypatch.setenv("WEATHER_FORCE_FAIL", "1")
    owm = weather_service._owm
    om = weather_service._om

    owm.geocode = AsyncMock(return_value=HYDERABAD_GEOCODE[0])
    owm.fetch_current = AsyncMock()
    owm.fetch_forecast = AsyncMock()
    om.fetch = AsyncMock(return_value=OPEN_METEO_RESPONSE)

    envelope = asyncio.run(weather_service.get_bundle("Hyderabad"))

    assert validate_snapshot(envelope["snapshot"]) is True
    assert envelope["meta"]["data_source"] == "live"
    om.fetch.assert_awaited_once()
    owm.fetch_current.assert_not_awaited()
    owm.fetch_forecast.assert_not_awaited()


def test_stale_cache_served_when_providers_fail(weather_service, db_session):
    stale_bundle = {
        "city": "Hyderabad",
        "country": "IN",
        "lat": 17.385,
        "lon": 78.4867,
        "fetched_at": "2026-06-08T10:00:00Z",
        "current": {
            "temp_c": 30.0,
            "feels_like_c": 33.0,
            "humidity_pct": 60,
            "wind_speed_mps": 2.0,
            "condition_code": 800,
            "condition_family": "clear",
            "rain_prob": 0.05,
        },
        "hours_strip": [
            {
                "offset_hours": h * 3,
                "temp_c": 30.0,
                "rain_prob": 0.05,
                "condition_code": 800,
                "condition_family": "clear",
            }
            for h in range(8)
        ],
    }
    expired_at = datetime.now(timezone.utc) - timedelta(minutes=60)
    db_session.add(
        ForecastCache(
            city_query="hyderabad",
            bundle_json=stale_bundle,
            cached_at=expired_at,
        )
    )
    db_session.commit()

    owm = weather_service._owm
    om = weather_service._om
    owm.geocode = AsyncMock(return_value=HYDERABAD_GEOCODE[0])
    owm.fetch_current = AsyncMock(
        side_effect=httpx.HTTPStatusError(
            "503",
            request=httpx.Request("GET", "http://owm"),
            response=httpx.Response(503, request=httpx.Request("GET", "http://owm")),
        )
    )
    owm.fetch_forecast = AsyncMock(
        side_effect=httpx.HTTPStatusError(
            "503",
            request=httpx.Request("GET", "http://owm"),
            response=httpx.Response(503, request=httpx.Request("GET", "http://owm")),
        )
    )
    om.fetch = AsyncMock(
        side_effect=httpx.HTTPStatusError(
            "503",
            request=httpx.Request("GET", "http://om"),
            response=httpx.Response(503, request=httpx.Request("GET", "http://om")),
        )
    )

    envelope = asyncio.run(weather_service.get_bundle("Hyderabad"))

    assert envelope["snapshot"]["city"] == "Hyderabad"
    assert envelope["snapshot"]["current"]["temp_c"] == 30.0
    assert envelope["meta"]["data_source"] == "stale_fallback"
    assert envelope["meta"]["stale_fallback"] is True
    assert envelope["presentation"]["provenance_tone"] == "stale"
