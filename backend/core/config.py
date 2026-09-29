import os
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    APP_NAME: str = "Udyam OS"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    
    # Root paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    ARTIFACTS_DIR: Path = BASE_DIR / "artifacts" / "sessions"
    STORAGE_DB_PATH: Path = BASE_DIR / "backend" / "storage" / "udyam.db"
    
    # Model configuration
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "deterministic") # deterministic, gemini, openai
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Guardrails
    AGENT_MAX_STEPS: int = 5
    AGENT_TIMEOUT_SECONDS: int = 60
    MAX_VERIFICATION_RETRIES: int = 1

settings = Settings()
settings.ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
settings.STORAGE_DB_PATH.parent.mkdir(parents=True, exist_ok=True)
