import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Các giá trị này sẽ được ưu tiên lấy từ file .env
    OPENAI_API_KEY: str = ""
    POSTGRES_URL: str = ""
    MONGODB_URL: str = ""
    MONGO_DB_NAME: str = "dev"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    CORS_ORIGINS: str = ""

    # Tự động đọc file .env nằm cùng cấp với thư mục app/ hoặc trong apps/ai/
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
