# Udyam OS — System Architecture Specification

**Project:** Udyam OS  
**Milestone:** Production-Ready Working Prototype  
**Status:** System Architecture Blueprint

---

## 1. Architectural Philosophy & Principles

Udyam OS is engineered around seven core principles that establish clear domain boundaries and prevent the system from degenerating into an uncontrolled, generic chatbot:

1. **iQOO Phone = Command Center:** The mobile phone is the active executive controller capturing voice/camera intent, tracking live progress, rendering artifact previews, and acting as the human gatekeeper.
2. **Udyam Manager = Orchestrator:** A single, deterministic async state engine governs task sequencing, lifecycle transitions, and event dispatching.
3. **AI Workforce = Execution Team:** Exactly 4 specialized agent roles (Research, Product, Builder, Growth), each bounded by strict step and timeout limits.
4. **Shared Context = Company Memory:** A structured, persistent domain state that accumulates company knowledge across stages; agents read from and contribute to this repository instead of chatting with each other.
5. **Artifacts = Business Outputs:** The tangible deliverables of the workforce (`research_brief.md`, `product_requirements.md`, `landing_page/index.html`, `launch_strategy.md`), persisted directly on disk.
6. **Verification = Quality Control:** Automated validation gate auditing schema completeness, syntax validity, and inter-artifact coherence prior to founder escalation.
7. **Founder Approval = Human Authority:** Explicit human-in-the-loop sign-off on the iQOO phone before launch assets are deployed or finalized.
8. **Office Kit = Phone-to-Laptop Bridge:** A real-time cross-device sync protocol connecting mobile executive decisions to desktop developer/launch workstations.

---

## 2. End-to-End System Topology

