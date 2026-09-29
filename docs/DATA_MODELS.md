# Udyam OS — Core Data Models & Lifecycle Specifications

**Version:** 1.0 (Phase 4 Specification)  
**Schema Standard:** Pydantic v2 / Python Typed Enums

---

## 1. Domain Object Hierarchy & Entity Relationships

The entire operational state of Udyam OS is anchored under a root `Session` entity, ensuring modular isolation and clean serialization:

```
Session
 ├── ProjectGoal (Parsed from FounderIntent)
 ├── SharedCompanyContext (Cumulative Company Memory)
 │    ├── MarketContext
 │    ├── ProductContext
 │    ├── BrandContext
 │    └── GrowthContext
 ├── AgentTasks [List of 4 Sequential Work Tasks]
 ├── Agents [List of 4 Registered Workforce Agents]
 ├── Artifacts [Dictionary of Generated Files on Disk]
 ├── VerificationResult (Automated Quality & Consistency Audit)
 ├── ApprovalRequest (Founder Mobile Gatekeeper Object)
 └── LaunchPackage (Final Verified & Approved Manifest)
```

---

## 2. Enumerated Lifecycle States

Explicit enums enforce strict state machine transitions across all system layers:

```python
from enum import Enum

class SessionState(str, Enum):
    CREATED = "CREATED"                         # Workspace initialized, awaiting goal
    INTAKE = "INTAKE"                           # Voice/camera parsing in progress
    RUNNING = "RUNNING"                         # Agents actively executing pipeline
    VERIFYING = "VERIFYING"                     # Automated verification engine checking outputs
    AWAITING_APPROVAL = "AWAITING_APPROVAL"     # Verification passed; awaiting founder sign-off
    REVISION_REQUESTED = "REVISION_REQUESTED"   # Founder sent feedback; re-running target agent
    APPROVED = "APPROVED"                       # Founder approved on iQOO phone
    LAUNCH_READY = "LAUNCH_READY"               # Office Kit sync completed; bundle finalized
    FAILED = "FAILED"                           # Terminal error encountered

class AgentState(str, Enum):
    IDLE = "IDLE"
    QUEUED = "QUEUED"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class ArtifactState(str, Enum):
    CREATING = "CREATING"
    READY = "READY"
    INVALID = "INVALID"
    REVISED = "REVISED"

class ApprovalState(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REVISION_REQUESTED = "REVISION_REQUESTED"

class ModalityType(str, Enum):
    TEXT = "text"
    VOICE = "voice"
    CAMERA = "camera"
    MULTIMODAL = "multimodal"
```

---

## 3. Core Domain Models (Pydantic Schemas)

### 3.1 Founder Intent & Project Goal
Captures the raw unstructured input and its parsed, normalized structure:

```python
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field
import time
import uuid

class FounderIntent(BaseModel):
    raw_input: str = Field(..., description="Raw text, transcribed speech, or note")
    modality: ModalityType = ModalityType.TEXT
    language: str = Field(default="en", description="Language of input (e.g. en, hi)")
    attachment_id: Optional[str] = Field(default=None, description="Optional camera upload ID")
    captured_at: float = Field(default_factory=time.time)

class ProjectGoal(BaseModel):
    project_name: str = Field(..., description="Generated working brand/project title")
    tagline: str = Field(..., description="High-impact one-liner")
    industry_domain: str = Field(..., description="e.g. AgriTech, FinTech, E-Commerce")
    core_problem: str = Field(..., description="Fundamental customer problem being addressed")
    solution_hypothesis: str = Field(..., description="Hypothesized solution and initial wedge")
    raw_intent: FounderIntent
```

---

### 3.2 Shared Company Context
The single source of truth shared by all workforce agents:

```python
class MarketContext(BaseModel):
    target_icp: str = Field(default="", description="Ideal customer profile summary")
    demographics: List[str] = Field(default_factory=list)
    core_pain_points: List[str] = Field(default_factory=list)
    competitors: List[Dict[str, str]] = Field(default_factory=list, description="Competitor name, weakness, wedge")
    market_opportunities: List[str] = Field(default_factory=list)
    key_assumptions: List[str] = Field(default_factory=list)

class ProductContext(BaseModel):
    product_name: str = Field(default="")
    value_proposition: str = Field(default="")
    mvp_features: List[str] = Field(default_factory=list, description="Strict must-have MVP feature list")
    user_journey_steps: List[str] = Field(default_factory=list, description="Core 3-4 step user flow")
    tech_stack_summary: str = Field(default="HTML5/Modern CSS Mobile-First PWA")

class BrandContext(BaseModel):
    primary_color: str = Field(default="#10B981")
    accent_color: str = Field(default="#F59E0B")
    background_theme: str = Field(default="Dark Modern Glassmorphism")
    tone_of_voice: str = Field(default="Authoritative, Empathetic, Urgency-driven")

class GrowthContext(BaseModel):
    positioning_statement: str = Field(default="")
    launch_channels: List[str] = Field(default_factory=list)
    day_1_actions: List[str] = Field(default_factory=list)
    hero_hook_copy: str = Field(default="")

class SharedCompanyContext(BaseModel):
    session_id: str
    project_goal: Optional[ProjectGoal] = None
    market: MarketContext = Field(default_factory=MarketContext)
    product: ProductContext = Field(default_factory=ProductContext)
    brand: BrandContext = Field(default_factory=BrandContext)
    growth: GrowthContext = Field(default_factory=GrowthContext)
    version: int = Field(default=1)
    updated_at: float = Field(default_factory=time.time)
```

