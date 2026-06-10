"""OpenWeatherMap provider — geocode + current + forecast."""

from __future__ import annotations

import httpx

from app.services.retry import with_transient_retry

OWM_GEO_URL = "https://api.openweathermap.org/geo/1.0/direct"
OWM_CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather"
OWM_FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"
OWM_AIR_POLLUTION_URL = "https://api.openweathermap.org/data/2.5/air_pollution"


class OpenWeatherClient:
    def __init__(self, client: httpx.AsyncClient, api_key: str) -> None:
        self._client = client
        self._api_key = api_key

    async def geocode(self, city: str) -> dict:
        async def _call():
            response = await self._client.get(
                OWM_GEO_URL,
                params={"q": city, "limit": 1, "appid": self._api_key},
            )
            response.raise_for_status()
            results = response.json()
            if not results:
                raise ValueError(f"city not found: {city}")
            return results[0]

        return await with_transient_retry(_call)

    async def fetch_current(self, lat: float, lon: float) -> dict:
        async def _call():
            response = await self._client.get(
                OWM_CURRENT_URL,
                params={"lat": lat, "lon": lon, "units": "metric", "appid": self._api_key},
            )
            response.raise_for_status()
            return response.json()

        return await with_transient_retry(_call)

    async def fetch_forecast(self, lat: float, lon: float) -> dict:
        async def _call():
            response = await self._client.get(
                OWM_FORECAST_URL,
                params={"lat": lat, "lon": lon, "units": "metric", "appid": self._api_key},
            )
            response.raise_for_status()
            return response.json()

        return await with_transient_retry(_call)

    async def fetch_air_pollution(self, lat: float, lon: float) -> dict:
        async def _call():
            response = await self._client.get(
                OWM_AIR_POLLUTION_URL,
                params={"lat": lat, "lon": lon, "appid": self._api_key},
            )
            response.raise_for_status()
            return response.json()

        return await with_transient_retry(_call)
