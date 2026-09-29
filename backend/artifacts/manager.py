import time
from pathlib import Path
from typing import List, Optional, Literal
from backend.core.models import Artifact, ArtifactState, ArtifactMetadata
from backend.tools.workspace import WorkspaceTool
from backend.events.bus import event_bus
from backend.events.models import EventType
from backend.storage.repository import session_repository

class ArtifactManager:
    """
    Manages session artifacts, enforcing file sandboxing, metadata extraction,
    and event emissions (ARTIFACT_CREATING, ARTIFACT_CREATED).
    """
    def __init__(self, repository=session_repository, bus=event_bus):
        self.repository = repository
        self.bus = bus

    async def create_artifact(
        self,
        session_id: str,
        artifact_id: str,
        artifact_type: Literal["research_brief", "product_requirements", "landing_page", "launch_strategy", "launch_package"],
        title: str,
        relative_path: str,
        created_by: str,
        content: str
    ) -> Artifact:
        # 1. Announce creation started
        await self.bus.publish(
            session_id=session_id,
            event_type=EventType.ARTIFACT_CREATING,
            source=created_by,
            status="RUNNING",
            message=f"Generating artifact: {title}",
            payload={"artifact_id": artifact_id, "type": artifact_type, "path": relative_path}
        )

        # 2. Write file safely to workspace
        file_path = WorkspaceTool.write_file(session_id, relative_path, content)
        
        # 3. Calculate metadata
        file_size = file_path.stat().st_size
        word_count = len(content.split())
        has_html = "<html" in content.lower() or "<!doctype html" in content.lower()
        snippet = content[:300].strip() + ("..." if len(content) > 300 else "")

        metadata = ArtifactMetadata(
            file_size_bytes=file_size,
            mime_type="text/html" if relative_path.endswith(".html") else "text/markdown",
            word_count=word_count,
            has_html_structure=has_html
        )

        artifact = Artifact(
            artifact_id=artifact_id,
            session_id=session_id,
            type=artifact_type,
            title=title,
            relative_path=relative_path,
            absolute_path=str(file_path),
            created_by=created_by,
            created_at=time.time(),
            status=ArtifactState.READY,
            preview_snippet=snippet,
            metadata=metadata
        )

        # 4. Save to session state
        session = self.repository.get_session(session_id)
        if session:
            session.artifacts[artifact_id] = artifact
            session.updated_at = time.time()
            self.repository.save_session(session)

        # 5. Announce creation completed
        await self.bus.publish(
            session_id=session_id,
            event_type=EventType.ARTIFACT_CREATED,
            source=created_by,
            status="COMPLETED",
            message=f"Artifact created: {title}",
            payload={
                "artifact_id": artifact_id,
                "type": artifact_type,
                "path": relative_path,
                "size_bytes": file_size
            }
        )

        return artifact

    def read_artifact_content(self, session_id: str, relative_path: str) -> str:
        return WorkspaceTool.read_file(session_id, relative_path)

    def get_artifact(self, session_id: str, artifact_id: str) -> Optional[Artifact]:
        session = self.repository.get_session(session_id)
        if not session:
            return None
        return session.artifacts.get(artifact_id)

    def list_artifacts(self, session_id: str) -> List[Artifact]:
        return self.repository.list_artifacts(session_id)

artifact_manager = ArtifactManager()
