import pytest
import asyncio
from backend.orchestrator.manager import udyam_manager
from backend.storage.repository import session_repository
from backend.events.bus import event_bus
from backend.events.models import EventType
from backend.core.models import SessionState, ApprovalState
from backend.tools.workspace import WorkspaceTool
from backend.approvals.manager import approval_manager

@pytest.mark.asyncio
async def test_clinic_reminder_saas_end_to_end():
    """
    Automated integration test for the ClinicPing venture scenario:
    'I want to launch an AI appointment-reminder SaaS for small clinics.'
    """
    emitted_events = []

    async def event_collector(event):
        emitted_events.append(event)

    # 1. Create session
    session = await udyam_manager.create_session(
        founder_name="Dr. Yash",
        device_id="iqoo_test_device_01"
    )
    session_id = session.session_id
    assert session_id is not None
    assert session.status == SessionState.CREATED

    # Subscribe to event bus for this session
    await event_bus.subscribe(session_id, event_collector)

    # 2. Submit Goal
    raw_prompt = "I want to launch an AI appointment-reminder SaaS for small clinics."
    await udyam_manager.submit_goal(
        session_id=session_id,
        raw_intent=raw_prompt,
        modality="text",
        language="en"
    )

    # Allow async pipeline execution to complete
    # Wait until session reaches AWAITING_APPROVAL (or FAILED)
    max_wait = 10.0
    start_time = asyncio.get_event_loop().time()
    while asyncio.get_event_loop().time() - start_time < max_wait:
        sess = session_repository.get_session(session_id)
        if sess.status in [SessionState.AWAITING_APPROVAL, SessionState.FAILED]:
            break
        await asyncio.sleep(0.1)

    sess = session_repository.get_session(session_id)
    assert sess.status == SessionState.AWAITING_APPROVAL, f"Expected AWAITING_APPROVAL, got {sess.status}"

    # 3. Verify Shared Context is populated
    ctx = sess.context
    assert ctx.project_goal is not None
    assert "Clinic" in ctx.project_goal.project_name or "Agro" in ctx.project_goal.project_name
    assert ctx.market.target_icp != ""
    assert len(ctx.market.competitors) >= 1
    assert ctx.product.product_name != ""
    assert len(ctx.product.mvp_features) >= 1
    assert ctx.brand.primary_color != ""
    assert len(ctx.growth.launch_channels) >= 1

    # 4. Verify all 4 required artifacts exist on disk
    assert WorkspaceTool.file_exists(session_id, "research_brief.md")
    assert WorkspaceTool.file_exists(session_id, "product_requirements.md")
    assert WorkspaceTool.file_exists(session_id, "landing_page/index.html")
    assert WorkspaceTool.file_exists(session_id, "landing_page/styles.css")
    assert WorkspaceTool.file_exists(session_id, "launch_strategy.md")

    # Verify HTML validity and viewport
    html = WorkspaceTool.read_file(session_id, "landing_page/index.html")
    assert "<!DOCTYPE html>" in html or "<!doctype html>" in html
    assert 'name="viewport"' in html
    assert "styles.css" in html

    # 5. Verify automated verification results
    assert sess.verification is not None
    assert sess.verification.passed is True
    assert len(sess.verification.checks) == 12
    assert all(c.passed for c in sess.verification.checks)

    # 6. Verify Approval Request is created and pending
    assert sess.approval is not None
    assert sess.approval.status == ApprovalState.PENDING

    # 7. Founder Approves on iQOO phone
    launch_package = await approval_manager.submit_approval(
        session_id=session_id,
        decision="APPROVED",
        founder_notes="Approved via iQOO automated integration test."
    )

    # 8. Verify final state and launch package
    final_sess = session_repository.get_session(session_id)
    assert final_sess.status == SessionState.LAUNCH_READY
    assert final_sess.launch_package is not None
    assert final_sess.launch_package.launch_ready is True
    assert WorkspaceTool.file_exists(session_id, "launch_package.json")

    # 9. Verify operational event sequence
    event_types = [e.type for e in emitted_events]
    assert EventType.GOAL_RECEIVED in event_types
    assert EventType.GOAL_PARSED in event_types
    assert EventType.TASK_CREATED in event_types
    assert EventType.AGENT_STARTED in event_types
    assert EventType.TOOL_STARTED in event_types
    assert EventType.TOOL_COMPLETED in event_types
    assert EventType.ARTIFACT_CREATED in event_types
    assert EventType.VERIFICATION_STARTED in event_types
    assert EventType.VERIFICATION_PASSED in event_types
    assert EventType.APPROVAL_REQUESTED in event_types
    assert EventType.APPROVAL_APPROVED in event_types
    assert EventType.LAUNCH_READY in event_types

    await event_bus.unsubscribe(session_id, event_collector)
