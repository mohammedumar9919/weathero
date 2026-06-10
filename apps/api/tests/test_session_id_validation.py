"""Session ID character validation — TDD (Slice V3b)."""

from fastapi.testclient import TestClient


def test_session_id_rejects_spaces_and_special_chars(api_client: TestClient):
    for invalid_id in ("sess 1", "sess@1", "sess/id"):
        response = api_client.get("/api/v1/locations", params={"session_id": invalid_id})
        assert response.status_code == 422, f"expected 422 for session_id={invalid_id!r}"
