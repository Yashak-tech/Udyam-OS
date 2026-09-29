# Udyam OS — Agent Contracts, Orchestration, Device & Office Kit Protocols

**Version:** 1.0 (Phase 4 Specification)  
**Scope:** Agent Interfaces, Deterministic Orchestration, Device Adapter, Office Kit Bridge & Fallback Engine

---

## 1. Base Workforce Agent Interface

All workforce agents implement a unified base class derived from the minimalist execution loop:

```python
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import time

class BaseWorkforceAgent(ABC):
    """
    Abstract contract for all Udyam OS autonomous workforce agents.
    Enforces strict input validation, step bounding, and event publication.
    """
    def __init__(
        self,
        name: str,
        role: str,
        description: str,
        allowed_tools: List[str],
        max_steps: int = 5,
        timeout_seconds: int = 60
    ):
        self.name = name
        self.role = role
        self.description = description
        self.allowed_tools = allowed_tools
        self.max_steps = max_steps
        self.timeout_seconds = timeout_seconds

    @abstractmethod
    def validate_input(self, input_data: Dict[str, Any]) -> bool:
        """Ensures all upstream dependencies from SharedCompanyContext exist."""
        pass

    @abstractmethod
    async def run(
        self,
        session_id: str,
        context: "SharedCompanyContext",
        event_bus: "EventBus"
    ) -> Dict[str, Any]:
        """
        Executes bounded step loop. Communicates strictly via context and event bus.
        Must NOT attempt direct socket communication with other agents.
        """
        pass

    @abstractmethod
    async def generate_artifact(
        self,
        session_id: str,
        output_payload: Dict[str, Any],
        workspace_path: str
    ) -> "Artifact":
        """Persists the formal deliverable file to the session artifacts directory."""
        pass

    async def publish_event(
        self,
        event_bus: "EventBus",
        session_id: str,
        event_type: str,
        status: str,
        message: str,
        payload: Dict[str, Any]
    ):
        """Dispatches safe operational event to the mobile feed."""
        await event_bus.publish(session_id, event_type, self.name, status, message, payload)
```

---

## 2. Specialized Agent Contracts & Input/Output Schemas

### 2.1 Research Agent
* **Name:** `ResearchAgent`
* **Role:** Market Intelligence & Problem-Solution Analyst
* **Allowed Tools:** `web_search_stub`, `write_workspace_file`
* **Input Schema:** `FounderIntent` (from Shared Context)
* **Output Schema:** `ResearchReport`
```json
{
  "target_icp": "Marginal farmers (1-5 acres) in Tier-2/3 Indian agricultural zones",
  "core_pain": "40% crop loss due to delayed disease identification and lack of local remedy access",
  "competitors": [
    {"name": "Plantix", "strength": "Large image database", "gap": "No vernacular audio, no local shop connect"},
    {"name": "AgroStar", "strength": "E-commerce logistics", "gap": "Slow delivery, heavy text interface"}
  ],
  "market_opportunities": ["Vernacular audio advisor", "1-click local dealer pickup"],
  "core_assumptions": ["Farmers prefer calling local dealers over 3-day courier delivery"]
}
```
* **Artifact Generated:** `artifacts/sessions/{id}/research_brief.md`

---

### 2.2 Product Agent
* **Name:** `ProductAgent`
* **Role:** Chief Product Officer / Solutions Architect
* **Allowed Tools:** `write_workspace_file`, `read_workspace_file`
* **Input Schema:** `FounderIntent` + `ResearchReport`
* **Output Schema:** `ProductRequirementsDocument (PRD)`
```json
{
  "product_name": "AgroPulse",
  "value_proposition": "Diagnose crop disease in 3 seconds via voice & photo, and order verified remedies instantly from your nearest dealer.",
  "mvp_features": [
    "Snap-and-diagnose camera scanner",
    "Vernacular voice audio prescription",
    "1-tap call dealer with pre-filled diagnosis receipt"
  ],
  "user_journey": [
    "Step 1: Farmer captures leaf picture",
    "Step 2: Instant audio playback explains remedy in local dialect",
    "Step 3: Screen shows 2 nearest certified shops with stock availability"
  ],
  "tech_specs": "Mobile-first PWA, responsive viewport, low-bandwidth CSS"
}
```
* **Artifact Generated:** `artifacts/sessions/{id}/product_requirements.md`

