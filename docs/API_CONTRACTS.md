# Udyam OS — API Contracts & Protocol Specification

**Version:** 1.0 (Phase 4 Contract Specification)  
**Base URL:** `http://localhost:8000/api/v1`  
**WebSocket URL:** `ws://localhost:8000/ws/sessions/{session_id}`  
**Content-Type:** `application/json` (except file upload endpoints)

---

## 1. General Principles & Error Envelope

All error responses across all REST endpoints adhere to a standard error structure:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Session with id 'sess_12345' was not found",
    "details": {},
    "timestamp": 1727615000.123
  }
}
```

Standard HTTP Status Codes:
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully created.
- `202 Accepted`: Asynchronous task / pipeline step accepted for background execution.
- `400 Bad Request`: Validation failure or malformed payload.
- `404 Not Found`: Session or artifact does not exist.
- `409 Conflict`: State machine violation (e.g. attempting to approve a session not in `AWAITING_APPROVAL`).
- `422 Unprocessable Entity`: Pydantic schema validation failure.
- `500 Internal Server Error`: Unhandled server exception.

---

## 2. Session Management Endpoints

### 2.1 Create New Session
* **Method:** `POST`
* **Path:** `/api/v1/sessions`
* **Purpose:** Initializes a new company workspace session and sets status to `CREATED`.

**Request Body:**
```json
{
  "founder_name": "Yash",
  "device_id": "iqoo_neo_9_pro_001",
  "client_version": "1.0.0"
}
```

**Pydantic Schema:**
```python
class SessionCreateRequest(BaseModel):
    founder_name: str = Field(default="Founder", min_length=1, max_length=50)
    device_id: str = Field(default="iqoo_default", max_length=100)
    client_version: str = Field(default="1.0.0")
```

**Response Body (`201 Created`):**
```json
{
  "session_id": "sess_01HXZ9Y8AB7CDEF",
  "status": "CREATED",
  "founder_name": "Yash",
  "created_at": 1727615000.0,
  "ws_url": "ws://localhost:8000/ws/sessions/sess_01HXZ9Y8AB7CDEF"
}
```

---

### 2.2 Submit Business Goal (Triggers Pipeline)
* **Method:** `POST`
* **Path:** `/api/v1/sessions/{session_id}/goals`
* **Purpose:** Ingests founder business concept and launches the asynchronous `IDEA → LAUNCH` workforce pipeline. Transitions session to `RUNNING`.

**Request Body:**
```json
{
  "raw_intent": "An AI crop health diagnosis app with 1-click fertilizer store orders for small Indian farmers.",
  "modality": "voice",
  "language": "en-IN",
  "camera_attachment_id": null
}
```

**Pydantic Schema:**
```python
class GoalSubmissionRequest(BaseModel):
    raw_intent: str = Field(..., min_length=5, max_length=2000)
    modality: Literal["text", "voice", "camera", "multimodal"] = "text"
    language: str = Field(default="en")
    camera_attachment_id: Optional[str] = None
