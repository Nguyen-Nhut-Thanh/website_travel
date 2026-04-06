import os

import dns.resolver
from motor.motor_asyncio import AsyncIOMotorClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.config import settings


def configure_dns_resolver() -> None:
    resolver = dns.resolver.Resolver(configure=False)
    resolver.nameservers = ["8.8.8.8", "8.8.4.4", "1.1.1.1"]
    dns.resolver.default_resolver = resolver


configure_dns_resolver()

mongo_url = settings.MONGODB_URL or os.getenv("MONGODB_CONNECTIONSTRING", "")

if mongo_url:
    mongo_client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=5000)
    mongo_db = mongo_client[settings.MONGO_DB_NAME]
    chat_collection = mongo_db["chat_history"]
else:
    mongo_client = None
    mongo_db = None
    chat_collection = None

engine = create_async_engine(settings.POSTGRES_URL, echo=False)
AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