---

### 2.3 Builder / Designer Agent
* **Name:** `BuilderAgent`
* **Role:** Lead Front-End Engineer & Visual Designer
* **Allowed Tools:** `write_workspace_file`, `validate_html`
* **Input Schema:** `ProductRequirementsDocument` + Brand attributes from Shared Context
* **Output Schema:** `LandingPageArtifact`
```json
{
  "html_path": "landing_page/index.html",
  "css_path": "landing_page/styles.css",
  "components": ["HeroSection", "InteractiveDiagnosisMock", "DealerMapPreview", "AudioSampleCTA"],
  "theme": "Dark emerald-tinted glassmorphism (#10B981, #0F172A)"
}
```
* **Artifact Generated:** `artifacts/sessions/{id}/landing_page/index.html` and `styles.css`

---

### 2.4 Growth Agent
* **Name:** `GrowthAgent`
* **Role:** Head of Growth & Go-to-Market Strategist
* **Allowed Tools:** `write_workspace_file`
* **Input Schema:** `ResearchReport` + `ProductRequirementsDocument` + `LandingPageArtifact`
* **Output Schema:** `GoToMarketPlan`
```json
{
  "positioning_statement": "The fastest crop disease lifeline for Indian farmers, backed by local trusted dealers.",
  "launch_channels": [
    "Kisan WhatsApp community groups",
    "Direct onboarding of 50 local pesticide retailers as demo hubs",
    "Krishi Vigyan Kendra ground workshops"
  ],
  "day_1_outreach": "WhatsApp broadcast template with sample audio clip",
  "thirty_day_target": "500 verified leaf scans across 10 villages"
}
```
* **Artifact Generated:** `artifacts/sessions/{id}/launch_strategy.md`

---

## 3. Orchestration State Machine (Udyam Manager)

Udyam Manager drives the pipeline through a strict, deterministic sequence:

```
[ FOUNDER_INPUT ] (Voice / Camera / Text on iQOO)
        ↓
[ GOAL_PARSED ]
        ↓
[ STAGE 1: RESEARCH ]  ──────► (Writes research_brief.md + Updates Context)
        ↓
[ STAGE 2: PRODUCT ]   ──────► (Writes product_requirements.md + Updates Context)
        ↓
[ STAGE 3: BUILDER ]   ──────► (Writes landing_page/index.html + Updates Context)
        ↓
[ STAGE 4: GROWTH ]    ──────► (Writes launch_strategy.md + Updates Context)
        ↓
[ VERIFICATION ENGINE ]
        │
        ├── [FAIL] ──► [ ONE BOUNDED CORRECTION ] ──► (Re-verifies once; escalates if failed)
        │
        └── [PASS]
                ↓
    [ FOUNDER APPROVAL GATE ] (iQOO Mobile Screen)
            │
            ├── [REVISION REQUESTED] ──► [ SPECIFIC AGENT RETRY ] ──► (Re-verifies)
            │
            └── [APPROVED]
                    ↓
        [ OFFICE KIT DESK-SYNC ] (Pushes live bundle to Laptop)
                    ↓
        [ LAUNCH READY ] (Manifest finalized & locked)
```

---

## 4. Artifact Contract & File Manifest

All generated deliverables conform to standard identifiers and metadata headers:

