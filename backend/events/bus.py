import asyncio
from typing import Dict, Set, Callable, Awaitable, List
from collections import defaultdict
from backend.events.models import OperationalEvent, EventType

SubscriberCallback = Callable[[OperationalEvent], Awaitable[None]]

class EventBus:
    """
    Session-scoped event bus with in-memory subscriber dispatching and history retention.
    Ensures safe operational events only are broadcast.
    """
    def __init__(self):
        self._subscribers: Dict[str, Set[SubscriberCallback]] = defaultdict(set)
        self._history: Dict[str, List[OperationalEvent]] = defaultdict(list)
        self._lock = asyncio.Lock()

    async def subscribe(self, session_id: str, callback: SubscriberCallback):
        async with self._lock:
            self._subscribers[session_id].add(callback)

    async def unsubscribe(self, session_id: str, callback: SubscriberCallback):
        async with self._lock:
            if session_id in self._subscribers:
                self._subscribers[session_id].discard(callback)

    async def publish(
        self,
        session_id: str,
        event_type: EventType,
        source: str,
        status: str,
        message: str,
        payload: dict = None
    ) -> OperationalEvent:
        event = OperationalEvent(
            session_id=session_id,
            type=event_type,
            source=source,
            status=status,
            message=message,
            payload=payload or {}
        )
        
        async with self._lock:
            self._history[session_id].append(event)
            callbacks = list(self._subscribers.get(session_id, set()))

        for cb in callbacks:
            try:
                await cb(event)
            except Exception:
                # Do not let one failing subscriber break the event pipeline
                pass

        return event

    async def get_history(self, session_id: str) -> List[OperationalEvent]:
        async with self._lock:
            return list(self._history.get(session_id, []))

# Global singleton event bus
event_bus = EventBus()
