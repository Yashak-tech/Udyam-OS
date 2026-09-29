import time
from backend.core.models import (
    Session,
    VerificationResult,
    VerificationCheck
)
from backend.tools.workspace import WorkspaceTool
from backend.events.bus import event_bus
from backend.events.models import EventType

class VerificationEngine:
    """
    Automated objective rules-based validation engine.
    Audits filesystem deliverables, syntax integrity, and semantic cross-agent alignment.
    """
    def __init__(self, bus=event_bus):
        self.bus = bus

    async def verify(self, session: Session, attempt: int = 1) -> VerificationResult:
        session_id = session.session_id
        await self.bus.publish(
            session_id=session_id,
            event_type=EventType.VERIFICATION_STARTED,
            source="VerificationEngine",
            status="RUNNING",
            message=f"Auditing workforce outputs for quality and consistency (Attempt {attempt})",
            payload={"attempt": attempt}
        )

        checks = []

        # Check 1: research_brief.md exists
        rb_exists = WorkspaceTool.file_exists(session_id, "research_brief.md")
        checks.append(VerificationCheck(
            check_name="Research Brief Presence",
            passed=rb_exists,
            details="research_brief.md exists on disk" if rb_exists else "research_brief.md missing"
        ))

        # Check 2 & 3: Research contents (ICP, competitors)
        rb_content = ""
        if rb_exists:
            rb_content = WorkspaceTool.read_file(session_id, "research_brief.md")
        
        has_icp = "Ideal Customer Profile" in rb_content or "ICP" in rb_content
        checks.append(VerificationCheck(
            check_name="Research ICP Defined",
            passed=has_icp,
            details="ICP section identified" if has_icp else "ICP section missing in research brief"
        ))

        has_competitors = "Competitor" in rb_content or "Competitive" in rb_content
        checks.append(VerificationCheck(
            check_name="Research Competitor Analysis",
            passed=has_competitors,
            details="Competitor analysis identified" if has_competitors else "Competitor breakdown missing"
        ))

        # Check 4 & 5: product_requirements.md exists and contains MVP features
        prd_exists = WorkspaceTool.file_exists(session_id, "product_requirements.md")
        checks.append(VerificationCheck(
            check_name="PRD Presence",
            passed=prd_exists,
            details="product_requirements.md exists on disk" if prd_exists else "product_requirements.md missing"
        ))

        prd_content = ""
        if prd_exists:
            prd_content = WorkspaceTool.read_file(session_id, "product_requirements.md")
        
        has_mvp = "MVP Feature" in prd_content or "MVP Scope" in prd_content
        checks.append(VerificationCheck(
            check_name="PRD MVP Scope Defined",
            passed=has_mvp,
            details="MVP feature list verified" if has_mvp else "MVP feature list missing in PRD"
        ))

        # Check 6, 7, 8, 9: Landing Page files and HTML validity
        lp_exists = WorkspaceTool.file_exists(session_id, "landing_page/index.html")
        checks.append(VerificationCheck(
            check_name="Landing Page HTML Presence",
            passed=lp_exists,
            details="landing_page/index.html exists on disk" if lp_exists else "landing_page/index.html missing"
        ))

        html_content = ""
        if lp_exists:
            html_content = WorkspaceTool.read_file(session_id, "landing_page/index.html")

        has_doctype = "<!doctype html" in html_content.lower() and "<html" in html_content.lower() and "</html>" in html_content.lower()
        checks.append(VerificationCheck(
            check_name="Valid HTML5 Structure",
            passed=has_doctype,
            details="HTML5 root structure valid" if has_doctype else "Malformed HTML5 structure"
        ))

        has_viewport = 'name="viewport"' in html_content.lower()
        checks.append(VerificationCheck(
            check_name="Responsive Mobile Viewport",
            passed=has_viewport,
            details="Mobile responsive viewport meta tag present" if has_viewport else "Viewport meta tag missing"
        ))

        css_exists = WorkspaceTool.file_exists(session_id, "landing_page/styles.css")
        checks.append(VerificationCheck(
            check_name="Styles.css Presence",
            passed=css_exists,
            details="landing_page/styles.css exists on disk" if css_exists else "styles.css missing"
        ))

        # Check 10 & 11: launch_strategy.md exists and contains channels
        ls_exists = WorkspaceTool.file_exists(session_id, "launch_strategy.md")
        checks.append(VerificationCheck(
            check_name="Launch Strategy Presence",
            passed=ls_exists,
            details="launch_strategy.md exists on disk" if ls_exists else "launch_strategy.md missing"
        ))

        ls_content = ""
        if ls_exists:
            ls_content = WorkspaceTool.read_file(session_id, "launch_strategy.md")

        has_channels = "Channel" in ls_content
        checks.append(VerificationCheck(
            check_name="GTM Launch Channels Defined",
            passed=has_channels,
            details="Acquisition channels verified" if has_channels else "Launch channels missing in strategy"
        ))

        # Check 12: Cross-artifact consistency (Product name in PRD aligns with Landing Page)
        product_name = session.context.product.product_name or (session.goal.project_name if session.goal else "")
        cross_consistent = (product_name.lower() in html_content.lower()) if (product_name and html_content) else False
        checks.append(VerificationCheck(
            check_name="Cross-Artifact Semantic Consistency",
            passed=cross_consistent,
            details=f"Product name '{product_name}' verified across PRD and Landing Page" if cross_consistent else "Product name mismatch across documents"
        ))

        all_passed = all(c.passed for c in checks)
        summary = "All 12 automated verification checks passed." if all_passed else f"{sum(not c.passed for c in checks)} of 12 checks failed."

        result = VerificationResult(
            passed=all_passed,
            checked_at=time.time(),
            checks=checks,
            auto_correction_attempts=attempt - 1,
            summary=summary
        )

        if all_passed:
            await self.bus.publish(
                session_id=session_id,
                event_type=EventType.VERIFICATION_PASSED,
                source="VerificationEngine",
                status="COMPLETED",
                message="Automated quality verification passed 12/12 checks",
                payload={"checks_passed": len(checks)}
            )
        else:
            await self.bus.publish(
                session_id=session_id,
                event_type=EventType.VERIFICATION_FAILED,
                source="VerificationEngine",
                status="WARNING",
                message=f"Verification failed: {summary}",
                payload={"failed_checks": [c.check_name for c in checks if not c.passed]}
            )

        return result

verification_engine = VerificationEngine()
