from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class FileModel(BaseModel):
    filename: str
    original_filename: str
    file_url: str
    file_size: int
    file_type: str

    uploaded_by: str

    created_at: Optional[datetime] = datetime.utcnow()