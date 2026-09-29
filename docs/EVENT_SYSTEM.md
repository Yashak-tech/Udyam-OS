# Udyam OS — Real-Time Event System & WebSocket Protocol

**Version:** 1.0 (Phase 4 Specification)  
**Channel:** Native WebSockets  
**Endpoint:** `/ws/sessions/{session_id}`

---

## 1. Safety & Privacy Architecture: Safe Operational Events Only

A foundational principle of Udyam OS is that **internal chain-of-thought (CoT), raw LLM reasoning tokens, or scratchpad prompts are NEVER streamed or exposed over the WebSocket.**

### Why Raw Reasoning is Blocked:
1. **Mobile Bandwidth & Rendering:** Streaming token-by-token reasoning floods the mobile radio, drains battery, and degrades UI rendering on the phone.
2. **Executive Cognitive Load:** A founder does not want to read an LLM's messy internal dialogue; they need crisp, executive-grade progress updates, decisive action logs, and tangible business artifacts.
3. **Security & IP:** Keeps prompt engineering and proprietary domain instructions isolated in the backend.

### What is Streamed Instead:
Only sanitized **Operational Events** (`AGENT_STARTED`, `TOOL_COMPLETED`, `ARTIFACT_CREATED`, `APPROVAL_REQUESTED`) featuring high-level, human-readable summaries and lightweight telemetry payloads.

---

## 2. Universal Operational Event Envelope

Every event dispatched over the WebSocket follows this strict JSON schema:

```json
{
  "id": "evt_01HXZ9Y8AB7CDEF",
  "session_id": "sess_01HXZ9Y8AB7CDEF",
  "timestamp": 1727615025.412,
  "type": "AGENT_STARTED",
  "source": "ResearchAgent",
  "status": "RUNNING",
  "message": "Research Agent analyzing market opportunity and competitors",
  "payload": {
    "agent_name": "ResearchAgent",
    "stage": 1,
    "total_stages": 4,
    "details": {
      "focus": "Identifying direct competitors in Tier-2 Indian agri-market"
    }
  }
}
```

### TypeScript / Pydantic Interface:
```python
class OperationalEvent(BaseModel):
    id: str = Field(default_factory=lambda: f"evt_{uuid.uuid4().hex[:12]}")
    session_id: str
    timestamp: float = Field(default_factory=time.time)
    type: EventType
    source: str = Field(..., description="e.g. UdyamManager, ResearchAgent, DeviceAdapter")
    status: Literal["INFO", "RUNNING", "COMPLETED", "FAILED", "WARNING", "ACTION_REQUIRED"]
    message: str = Field(..., max_length=200, description="Clean executive summary string")
    payload: Dict[str, Any] = Field(default_factory=dict, description="Compact data dictionary")
```

---

## 3. Enumerated Operational Event Catalog

