"""Weather bundle endpoint — GET /api/v1/weather?city="""

from __future__ import annotations

import httpx
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.limiter import limiter
from app.services.swr_cache_headers import apply_swr_cache_headers
from app.services.weather_service import WeatherService

router = APIRouter(tags=["weather"])


def _get_http_client(request: Request) -> httpx.AsyncClient:
    return request.app.state.http_client


@router.get("/weather")
@limiter.limit("60/minute")
async def get_weather(
    request: Request,
    city: str = Query(..., min_length=1, max_length=100),
    db: Session = Depends(get_db),
    http_client: httpx.AsyncClient = Depends(_get_http_client),
):
    if not settings.openweather_api_key.strip():
        raise HTTPException(status_code=503, detail="weather provider not configured")

    service = WeatherService(
        db=db,
        http_client=http_client,
        api_key=settings.openweather_api_key,
    )
    try:
        bundle = await service.get_bundle(city)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail="weather provider unavailable") from exc

    headers: dict[str, str] = {}
    apply_swr_cache_headers(headers)
    return JSONResponse(content=bundle, headers=headers)
