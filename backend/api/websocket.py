import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from backend.events.bus import event_bus
from backend.events.models import OperationalEvent

logger = logging.getLogger(__name__)
ws_router = APIRouter()

class ConnectionManager:
    """Manages active WebSocket connections subscribed to sessions."""
    def __init__(self):
        self.active_connections: dict[str, set[WebSocket]] = {}

    async def connect(self, session_id: str, websocket: WebSocket):
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = set()
        self.active_connections[session_id].add(websocket)

    def disconnect(self, session_id: str, websocket: WebSocket):
        if session_id in self.active_connections:
            self.active_connections[session_id].discard(websocket)
            if not self.active_connections[session_id]:
                del self.active_connections[session_id]

    async def broadcast_to_session(self, session_id: str, event: OperationalEvent):
        sockets = list(self.active_connections.get(session_id, []))
        payload_text = event.model_dump_json()
        dead = []
        for ws in sockets:
            try:
                await ws.send_text(payload_text)
            except Exception:
                dead.append(ws)
        for dead_ws in dead:
            self.disconnect(session_id, dead_ws)

manager = ConnectionManager()

# Hook event bus to broadcast to WebSocket subscribers automatically
async def _ws_event_listener(event: OperationalEvent):
    await manager.broadcast_to_session(event.session_id, event)

@ws_router.websocket("/ws/sessions/{session_id}")
async def websocket_session_feed(websocket: WebSocket, session_id: str):
    await manager.connect(session_id, websocket)
    # Register bus subscriber for this session
    await event_bus.subscribe(session_id, _ws_event_listener)

    # Immediately push existing history so reconnected client catches up
    history = await event_bus.get_history(session_id)
    for past_event in history:
        try:
            await websocket.send_text(past_event.model_dump_json())
        except Exception:
            break

    try:
        while True:
            # Keep connection alive; client can send pings
            data = await websocket.receive_text()
            if data == "PING":
                await websocket.send_text('{"type":"PONG"}')
    except WebSocketDisconnect:
        manager.disconnect(session_id, websocket)
        await event_bus.unsubscribe(session_id, _ws_event_listener)
    except Exception as e:
        logger.warning(f"WebSocket error for {session_id}: {e}")
        manager.disconnect(session_id, websocket)
        await event_bus.unsubscribe(session_id, _ws_event_listener)
