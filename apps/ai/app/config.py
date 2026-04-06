from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    OPENAI_API_KEY: str = ""
    POSTGRES_URL: str = ""
    MONGODB_URL: str = ""
    MONGO_DB_NAME: str = "dev"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    CORS_ORIGINS: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
