from enum import Enum
from typing import Dict, Any, Literal
from pydantic import BaseModel, Field
import time
import uuid

class EventType(str, Enum):
    SESSION_CREATED = "SESSION_CREATED"
    GOAL_RECEIVED = "GOAL_RECEIVED"
    GOAL_PARSED = "GOAL_PARSED"
    TASK_CREATED = "TASK_CREATED"
    AGENT_QUEUED = "AGENT_QUEUED"
    AGENT_STARTED = "AGENT_STARTED"
    AGENT_PROGRESS = "AGENT_PROGRESS"
    AGENT_COMPLETED = "AGENT_COMPLETED"
    AGENT_FAILED = "AGENT_FAILED"
    TOOL_STARTED = "TOOL_STARTED"
    TOOL_COMPLETED = "TOOL_COMPLETED"
    CONTEXT_UPDATED = "CONTEXT_UPDATED"
    ARTIFACT_CREATING = "ARTIFACT_CREATING"
    ARTIFACT_CREATED = "ARTIFACT_CREATED"
    VERIFICATION_STARTED = "VERIFICATION_STARTED"
    VERIFICATION_PASSED = "VERIFICATION_PASSED"
    VERIFICATION_FAILED = "VERIFICATION_FAILED"
    APPROVAL_REQUESTED = "APPROVAL_REQUESTED"
    APPROVAL_APPROVED = "APPROVAL_APPROVED"
    REVISION_REQUESTED = "REVISION_REQUESTED"
    OFFICE_KIT_SYNC_STARTED = "OFFICE_KIT_SYNC_STARTED"
    OFFICE_KIT_SYNC_COMPLETED = "OFFICE_KIT_SYNC_COMPLETED"
    LAUNCH_READY = "LAUNCH_READY"

class OperationalEvent(BaseModel):
    id: str = Field(default_factory=lambda: f"evt_{uuid.uuid4().hex[:12]}")
    session_id: str
    timestamp: float = Field(default_factory=time.time)
    type: EventType
    source: str
    status: Literal["INFO", "RUNNING", "COMPLETED", "FAILED", "WARNING", "ACTION_REQUIRED"]
    message: str = Field(..., max_length=300)
    payload: Dict[str, Any] = Field(default_factory=dict)
