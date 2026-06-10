"""TDD tests for cache-aside 45m TTL — RED first (Slice B)."""

from __future__ import annotations

import asyncio
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock

import pytest

from app.models.forecast_cache import ForecastCache
from app.models.geocode_cache import GeocodeCache
from app.services.weather_service import WeatherService
from tests.fixtures.owm_responses import (
    HYDERABAD_CURRENT,
    HYDERABAD_FORECAST,
    HYDERABAD_GEOCODE,
)


@pytest.fixture
def weather_service(db_session, http_client):
    return WeatherService(db=db_session, http_client=http_client, api_key="test-key")


def test_cache_miss_fetches_from_providers(weather_service):
    owm = weather_service._owm
    owm.geocode = AsyncMock(return_value=HYDERABAD_GEOCODE[0])
    owm.fetch_current = AsyncMock(return_value=HYDERABAD_CURRENT)
    owm.fetch_forecast = AsyncMock(return_value=HYDERABAD_FORECAST)

    envelope = asyncio.run(weather_service.get_bundle("Hyderabad"))
    snapshot = envelope["snapshot"]

    assert snapshot["city"] == "Hyderabad"
    assert "presentation" in envelope
    assert "meta" in envelope
    owm.geocode.assert_awaited_once()
    owm.fetch_current.assert_awaited_once()
    owm.fetch_forecast.assert_awaited_once()


def test_cache_hit_within_ttl_skips_provider_calls(weather_service, db_session):
    fresh_bundle = {
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
                "temp_c": 32.0,
                "rain_prob": 0.1,
                "condition_code": 800,
                "condition_family": "clear",
            }
            for h in range(8)
        ],
    }
    fresh_at = datetime.now(timezone.utc) - timedelta(minutes=10)
    db_session.add(
        ForecastCache(
            city_query="hyderabad",
            bundle_json=fresh_bundle,
            cached_at=fresh_at,
        )
    )
    db_session.commit()

    owm = weather_service._owm
    owm.geocode = AsyncMock()
    owm.fetch_current = AsyncMock()
    owm.fetch_forecast = AsyncMock()

    envelope = asyncio.run(weather_service.get_bundle("Hyderabad"))

    assert envelope["snapshot"]["current"]["temp_c"] == 32.0
    assert envelope["meta"]["data_source"] == "cache"
    owm.geocode.assert_not_awaited()
    owm.fetch_current.assert_not_awaited()
    owm.fetch_forecast.assert_not_awaited()


def test_geocode_cache_hit_skips_geocode_api_call(weather_service, db_session):
    db_session.add(
        GeocodeCache(
            city_query="hyderabad",
            lat=17.385,
            lon=78.4867,
            country="IN",
            cached_at=datetime.now(timezone.utc),
        )
    )
    db_session.commit()

    owm = weather_service._owm
    owm.geocode = AsyncMock()
    owm.fetch_current = AsyncMock(return_value=HYDERABAD_CURRENT)
    owm.fetch_forecast = AsyncMock(return_value=HYDERABAD_FORECAST)

    asyncio.run(weather_service.get_bundle("Hyderabad"))

    owm.geocode.assert_not_awaited()
    owm.fetch_current.assert_awaited_once()
