from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import InvalidURI
from app.config import MONGO_URL, DATABASE_NAME

# Lazy-initialized Mongo client and database
client: AsyncIOMotorClient | None = None
db = None


async def init_db():
    """Initialize MongoDB client and test connection. Raises on failure."""
    global client, db
    if not MONGO_URL:
        print("❌ MONGO_URL not set")
        raise RuntimeError("MONGO_URL is not configured")
    try:
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DATABASE_NAME]
        # verify connection
        await client.admin.command("ping")
        print("✅ Connected to MongoDB")
    except InvalidURI as e:
        print("❌ MongoDB InvalidURI:", e)
        client = None
        db = None
        raise
    except Exception as e:
        print("❌ MongoDB Connection Error:", e)
        client = None
        db = None
        raise


def get_db():
    return db
