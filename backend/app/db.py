from motor.motor_asyncio import AsyncIOMotorClient
from app.config import MONGO_URL, DATABASE_NAME

# Create MongoDB client
client = AsyncIOMotorClient(MONGO_URL)

# Select database
db = client[DATABASE_NAME]


# Check database connection
async def connect_to_mongo():
    try:
        await client.admin.command("ping")
        print("✅ Connected to MongoDB")
    except Exception as e:
        print("❌ MongoDB Connection Error:", e)
