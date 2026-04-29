from pydantic import BaseModel, EmailStr
from typing import Optional

#Register Request
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

#Login Request
class UserLogin(BaseModel):
    email: EmailStr
    password: str

#Response Schema (User)
class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr

    class Config:
        from_attributes = True  # for SQLAlchemy

#Token Response
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"