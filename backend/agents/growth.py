from typing import Dict, Any
from backend.agents.base import BaseWorkforceAgent
from backend.core.models import SharedCompanyContext, GrowthContext
from backend.events.bus import EventBus
from backend.events.models import EventType
from backend.agents.model_provider import model_provider
from backend.context.manager import context_manager
from backend.artifacts.manager import artifact_manager

class GrowthAgent(BaseWorkforceAgent):
    """
    Head of Growth & Go-To-Market Strategist.
    Crafts hyper-targeted customer acquisition channels, Day-1 playbooks, and positioning hooks.
    """
    def __init__(self):
        super().__init__(
            name="GrowthAgent",
            role="Go-To-Market Strategist",
            description="Engineers distribution strategies, zero-cost acquisition channels, and launch campaigns.",
            allowed_tools=["write_workspace_file"]
        )

    def validate_input(self, context: SharedCompanyContext) -> bool:
        return bool(context.market.target_icp) and bool(context.product.product_name)

    async def run(
        self,
        session_id: str,
        context: SharedCompanyContext,
        bus: EventBus
    ) -> Dict[str, Any]:
        prompt = f"""
        Product: {context.product.product_name}
        Value Proposition: {context.product.value_proposition}
        Target Customer: {context.market.target_icp}
        """

        await self.publish_event(
            bus=bus,
            session_id=session_id,
            event_type=EventType.AGENT_PROGRESS,
            status="RUNNING",
            message="Formulating Day-1 go-to-market playbook and viral acquisition hooks",
            payload={"step": 1, "max_steps": 3}
        )

        growth_data = await model_provider.generate_structured(
            prompt=prompt,
            system_instruction="Create high-conversion launch channels, Day-1 tactical action items, and a magnetic hero hook copy.",
            stage="growth"
        )

        growth_ctx = GrowthContext(
            positioning_statement=growth_data.get("positioning_statement", f"The premier solution for {context.market.target_icp}"),
            launch_channels=growth_data.get("launch_channels", ["Direct community outreach", "Targeted founder networks", "Local industry hubs"]),
            day_1_actions=growth_data.get("day_1_actions", ["Deploy landing page", "Outreach to 25 target prospects", "Collect pilot signups"]),
            hero_hook_copy=growth_data.get("hero_hook", context.product.value_proposition)
        )
        await context_manager.update_growth(session_id, growth_ctx)

        channels_md = "\n".join([f"- [x] **{ch}**" for ch in growth_ctx.launch_channels])
        actions_md = "\n".join([f"{i+1}. {act}" for i, act in enumerate(growth_ctx.day_1_actions)])

        md_content = f"""# Go-To-Market & Launch Strategy

**Product:** {context.product.product_name}  
**Author:** Udyam OS Growth Agent  
**Target Milestone:** Initial Pilot Customer Validation  

---

## 1. Strategic Market Positioning
> "{growth_ctx.positioning_statement}"

---

## 2. Primary Customer Acquisition Channels
{channels_md}

---

## 3. Day-1 Tactical Launch Playbook
{actions_md}

---

## 4. Viral Copy & Hook Angle
- **Core Hook:** *"{growth_ctx.hero_hook_copy}"*
- **Call-to-Action Wedge:** Free pilot trial with zero upfront software commitment.
"""

        await artifact_manager.create_artifact(
            session_id=session_id,
            artifact_id="art_launch_strategy",
            artifact_type="launch_strategy",
            title="Go-To-Market & Launch Strategy",
            relative_path="launch_strategy.md",
            created_by=self.name,
            content=md_content
        )

        return growth_data
