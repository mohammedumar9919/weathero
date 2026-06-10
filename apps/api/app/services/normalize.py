"""Normalize provider payloads to WeatherBundle v1.2.0."""

from __future__ import annotations

from datetime import datetime, timezone

from app.services.condition_codes import map_owm_code_to_family
from app.services.gate import HOURS_STRIP_LENGTH

HOURS_STRIP_OFFSETS = [0, 3, 6, 9, 12, 15, 18, 21]

# WMO weather codes → approximate OWM codes for family mapping
_WMO_TO_OWM: dict[int, int] = {
    0: 800,
    1: 801,
    2: 802,
    3: 803,
    45: 741,
    48: 741,
    51: 300,
    53: 301,
    55: 302,
    61: 500,
    63: 501,
    65: 502,
    80: 520,
    81: 521,
    82: 522,
    95: 200,
    96: 200,
    99: 200,
}


def _clamp_prob(value: float) -> float:
    return max(0.0, min(1.0, float(value)))


def _owm_code_from_weather(weather: list[dict]) -> int:
    if not weather:
        return 800
    return int(weather[0]["id"])


def _build_hours_strip_from_owm(forecast_list: list[dict]) -> list[dict]:
    slots: list[dict] = []
    for i in range(HOURS_STRIP_LENGTH):
        item = forecast_list[i] if i < len(forecast_list) else forecast_list[-1]
        code = _owm_code_from_weather(item.get("weather", []))
        pop = _clamp_prob(item.get("pop", 0.0))
        slots.append(
            {
                "offset_hours": HOURS_STRIP_OFFSETS[i],
                "temp_c": float(item["main"]["temp"]),
                "rain_prob": pop,
                "condition_code": code,
                "condition_family": map_owm_code_to_family(code),
            }
        )
    return slots


def normalize_owm(geocode: dict, current: dict, forecast: dict) -> dict:
    """Map OWM geocode + current + forecast to WeatherBundle v1.2.0."""
    forecast_list = forecast.get("list", [])
    current_code = _owm_code_from_weather(current.get("weather", []))
    current_rain = _clamp_prob(forecast_list[0].get("pop", 0.0)) if forecast_list else 0.0

    return {
        "city": geocode["name"],
        "country": geocode["country"],
        "lat": float(geocode["lat"]),
        "lon": float(geocode["lon"]),
        "fetched_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "current": {
            "temp_c": float(current["main"]["temp"]),
            "feels_like_c": float(current["main"]["feels_like"]),
            "humidity_pct": int(current["main"]["humidity"]),
            "wind_speed_mps": float(current["wind"]["speed"]),
            "condition_code": current_code,
            "condition_family": map_owm_code_to_family(current_code),
            "rain_prob": current_rain,
        },
        "hours_strip": _build_hours_strip_from_owm(forecast_list),
    }


def _wmo_to_owm_code(wmo_code: int) -> int:
    return _WMO_TO_OWM.get(wmo_code, 800)


def normalize_om(
    *,
    lat: float,
    lon: float,
    om_data: dict,
    city: str,
    country: str,
) -> dict:
    """Map Open-Meteo response to WeatherBundle v1.2.0."""
    current = om_data["current"]
    hourly = om_data["hourly"]
    current_wmo = int(current.get("weather_code", 0))
    current_code = _wmo_to_owm_code(current_wmo)

    hours_strip: list[dict] = []
    for i in range(HOURS_STRIP_LENGTH):
        wmo = int(hourly["weather_code"][i])
        code = _wmo_to_owm_code(wmo)
        rain_pct = hourly.get("precipitation_probability", [0] * HOURS_STRIP_LENGTH)[i]
        hours_strip.append(
            {
                "offset_hours": HOURS_STRIP_OFFSETS[i],
                "temp_c": float(hourly["temperature_2m"][i]),
                "rain_prob": _clamp_prob(rain_pct / 100.0),
                "condition_code": code,
                "condition_family": map_owm_code_to_family(code),
            }
        )

    current_rain = hours_strip[0]["rain_prob"] if hours_strip else 0.0

    return {
        "city": city,
        "country": country,
        "lat": lat,
        "lon": lon,
        "fetched_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "current": {
            "temp_c": float(current["temperature_2m"]),
            "feels_like_c": float(current.get("apparent_temperature", current["temperature_2m"])),
            "humidity_pct": int(current.get("relative_humidity_2m", 0)),
            "wind_speed_mps": float(current.get("wind_speed_10m", 0.0)),
            "condition_code": current_code,
            "condition_family": map_owm_code_to_family(current_code),
            "rain_prob": current_rain,
        },
        "hours_strip": hours_strip,
    }
