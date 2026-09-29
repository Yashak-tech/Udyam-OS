import sqlite3
import json
from pathlib import Path
from typing import Optional, List
from backend.core.config import settings
from backend.core.models import Session, Artifact, SessionState

class SessionRepository:
    """
    SQLite-backed persistence repository for Udyam OS sessions and artifacts.
    No orchestration logic; strictly persistence and retrieval.
    """
    def __init__(self, db_path: Path = settings.STORAGE_DB_PATH):
        self.db_path = db_path
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._get_connection() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS sessions (
                    session_id TEXT PRIMARY KEY,
                    status TEXT NOT NULL,
                    founder_name TEXT,
                    device_id TEXT,
                    data TEXT NOT NULL,
                    created_at REAL NOT NULL,
                    updated_at REAL NOT NULL
                )
            """)
            conn.execute("""
                CREATE TABLE IF NOT EXISTS artifacts (
                    artifact_id TEXT PRIMARY KEY,
                    session_id TEXT NOT NULL,
                    type TEXT NOT NULL,
                    title TEXT NOT NULL,
                    relative_path TEXT NOT NULL,
                    absolute_path TEXT NOT NULL,
                    data TEXT NOT NULL,
                    created_at REAL NOT NULL,
                    FOREIGN KEY (session_id) REFERENCES sessions(session_id)
                )
            """)
            conn.commit()

    def create_session(self, session: Session) -> Session:
        with self._get_connection() as conn:
            conn.execute(
                """
                INSERT INTO sessions (session_id, status, founder_name, device_id, data, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    session.session_id,
                    session.status.value,
                    session.founder_name,
                    session.device_id,
                    session.model_dump_json(),
                    session.created_at,
                    session.updated_at
                )
            )
            conn.commit()
        return session

    def get_session(self, session_id: str) -> Optional[Session]:
        with self._get_connection() as conn:
            row = conn.execute(
                "SELECT data FROM sessions WHERE session_id = ?",
                (session_id,)
            ).fetchone()
            if not row:
                return None
            data = json.loads(row["data"])
            return Session.model_validate(data)

    def save_session(self, session: Session) -> Session:
        with self._get_connection() as conn:
            # Upsert into sessions
            conn.execute(
                """
                INSERT INTO sessions (session_id, status, founder_name, device_id, data, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(session_id) DO UPDATE SET
                    status=excluded.status,
                    data=excluded.data,
                    updated_at=excluded.updated_at
                """,
                (
                    session.session_id,
                    session.status.value,
                    session.founder_name,
                    session.device_id,
                    session.model_dump_json(),
                    session.created_at,
                    session.updated_at
                )
            )
            # Sync artifacts table
            for art in session.artifacts.values():
                conn.execute(
                    """
                    INSERT INTO artifacts (artifact_id, session_id, type, title, relative_path, absolute_path, data, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    ON CONFLICT(artifact_id) DO UPDATE SET
                        session_id=excluded.session_id,
                        type=excluded.type,
                        title=excluded.title,
                        relative_path=excluded.relative_path,
                        absolute_path=excluded.absolute_path,
                        data=excluded.data,
                        created_at=excluded.created_at
                    """,
                    (
                        art.artifact_id,
                        art.session_id,
                        art.type,
                        art.title,
                        art.relative_path,
                        art.absolute_path,
                        art.model_dump_json(),
                        art.created_at
                    )
                )
            conn.commit()
        return session

    def update_session(self, session: Session) -> Session:
        return self.save_session(session)

    def list_artifacts(self, session_id: str) -> List[Artifact]:
        session = self.get_session(session_id)
        if session and session.artifacts:
            return list(session.artifacts.values())
        with self._get_connection() as conn:
            rows = conn.execute(
                "SELECT data FROM artifacts WHERE session_id = ? ORDER BY created_at ASC",
                (session_id,)
            ).fetchall()
            return [Artifact.model_validate(json.loads(row["data"])) for row in rows]

# Global singleton repository
session_repository = SessionRepository()
