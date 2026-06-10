"""Weather BFF — cache-aside, single-flight lock, OWM + OM fallback."""

from __future__ import annotations

import asyncio
import os
from datetime import datetime, timedelta, timezone

import httpx
from sqlalchemy.orm import Session

from app.models.forecast_cache import ForecastCache
from app.models.geocode_cache import GeocodeCache
from app.services.gate import validate_snapshot
from app.services.air_quality import normalize_air_quality
from app.services.normalize import normalize_om, normalize_owm
from app.services.open_meteo import OpenMeteoClient
from app.services.openweather import OpenWeatherClient
from app.services.presentation import build as build_presentation

CACHE_TTL_MINUTES = 45

_fetch_locks: dict[tuple[float, float], asyncio.Lock] = {}


def _normalize_city_query(city: str) -> str:
    return city.strip().lower()


def _is_cache_fresh(cached_at: datetime) -> bool:
    now = datetime.now(timezone.utc)
    if cached_at.tzinfo is None:
        cached_at = cached_at.replace(tzinfo=timezone.utc)
    return now - cached_at < timedelta(minutes=CACHE_TTL_MINUTES)


def _lock_for_coords(lat: float, lon: float) -> asyncio.Lock:
    key = (round(lat, 4), round(lon, 4))
    if key not in _fetch_locks:
        _fetch_locks[key] = asyncio.Lock()
    return _fetch_locks[key]


def _format_cached_at(value: datetime | str) -> str:
    if isinstance(value, datetime):
        dt = value
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    return str(value)


def _unpack_cache_entry(bundle_json: dict) -> tuple[dict, str]:
    """Read cached payload — supports legacy flat snapshot or wrapped entry."""
    if "snapshot" in bundle_json:
        return dict(bundle_json["snapshot"]), str(bundle_json.get("provider", "openweather"))
    return dict(bundle_json), "openweather"


def _build_meta(
    *,
    data_source: str,
    provider: str,
    cached_at: datetime | str,
    stale_fallback: bool = False,
) -> dict:
    return {
        "data_source": data_source,
        "provider": provider,
        "cached_at": _format_cached_at(cached_at),
        "stale_fallback": stale_fallback,
    }


def _build_envelope(
    snapshot: dict,
    *,
    data_source: str,
    provider: str,
    cached_at: datetime | str,
    stale_fallback: bool = False,
) -> dict:
    meta = _build_meta(
        data_source=data_source,
        provider=provider,
        cached_at=cached_at,
        stale_fallback=stale_fallback,
    )
    return {
        "snapshot": snapshot,
        "presentation": build_presentation(snapshot, meta),
        "meta": meta,
    }


