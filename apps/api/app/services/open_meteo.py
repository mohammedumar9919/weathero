"""Open-Meteo fallback provider."""

from __future__ import annotations

import httpx

from app.services.retry import with_transient_retry

OM_FORECAST_URL = "https://api.open-meteo.com/v1/forecast"


class OpenMeteoClient:
    def __init__(self, client: httpx.AsyncClient) -> None:
        self._client = client

    async def fetch(self, lat: float, lon: float) -> dict:
        async def _call():
            response = await self._client.get(
                OM_FORECAST_URL,
                params={
                    "latitude": lat,
                    "longitude": lon,
                    "current": "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code",
                    "hourly": "temperature_2m,precipitation_probability,weather_code",
                    "forecast_hours": 24,
                    "timezone": "UTC",
                },
            )
            response.raise_for_status()
            return response.json()

        return await with_transient_retry(_call)
