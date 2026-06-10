"""Shared pytest fixtures for Slice B tests."""

from __future__ import annotations

import os
from collections.abc import Generator

import httpx
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings
from app.core.database import get_db
from app.main import app as fastapi_app
from app.models import Base  # noqa: F401 — register models with metadata
import app.models.forecast_cache  # noqa: F401
import app.models.geocode_cache  # noqa: F401
import app.models.saved_locations  # noqa: F401

# Ensure test DB URL matches docker-compose (:5435)
TEST_DATABASE_URL = os.environ.get("DATABASE_URL", settings.database_url)


@pytest.fixture(scope="session")
def engine():
    eng = create_engine(TEST_DATABASE_URL)
    Base.metadata.create_all(eng)
    yield eng
    Base.metadata.drop_all(eng)


@pytest.fixture
def db_session(engine) -> Generator[Session, None, None]:
    connection = engine.connect()
    transaction = connection.begin()
    SessionLocal = sessionmaker(bind=connection)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


def _truncate_tables(engine) -> None:
    with engine.connect() as conn:
        for table in ("saved_locations", "forecast_cache", "geocode_cache"):
            conn.execute(text(f"TRUNCATE TABLE {table} RESTART IDENTITY CASCADE"))
        conn.commit()


@pytest.fixture(autouse=True)
def _clean_tables(engine):
    """Truncate cache/location tables between tests."""
    _truncate_tables(engine)
    yield
    _truncate_tables(engine)


@pytest.fixture
def http_client() -> httpx.AsyncClient:
    return httpx.AsyncClient()


@pytest.fixture
def api_client(db_session) -> Generator[TestClient, None, None]:
    def override_get_db():
        yield db_session

    fastapi_app.dependency_overrides[get_db] = override_get_db
    with TestClient(fastapi_app) as client:
        yield client
    fastapi_app.dependency_overrides.clear()
