from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    env: str = "development"
    database_url: str = "postgresql+psycopg://weathero:weathero@localhost:5435/weathero"
    cors_origins: str = "http://localhost:5173"
    api_prefix: str = "/api/v1"
    openweather_api_key: str = ""
    open_meteo_enabled: bool = True


settings = Settings()
