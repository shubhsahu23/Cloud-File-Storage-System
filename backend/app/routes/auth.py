from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from app.schemas.auth import (
    UserRegister
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
async def login(
    form_data: OAuth2PasswordRequestForm = Depends()
):

    return await login_user(
        form_data.username,
        form_data.password
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