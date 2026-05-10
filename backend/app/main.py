from fastapi import FastAPI

from app.routes.auth import router as auth_router
from app.routes.files import router as files_router

app = FastAPI()

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