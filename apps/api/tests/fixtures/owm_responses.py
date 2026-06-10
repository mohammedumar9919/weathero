"""Mock OpenWeatherMap API responses for tests."""

from __future__ import annotations

HYDERABAD_GEOCODE = [
    {
        "name": "Hyderabad",
        "lat": 17.385,
        "lon": 78.4867,
        "country": "IN",
        "state": "Telangana",
    }
]

HYDERABAD_CURRENT = {
    "main": {"temp": 32.0, "feels_like": 35.0, "humidity": 65},
    "wind": {"speed": 3.5},
    "weather": [{"id": 800, "main": "Clear", "description": "clear sky"}],
    "dt": 1717851600,
}


def _forecast_item(dt: int, temp: float, pop: float, code: int) -> dict:
    return {
        "dt": dt,
        "main": {"temp": temp},
        "pop": pop,
        "weather": [{"id": code, "main": "Clear"}],
    }


# 8 items at 3h intervals starting from base dt
_BASE_DT = 1717851600
HYDERABAD_FORECAST = {
    "list": [
        _forecast_item(_BASE_DT + i * 10800, 32.0 + i, 0.1 + i * 0.05, 800 if i < 4 else 500)
        for i in range(8)
    ]
}

OPEN_METEO_RESPONSE = {
    "latitude": 17.385,
    "longitude": 78.4867,
    "current": {
        "temperature_2m": 31.5,
        "apparent_temperature": 34.0,
        "relative_humidity_2m": 70,
        "wind_speed_10m": 4.0,
        "weather_code": 0,
    },
    "hourly": {
        "time": [f"2026-06-08T{h:02d}:00" for h in range(0, 24, 3)],
        "temperature_2m": [30.0 + i for i in range(8)],
        "precipitation_probability": [10 + i * 5 for i in range(8)],
        "weather_code": [0, 1, 2, 3, 61, 61, 80, 0],
    },
}
