from typing import Dict, Any
from backend.agents.base import BaseWorkforceAgent
from backend.core.models import SharedCompanyContext, ProductContext
from backend.events.bus import EventBus
from backend.events.models import EventType
from backend.agents.model_provider import model_provider
from backend.context.manager import context_manager
from backend.artifacts.manager import artifact_manager

class ProductAgent(BaseWorkforceAgent):
    """
    Chief Product Officer & Solution Architect.
    Converts research insights into a crisp product definition, MVP scope, and user journeys.
    """
    def __init__(self):
        super().__init__(
            name="ProductAgent",
            role="Product Solutions Architect",
            description="Defines MVP feature scope, user experience flows, and technical requirements.",
            allowed_tools=["write_workspace_file", "read_workspace_file"]
        )

    def validate_input(self, context: SharedCompanyContext) -> bool:
        return bool(context.market.target_icp) and bool(context.market.core_pain_points)

    async def run(
        self,
        session_id: str,
        context: SharedCompanyContext,
        bus: EventBus
    ) -> Dict[str, Any]:
        prompt = f"""
        Company: {context.project_goal.project_name}
        Goal: {context.project_goal.raw_intent.raw_input}
        Target ICP: {context.market.target_icp}
        Core Pain: {context.market.core_pain_points[0]}
        """

        await self.publish_event(
            bus=bus,
            session_id=session_id,
            event_type=EventType.AGENT_PROGRESS,
            status="RUNNING",
            message="Defining MVP feature scope and core user journey",
            payload={"step": 1, "max_steps": 3}
        )

        product_data = await model_provider.generate_structured(
            prompt=prompt,
            system_instruction="Define the product value proposition, 3-4 strict must-have MVP features, and the primary user journey steps.",
            stage="product"
        )

        product_ctx = ProductContext(
            product_name=product_data.get("product_name", context.project_goal.project_name),
            value_proposition=product_data.get("value_proposition", context.project_goal.tagline),
            mvp_features=product_data.get("mvp_features", ["Core workflow", "Mobile responsive interface", "1-click actions"]),
            user_journey_steps=product_data.get("user_journey", ["Sign in", "Perform core action", "Review output"]),
            tech_stack_summary=product_data.get("tech_specs", "HTML5/Modern CSS Mobile-First PWA")
        )
        await context_manager.update_product(session_id, product_ctx)

        # Write product_requirements.md
        features_md = "\n".join([f"- [x] **{feat}**" for feat in product_ctx.mvp_features])
        journey_md = "\n".join([f"{i+1}. {step}" for i, step in enumerate(product_ctx.user_journey_steps)])

        md_content = f"""# Product Requirements Document (PRD)

**Product Name:** {product_ctx.product_name}  
**Author:** Udyam OS Product Agent  
**Status:** MVP Specification (Ready for Build)  

---

## 1. Core Value Proposition
> {product_ctx.value_proposition}

---

## 2. Target Persona Alignment
Designed exclusively for: **{context.market.target_icp}**

---

## 3. Strict MVP Feature Scope
{features_md}

---

## 4. End-to-End User Conversion Journey
{journey_md}

---

## 5. Technical Architecture Summary
- **Architecture:** {product_ctx.tech_stack_summary}
- **Deployment Mode:** Mobile PWA with Desktop Office Kit Synchronization
- **Latency Target:** Sub-second interaction times on standard cellular data
"""

        await artifact_manager.create_artifact(
            session_id=session_id,
            artifact_id="art_product_requirements",
            artifact_type="product_requirements",
            title="Product Requirements Document (PRD)",
            relative_path="product_requirements.md",
            created_by=self.name,
            content=md_content
        )

        return product_data
