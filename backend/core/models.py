from enum import Enum
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field
import time
import uuid

class SessionState(str, Enum):
    CREATED = "CREATED"
    INTAKE = "INTAKE"
    RUNNING = "RUNNING"
    VERIFYING = "VERIFYING"
    AWAITING_APPROVAL = "AWAITING_APPROVAL"
    REVISION_REQUESTED = "REVISION_REQUESTED"
    APPROVED = "APPROVED"
    LAUNCH_READY = "LAUNCH_READY"
    FAILED = "FAILED"

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

class FounderIntent(BaseModel):
    raw_input: str = Field(..., description="Raw text, transcribed speech, or note")
    modality: ModalityType = ModalityType.TEXT
    language: str = Field(default="en")
    attachment_id: Optional[str] = None
    captured_at: float = Field(default_factory=time.time)

class ProjectGoal(BaseModel):
    project_name: str
    tagline: str
    industry_domain: str
    core_problem: str
    solution_hypothesis: str
    raw_intent: FounderIntent

class MarketContext(BaseModel):
    target_icp: str = ""
    demographics: List[str] = Field(default_factory=list)
    core_pain_points: List[str] = Field(default_factory=list)
    competitors: List[Dict[str, str]] = Field(default_factory=list)
    market_opportunities: List[str] = Field(default_factory=list)
    key_assumptions: List[str] = Field(default_factory=list)

class ProductContext(BaseModel):
    product_name: str = ""
    value_proposition: str = ""
    mvp_features: List[str] = Field(default_factory=list)
    user_journey_steps: List[str] = Field(default_factory=list)
    tech_stack_summary: str = "HTML5/Modern CSS Mobile-First PWA"

class BrandContext(BaseModel):
    primary_color: str = "#10B981"
    accent_color: str = "#F59E0B"
    background_theme: str = "Dark Modern Glassmorphism"
    tone_of_voice: str = "Authoritative, Empathetic, Urgency-driven"

class GrowthContext(BaseModel):
    positioning_statement: str = ""
    launch_channels: List[str] = Field(default_factory=list)
    day_1_actions: List[str] = Field(default_factory=list)
    hero_hook_copy: str = ""

class SharedCompanyContext(BaseModel):
    session_id: str
    project_goal: Optional[ProjectGoal] = None
    market: MarketContext = Field(default_factory=MarketContext)
    product: ProductContext = Field(default_factory=ProductContext)
    brand: BrandContext = Field(default_factory=BrandContext)
    growth: GrowthContext = Field(default_factory=GrowthContext)
    version: int = 1
    updated_at: float = Field(default_factory=time.time)

class AgentProfile(BaseModel):
    agent_id: str
    name: str
    role: str
    description: str
    status: AgentState = AgentState.IDLE
    allowed_tools: List[str] = Field(default_factory=list)
    current_step: int = 0
    max_steps: int = 5

class AgentTask(BaseModel):
    task_id: str = Field(default_factory=lambda: f"tsk_{uuid.uuid4().hex[:8]}")
    session_id: str
    agent_name: str
    stage_index: int
    status: AgentState = AgentState.QUEUED
    input_payload: Dict[str, Any] = Field(default_factory=dict)
    output_payload: Optional[Dict[str, Any]] = None
    target_artifact_type: str
    error_message: Optional[str] = None
    started_at: Optional[float] = None
    completed_at: Optional[float] = None

class ArtifactMetadata(BaseModel):
    file_size_bytes: int = 0
    mime_type: str = "text/markdown"
    word_count: int = 0
    has_html_structure: bool = False
    custom_props: Dict[str, Any] = Field(default_factory=dict)

class Artifact(BaseModel):
    artifact_id: str
    session_id: str
    type: Literal["research_brief", "product_requirements", "landing_page", "launch_strategy", "launch_package"]
    title: str
    relative_path: str
    absolute_path: str
    created_by: str
    created_at: float = Field(default_factory=time.time)
    status: ArtifactState = ArtifactState.CREATING
    preview_snippet: str = ""
    metadata: ArtifactMetadata = Field(default_factory=ArtifactMetadata)

class VerificationCheck(BaseModel):
    check_name: str
    passed: bool
    details: str

class VerificationResult(BaseModel):
    passed: bool
    checked_at: float = Field(default_factory=time.time)
    checks: List[VerificationCheck] = Field(default_factory=list)
    auto_correction_attempts: int = 0
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

class LaunchPackage(BaseModel):
    package_id: str = Field(default_factory=lambda: f"pkg_{uuid.uuid4().hex[:8]}")
    session_id: str
    project_name: str
    tagline: str
    approved_by: str = "Founder via iQOO Phone"
    approval_timestamp: float = Field(default_factory=time.time)
    artifacts: Dict[str, str] = Field(default_factory=dict)
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
