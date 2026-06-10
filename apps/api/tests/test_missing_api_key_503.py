"""Missing OpenWeather API key returns 503 — TDD (Slice V3b)."""

from unittest.mock import patch

from fastapi.testclient import TestClient


def test_empty_api_key_returns_503_not_502(api_client: TestClient):
    with patch("app.routers.weather.settings.openweather_api_key", ""):
        response = api_client.get("/api/v1/weather", params={"city": "London"})
    assert response.status_code == 503
    assert response.status_code != 502
    assert response.json()["detail"] == "weather provider not configured"
