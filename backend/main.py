from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.core.config import settings
from backend.api import api_router, ws_router

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Udyam OS Core Backend — Phone-First AI Company Command Center"
)

# Enable CORS for local PWA/browser testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health endpoint (Phase 5 requirement)
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "ok",
        "service": "udyam-os"
    }

# Mount REST and WebSocket routers
app.include_router(api_router)
app.include_router(ws_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=settings.HOST, port=settings.PORT, reload=True)
