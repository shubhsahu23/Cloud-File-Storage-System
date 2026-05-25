from fastapi import APIRouter, Depends, HTTPException

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

from app.db import db

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
        "email": current_user["email"],
        "role": current_user.get("role", "user")
    }


# Admin Route: Get All Users
@router.get("/users")
async def get_users(
    current_user=Depends(get_current_user)
):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin privileges required"
        )
    
    users = await db.users.find({}, {"password": 0}).to_list(length=None)
    for u in users:
        u["_id"] = str(u["_id"])
    return {"users": users}