import asyncio
import time
import logging
from typing import Dict, Any, Optional
from backend.core.models import (
    Session,
    SessionState,
    SharedCompanyContext,
    ProjectGoal,
    FounderIntent,
    AgentTask,
    AgentState,
    FounderFeedback
)
from backend.core.exceptions import SessionNotFoundError, StateConflictError
from backend.storage.repository import session_repository
from backend.events.bus import event_bus
from backend.events.models import EventType
from backend.context.manager import context_manager
from backend.agents.model_provider import model_provider
from backend.agents.research import ResearchAgent
from backend.agents.product import ProductAgent
from backend.agents.builder import BuilderAgent
from backend.agents.growth import GrowthAgent
from backend.verification.engine import verification_engine
from backend.approvals.manager import approval_manager

logger = logging.getLogger(__name__)

class UdyamManager:
    """
    Central kernel orchestrator for Udyam OS.
    Owns the deterministic stage pipeline:
    FOUNDER_INPUT -> GOAL_PARSED -> RESEARCH -> PRODUCT -> BUILDER -> GROWTH -> VERIFY -> APPROVAL
    No agent decides what happens next; the Manager controls task execution and state.
    """
    def __init__(self, repository=session_repository, bus=event_bus):
        self.repository = repository
        self.bus = bus
        self.agents = {
            "ResearchAgent": ResearchAgent(),
            "ProductAgent": ProductAgent(),
            "BuilderAgent": BuilderAgent(),
            "GrowthAgent": GrowthAgent()
        }

    async def create_session(self, founder_name: str = "Founder", device_id: str = "iqoo_phone") -> Session:
        initial_context = SharedCompanyContext(session_id="temp")
        session = Session(
            founder_name=founder_name,
            device_id=device_id,
            status=SessionState.CREATED,
            context=initial_context
        )
        session.context.session_id = session.session_id
        self.repository.create_session(session)

        await self.bus.publish(
            session_id=session.session_id,
            event_type=EventType.SESSION_CREATED,
            source="UdyamManager",
            status="INFO",
            message=f"Udyam OS workspace initialized for {founder_name}",
            payload={"session_id": session.session_id, "device_id": device_id}
        )
        return session

    async def submit_goal(
        self,
        session_id: str,
        raw_intent: str,
        modality: str = "text",
        language: str = "en",
        attachment_id: Optional[str] = None
    ) -> Session:
        session = self.repository.get_session(session_id)
        if not session:
            raise SessionNotFoundError(session_id)
        
        if session.status != SessionState.CREATED and session.status != SessionState.FAILED:
            raise StateConflictError(f"Session is already in state '{session.status}'")

        session.status = SessionState.INTAKE
        self.repository.save_session(session)

        await self.bus.publish(
            session_id=session_id,
            event_type=EventType.GOAL_RECEIVED,
            source="UdyamManager",
            status="INFO",
            message="Founder business intent received via iQOO device",
            payload={"modality": modality, "char_length": len(raw_intent)}
        )

        intent = FounderIntent(
            raw_input=raw_intent,
            modality=modality,
            language=language,
            attachment_id=attachment_id
        )

        parsed_goal_data = await model_provider.generate_structured(
            prompt=raw_intent,
            system_instruction="Extract project_name, tagline, industry_domain, core_problem, and solution_hypothesis.",
            stage="goal_intake"
        )

        goal = ProjectGoal(
            project_name=parsed_goal_data.get("project_name", "NewVenture"),
            tagline=parsed_goal_data.get("tagline", "Autonomous Venture on Udyam OS"),
            industry_domain=parsed_goal_data.get("industry_domain", "Technology"),
            core_problem=parsed_goal_data.get("core_problem", raw_intent),
            solution_hypothesis=parsed_goal_data.get("solution_hypothesis", "AI-driven solution"),
            raw_intent=intent
        )

        await context_manager.update_project_goal(session_id, goal)

        await self.bus.publish(
            session_id=session_id,
            event_type=EventType.GOAL_PARSED,
            source="UdyamManager",
            status="COMPLETED",
            message=f"Goal conceptualized: {goal.project_name} — {goal.tagline}",
            payload={"project_name": goal.project_name, "domain": goal.industry_domain}
        )

        # Launch the asynchronous workforce pipeline
        asyncio.create_task(self.run_pipeline(session_id))
        return session

    async def run_pipeline(self, session_id: str):
        """
        Executes the linear workforce sequence:
        RESEARCH -> PRODUCT -> BUILDER -> GROWTH -> VERIFY -> APPROVAL
        """
        session = self.repository.get_session(session_id)
        if not session:
            return

        session.status = SessionState.RUNNING
        self.repository.save_session(session)

        stages = [
            ("ResearchAgent", 1, "art_research_brief", "research_brief.md"),
            ("ProductAgent", 2, "art_product_requirements", "product_requirements.md"),
            ("BuilderAgent", 3, "art_landing_page", "landing_page/index.html"),
            ("GrowthAgent", 4, "art_launch_strategy", "launch_strategy.md")
        ]

        try:
            for agent_name, stage_idx, target_art_type, rel_path in stages:
                await self._execute_stage(session_id, agent_name, stage_idx, target_art_type)

            # Stage 5: Real automated verification
            await self._run_verification_and_approval_gate(session_id)

        except Exception as e:
            logger.exception(f"Pipeline error in session {session_id}: {e}")
            session = self.repository.get_session(session_id)
            if session:
                session.status = SessionState.FAILED
                self.repository.save_session(session)
            await self.bus.publish(
                session_id=session_id,
                event_type=EventType.AGENT_FAILED,
                source="UdyamManager",
                status="FAILED",
                message=f"Pipeline halted due to error: {str(e)}",
                payload={"error": str(e)}
            )

    async def _execute_stage(
        self,
        session_id: str,
        agent_name: str,
        stage_idx: int,
        target_art_type: str
    ):
        session = self.repository.get_session(session_id)
        agent = self.agents[agent_name]

        # 1. Create AgentTask
        task = AgentTask(
            session_id=session_id,
            agent_name=agent_name,
            stage_index=stage_idx,
            status=AgentState.QUEUED,
            target_artifact_type=target_art_type,
            started_at=time.time()
        )
        session.tasks.append(task)
        self.repository.save_session(session)

        # 2. Emit TASK_CREATED & AGENT_QUEUED
        await self.bus.publish(
            session_id=session_id,
            event_type=EventType.TASK_CREATED,
            source="UdyamManager",
            status="INFO",
            message=f"Stage {stage_idx}/4 task created for {agent_name}",
            payload={"task_id": task.task_id, "agent": agent_name, "stage": stage_idx}
        )
        await self.bus.publish(
            session_id=session_id,
            event_type=EventType.AGENT_QUEUED,
            source="UdyamManager",
            status="INFO",
            message=f"{agent_name} queued for execution",
            payload={"agent": agent_name}
        )

        # 3. Emit AGENT_STARTED
        session = self.repository.get_session(session_id)
        for t in session.tasks:
            if t.task_id == task.task_id:
                t.status = AgentState.RUNNING
        self.repository.save_session(session)

        await self.bus.publish(
            session_id=session_id,
            event_type=EventType.AGENT_STARTED,
            source=agent_name,
            status="RUNNING",
            message=f"{agent_name} started: {agent.description}",
            payload={"agent": agent_name, "stage": stage_idx}
        )

        # 4. Execute Agent against Shared Context
        session = self.repository.get_session(session_id)
        if not agent.validate_input(session.context):
            raise ValueError(f"Agent {agent_name} input validation failed for session {session_id}")

        output = await agent.run(session_id, session.context, self.bus)

        # 5. Mark task completed & emit AGENT_COMPLETED
        session = self.repository.get_session(session_id)
        completed_time = time.time()
        for t in session.tasks:
            if t.task_id == task.task_id:
                t.status = AgentState.COMPLETED
                t.completed_at = completed_time
                t.output_payload = output
        self.repository.save_session(session)

        await self.bus.publish(
            session_id=session_id,
            event_type=EventType.AGENT_COMPLETED,
            source=agent_name,
            status="COMPLETED",
            message=f"{agent_name} successfully finished stage {stage_idx}",
            payload={"agent": agent_name, "duration_seconds": round(completed_time - task.started_at, 2)}
        )

    async def _run_verification_and_approval_gate(self, session_id: str):
        session = self.repository.get_session(session_id)
        session.status = SessionState.VERIFYING
        self.repository.save_session(session)

        # First verification check
        result = await verification_engine.verify(session, attempt=1)
        session.verification = result
        self.repository.save_session(session)

        if not result.passed:
            # One bounded auto-correction attempt
            logger.warning(f"Verification failed on attempt 1 for {session_id}. Running bounded correction.")
            # Re-execute builder or failing component
            await self._execute_stage(session_id, "BuilderAgent", 3, "art_landing_page")
            
            # Second and final verification check
            session = self.repository.get_session(session_id)
            result = await verification_engine.verify(session, attempt=2)
            session.verification = result
            self.repository.save_session(session)

            if not result.passed:
                session.status = SessionState.FAILED
                self.repository.save_session(session)
                raise ValueError("Verification failed after 1 bounded auto-correction attempt.")

        # Verification succeeded -> escalate to Founder Approval Gate
        await approval_manager.create_approval_request(session)

    async def handle_feedback_revision(self, session_id: str, feedback: FounderFeedback):
        """
        Handles founder revision requests by re-running the specific agent, re-verifying,
        and re-presenting for approval.
        """
        target_agent = feedback.target_agent
        if target_agent not in self.agents:
            raise ValueError(f"Unknown target agent: {target_agent}")

        session = self.repository.get_session(session_id)
        session.status = SessionState.RUNNING
        self.repository.save_session(session)

        # Stage mapping
        stage_map = {
            "ResearchAgent": (1, "art_research_brief"),
            "ProductAgent": (2, "art_product_requirements"),
            "BuilderAgent": (3, "art_landing_page"),
            "GrowthAgent": (4, "art_launch_strategy")
        }
        idx, art_type = stage_map[target_agent]
        await self._execute_stage(session_id, target_agent, idx, art_type)

        # Re-verify and re-request approval
        await self._run_verification_and_approval_gate(session_id)

udyam_manager = UdyamManager()