```

**Response Body (`202 Accepted`):**
```json
{
  "session_id": "sess_01HXZ9Y8AB7CDEF",
  "status": "RUNNING",
  "current_stage": "RESEARCH",
  "active_agent": "ResearchAgent",
  "message": "Goal received. Research Agent dispatched."
}
```

**Error Responses:**
- `404 Not Found`: Session does not exist.
- `409 Conflict`: Goal already submitted and pipeline is currently running.

---

### 2.3 Get Session Status & State
* **Method:** `GET`
* **Path:** `/api/v1/sessions/{session_id}`
* **Purpose:** Retrieves full session snapshot, active agent, stage progression, and errors.

**Request Body:** None.

**Response Body (`200 OK`):**
```json
{
  "session_id": "sess_01HXZ9Y8AB7CDEF",
  "status": "RUNNING",
  "current_stage": "PRODUCT",
  "active_agent": "ProductAgent",
  "project_name": "AgroPulse",
  "created_at": 1727615000.0,
  "updated_at": 1727615032.0,
  "artifacts_count": 1,
  "stages_completed": ["RESEARCH"]
}
```

---

### 2.4 Get Shared Company Context
* **Method:** `GET`
* **Path:** `/api/v1/sessions/{session_id}/context`
* **Purpose:** Retrieves the current state of the `SharedCompanyContext` accumulated by the workforce.

**Request Body:** None.

**Response Body (`200 OK`):**
```json
{
  "session_id": "sess_01HXZ9Y8AB7CDEF",
  "project_name": "AgroPulse",
  "tagline": "AI Crop Diagnosis & Instant Marketplace for Indian Farmers",
  "founder_intent": {
    "raw_input": "An AI crop health diagnosis app...",
    "modality": "voice"
  },
  "market_context": {
    "target_icp": "Smallholder farmers (1-5 acres) in Tier 2/3 rural belts",
    "core_pain": "40% crop loss due to delayed disease identification",
    "competitors": ["Plantix", "KisanSuvidha", "AgroStar"],
    "market_gap": "Hyper-local vernacular audio guidance + direct input supply linking"
  },
  "product_context": {
    "mvp_scope": ["Photo diagnosis", "Audio remedy advisory", "1-click local supplier call"],
    "user_flow": ["Snap Leaf Photo", "Get Diagnosis in 3s", "Order Remedy or Call Dealer"]
  },
  "brand_context": {
    "primary_color": "#10B981",
    "accent_color": "#F59E0B"
  },
  "growth_context": {
    "launch_channels": ["WhatsApp farmer groups", "Krishi Vigyan Kendra demo"]
  },
  "updated_at": 1727615045.0
}
```

---

## 3. Artifact Management Endpoints

### 3.1 List All Session Artifacts
* **Method:** `GET`
* **Path:** `/api/v1/sessions/{session_id}/artifacts`
* **Purpose:** Returns list of all generated deliverables and their statuses.

**Request Body:** None.

**Response Body (`200 OK`):**
```json
{
  "session_id": "sess_01HXZ9Y8AB7CDEF",
  "artifacts": [
    {
      "artifact_id": "art_research_brief",
      "type": "research_brief",
      "title": "Market & Competitor Analysis",
      "status": "READY",
      "file_path": "artifacts/sessions/sess_01HXZ9Y8AB7CDEF/research_brief.md",
      "created_by": "ResearchAgent",
      "created_at": 1727615020.0
    },
    {
      "artifact_id": "art_product_requirements",
      "type": "product_requirements",
      "title": "Product Requirements Document (PRD)",
      "status": "READY",
      "file_path": "artifacts/sessions/sess_01HXZ9Y8AB7CDEF/product_requirements.md",
      "created_by": "ProductAgent",
      "created_at": 1727615040.0
    },
    {
      "artifact_id": "art_landing_page",
      "type": "landing_page",
      "title": "Interactive Landing Page",
      "status": "READY",
      "file_path": "artifacts/sessions/sess_01HXZ9Y8AB7CDEF/landing_page/index.html",
      "created_by": "BuilderAgent",
      "created_at": 1727615060.0
    },
    {
      "artifact_id": "art_launch_strategy",
      "type": "launch_strategy",
      "title": "Go-To-Market & Launch Playbook",
      "status": "READY",
      "file_path": "artifacts/sessions/sess_01HXZ9Y8AB7CDEF/launch_strategy.md",
      "created_by": "GrowthAgent",
      "created_at": 1727615075.0
    }
  ]
}
```

---

### 3.2 Get Specific Artifact Content / Raw File
* **Method:** `GET`
* **Path:** `/api/v1/sessions/{session_id}/artifacts/{artifact_id}`
* **Query Params:** `?raw=true|false` (default: `false`)
* **Purpose:** Returns artifact metadata and content string (or raw HTML/CSS file stream if `raw=true`).

**Response Body (`200 OK` when `raw=false`):**
```json
{
  "artifact_id": "art_landing_page",
  "type": "landing_page",
  "title": "Interactive Landing Page",
  "status": "READY",
  "content": "<!DOCTYPE html><html><head>...</head><body>...</body></html>",
  "preview_url": "/api/v1/sessions/sess_01HXZ9Y8AB7CDEF/artifacts/art_landing_page?raw=true",
  "metadata": {
    "viewport": "width=device-width, initial-scale=1.0",
    "theme": "dark-glassmorphism",
    "has_css": true
  }
}
```

---

## 4. Human Approval & Feedback Endpoints

### 4.1 Founder Approval Submission
* **Method:** `POST`
* **Path:** `/api/v1/sessions/{session_id}/approval`
* **Purpose:** Founder submits final approval from the iQOO phone. Locks context and initiates the Office Kit sync flow.

**Request Body:**
```json
{
  "decision": "APPROVED",
  "founder_notes": "Approved from iQOO phone. Ready for launch sync.",
  "approved_at": 1727615100.0
}
```

**Pydantic Schema:**
```python
class ApprovalSubmissionRequest(BaseModel):
    decision: Literal["APPROVED"]
    founder_notes: Optional[str] = None
    approved_at: float = Field(default_factory=time.time)
