"""OpenWeatherMap condition code → condition_family mapping (Slice A)."""

from __future__ import annotations

# OWM condition code ranges → condition_family
# https://openweathermap.org/weather-conditions
_CODE_RANGES: list[tuple[int, int, str]] = [
    (200, 232, "thunderstorm"),
    (300, 321, "drizzle"),
    (500, 531, "rain"),
    (600, 622, "snow"),
    (701, 741, "atmosphere"),  # mist, smoke, haze, fog (741)
    (751, 781, "atmosphere"),
    (800, 800, "clear"),
    (801, 804, "clouds"),
]

# Explicit overrides for clarity in tests and fog handling
_EXPLICIT_CODES: dict[int, str] = {
    741: "fog",
}


class ConditionCodeError(ValueError):
    """Raised when an OWM code cannot be mapped."""


def map_owm_code_to_family(code: int) -> str:
    if code in _EXPLICIT_CODES:
        return _EXPLICIT_CODES[code]

    for low, high, family in _CODE_RANGES:
        if low <= code <= high:
            return family

    raise ConditionCodeError(f"unknown OWM condition code: {code}")
