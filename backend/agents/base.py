from abc import ABC, abstractmethod
from typing import Dict, Any, List
from backend.core.models import SharedCompanyContext, Artifact
from backend.events.bus import EventBus, event_bus
from backend.events.models import EventType
from backend.core.config import settings

class BaseWorkforceAgent(ABC):
    """
    Abstract base class for all Udyam OS workforce agents.
    Enforces bounded step loops, tool restrictions, event publishing,
    and communication strictly through the SharedCompanyContext.
    """
    def __init__(
        self,
        name: str,
        role: str,
        description: str,
        allowed_tools: List[str],
        max_steps: int = settings.AGENT_MAX_STEPS,
        timeout_seconds: int = settings.AGENT_TIMEOUT_SECONDS
    ):
        self.name = name
        self.role = role
        self.description = description
        self.allowed_tools = allowed_tools
        self.max_steps = max_steps
        self.timeout_seconds = timeout_seconds

    @abstractmethod
    def validate_input(self, context: SharedCompanyContext) -> bool:
        """Ensures all necessary upstream context fields exist before executing."""
        pass

    @abstractmethod
    async def run(
        self,
        session_id: str,
        context: SharedCompanyContext,
        bus: EventBus = event_bus
    ) -> Dict[str, Any]:
        """
        Executes the agent's bounded step loop, updates the shared company context,
        and generates the required file artifact.
        """
        pass

    async def publish_event(
        self,
        bus: EventBus,
        session_id: str,
        event_type: EventType,
        status: str,
        message: str,
        payload: dict = None
    ):
        """Dispatches an operational event to the event bus."""
        await bus.publish(
            session_id=session_id,
            event_type=event_type,
            source=self.name,
            status=status,
            message=message,
            payload=payload or {}
        )