```
┌────────────────────────────────────────────────────────────────────────┐
│                          iQOO SMARTPHONE                               │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     Udyam Mobile Client (PWA)                    │  │
│  │   • Voice Recorder / Transcription Bridge                        │  │
│  │   • Camera Capture & Sketch Uploader                             │  │
│  │   • Real-Time Event Timeline (Tactile Cards)                     │  │
│  │   • In-App Responsive Artifact Viewer (Iframe Sandbox)           │  │
│  │   • High-Priority Approval Gate Dialog & Haptic Feedback         │  │
│  └───────────────────▲──────────────────────────────┬───────────────┘  │
└──────────────────────┼──────────────────────────────┼──────────────────┘
            WebSocket  │ (JSON Events)                │ HTTP REST
           /ws/sessions│                              │ (POST / GET)
┌──────────────────────┴──────────────────────────────▼──────────────────┐
│                         UDYAM OS BACKEND                               │
│                         (FastAPI Service)                              │
│                                                                        │
│  ┌───────────────────────┐             ┌────────────────────────────┐  │
│  │      API Gateway      │             │     WebSocket Event Hub    │  │
│  │   (Routes & Schemas)  │             │   (Safe Broadcast Channel) │  │
│  └───────────┬───────────┘             └────────────▲───────────────┘  │
│              │                                      │                  │
│  ┌───────────▼──────────────────────────────────────┴───────────────┐  │
│  │                      Udyam Manager Engine                        │  │
│  │               (Linear State DAG & Orchestrator)                  │  │
│  └───────┬──────────────────────┬──────────────────────┬────────────┘  │
│          │                      │                      │               │
│  ┌───────▼───────────┐  ┌───────▼───────────┐  ┌───────▼────────────┐  │
│  │   Shared Company  │  │   AI Workforce    │  │    Verification    │  │
│  │   Context Store   │  │   (4 Agents)      │  │    Engine          │  │
│  │  (In-Memory/File) │  │ • Research Agent  │  │ • Schema validator │  │
│  └───────────────────┘  │ • Product Agent   │  │ • HTML / CSS check │  │
│                         │ • Builder Agent   │  │ • Coherence audit  │  │
│                         │ • Growth Agent    │  └────────────────────┘  │
│                         └───────┬───────────┘                          │
│                                 │                                      │
│  ┌──────────────────────────────▼───────────────────────────────────┐  │
│  │                     Tool & Workspace Layer                       │  │
│  │    `artifacts/{session_id}/` (Real Deliverables & Web Files)     │  │
│  └──────────────────────────────┬───────────────────────────────────┘  │
│                                 │ Office Kit Sync Signal               │
└─────────────────────────────────┼──────────────────────────────────────┘
                                  │ (Local WS / HTTP)
┌─────────────────────────────────▼──────────────────────────────────────┐
│                            LAPTOP WORKSPACE                            │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                   Office Kit Desktop Receiver                    │  │
│  │   • Automatic Launch of Generated Landing Page in Browser        │  │
│  │   • Local Folder Primed with `artifacts/{session_id}/`           │  │
│  │   • Desktop Notification: "Founder Approved AgroPulse"           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack Decisions & Constraints

### 3.1 Frontend (Mobile-First Web / PWA)
- **Framework:** React 18 + Vite.
- **Styling:** Tailwind CSS + Vanilla CSS variables for high-contrast dark mode, glassmorphism, and responsive mobile viewport scaling.
- **Audio / Vision:** Web MediaRecorder API / Web Speech API + HTML5 file input with `capture="environment"` for direct iQOO camera activation.
- **Target Form Factor:** Calibrated for mobile viewport (390px - 430px width) with desktop companion view for Office Kit display.

### 3.2 Backend (FastAPI + Async Python)
- **Framework:** Python 3.11+ with FastAPI.
- **Concurrency:** Native `asyncio` for non-blocking agent step execution and WebSocket client broadcasts.
- **Data Validation:** Pydantic v2 schemas for all API payloads, internal events, and agent contracts.
- **Communication:** HTTP REST for command/query endpoints; native WebSockets (`FastAPI.WebSocket`) for bi-directional live event streaming.

### 3.3 Storage & Persistence
- **State Store:** Lightweight SQLite or JSON file-backed state repository (`storage/sessions.json`).
- **Artifact Workspace:** Direct file system storage in `artifacts/sessions/{session_id}/`.
- **Zero Heavy Infrastructure:** **NO** Docker, Kubernetes, Redis, Kafka, Elasticsearch, or standalone vector DBs. The entire prototype runs from a single Python virtual environment.

### 3.4 AI Layer & Model Abstraction
- **Model Adapter:** Centralized `ModelProvider` interface wrapping LiteLLM / Gemini API / OpenAI API.
- **Safety / Demo Reliability:** Built-in deterministic fallback engine containing pre-verified outputs to guarantee 100% demo uptime under network degradation or API rate limits.
- **Future-Proofing:** Pluggable design allowing local on-device NPU runtimes (e.g. MLC-LLM, llama.cpp) to be swapped behind the `ModelProvider` contract without altering orchestration logic.

---

## 4. Backend Modular Decomposition

The backend is structured into 12 focused, decoupled packages:

```text
backend/
├── api/             # REST route handlers & WebSocket endpoints
├── core/            # Configuration, logging, exception handlers, security constants
├── orchestrator/    # Udyam Manager state machine & task scheduler
├── agents/          # 4 specialized workforce agents + base agent interface
├── context/         # SharedCompanyContext schema, manager, and serialization
├── events/          # Event definitions, bus, and WebSocket broadcast manager
├── tools/           # Workspace filesystem tools, search stubs, and model clients
├── artifacts/       # Artifact generators, file writers, and directory manager
├── verification/    # Automated syntax, integrity, and cross-agent coherence rules
├── approvals/       # Approval state tracker, timeout rules, and feedback parser
├── device/          # Mobile input parsers (audio, image OCR/stub), haptic signals
└── storage/         # SQLite / file persistence for sessions, context, and logs
```

### Module Responsibilities:

| Module | Purpose & Core Responsibility |
| :--- | :--- |
| `backend.api` | Exposes REST endpoints (`/sessions`, `/goals`, `/approval`, `/office-kit`) and the WebSocket feed (`/ws/sessions/{id}`). Handles serialization and HTTP status codes. |
| `backend.core` | Loads `.env`, manages logging configuration, initializes singleton instances, and defines global error handlers. |
| `backend.orchestrator` | Houses `UdyamManager`. Directs stage progression (`INTAKE → RESEARCH → PRODUCT → BUILDER → GROWTH → VERIFY → APPROVAL`), handles retries, and coordinates agents. |
| `backend.agents` | Contains `BaseWorkforceAgent`, `ResearchAgent`, `ProductAgent`, `BuilderAgent`, and `GrowthAgent`. Implements bounded `step()` loop and prompt construction. |
| `backend.context` | Defines `SharedCompanyContext` Pydantic model. Manages thread-safe reads, incremental updates, and snapshot exports to disk. |
| `backend.events` | Manages `EventBus`. Translates internal domain events into safe `OperationalEvent` payloads and broadcasts them across active WebSocket connections. |
| `backend.tools` | Houses tools callable by agents (`write_workspace_file`, `read_workspace_file`, `web_search_mock`). Implements sandboxed path checking. |
| `backend.artifacts` | Enforces artifact schemas (`research_brief`, `product_requirements`, `landing_page`, `launch_strategy`, `launch_package`). Manages `artifacts/{session_id}/`. |
| `backend.verification` | Contains automated audit functions checking file presence, non-zero byte size, HTML5 DOM validity, and semantic alignment across documents. |
| `backend.approvals` | Manages the human gatekeeper lifecycle (`PENDING → APPROVED / REVISION_REQUESTED`). Formats executive approval cards. |
| `backend.device` | Provides `DeviceAdapter` translating phone inputs (voice audio bytes, camera image uploads) into clean text/metadata for Udyam Manager. |
| `backend.storage` | Handles session persistence, retrieval, and rehydration to SQLite or structured JSON files. |

---

## 5. System Execution & Data Flows

### 5.1 Request Flow (Founder Goal Submission)
1. **User Action:** Founder speaks into iQOO phone or types a prompt on the PWA.
2. **Device Adapter:** Phone captures input and issues `POST /api/v1/sessions` followed by `POST /api/v1/sessions/{id}/goals`.
3. **API Layer:** Validates `GoalSubmissionRequest` via Pydantic schema and returns `202 Accepted` with initial session state.
4. **Manager Activation:** Udyam Manager starts an asynchronous background task to orchestrate the pipeline.

### 5.2 WebSocket & Event Flow
1. **Handshake:** Mobile client connects to `ws://{host}/ws/sessions/{session_id}` immediately after session creation.
2. **Subscription:** Event Bus registers the connection for that `session_id`.
3. **Emission:** Whenever an agent starts, executes a tool, updates context, or creates an artifact, an `OperationalEvent` is emitted to the Event Bus.
4. **Broadcast:** Event Bus writes JSON frames over the WebSocket. Client UI updates its live activity timeline without polling.

