"""Saved locations CRUD — max 3 per session."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.limiter import limiter
from app.models.saved_locations import MAX_SAVED_LOCATIONS, SavedLocation

router = APIRouter(tags=["locations"])

SESSION_ID_PATTERN = r"^[\w-]+$"

SessionIdQuery = Annotated[
    str,
    Query(..., min_length=1, max_length=64, pattern=SESSION_ID_PATTERN),
]


class LocationCreate(BaseModel):
    session_id: str = Field(..., min_length=1, max_length=64, pattern=SESSION_ID_PATTERN)
    city: str = Field(..., min_length=1)


class LocationResponse(BaseModel):
    id: int
    session_id: str
    city: str
    sort_order: int

    model_config = {"from_attributes": True}


@router.get("/locations", response_model=list[LocationResponse])
@limiter.limit("60/minute")
def list_locations(
    request: Request,
    session_id: SessionIdQuery,
    db: Session = Depends(get_db),
):
    rows = (
        db.query(SavedLocation)
        .filter_by(session_id=session_id)
        .order_by(SavedLocation.sort_order)
        .all()
    )
    return rows


@router.post("/locations", response_model=LocationResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("60/minute")
def create_location(request: Request, body: LocationCreate, db: Session = Depends(get_db)):
    count = db.query(SavedLocation).filter_by(session_id=body.session_id).count()
    if count >= MAX_SAVED_LOCATIONS:
        raise HTTPException(
            status_code=400,
            detail=f"max {MAX_SAVED_LOCATIONS} saved locations per session",
        )
    row = SavedLocation(session_id=body.session_id, city=body.city, sort_order=count)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/locations/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
@limiter.limit("60/minute")
def delete_location(
    request: Request,
    location_id: int,
    session_id: SessionIdQuery,
    db: Session = Depends(get_db),
):
    row = (
        db.query(SavedLocation)
        .filter_by(id=location_id, session_id=session_id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="location not found")
    db.delete(row)
    db.commit()
