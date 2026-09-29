from pathlib import Path
from backend.core.config import settings
from backend.core.exceptions import PathTraversalError

class WorkspaceTool:
    """
    Sandboxed workspace tool for file reading and writing within a session directory.
    Guarantees no agent can write outside artifacts/sessions/{session_id}/.
    """
    @staticmethod
    def get_session_dir(session_id: str) -> Path:
        session_dir = (settings.ARTIFACTS_DIR / session_id).resolve()
        session_dir.mkdir(parents=True, exist_ok=True)
        return session_dir

    @classmethod
    def resolve_safe_path(cls, session_id: str, relative_path: str) -> Path:
        session_dir = cls.get_session_dir(session_id)
        target_path = (session_dir / relative_path).resolve()
        
        # Guard against directory traversal attacks (e.g. ../../)
        if not str(target_path).startswith(str(session_dir)):
            raise PathTraversalError(relative_path)
            
        return target_path

    @classmethod
    def write_file(cls, session_id: str, relative_path: str, content: str) -> Path:
        target_path = cls.resolve_safe_path(session_id, relative_path)
        target_path.parent.mkdir(parents=True, exist_ok=True)
        target_path.write_text(content, encoding="utf-8")
        return target_path

    @classmethod
    def read_file(cls, session_id: str, relative_path: str) -> str:
        target_path = cls.resolve_safe_path(session_id, relative_path)
        if not target_path.exists():
            raise FileNotFoundError(f"File not found: {relative_path}")
        return target_path.read_text(encoding="utf-8")

    @classmethod
    def file_exists(cls, session_id: str, relative_path: str) -> bool:
        try:
            target_path = cls.resolve_safe_path(session_id, relative_path)
            return target_path.exists()
        except PathTraversalError:
            return False
