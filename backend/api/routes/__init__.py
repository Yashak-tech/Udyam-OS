from fastapi import APIRouter
from backend.api.routes.sessions import router as sessions_router
from backend.api.routes.artifacts import router as artifacts_router
from backend.api.routes.approvals import router as approvals_router
from backend.api.routes.device import router as device_router
from backend.api.routes.office_kit import router as office_kit_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(sessions_router)
api_router.include_router(artifacts_router)
api_router.include_router(approvals_router)
api_router.include_router(device_router)
api_router.include_router(office_kit_router)
