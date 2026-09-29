from typing import Optional, Literal
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from backend.core.models import Session, SharedCompanyContext
from backend.core.exceptions import SessionNotFoundError, StateConflictError
from backend.orchestrator.manager import udyam_manager
from backend.storage.repository import session_repository

router = APIRouter(prefix="/sessions", tags=["Sessions"])

class SessionCreateRequest(BaseModel):
    founder_name: str = Field(default="Founder", min_length=1, max_length=50)
    device_id: str = Field(default="iqoo_default", max_length=100)
    client_version: str = Field(default="1.0.0")

class GoalSubmissionRequest(BaseModel):
    raw_intent: str = Field(..., min_length=5, max_length=2000)
    modality: Literal["text", "voice", "camera", "multimodal"] = "text"
    language: str = Field(default="en")
    attachment_id: Optional[str] = None

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_session(req: SessionCreateRequest):
    session = await udyam_manager.create_session(
        founder_name=req.founder_name,
        device_id=req.device_id
    )
    return {
        "session_id": session.session_id,
        "status": session.status,
        "founder_name": session.founder_name,
        "created_at": session.created_at,
        "ws_url": f"/ws/sessions/{session.session_id}"
    }

@router.post("/{session_id}/goals", status_code=status.HTTP_202_ACCEPTED)
async def submit_goal(session_id: str, req: GoalSubmissionRequest):
    try:
        session = await udyam_manager.submit_goal(
            session_id=session_id,
            raw_intent=req.raw_intent,
            modality=req.modality,
            language=req.language,
            attachment_id=req.attachment_id
        )
        return {
            "session_id": session_id,
            "status": session.status,
            "message": "Goal received. Autonomous workforce dispatched.",
            "active_agent": "ResearchAgent"
        }
    except SessionNotFoundError:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")
    except StateConflictError as e:
        raise HTTPException(status_code=409, detail=str(e))

@router.get("/{session_id}")
async def get_session(session_id: str):
    session = session_repository.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")
    return session

@router.get("/{session_id}/context")
async def get_session_context(session_id: str):
    session = session_repository.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")
    return session.context
