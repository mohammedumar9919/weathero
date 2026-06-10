"""Input bounds validation — TDD (Slice V3b)."""

from fastapi.testclient import TestClient


def test_city_over_100_chars_returns_422(api_client: TestClient):
    long_city = "A" * 101
    response = api_client.get("/api/v1/weather", params={"city": long_city})
    assert response.status_code == 422


def test_session_id_over_64_chars_returns_422(api_client: TestClient):
    long_session = "s" * 65
    response = api_client.get("/api/v1/locations", params={"session_id": long_session})
    assert response.status_code == 422