```

**Response Body (`200 OK`):**
```json
{
  "session_id": "sess_01HXZ9Y8AB7CDEF",
  "status": "APPROVED",
  "message": "Launch package approved. Office Kit sync initiated.",
  "office_kit_synced": true
}
```

**Error Responses:**
- `409 Conflict`: Session is not in `AWAITING_APPROVAL` status.

---

### 4.2 Founder Feedback / Revision Request
* **Method:** `POST`
* **Path:** `/api/v1/sessions/{session_id}/feedback`
* **Purpose:** Founder requests changes on the iQOO phone. Re-engages the target agent for a single bounded refinement.

**Request Body:**
```json
{
  "target_agent": "BuilderAgent",
  "feedback_text": "Make the free diagnosis CTA button much larger and highlight zero-cost trial.",
  "target_artifact": "art_landing_page"
}
```

**Pydantic Schema:**
```python
class FeedbackSubmissionRequest(BaseModel):
    target_agent: Literal["ResearchAgent", "ProductAgent", "BuilderAgent", "GrowthAgent"]
    feedback_text: str = Field(..., min_length=3, max_length=1000)
    target_artifact: Optional[str] = None
```

**Response Body (`202 Accepted`):**
```json
{
  "session_id": "sess_01HXZ9Y8AB7CDEF",
  "status": "REVISION_REQUESTED",
  "reassigned_to": "BuilderAgent",
  "message": "Feedback received. Re-running Builder Agent for refinement."
}
```

---

## 5. Device Input Endpoints

### 5.1 Voice Input Ingestion
* **Method:** `POST`
* **Path:** `/api/v1/input/voice`
* **Content-Type:** `multipart/form-data`
* **Purpose:** Receives audio file recorded on iQOO phone, transcribes to text, and returns parsed intent.

**Form Data:**
- `audio_file`: Binary audio stream (`.webm`, `.mp4`, or `.wav`).
- `language`: String (`"en"`, `"hi"`, etc.).

**Response Body (`200 OK`):**
```json
{
  "transcript": "Build AgroPulse an AI crop health diagnosis app for small farmers with local fertilizer store ordering.",
  "confidence": 0.96,
  "duration_seconds": 6.4
}
```

---

### 5.2 Camera / Sketch Input Ingestion
* **Method:** `POST`
* **Path:** `/api/v1/input/camera`
* **Content-Type:** `multipart/form-data`
* **Purpose:** Receives whiteboard napkin sketch or document image captured by iQOO camera and extracts visual context.

**Form Data:**
- `image_file`: Binary image (`.jpg`, `.png`).
- `caption`: Optional user note.

**Response Body (`200 OK`):**
```json
{
  "attachment_id": "att_cam_01HXZ9Y8ABC",
  "extracted_context": "Handwritten diagram showing 3-step farmer app: 1) Leaf photo, 2) Disease label, 3) Call shopkeeper.",
  "preview_url": "/api/v1/input/attachments/att_cam_01HXZ9Y8ABC"
}
```

---

## 6. Office Kit Bridge Endpoint

### 6.1 Trigger Office Kit Desktop Sync
* **Method:** `POST`
* **Path:** `/api/v1/office-kit/sync`
* **Purpose:** Explicitly pushes session launch bundle to connected laptop desktop client, launching the browser and local directory.

**Request Body:**
```json
{
  "session_id": "sess_01HXZ9Y8AB7CDEF",
  "target_screen": "primary_laptop",
  "auto_open_browser": true
}
```

**Response Body (`200 OK`):**
```json
{
  "session_id": "sess_01HXZ9Y8AB7CDEF",
  "sync_status": "COMPLETED",
  "desktop_url": "http://localhost:8000/artifacts/sessions/sess_01HXZ9Y8AB7CDEF/landing_page/index.html",
  "workspace_path": "./artifacts/sessions/sess_01HXZ9Y8AB7CDEF",
  "message": "Desktop synchronized successfully."
}
```

---

## 7. WebSocket Contract (`/ws/sessions/{session_id}`)

### 7.1 Lifecycle & Connection Policy
- **URL:** `ws://localhost:8000/ws/sessions/{session_id}`
- **Authentication:** In prototype mode, passing valid `session_id` grants read-only subscription to that session's operational event stream.
- **Heartbeat:** Server sends a ping frame every 30 seconds (`{"type": "PING"}`); client responds with `{"type": "PONG"}`.
- **Reconnection:** Client automatically attempts reconnect with exponential backoff (1s, 2s, 4s, up to 10s max). On reconnect, client may fetch `GET /sessions/{id}/context` to catch up on missed state.

### 7.2 Safe Event Frame Payload
The server pushes JSON text frames complying with the `OperationalEvent` schema:

```json
{
  "id": "evt_01HXZABC1234",
  "session_id": "sess_01HXZ9Y8AB7CDEF",
  "timestamp": 1727615020.15,
  "type": "AGENT_STARTED",
  "source": "ResearchAgent",
  "status": "RUNNING",
  "message": "Research Agent is analyzing competitors in agricultural AI sector",
  "payload": {
    "agent": "ResearchAgent",
    "step": 1,
    "max_steps": 5
  }
}
```
*(Complete event types defined in `docs/EVENT_SYSTEM.md`)*
