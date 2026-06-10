"""Security headers middleware — TDD (Slice V3b)."""

from fastapi.testclient import TestClient

REQUIRED_HEADERS = {
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "strict-origin-when-cross-origin",
    "permissions-policy": "geolocation=(), microphone=(), camera=()",
}


def test_security_headers_on_weather(api_client: TestClient):
    response = api_client.get("/api/v1/weather", params={"city": "London"})
    for header, expected in REQUIRED_HEADERS.items():
        assert response.headers.get(header) == expected, f"missing or wrong {header}"


def test_security_headers_on_health(api_client: TestClient):
    response = api_client.get("/api/v1/health")
    assert response.status_code == 200
    for header, expected in REQUIRED_HEADERS.items():
        assert response.headers.get(header) == expected, f"missing or wrong {header}"
