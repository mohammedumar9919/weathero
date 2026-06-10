"""TDD tests for normalize.py — RED first (Slice B)."""

import pytest

from app.services.gate import validate_snapshot
from app.services.normalize import normalize_om, normalize_owm
from tests.fixtures.owm_responses import (
    HYDERABAD_CURRENT,
    HYDERABAD_FORECAST,
    HYDERABAD_GEOCODE,
    OPEN_METEO_RESPONSE,
)

EXPECTED_OFFSETS = [0, 3, 6, 9, 12, 15, 18, 21]


def test_owm_normalize_produces_required_top_level_fields():
    bundle = normalize_owm(HYDERABAD_GEOCODE[0], HYDERABAD_CURRENT, HYDERABAD_FORECAST)
    for field in ("city", "country", "lat", "lon", "fetched_at", "current", "hours_strip"):
        assert field in bundle


def test_owm_normalize_hours_strip_has_eight_slots():
    bundle = normalize_owm(HYDERABAD_GEOCODE[0], HYDERABAD_CURRENT, HYDERABAD_FORECAST)
    assert len(bundle["hours_strip"]) == 8


def test_owm_normalize_hours_strip_offsets_are_three_hour_intervals():
    bundle = normalize_owm(HYDERABAD_GEOCODE[0], HYDERABAD_CURRENT, HYDERABAD_FORECAST)
    offsets = [slot["offset_hours"] for slot in bundle["hours_strip"]]
    assert offsets == EXPECTED_OFFSETS


def test_owm_normalize_rain_prob_within_zero_one():
    bundle = normalize_owm(HYDERABAD_GEOCODE[0], HYDERABAD_CURRENT, HYDERABAD_FORECAST)
    assert 0 <= bundle["current"]["rain_prob"] <= 1
    for slot in bundle["hours_strip"]:
        assert 0 <= slot["rain_prob"] <= 1


def test_owm_normalize_clear_code_maps_to_clear_family():
    bundle = normalize_owm(HYDERABAD_GEOCODE[0], HYDERABAD_CURRENT, HYDERABAD_FORECAST)
    assert bundle["current"]["condition_family"] == "clear"
    assert bundle["hours_strip"][0]["condition_family"] == "clear"


def test_owm_normalize_fog_code_maps_to_fog_family():
    current = {**HYDERABAD_CURRENT, "weather": [{"id": 741, "main": "Fog"}]}
    bundle = normalize_owm(HYDERABAD_GEOCODE[0], current, HYDERABAD_FORECAST)
    assert bundle["current"]["condition_family"] == "fog"


def test_om_normalize_produces_valid_bundle_shape():
    bundle = normalize_om(
        lat=17.385,
        lon=78.4867,
        om_data=OPEN_METEO_RESPONSE,
        city="Hyderabad",
        country="IN",
    )
    assert bundle["city"] == "Hyderabad"
    assert len(bundle["hours_strip"]) == 8


def test_owm_normalize_passes_gate_validation():
    bundle = normalize_owm(HYDERABAD_GEOCODE[0], HYDERABAD_CURRENT, HYDERABAD_FORECAST)
    assert validate_snapshot(bundle) is True