---

### 3.3 Agents and Tasks
Defines the workforce registry and discrete unit of work:

```python
class AgentProfile(BaseModel):
    agent_id: str
    name: str = Field(..., description="e.g. ResearchAgent, ProductAgent")
    role: str = Field(..., description="e.g. Market Intelligence Specialist")
    description: str
    status: AgentState = AgentState.IDLE
    allowed_tools: List[str] = Field(default_factory=list)
    current_step: int = 0
    max_steps: int = 5

class AgentTask(BaseModel):
    task_id: str = Field(default_factory=lambda: f"tsk_{uuid.uuid4().hex[:8]}")
    session_id: str
    agent_name: str
    stage_index: int = Field(..., description="1=Research, 2=Product, 3=Builder, 4=Growth")
    status: AgentState = AgentState.QUEUED
    input_payload: Dict[str, Any] = Field(default_factory=dict)
    output_payload: Optional[Dict[str, Any]] = None
    target_artifact_type: str
    error_message: Optional[str] = None
    started_at: Optional[float] = None
    completed_at: Optional[float] = None
```

---

### 3.4 Artifact and Artifact Metadata
Represents tangible deliverables written to the filesystem:

```python
class ArtifactMetadata(BaseModel):
    file_size_bytes: int = 0
    mime_type: str = "text/markdown"
    word_count: int = 0
    has_html_structure: bool = False
    custom_props: Dict[str, Any] = Field(default_factory=dict)

class Artifact(BaseModel):
    artifact_id: str = Field(..., description="e.g. art_research_brief")
    session_id: str
    type: Literal["research_brief", "product_requirements", "landing_page", "launch_strategy", "launch_package"]
    title: str
    relative_path: str = Field(..., description="Path within workspace e.g. landing_page/index.html")
    absolute_path: str
    created_by: str = Field(..., description="Agent name responsible for creation")
    created_at: float = Field(default_factory=time.time)
    status: ArtifactState = ArtifactState.CREATING
    preview_snippet: str = Field(default="", max_length=500)
    metadata: ArtifactMetadata = Field(default_factory=ArtifactMetadata)
```

---

### 3.5 Verification, Approval, and Feedback

```python
class VerificationCheck(BaseModel):
    check_name: str
    passed: bool
    details: str

class VerificationResult(BaseModel):
    passed: bool
    checked_at: float = Field(default_factory=time.time)
    checks: List[VerificationCheck] = Field(default_factory=list)
    auto_correction_attempts: int = Field(default=0, le=1)
    summary: str

class ApprovalRequest(BaseModel):
    request_id: str = Field(default_factory=lambda: f"apr_{uuid.uuid4().hex[:8]}")
    session_id: str
    project_name: str
    tagline: str
    executive_summary: str
    status: ApprovalState = ApprovalState.PENDING
    requested_at: float = Field(default_factory=time.time)
    decided_at: Optional[float] = None
    founder_decision: Optional[Literal["APPROVED", "REVISION_REQUESTED"]] = None
    founder_notes: Optional[str] = None

class FounderFeedback(BaseModel):
    session_id: str
    target_agent: str
    target_artifact_id: Optional[str] = None
    critique_text: str
    submitted_at: float = Field(default_factory=time.time)
```

---

### 3.6 Launch Package & Root Session
The final aggregated manifest and root container:

```python
class LaunchPackage(BaseModel):
    package_id: str
    session_id: str
    project_name: str
    tagline: str
    approved_by: str = "Founder via iQOO Phone"
    approval_timestamp: float
    artifacts: Dict[str, str] = Field(..., description="Map of artifact type to file path")
    executive_kpis: Dict[str, Any] = Field(default_factory=dict)
    launch_ready: bool = True

class Session(BaseModel):
    session_id: str = Field(default_factory=lambda: f"sess_{uuid.uuid4().hex[:12]}")
    founder_name: str = "Founder"
    device_id: str = "iqoo_phone"
    status: SessionState = SessionState.CREATED
    goal: Optional[ProjectGoal] = None
    context: SharedCompanyContext
    tasks: List[AgentTask] = Field(default_factory=list)
    artifacts: Dict[str, Artifact] = Field(default_factory=dict)
    verification: Optional[VerificationResult] = None
    approval: Optional[ApprovalRequest] = None
    launch_package: Optional[LaunchPackage] = None
    created_at: float = Field(default_factory=time.time)
    updated_at: float = Field(default_factory=time.time)
```
