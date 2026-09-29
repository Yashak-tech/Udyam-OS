from typing import Optional, Literal
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from backend.core.exceptions import StateConflictError
from backend.approvals.manager import approval_manager
from backend.orchestrator.manager import udyam_manager
from backend.storage.repository import session_repository

router = APIRouter(prefix="/sessions/{session_id}", tags=["Approvals"])

class ApprovalSubmissionRequest(BaseModel):
    decision: Literal["APPROVED"]
    founder_notes: Optional[str] = None

class FeedbackSubmissionRequest(BaseModel):
    target_agent: Literal["ResearchAgent", "ProductAgent", "BuilderAgent", "GrowthAgent"]
    critique_text: str = Field(..., min_length=3, max_length=1000)
    target_artifact: Optional[str] = None

@router.post("/approval", status_code=status.HTTP_200_OK)
async def submit_approval(session_id: str, req: ApprovalSubmissionRequest):
    try:
        launch_pkg = await approval_manager.submit_approval(
            session_id=session_id,
            decision=req.decision,
            founder_notes=req.founder_notes
        )
        return {
            "session_id": session_id,
            "status": "APPROVED",
            "message": "Launch package approved and finalized.",
            "launch_package": launch_pkg
        }
    except StateConflictError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/feedback", status_code=status.HTTP_202_ACCEPTED)
async def submit_feedback(session_id: str, req: FeedbackSubmissionRequest):
    try:
        feedback = await approval_manager.submit_feedback(
            session_id=session_id,
            target_agent=req.target_agent,
            critique_text=req.critique_text,
            target_artifact_id=req.target_artifact
        )
        # Re-trigger agent revision asynchronously
        import asyncio
        asyncio.create_task(udyam_manager.handle_feedback_revision(session_id, feedback))

        return {
            "session_id": session_id,
            "status": "REVISION_REQUESTED",
            "message": f"Feedback received. Re-running {req.target_agent}."
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
