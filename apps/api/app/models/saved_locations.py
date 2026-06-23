"""Saved locations model — docs/api-contracts.md."""

from __future__ import annotations

from sqlalchemy import Integer, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base

MAX_SAVED_LOCATIONS = 7


class SavedLocation(Base):
    __tablename__ = "saved_locations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    session_id: Mapped[str] = mapped_column(Text, nullable=False, index=True)
    city: Mapped[str] = mapped_column(Text, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
