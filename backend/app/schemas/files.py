from pydantic import BaseModel
from typing import Optional
from datetime import datetime

#File Upload Response
class FileUploadResponse(BaseModel):
    filename: str
    file_url: str

#File Metadata (DB response)
class FileResponse(BaseModel):
    id: int
    filename: str
    file_url: str
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True