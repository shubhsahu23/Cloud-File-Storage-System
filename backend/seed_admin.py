import asyncio
import os
import sys
import bcrypt
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

# Load environment variables
load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://127.0.0.1:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "cloud_storage")

ADMIN_EMAIL = "admin@gmail.com"
ADMIN_PASSWORD = "Admin@123"
ADMIN_NAME = "System Administrator"

def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode("utf-8")

async def seed_admin():
    print(">>> Starting Database Seeder...")
    print(f"Connecting to MongoDB at: {MONGO_URL}")
    
    try:
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DATABASE_NAME]
        
        # Test connection
        await client.admin.command("ping")
        print("Connected to MongoDB successfully!")
        
        # Check if users collection exists
        users_collection = db["users"]
        
        print(f"Checking for existing admin account: {ADMIN_EMAIL}")
        existing_admin = await users_collection.find_one({"email": ADMIN_EMAIL})
        
        hashed = hash_password(ADMIN_PASSWORD)
        
        admin_doc = {
            "name": ADMIN_NAME,
            "email": ADMIN_EMAIL,
            "password": hashed,
            "role": "admin"
        }
        
        if existing_admin:
            print("Admin account already exists! Updating credentials and ensuring admin role...")
            await users_collection.update_one(
                {"_id": existing_admin["_id"]},
                {"$set": {
                    "name": ADMIN_NAME,
                    "password": hashed,
                    "role": "admin"
                }}
            )
            print("Admin account successfully updated!")
        else:
            print("Admin account not found. Creating a new one...")
            await users_collection.insert_one(admin_doc)
            print("Admin account successfully created!")
            
        print("\nSeeded Credentials:")
        print(f"   Email:    {ADMIN_EMAIL}")
        print(f"   Password: {ADMIN_PASSWORD}")
        print(f"   Role:     admin\n")
        print("Seeding completed successfully!")
        
    except Exception as e:
        print(f"Database Seeding Failed: {e}", file=sys.stderr)
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(seed_admin())
