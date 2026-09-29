import time
from typing import Optional
from backend.core.models import (
    SharedCompanyContext,
    ProjectGoal,
    MarketContext,
    ProductContext,
    BrandContext,
    GrowthContext
)
from backend.events.bus import event_bus
from backend.events.models import EventType
from backend.storage.repository import session_repository

class ContextManager:
    """
    Manages thread-safe reads and incremental atomic updates to SharedCompanyContext.
    Enforces that every update increments context.version and emits CONTEXT_UPDATED.
    """
    def __init__(self, repository=session_repository, bus=event_bus):
        self.repository = repository
        self.bus = bus

    def get_context(self, session_id: str) -> Optional[SharedCompanyContext]:
        session = self.repository.get_session(session_id)
        if not session:
            return None
        return session.context

    async def update_project_goal(self, session_id: str, goal: ProjectGoal) -> SharedCompanyContext:
        session = self.repository.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        session.goal = goal
        session.context.project_goal = goal
        session.context.version += 1
        session.context.updated_at = time.time()
        session.updated_at = time.time()
        self.repository.save_session(session)

        await self.bus.publish(
            session_id=session_id,
            event_type=EventType.CONTEXT_UPDATED,
            source="ContextManager",
            status="INFO",
            message=f"Project goal defined: {goal.project_name}",
            payload={"section": "project_goal", "version": session.context.version}
        )
        return session.context

    async def update_market(self, session_id: str, market: MarketContext) -> SharedCompanyContext:
        session = self.repository.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        session.context.market = market
        session.context.version += 1
        session.context.updated_at = time.time()
        session.updated_at = time.time()
        self.repository.save_session(session)

        await self.bus.publish(
            session_id=session_id,
            event_type=EventType.CONTEXT_UPDATED,
            source="ContextManager",
            status="INFO",
            message="Market intelligence updated in company context",
            payload={"section": "market", "version": session.context.version}
        )
        return session.context

    async def update_product(self, session_id: str, product: ProductContext) -> SharedCompanyContext:
        session = self.repository.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        session.context.product = product
        session.context.version += 1
        session.context.updated_at = time.time()
        session.updated_at = time.time()
        self.repository.save_session(session)

        await self.bus.publish(
            session_id=session_id,
            event_type=EventType.CONTEXT_UPDATED,
            source="ContextManager",
            status="INFO",
            message="Product requirements updated in company context",
            payload={"section": "product", "version": session.context.version}
        )
        return session.context

    async def update_brand(self, session_id: str, brand: BrandContext) -> SharedCompanyContext:
        session = self.repository.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        session.context.brand = brand
        session.context.version += 1
        session.context.updated_at = time.time()
        session.updated_at = time.time()
        self.repository.save_session(session)

        await self.bus.publish(
            session_id=session_id,
            event_type=EventType.CONTEXT_UPDATED,
            source="ContextManager",
            status="INFO",
            message="Brand design guidelines updated in company context",
            payload={"section": "brand", "version": session.context.version}
        )
        return session.context

    async def update_growth(self, session_id: str, growth: GrowthContext) -> SharedCompanyContext:
        session = self.repository.get_session(session_id)
        if not session:
            raise ValueError(f"Session {session_id} not found")
        
        session.context.growth = growth
        session.context.version += 1
        session.context.updated_at = time.time()
        session.updated_at = time.time()
        self.repository.save_session(session)

        await self.bus.publish(
            session_id=session_id,
            event_type=EventType.CONTEXT_UPDATED,
            source="ContextManager",
            status="INFO",
            message="Growth and GTM strategy updated in company context",
            payload={"section": "growth", "version": session.context.version}
        )
        return session.context

context_manager = ContextManager()
