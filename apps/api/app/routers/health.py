from fastapi import APIRouter, Request

from app.core.limiter import limiter

router = APIRouter(tags=["health"])


@router.get("/health")
@limiter.limit("30/minute")
def health(request: Request) -> dict[str, str]:
    return {"status": "ok", "slice": "A"}
