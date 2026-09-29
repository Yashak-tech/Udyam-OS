from fastapi import APIRouter, HTTPException, status

router = APIRouter(prefix="/office-kit", tags=["Office Kit"])

@router.post("/sync", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def sync_office_kit():
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Office Kit desk-sync scheduled for Phase 6 desktop integration."
    )
