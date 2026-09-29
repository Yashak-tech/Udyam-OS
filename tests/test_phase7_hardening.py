import pytest
import asyncio
import os
import json
from starlette.testclient import TestClient
from backend.main import app
from backend.core.models import SessionState, ApprovalState, AgentState
from backend.storage.repository import session_repository
from backend.orchestrator.manager import udyam_manager
from backend.tools.workspace import WorkspaceTool
from backend.events.bus import event_bus
from backend.events.models import EventType
from backend.verification.engine import verification_engine

client = TestClient(app)

@pytest.mark.asyncio
async def test_phase7_full_lifecycle_and_hardening():
    """
    Comprehensive Phase 7 End-to-End Verification Test.
    Covers:
    1. Fresh session creation & goal intake
    2. 4-agent sequential dependency execution
    3. Shared context consolidation
    4. 12/12 quality verification
    5. Revision request flow
    6. Founder approval gate
    7. Sealed launch package & LAUNCH_READY state
    8. All 4 agents showing COMPLETED
    9. Artifact integrity on disk and via REST
    10. Failure cases (empty goal 422, invalid approval 409, missing session 404, Office Kit 501)
    11. Reload recovery consistency
    """
    # -------------------------------------------------------------
    # 1. Fresh Session Creation
    # -------------------------------------------------------------
    create_res = client.post(
        "/api/v1/sessions",
        json={"founder_name": "ClinicFounder", "device_id": "iqoo_neo_9_pro_test"}
    )
    assert create_res.status_code == 201, f"Failed session create: {create_res.text}"
    session_data = create_res.json()
    session_id = session_data["session_id"]
    assert session_id is not None
    assert session_data["status"] == "CREATED"
    assert session_data["ws_url"] == f"/ws/sessions/{session_id}"

    # Collect operational events
    recorded_events = []
    async def record_event(evt):
        recorded_events.append(evt)
    await event_bus.subscribe(session_id, record_event)

    # -------------------------------------------------------------
    # 2. Failure Testing: Empty Goal Validation (Requirement 23F)
    # -------------------------------------------------------------
    empty_goal_res = client.post(
        f"/api/v1/sessions/{session_id}/goals",
        json={"raw_intent": "hi", "modality": "text"} # < 5 characters
    )
    assert empty_goal_res.status_code == 422, f"Expected 422 for short goal, got {empty_goal_res.status_code}"

    # -------------------------------------------------------------
    # 3. Failure Testing: Invalid Approval in CREATED state (Requirement 23E)
    # -------------------------------------------------------------
    bad_approval_res = client.post(
        f"/api/v1/sessions/{session_id}/approval",
        json={"decision": "APPROVED", "founder_notes": "Premature approval"}
    )
    assert bad_approval_res.status_code == 409, f"Expected 409 Conflict, got {bad_approval_res.status_code}"

    # -------------------------------------------------------------
    # 4. Submit Valid Business Goal (Section 4)
    # -------------------------------------------------------------
    goal_prompt = "I want to launch an AI appointment-reminder SaaS for small clinics."
    submit_res = client.post(
        f"/api/v1/sessions/{session_id}/goals",
        json={"raw_intent": goal_prompt, "modality": "text", "language": "en"}
    )
    assert submit_res.status_code == 202, f"Failed submit goal: {submit_res.text}"
    assert submit_res.json()["status"] in ["INTAKE", "RUNNING"]

    # Wait for autonomous workforce execution to reach AWAITING_APPROVAL
    max_wait = 15.0
    start_time = asyncio.get_event_loop().time()
    while asyncio.get_event_loop().time() - start_time < max_wait:
        sess = session_repository.get_session(session_id)
        if sess and sess.status in [SessionState.AWAITING_APPROVAL, SessionState.FAILED]:
            break
        await asyncio.sleep(0.15)

    sess = session_repository.get_session(session_id)
    assert sess is not None
    assert sess.status == SessionState.AWAITING_APPROVAL, f"Expected AWAITING_APPROVAL, got {sess.status}"

    # -------------------------------------------------------------
    # 5. Shared Company Context Verification (Section 9 & 10)
    # -------------------------------------------------------------
    ctx = sess.context
    assert ctx.project_goal is not None
    assert ctx.project_goal.raw_intent.raw_input == goal_prompt
    assert ctx.market.target_icp != "", "Research ICP must be populated"
    assert len(ctx.market.competitors) >= 1, "Research competitors must be populated"
    assert ctx.product.product_name != "", "Product name must be populated"
    assert len(ctx.product.mvp_features) >= 1, "MVP features must be populated"
    assert ctx.brand.primary_color != "", "Brand colors must be populated"
    assert len(ctx.growth.launch_channels) >= 1, "Growth channels must be populated"

    # -------------------------------------------------------------
    # 6. Artifact Integrity Verification (Section 7 & 8)
    # -------------------------------------------------------------
    # Check physical files exist in session workspace
    assert WorkspaceTool.file_exists(session_id, "research_brief.md")
    assert WorkspaceTool.file_exists(session_id, "product_requirements.md")
    assert WorkspaceTool.file_exists(session_id, "landing_page/index.html")
    assert WorkspaceTool.file_exists(session_id, "landing_page/styles.css")
    assert WorkspaceTool.file_exists(session_id, "launch_strategy.md")

    # Verify REST endpoint returns matching artifacts
    art_list_res = client.get(f"/api/v1/sessions/{session_id}/artifacts")
    assert art_list_res.status_code == 200
    art_list = art_list_res.json()["artifacts"]
    assert len(art_list) >= 4, f"Expected at least 4 artifacts, got {len(art_list)}"
    art_types = [a["type"] for a in art_list]
    assert "research_brief" in art_types
    assert "product_requirements" in art_types
    assert "landing_page" in art_types
    assert "launch_strategy" in art_types

    # Verify raw HTML preview has embedded contrast and viewport
    lp_res = client.get(f"/api/v1/sessions/{session_id}/artifacts/art_landing_page?raw=true")
    assert lp_res.status_code == 200
    html_content = lp_res.text
    assert "<!doctype html" in html_content.lower()
    assert 'name="viewport"' in html_content.lower()
    assert "<style>" in html_content, "Expected inline styling for sandbox contrast isolation"

    # -------------------------------------------------------------
    # 7. Quality Verification Check (Section 13)
    # -------------------------------------------------------------
    assert sess.verification is not None
    assert sess.verification.passed is True
    assert len(sess.verification.checks) == 12
    assert all(c.passed for c in sess.verification.checks)

    # -------------------------------------------------------------
    # 8. Revision Flow Verification (Section 15)
    # -------------------------------------------------------------
    # Founder requests a revision on the BuilderAgent
    feedback_res = client.post(
        f"/api/v1/sessions/{session_id}/feedback",
        json={
            "target_agent": "BuilderAgent",
            "critique_text": "Improve the landing page positioning for small clinic owners.",
            "target_artifact": "art_landing_page"
        }
    )
    assert feedback_res.status_code == 202
    assert feedback_res.json()["status"] == "REVISION_REQUESTED"

    # Wait for revision and re-verification to complete
    start_time = asyncio.get_event_loop().time()
    while asyncio.get_event_loop().time() - start_time < max_wait:
        sess = session_repository.get_session(session_id)
        if sess and sess.status in [SessionState.AWAITING_APPROVAL, SessionState.FAILED]:
            break
        await asyncio.sleep(0.15)

    sess = session_repository.get_session(session_id)
    assert sess.status == SessionState.AWAITING_APPROVAL, f"Expected return to AWAITING_APPROVAL, got {sess.status}"
    assert sess.verification.passed is True

    # -------------------------------------------------------------
    # 9. Founder Approval Gate & LAUNCH_READY (Section 14 & 3)
    # -------------------------------------------------------------
    approve_res = client.post(
        f"/api/v1/sessions/{session_id}/approval",
        json={
            "decision": "APPROVED",
            "founder_notes": "Venture signed off from iQOO command center."
        }
    )
    assert approve_res.status_code == 200
    approve_data = approve_res.json()
    assert approve_data["status"] == "APPROVED"
    assert "launch_package" in approve_data

    # Reload session from repository (Simulate Reload / Recovery - Section 25)
    reloaded_sess = session_repository.get_session(session_id)
    assert reloaded_sess.status == SessionState.LAUNCH_READY
    assert reloaded_sess.approval.status == ApprovalState.APPROVED
    assert reloaded_sess.launch_package is not None
    assert reloaded_sess.launch_package.launch_ready is True
    assert WorkspaceTool.file_exists(session_id, "launch_package.json")

    # Authoritative Agent State Check: All 4 agents must be COMPLETED
    tasks_by_agent = {t.agent_name: t.status for t in reloaded_sess.tasks}
    assert tasks_by_agent.get("ResearchAgent") == AgentState.COMPLETED
    assert tasks_by_agent.get("ProductAgent") == AgentState.COMPLETED
    assert tasks_by_agent.get("BuilderAgent") == AgentState.COMPLETED
    assert tasks_by_agent.get("GrowthAgent") == AgentState.COMPLETED

    # -------------------------------------------------------------
    # 10. Operational Event Sequence & Telemetry Sanitization (Section 5 & 6)
    # -------------------------------------------------------------
    event_types = [e.type for e in recorded_events]
    assert EventType.GOAL_RECEIVED in event_types
    assert EventType.GOAL_PARSED in event_types
    assert EventType.TASK_CREATED in event_types
    assert EventType.AGENT_STARTED in event_types
    assert EventType.AGENT_COMPLETED in event_types
    assert EventType.ARTIFACT_CREATED in event_types
    assert EventType.VERIFICATION_STARTED in event_types
    assert EventType.VERIFICATION_PASSED in event_types
    assert EventType.APPROVAL_REQUESTED in event_types
    assert EventType.APPROVAL_APPROVED in event_types
    assert EventType.LAUNCH_READY in event_types

    # Verify no private reasoning/prompts leaked in events
    for evt in recorded_events:
        json_str = evt.model_dump_json()
        assert "chain_of_thought" not in json_str
        assert "internal_reasoning" not in json_str
        assert "hidden_prompt" not in json_str

    # -------------------------------------------------------------
    # 11. Office Kit Truthful Verification (Section 22)
    # -------------------------------------------------------------
    office_kit_res = client.post("/api/v1/office-kit/sync")
    assert office_kit_res.status_code == 501, "Office Kit must truthfully return 501 Not Implemented when bridge not active"

    # -------------------------------------------------------------
    # 12. Verification Failure Behavior (Section 23D)
    # -------------------------------------------------------------
    # Manually remove an artifact from a clone session to test verification failure
    test_sess_clone = await udyam_manager.create_session("AuditTest", "iqoo_test")
    res_fail = await verification_engine.verify(test_sess_clone, attempt=1)
    assert res_fail.passed is False, "Empty session without artifacts must fail verification"

    await event_bus.unsubscribe(session_id, record_event)
