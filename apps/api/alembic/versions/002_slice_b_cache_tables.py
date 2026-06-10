"""Slice B cache tables — geocode_cache, forecast_cache, saved_locations.

Revision ID: 002
Revises: 001
Create Date: 2026-06-08

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "geocode_cache",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("city_query", sa.Text(), nullable=False, unique=True),
        sa.Column("lat", sa.Float(), nullable=False),
        sa.Column("lon", sa.Float(), nullable=False),
        sa.Column("country", sa.Text(), nullable=False),
        sa.Column("cached_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table(
        "forecast_cache",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("city_query", sa.Text(), nullable=False, unique=True),
        sa.Column("bundle_json", postgresql.JSONB(), nullable=False),
        sa.Column("cached_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_table(
        "saved_locations",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("session_id", sa.Text(), nullable=False, index=True),
        sa.Column("city", sa.Text(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
    )


def downgrade() -> None:
    op.drop_table("saved_locations")
    op.drop_table("forecast_cache")
    op.drop_table("geocode_cache")