class WeatherService:
    def __init__(self, db: Session, http_client: httpx.AsyncClient, api_key: str = "") -> None:
        self._db = db
        self._http_client = http_client
        self._owm = OpenWeatherClient(http_client, api_key)
        self._om = OpenMeteoClient(http_client)

    def _get_forecast_cache(self, city_query: str) -> ForecastCache | None:
        return self._db.query(ForecastCache).filter_by(city_query=city_query).first()

    def _get_geocode_cache(self, city_query: str) -> GeocodeCache | None:
        return self._db.query(GeocodeCache).filter_by(city_query=city_query).first()

    def _store_forecast_cache(self, city_query: str, snapshot: dict, provider: str) -> datetime:
        existing = self._get_forecast_cache(city_query)
        now = datetime.now(timezone.utc)
        payload = {"snapshot": snapshot, "provider": provider}
        if existing:
            existing.bundle_json = payload
            existing.cached_at = now
        else:
            self._db.add(
                ForecastCache(city_query=city_query, bundle_json=payload, cached_at=now)
            )
        self._db.commit()
        return now

    def _store_geocode_cache(self, city_query: str, geo: dict) -> None:
        existing = self._get_geocode_cache(city_query)
        now = datetime.now(timezone.utc)
        if existing:
            existing.lat = float(geo["lat"])
            existing.lon = float(geo["lon"])
            existing.country = geo["country"]
            existing.cached_at = now
        else:
            self._db.add(
                GeocodeCache(
                    city_query=city_query,
                    lat=float(geo["lat"]),
                    lon=float(geo["lon"]),
                    country=geo["country"],
                    cached_at=now,
                )
            )
        self._db.commit()

    async def _resolve_geocode(self, city: str, city_query: str) -> dict:
        cached = self._get_geocode_cache(city_query)
        if cached:
            return {
                "name": city.strip().title(),
                "lat": cached.lat,
                "lon": cached.lon,
                "country": cached.country,
            }
        geo = await self._owm.geocode(city)
        self._store_geocode_cache(city_query, geo)
        return geo

    async def _fetch_owm_bundle(self, geo: dict) -> dict:
        current_result, forecast_result, pollution_result = await asyncio.gather(
            self._owm.fetch_current(geo["lat"], geo["lon"]),
            self._owm.fetch_forecast(geo["lat"], geo["lon"]),
            self._owm.fetch_air_pollution(geo["lat"], geo["lon"]),
            return_exceptions=True,
        )

        if isinstance(current_result, BaseException):
            raise current_result
        if isinstance(forecast_result, BaseException):
            raise forecast_result

        snapshot = normalize_owm(geo, current_result, forecast_result)

        if not isinstance(pollution_result, BaseException):
            try:
                snapshot["air_quality"] = normalize_air_quality(pollution_result)
            except Exception:
                pass

        return snapshot

    async def _fetch_om_bundle(self, geo: dict) -> dict:
        om_data = await self._om.fetch(geo["lat"], geo["lon"])
        return normalize_om(
            lat=geo["lat"],
            lon=geo["lon"],
            om_data=om_data,
            city=geo.get("name", ""),
            country=geo["country"],
        )

    def _should_force_fail(self) -> bool:
        return os.environ.get("WEATHER_FORCE_FAIL", "").strip() == "1"

    def _envelope_from_cache(self, cached: ForecastCache) -> dict:
        snapshot, provider = _unpack_cache_entry(dict(cached.bundle_json))
        return _build_envelope(
            snapshot,
            data_source="cache",
            provider=provider,
            cached_at=cached.cached_at,
        )

    async def get_bundle(self, city: str) -> dict:
        city_query = _normalize_city_query(city)

        cached = self._get_forecast_cache(city_query)
        if cached and _is_cache_fresh(cached.cached_at):
            return self._envelope_from_cache(cached)

        stale_snapshot: dict | None = None
        stale_provider = "openweather"
        if cached:
            stale_snapshot, stale_provider = _unpack_cache_entry(dict(cached.bundle_json))

        geo = await self._resolve_geocode(city, city_query)
        lock = _lock_for_coords(geo["lat"], geo["lon"])

        async with lock:
            cached = self._get_forecast_cache(city_query)
            if cached and _is_cache_fresh(cached.cached_at):
                return self._envelope_from_cache(cached)

            provider = "openweather"
            try:
                if self._should_force_fail():
                    raise RuntimeError("WEATHER_FORCE_FAIL enabled")
                snapshot = await self._fetch_owm_bundle(geo)
            except Exception:
                try:
                    snapshot = await self._fetch_om_bundle(geo)
                    provider = "open_meteo"
                except Exception:
                    if stale_snapshot is not None:
                        return _build_envelope(
                            stale_snapshot,
                            data_source="stale_fallback",
                            provider=stale_provider,
                            cached_at=cached.cached_at if cached else stale_snapshot["fetched_at"],
                            stale_fallback=True,
                        )
                    raise

            validate_snapshot(snapshot)
            cached_at = self._store_forecast_cache(city_query, snapshot, provider)
            return _build_envelope(
                snapshot,
                data_source="live",
                provider=provider,
                cached_at=cached_at,
            )
