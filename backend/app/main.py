import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from fastapi.middleware.cors import (
    CORSMiddleware
)

from app.routes.auth import (
    router as auth_router
)

from app.routes.files import (
    router as files_router
)

from app.config import CORS_ORIGINS

app = FastAPI()

# Mount local uploads directory as static files route
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in CORS_ORIGINS.split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    auth_router,
    prefix="/auth",
    tags=["Authentication"]
)

app.include_router(
    files_router,
    prefix="/files",
    tags=["Files"]
)


@app.get("/")
def home():

    return {
        "message": "Cloud Storage API Running"
    }


from app.db import init_db, get_db


# Initialize resources on startup
@app.on_event("startup")
async def startup():
    try:
        await init_db()
    except Exception as e:
        # Log and continue so the app process stays up for debugging
        print("⚠️  MongoDB initialization failed on startup:", e)


# Auto-Seed Admin Account on Startup (runs after DB init)
@app.on_event("startup")
async def seed_admin():
    from app.utils.security import hash_password

    db = get_db()
    if db is None:
        print("⚠️  Skipping admin seed because DB is not initialized")
        return

    admin_email = "admin@gmail.com"
    existing_admin = await db.users.find_one({"email": admin_email})
    if not existing_admin:
        hashed_password = hash_password("Admin@123")
        await db.users.insert_one({
            "name": "System Administrator",
            "email": admin_email,
            "password": hashed_password,
            "role": "admin"
        })
        print("👤 Seeded Admin Account: admin@gmail.com / Admin@123")