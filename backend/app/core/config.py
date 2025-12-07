from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Application
    app_name: str = "Team Management API"
    app_version: str = "1.0.0"
    debug: bool = True
    
    # Database
    database_url: str = "sqlite:///./team_management.db"
    
    # Security
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    
    # CORS
    allowed_origins: str = "http://localhost:3000,http://127.0.0.1:3000"
    
    # Email
    smtp_host: str = "localhost"
    smtp_port: int = 1025
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from_email: str = "noreply@teammanagement.local"
    smtp_from_name: str = "Team Management System"
    
    # Rate Limiting
    redis_url: str = "redis://localhost:6379/0"
    
    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",")]
    
    class Config:
        env_file = "C:\\Users\\Dell\\take2\\invite-system\\backend\\.env.local"


settings = Settings()