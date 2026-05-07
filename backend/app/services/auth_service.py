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
        return {"message": "User already exists"}

    hashed_password = hash_password(user.password)

    new_user = {
        "name": user.name,
        "email": user.email,
        "password": hashed_password
    }

    await db.users.insert_one(new_user)

    return {"message": "User registered successfully"}


# Login User
async def login_user(user):

    existing_user = await db.users.find_one(
        {"email": user.email}
    )

    if not existing_user:
        return {"message": "Invalid email"}

    password_match = verify_password(
        user.password,
        existing_user["password"]
    )

    if not password_match:
        return {"message": "Invalid password"}

    token = create_access_token(
        {"email": existing_user["email"]}
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }