import pytest
from starlette.testclient import TestClient
from backend.main import app
from backend.storage.repository import session_repository

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "udyam-os"}

def test_session_lifecycle_rest_api():
    # 1. Create Session
    create_res = client.post(
        "/api/v1/sessions",
        json={"founder_name": "TestFounder", "device_id": "iqoo_device_01"}
    )
    assert create_res.status_code == 201
    data = create_res.json()
    session_id = data["session_id"]
    assert data["status"] == "CREATED"
    assert "ws_url" in data

    # 2. Get Session
    get_res = client.get(f"/api/v1/sessions/{session_id}")
    assert get_res.status_code == 200
    assert get_res.json()["session_id"] == session_id

    # 3. Get Context
    ctx_res = client.get(f"/api/v1/sessions/{session_id}/context")
    assert ctx_res.status_code == 200
    assert ctx_res.json()["session_id"] == session_id

    # 4. Attempt approval on CREATED session (must return 409 Conflict)
    bad_approval = client.post(
        f"/api/v1/sessions/{session_id}/approval",
        json={"decision": "APPROVED"}
    )
    assert bad_approval.status_code == 409

    # 5. Stubs return 501 Not Implemented
    voice_res = client.post("/api/v1/input/voice")
    assert voice_res.status_code == 501

    camera_res = client.post("/api/v1/input/camera")
    assert camera_res.status_code == 501

    sync_res = client.post("/api/v1/office-kit/sync")
    assert sync_res.status_code == 501
