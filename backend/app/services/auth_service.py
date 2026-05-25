from fastapi import HTTPException

from app.db import db

from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token
)


# Register User
async def register_user(user):

    existing_user = await db.users.find_one(
        {"email": user.email}
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User already exists"
        )

    hashed_password = hash_password(
        user.password
    )

    role = "admin" if user.email.lower().startswith("admin@") else "user"

    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hashed_password,
        "role": role
    }

    await db.users.insert_one(new_user)

    return {
        "message": "User registered successfully"
    }


# Login User
async def login_user(
    email: str,
    password: str
):

    existing_user = await db.users.find_one(
        {"email": email}
    )

    if not existing_user:
        raise HTTPException(
            status_code=400,
            detail="Invalid email"
        )

    password_match = verify_password(
        password,
        existing_user["password"]
    )

    if not password_match:
        raise HTTPException(
            status_code=400,
            detail="Invalid password"
        )

    token = create_access_token(
        {
            "email": existing_user["email"]
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": existing_user.get("role", "user")
    }