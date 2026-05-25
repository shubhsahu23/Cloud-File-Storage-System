from fastapi import APIRouter, Depends

from app.schemas.auth import (
    UserRegister,
    UserLogin
)

from app.services.auth_service import (
    register_user,
    login_user
)

from app.utils.security import (
    get_current_user
)

router = APIRouter()


# Register
@router.post("/register")
async def register(user: UserRegister):
    return await register_user(user)


# Login
@router.post("/login")
async def login(user: UserLogin):
    return await login_user(
        user.email,
        user.password
    )


# Protected Route
@router.get("/me")
async def get_me(
    current_user=Depends(get_current_user)
):

    return {
        "name": current_user["name"],
        "email": current_user["email"]
    }