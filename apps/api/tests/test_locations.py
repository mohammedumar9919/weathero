"""TDD tests for saved locations CRUD — RED first (Slice B)."""

from fastapi.testclient import TestClient


def test_post_location_creates_saved_entry(api_client: TestClient):
    response = api_client.post(
        "/api/v1/locations",
        json={"session_id": "sess-1", "city": "Hyderabad"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["city"] == "Hyderabad"
    assert data["session_id"] == "sess-1"


def test_max_seven_locations_per_session(api_client: TestClient):
    session_id = "sess-max"
    for n in range(1, 8):
        resp = api_client.post(
            "/api/v1/locations",
            json={"session_id": session_id, "city": f"City{n}"},
        )
        assert resp.status_code == 201

    overflow = api_client.post(
        "/api/v1/locations",
        json={"session_id": session_id, "city": "City8"},
    )
    assert overflow.status_code == 400
    assert "max" in overflow.json()["detail"].lower()


def test_delete_location_removes_entry(api_client: TestClient):
    create = api_client.post(
        "/api/v1/locations",
        json={"session_id": "sess-del", "city": "Mumbai"},
    )
    loc_id = create.json()["id"]

    delete = api_client.delete(f"/api/v1/locations/{loc_id}", params={"session_id": "sess-del"})
    assert delete.status_code == 204

    listing = api_client.get("/api/v1/locations", params={"session_id": "sess-del"})
    assert listing.json() == []
