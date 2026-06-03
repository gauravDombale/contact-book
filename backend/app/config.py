from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = "sqlite+aiosqlite:///./contacts.db"
    APP_NAME: str = "ContactBook API"
    DEBUG: bool = Field(default=True, validation_alias="APP_DEBUG")


settings = Settings()
