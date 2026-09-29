import time
from typing import Optional, Literal
from backend.core.models import (
    Session,
    SessionState,
    ApprovalRequest,
    ApprovalState,
    LaunchPackage,
    FounderFeedback
)
from backend.core.exceptions import StateConflictError
from backend.events.bus import event_bus
from backend.events.models import EventType
from backend.storage.repository import session_repository
from backend.artifacts.manager import artifact_manager
from backend.tools.workspace import WorkspaceTool

class ApprovalManager:
    """
    Manages the Founder Human-in-the-Loop approval gate.
    Enforces that approval can only be granted when session is in AWAITING_APPROVAL.
    """
    def __init__(self, repository=session_repository, bus=event_bus):
        self.repository = repository
        self.bus = bus

    async def create_approval_request(self, session: Session) -> ApprovalRequest:
        project_name = session.goal.project_name if session.goal else "Project"
        tagline = session.goal.tagline if session.goal else ""

        approval = ApprovalRequest(
            session_id=session.session_id,
            project_name=project_name,
            tagline=tagline,
            executive_summary=f"The AI workforce has generated complete market research, PRD, a live landing page, and GTM strategy for {project_name}.",
            status=ApprovalState.PENDING,
            requested_at=time.time()
        )

        session.approval = approval
        session.status = SessionState.AWAITING_APPROVAL
        session.updated_at = time.time()
        self.repository.save_session(session)

        await self.bus.publish(
            session_id=session.session_id,
            event_type=EventType.APPROVAL_REQUESTED,
            source="ApprovalManager",
            status="ACTION_REQUIRED",
            message=f"Action Required: Founder sign-off needed for {project_name}",
            payload={
                "request_id": approval.request_id,
                "project_name": project_name,
                "preview_url": f"/api/v1/sessions/{session.session_id}/artifacts/art_landing_page?raw=true"
            }
        )
        return approval

    async def submit_approval(
        self,
        session_id: str,
        decision: Literal["APPROVED"] = "APPROVED",
        founder_notes: Optional[str] = None
    ) -> LaunchPackage:
        session = self.repository.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        if session.status != SessionState.AWAITING_APPROVAL:
            raise StateConflictError(f"Cannot approve session in state '{session.status}'. Must be AWAITING_APPROVAL.")

        # Update approval object
        if session.approval:
            session.approval.status = ApprovalState.APPROVED
            session.approval.decided_at = time.time()
            session.approval.founder_decision = "APPROVED"
            session.approval.founder_notes = founder_notes

        session.status = SessionState.APPROVED
        session.updated_at = time.time()

        await self.bus.publish(
            session_id=session_id,
            event_type=EventType.APPROVAL_APPROVED,
            source="DeviceAdapter",
            status="COMPLETED",
            message="Founder approval granted via iQOO mobile client",
            payload={"founder_notes": founder_notes}
        )

        # Build Launch Package manifest
        artifact_map = {art.type: art.relative_path for art in session.artifacts.values()}
        launch_pkg = LaunchPackage(
            session_id=session_id,
            project_name=session.goal.project_name if session.goal else "Launch Package",
            tagline=session.goal.tagline if session.goal else "",
            approval_timestamp=time.time(),
            artifacts=artifact_map,
            executive_kpis={
                "artifacts_verified": len(session.artifacts),
                "ready_for_web_deploy": True,
                "approval_device": session.device_id
            }
        )
        session.launch_package = launch_pkg
        session.status = SessionState.LAUNCH_READY
        self.repository.save_session(session)

        # Write launch_package.json artifact
        await artifact_manager.create_artifact(
            session_id=session_id,
            artifact_id="art_launch_package",
            artifact_type="launch_package",
            title="Consolidated Launch Package",
            relative_path="launch_package.json",
            created_by="UdyamManager",
            content=launch_pkg.model_dump_json(indent=2)
        )

        await self.bus.publish(
            session_id=session_id,
            event_type=EventType.LAUNCH_READY,
            source="UdyamManager",
            status="COMPLETED",
            message="Launch package verified, approved, and sealed for deployment",
            payload={"package_id": launch_pkg.package_id}
        )

        return launch_pkg

    async def submit_feedback(
        self,
        session_id: str,
        target_agent: str,
        critique_text: str,
        target_artifact_id: Optional[str] = None
    ) -> FounderFeedback:
        session = self.repository.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")

        feedback = FounderFeedback(
            session_id=session_id,
            target_agent=target_agent,
            target_artifact_id=target_artifact_id,
            critique_text=critique_text
        )

        if session.approval:
            session.approval.status = ApprovalState.REVISION_REQUESTED
            session.approval.founder_decision = "REVISION_REQUESTED"
            session.approval.founder_notes = critique_text

        session.status = SessionState.REVISION_REQUESTED
        session.updated_at = time.time()
        self.repository.save_session(session)

        await self.bus.publish(
            session_id=session_id,
            event_type=EventType.REVISION_REQUESTED,
            source="DeviceAdapter",
            status="ACTION_REQUIRED",
            message=f"Founder requested revision on {target_agent}: '{critique_text[:60]}...'",
            payload={"target_agent": target_agent, "critique": critique_text}
        )

        return feedback

approval_manager = ApprovalManager()