| Artifact Identifier | Output Path | Format | Verification Criteria |
| :--- | :--- | :--- | :--- |
| `research_brief` | `artifacts/sessions/{id}/research_brief.md` | Markdown | Contains ICP, Pain Points, 2+ Competitors |
| `product_requirements` | `artifacts/sessions/{id}/product_requirements.md` | Markdown | Contains MVP Feature List, User Journey Steps |
| `landing_page` | `artifacts/sessions/{id}/landing_page/index.html` | HTML5/CSS3 | Valid HTML tags, Responsive Viewport, Zero unparsed template vars |
| `launch_strategy` | `artifacts/sessions/{id}/launch_strategy.md` | Markdown | Contains Launch Channels, Day-1 Playbook |
| `launch_package` | `artifacts/sessions/{id}/launch_package.json` | JSON | Valid JSON, contains paths to all 4 files, signed by Founder |

---

## 5. Device Contract (`DeviceAdapter`)

The iQOO phone connects to the backend through a specialized `DeviceAdapter` abstraction:

```python
class DeviceAdapter:
    """
    Translates physical smartphone capabilities into clean operational contracts.
    Avoids vendor lock-in; handles mobile browser capabilities (Web APIs) gracefully.
    """
    @staticmethod
    def parse_voice_audio(audio_bytes: bytes, format: str) -> str:
        """Converts mobile audio stream into plain text transcript."""
        pass

    @staticmethod
    def parse_camera_image(image_bytes: bytes) -> Dict[str, Any]:
        """Extracts whiteboard notes or sketch structures into intent context."""
        pass

    @staticmethod
    def trigger_haptic_alert() -> Dict[str, str]:
        """Generates WebSocket payload signaling phone to vibrate upon approval request."""
        return {"action": "vibrate", "pattern": [100, 50, 100]}

    @staticmethod
    def format_approval_card(session: "Session") -> Dict[str, Any]:
        """Builds high-contrast executive decision card optimized for iQOO screen."""
        return {
            "title": f"Ready to Launch: {session.goal.project_name}",
            "summary": session.goal.tagline,
            "preview_url": f"/api/v1/sessions/{session.session_id}/artifacts/art_landing_page?raw=true",
            "actions": ["APPROVE", "REVISE"]
        }
```

---

## 6. Office Kit Contract: "Approve & Desk-Sync"

The single prototype Office Kit workflow bridges phone approval directly to laptop execution:

```
[ iQOO Phone ]                                    [ Laptop Screen ]
     │                                                    │
     ├──── Tap "Approve & Launch" ────────────┐           │
     │                                        │           │
     │                                        ▼           │
     │                               [ Backend: EventBus ]│
     │                                        │           │
     │                                        ├───────────► Receive: OFFICE_KIT_SYNC_STARTED
     │                                        │           │
     │                                        │           ├─► Auto-opens browser to:
     │                                        │           │   http://localhost:8000/landing_page
     │                                        │           │
     │                                        │           ├─► Emits Desktop Notification:
     │                                        │           │   "Founder approved AgroPulse"
     │                                        │           │
     │   Receive: OFFICE_KIT_SYNC_COMPLETED ◄─┴───────────┤
     ▼                                                    ▼
(Launch Manifest Displayed)                          (Ready for Deployment)
```

---

## 7. Error & Deterministic Fallback Strategy

To guarantee **100% demo uptime** during live founder walkthroughs:

| Failure Mode | Detection | System Behavior & Fallback |
| :--- | :--- | :--- |
| **LLM Timeout (>20s)** | `asyncio.TimeoutError` | Cancels request; loads pre-calibrated domain response into context; logs warning. |
| **LLM Rate Limit (429)** | HTTP Status Code `429` | Immediately falls back to deterministic mock response; demo continues seamlessly. |
| **Malformed Output** | JSON parse exception | Retries prompt once with error feedback; if still invalid, injects sanitized template. |
| **Agent Crash** | Unhandled exception in `step()` | Marks `AGENT_FAILED`; Manager executes single retry before asking founder. |
| **WebSocket Disconnect** | Network drop / socket close | Client pauses timeline without erasing state; reconnects with exponential backoff. |
| **HTML Syntax Error** | Verification audit failure | Builder Agent receives auto-correction task to close tags and inject valid structure. |
| **Office Kit Disconnect** | Desktop client offline | Logs warning, marks sync as pending, but completes session on phone without crash. |
