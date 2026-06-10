"""TDD tests for condition_codes.py — written FIRST (Slice A)."""

import pytest

from app.services.condition_codes import (
    ConditionCodeError,
    map_owm_code_to_family,
)


def test_clear_sky_800_maps_to_clear():
    assert map_owm_code_to_family(800) == "clear"


def test_rain_500_maps_to_rain():
    assert map_owm_code_to_family(500) == "rain"


def test_thunderstorm_200_maps_to_thunderstorm():
    assert map_owm_code_to_family(200) == "thunderstorm"


def test_snow_600_maps_to_snow():
    assert map_owm_code_to_family(600) == "snow"


def test_fog_741_maps_to_fog():
    assert map_owm_code_to_family(741) == "fog"


def test_unknown_code_raises():
    with pytest.raises(ConditionCodeError, match="unknown"):
        map_owm_code_to_family(9999)
