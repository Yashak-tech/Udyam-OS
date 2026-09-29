from typing import Optional
from fastapi import APIRouter, HTTPException, Response, Query
from backend.storage.repository import session_repository
from backend.artifacts.manager import artifact_manager
from backend.tools.workspace import WorkspaceTool

router = APIRouter(prefix="/sessions/{session_id}/artifacts", tags=["Artifacts"])

@router.get("")
async def list_session_artifacts(session_id: str):
    session = session_repository.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")
    artifacts = artifact_manager.list_artifacts(session_id)
    return {"session_id": session_id, "artifacts": artifacts}

@router.get("/{artifact_id}")
async def get_artifact(
    session_id: str,
    artifact_id: str,
    raw: bool = Query(default=False, description="Return raw file content instead of JSON")
):
    session = session_repository.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")
    
    artifact = session.artifacts.get(artifact_id)
    if not artifact:
        raise HTTPException(status_code=404, detail=f"Artifact '{artifact_id}' not found")

    try:
        content = WorkspaceTool.read_file(session_id, artifact.relative_path)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Artifact file missing from workspace")

    if raw:
        media_type = "text/html" if artifact.relative_path.endswith(".html") else "text/markdown"
        return Response(content=content, media_type=media_type)

    return {
        "artifact": artifact,
        "content": content
    }
