from datetime import datetime, timedelta

from jose import JWTError, jwt

import bcrypt

from fastapi import Depends, HTTPException, status

from fastapi.security import OAuth2PasswordBearer

from app.config import SECRET_KEY, ALGORITHM

from app.db import db


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


# Hash Password
def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode("utf-8")


# Verify Password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    pwd_bytes = plain_password.encode("utf-8")
    hashed_bytes = hashed_password.encode("utf-8")
    return bcrypt.checkpw(pwd_bytes, hashed_bytes)


# Create JWT Token
def create_access_token(data: dict):

    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(hours=1)

    to_encode.update({"exp": expire})

    token = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token


# Verify Current User
async def get_current_user(
    token: str = Depends(oauth2_scheme)
):

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid token"
    )

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        email = payload.get("email")

        if email is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = await db.users.find_one(
        {"email": email}
    )

    if user is None:
        raise credentials_exception

    return user