| Event Type | Source | Typical Status | Purpose / Mobile UI Reaction | Payload Summary |
| :--- | :--- | :--- | :--- | :--- |
| `SESSION_CREATED` | `UdyamManager` | `INFO` | Workspace initialized; phone displays ready state. | `{"founder_name": "Yash"}` |
| `GOAL_RECEIVED` | `DeviceAdapter`| `INFO` | Audio/Text received from phone; shows parsing spinner. | `{"modality": "voice"}` |
| `GOAL_PARSED` | `UdyamManager` | `COMPLETED` | Extracted problem & solution; sets project name on screen. | `{"project_name": "AgroPulse"}` |
| `TASK_CREATED` | `UdyamManager` | `INFO` | Stages populated; mobile progress stepper illuminates. | `{"stage_count": 4}` |
| `AGENT_QUEUED` | `UdyamManager` | `INFO` | Agent next in queue; stage icon pulses. | `{"agent": "ResearchAgent"}` |
| `AGENT_STARTED` | `Agent` | `RUNNING` | Agent begins execution; avatar animates. | `{"stage": 1, "agent": "ResearchAgent"}`|
| `AGENT_PROGRESS` | `Agent` | `RUNNING` | Step milestone reached; updates progress percentage. | `{"step": 2, "max_steps": 5}` |
| `AGENT_COMPLETED` | `Agent` | `COMPLETED` | Agent finished its task; checkmark displays. | `{"duration_sec": 12.4}` |
| `AGENT_FAILED` | `Agent` | `FAILED` | Agent encountered non-fatal error; logs warning. | `{"error": "Timeout", "retry": true}` |
| `TOOL_STARTED` | `Agent` | `RUNNING` | Tool invoked; shows action chip (e.g. "Browsing market"). | `{"tool_name": "web_search"}` |
| `TOOL_COMPLETED` | `Agent` | `COMPLETED` | Tool output recorded; chip turns green. | `{"tool_name": "web_search", "results": 3}`|
| `CONTEXT_UPDATED` | `UdyamManager` | `INFO` | Shared company context updated with new section. | `{"section": "market_context"}` |
| `ARTIFACT_CREATING`| `Agent` | `RUNNING` | File generation initiated; shows drafting placeholder. | `{"artifact_type": "landing_page"}` |
| `ARTIFACT_CREATED` | `Agent` | `COMPLETED` | File written to disk; generates clickable mobile preview. | `{"artifact_id": "art_landing_page", "path": "landing_page/index.html"}` |
| `VERIFICATION_STARTED` | `VerificationEngine` | `RUNNING` | Quality audit running across all outputs. | `{"checks_count": 3}` |
| `VERIFICATION_PASSED` | `VerificationEngine` | `COMPLETED` | All criteria satisfied; reveals success badge. | `{"score": "100%", "errors": 0}` |
| `VERIFICATION_FAILED` | `VerificationEngine` | `WARNING` | Quality issue detected; triggers auto-correction. | `{"retry_agent": "BuilderAgent"}` |
| `APPROVAL_REQUESTED` | `UdyamManager` | `ACTION_REQUIRED` | **THE iQOO MOMENT:** Phone vibrates; pops up Approval Card. | `{"preview_url": "/artifacts/...", "summary": "..."}` |
| `APPROVAL_APPROVED` | `DeviceAdapter`| `COMPLETED` | Founder tapped "Approve"; locks session. | `{"approved_by": "Founder"}` |
| `REVISION_REQUESTED`| `DeviceAdapter`| `ACTION_REQUIRED` | Founder requested edit; restarts target stage. | `{"target_agent": "BuilderAgent"}` |
| `OFFICE_KIT_SYNC_STARTED` | `OfficeKit` | `RUNNING` | Desktop sync triggered; laptop screen prepares to launch. | `{"target_device": "laptop"}` |
| `OFFICE_KIT_SYNC_COMPLETED` | `OfficeKit` | `COMPLETED` | Laptop opened browser & primed workspace files. | `{"desktop_url": "..."}` |
| `LAUNCH_READY` | `UdyamManager` | `COMPLETED` | Pipeline complete; displays final launch manifest. | `{"package_id": "pkg_01"}` |

---

## 4. WebSocket Protocol Details

### 4.1 Connection & Route
* **Endpoint:** `GET /ws/sessions/{session_id}` (Upgraded to WebSocket connection).
* **Auth Assumption:** Single-founder prototype mode. Supplying an active `session_id` authenticates the subscriber.

### 4.2 In-Memory Pub/Sub Architecture
```python
class ConnectionManager:
    def __init__(self):
        # Maps session_id to set of active WebSocket clients (phone + laptop)
        self.active_connections: Dict[str, Set[WebSocket]] = defaultdict(set)

    async def connect(self, session_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[session_id].add(websocket)

    def disconnect(self, session_id: str, websocket: WebSocket):
        if session_id in self.active_connections:
            self.active_connections[session_id].discard(websocket)

    async def broadcast(self, session_id: str, event: OperationalEvent):
        payload_str = event.model_dump_json()
        dead_sockets = set()
        for ws in self.active_connections.get(session_id, []):
            try:
                await ws.send_text(payload_str)
            except Exception:
                dead_sockets.add(ws)
        for dead_ws in dead_sockets:
            self.disconnect(session_id, dead_ws)
```

### 4.3 Heartbeat & Liveness Policy
- **Server Ping:** The server issues an empty ping frame every 30 seconds: `{"type": "PING"}`.
- **Client Pong:** The client responds with `{"type": "PONG"}` within 10 seconds. If missing, socket is cleanly recycled.

### 4.4 Reconnection & Resiliency Policy
- If the phone drops cellular/Wi-Fi signal, the client UI retains its last rendered state without blanking out.
- The mobile client executes exponential backoff reconnects: 1s, 2s, 4s, up to 10s.
- Upon reconnecting, the client immediately issues `GET /api/v1/sessions/{session_id}/context` to catch up on any events dispatched during disconnection.
