from fastapi import APIRouter, HTTPException, status

router = APIRouter(prefix="/input", tags=["Device Input"])

@router.post("/voice", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def ingest_voice():
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Voice input ingestion scheduled for Phase 6 device integration."
    )

@router.post("/camera", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def ingest_camera():
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Camera/sketch ingestion scheduled for Phase 6 device integration."
    )
