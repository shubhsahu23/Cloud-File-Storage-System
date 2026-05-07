from fastapi import APIRouter
from app.schemas.auth import (
    UserRegister,
    UserLogin
)

from app.services.auth_service import (
    register_user,
    login_user
)

router = APIRouter()


@router.post("/register")
async def register(user: UserRegister):
    return await register_user(user)


@router.post("/login")
async def login(user: UserLogin):
    return await login_user(user)