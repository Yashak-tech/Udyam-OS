from typing import Dict, Any, Optional
from backend.core.models import Session

class DeviceAdapter:
    """
    Device abstraction isolating physical iQOO phone capabilities.
    Maps mobile events, notifications, and multimodal stubs to backend contracts.
    """
    @staticmethod
    def format_approval_card(session: Session) -> Dict[str, Any]:
        return {
            "title": f"Ready to Launch: {session.goal.project_name if session.goal else 'Your Venture'}",
            "tagline": session.goal.tagline if session.goal else "",
            "preview_url": f"/api/v1/sessions/{session.session_id}/artifacts/art_landing_page?raw=true",
            "available_actions": ["APPROVE", "REVISE"]
        }

    @staticmethod
    def trigger_haptic_alert() -> Dict[str, Any]:
        """Provides mobile browser haptic vibration instructions."""
        return {"action": "vibrate", "pattern": [100, 50, 100]}
