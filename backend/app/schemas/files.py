from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# Request Schema
class FileUpload(BaseModel):
    filename: str
    file_size: int
    file_type: str


# Response Schema
class FileResponse(BaseModel):
    id: Optional[str] = None

    filename: str
    original_filename: str
    file_url: str
    file_size: int
    file_type: str

    uploaded_by: str

    created_at: Optional[datetime] = datetime.utcnow()