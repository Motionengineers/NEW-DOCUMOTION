"""Authentication configuration settings."""
from pydantic_settings import BaseSettings
from typing import Optional

class AuthSettings(BaseSettings):
    # In production, these should be loaded from environment variables
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    API_KEY_TTL_DAYS: int = 365

    class Config:
        env_prefix = "AUTH_"

auth_settings = AuthSettings()