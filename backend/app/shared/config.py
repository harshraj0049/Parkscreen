from pydantic_settings import BaseSettings
from pathlib import Path

ENV_PATH = Path(__file__).resolve().parents[3] / ".env"

class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DATABASE_URL: str

    class Config:
        env_file = ".env"    # ← str(ENV_PATH) not ".env"

settings = Settings()