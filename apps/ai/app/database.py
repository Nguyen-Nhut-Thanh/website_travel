from motor.motor_asyncio import AsyncIOMotorClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.config import settings
import dns.resolver

# --- Fix DNS for MongoDB Atlas (SRV) ---
# Ép ứng dụng sử dụng Google DNS để tránh lỗi DNS Timeout khi dùng mạng Hotspot/4G
dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
dns.resolver.default_resolver.nameservers = ['8.8.8.8', '8.8.4.4', '1.1.1.1']

# --- MongoDB Setup ---
mongo_client = AsyncIOMotorClient(settings.MONGODB_URL)
mongo_db = mongo_client[settings.MONGO_DB_NAME]
chat_collection = mongo_db["chat_history"]

# --- PostgreSQL Setup ---
# URL trong .env đã bao gồm postgresql+asyncpg://
pg_url = settings.POSTGRES_URL
engine = create_async_engine(pg_url, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