### 5.3 Agent Execution & Shared Context Flow
1. **Sequential Turn:** Udyam Manager activates the target agent (e.g. `ResearchAgent`).
2. **Context Ingestion:** The agent queries `SharedCompanyContext` for upstream inputs (`FounderIntent`).
3. **Execution Loop:** Agent calls LLM with strict system prompt and tool definitions. Runs a bounded loop (max 5 steps).
4. **Artifact Persisted:** Generated deliverable is written to disk in `artifacts/sessions/{id}/`.
5. **Context Update:** Agent's structured output updates the `SharedCompanyContext`.
6. **Next Agent Activated:** Manager verifies state and proceeds to next agent (`ProductAgent`), passing accumulated context.

### 5.4 Verification Flow
1. **Trigger:** Fires automatically after the 4th agent (`GrowthAgent`) completes.
2. **Execution:** `VerificationEngine` checks:
   - Are all 4 required artifact files present and readable on disk?
   - Is `landing_page/index.html` valid HTML with responsive viewport meta and matching CSS?
   - Does the value proposition in `landing_page` match `product_requirements.md`?
3. **Outcome Branching:**
   - **Pass:** State transitions to `AWAITING_APPROVAL`. Emits `VERIFICATION_PASSED` event.
   - **Fail:** Emits `VERIFICATION_FAILED`. Triggers exactly **one bounded auto-correction** task with the responsible agent. If it fails a second time, notifies founder with error details.

### 5.5 Founder Approval Flow (The iQOO Moment)
1. **Alert Dispatch:** Manager dispatches `APPROVAL_REQUESTED` event over WebSocket.
2. **Phone Display:** Mobile UI triggers haptic pulse and presents full-screen **Approval Card**:
   - Executive Summary
   - Direct button to render `artifacts/.../landing_page/index.html` inside phone iframe
   - Two high-contrast actions: **"Approve & Launch"** or **"Request Revision"**.
3. **Founder Interaction:**
   - If **Approve:** Client issues `POST /api/v1/sessions/{id}/approval`. State transitions to `APPROVED`.
   - If **Revision:** Client enters feedback and issues `POST /api/v1/sessions/{id}/feedback`. Manager restarts the specific agent with feedback context.

### 5.6 Office Kit Flow (Approve & Desk-Sync)
1. **Trigger:** Triggered immediately when `POST /api/v1/sessions/{id}/approval` succeeds.
2. **Notification:** Backend broadcasts `OFFICE_KIT_SYNC_STARTED` to all connected clients (including the laptop desktop client).
3. **Desktop Action:** The laptop client receives the event, triggers a local browser pop-up opening `http://{host}/artifacts/{id}/landing_page/index.html`, and reveals the generated workspace folder.
4. **Completion:** Backend marks `OFFICE_KIT_SYNC_COMPLETED` and sets session state to `LAUNCH_READY`.

### 5.7 Error & Fallback Flow
1. **Network / Rate-Limit Guard:** If LLM provider responds with `429 Too Many Requests` or times out (>20s), the model adapter catches the exception.
2. **Deterministic Fallback:** The system injects pre-calibrated, high-quality domain responses for the specific prompt, logging a warning.
3. **Integrity Intact:** The pipeline continues without breaking, ensuring live walkthroughs and execution remain smooth and reliable.
