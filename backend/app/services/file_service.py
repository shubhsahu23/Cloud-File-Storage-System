import os
import shutil
import boto3
import uuid

from datetime import datetime

import app.db as db_module

from app.config import (
    AWS_ACCESS_KEY,
    AWS_SECRET_KEY,
    AWS_BUCKET_NAME,
    AWS_REGION
)

from bson import ObjectId

from fastapi import HTTPException


# 1 GB Storage Limit
MAX_STORAGE = 1024 * 1024 * 1024

# Detect if AWS config has placeholder values (e.g. "your-aws-access-key")
IS_LOCAL_STORAGE = (
    not AWS_ACCESS_KEY or 
    "your-" in AWS_ACCESS_KEY or 
    not AWS_BUCKET_NAME or 
    "your-" in AWS_BUCKET_NAME
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

if IS_LOCAL_STORAGE:
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    s3_client = None
    print("📂 AWS Credentials are placeholders. Using local directory 'backend/uploads' for file storage.")
else:
    # S3 Client
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=AWS_ACCESS_KEY,
        aws_secret_access_key=AWS_SECRET_KEY,
        region_name=AWS_REGION
    )


# Upload File
async def upload_file(
    file,
    current_user
):

    if db_module.db is None:
        raise HTTPException(status_code=503, detail="Database not initialized")

    # Get all user files
    user_files = await db_module.db.files.find(
        {
            "uploaded_by": current_user["email"]
        }
    ).to_list(length=None)

    # Calculate current storage usage
    current_storage = sum(
        file.get("file_size", 0)
        for file in user_files
    )

    # Check storage limit
    if (
        current_storage + file.size
        > MAX_STORAGE
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Storage limit exceeded "
                "(1 GB max)"
            )
        )

    # Generate unique filename
    unique_filename = (
        f"{uuid.uuid4()}-{file.filename}"
    )

    if IS_LOCAL_STORAGE:
        # Save file to local disk
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Point to local StaticFiles mount path
        file_url = f"http://127.0.0.1:8000/uploads/{unique_filename}"
    else:
        # Upload to S3
        s3_client.upload_fileobj(
            file.file,
            AWS_BUCKET_NAME,
            unique_filename
        )
        file_url = (
            f"https://{AWS_BUCKET_NAME}.s3."
            f"{AWS_REGION}.amazonaws.com/"
            f"{unique_filename}"
        )

    # Save metadata in MongoDB
    file_data = {
        "filename": unique_filename,
        "original_filename": file.filename,
        "file_url": file_url,
        "file_type": file.content_type,
        "file_size": file.size,
        "uploaded_by": current_user["email"],
        "created_at": datetime.utcnow(),
        "is_deleted": False
    }

    await db_module.db.files.insert_one(file_data)

    return {
        "message": "File uploaded successfully" + (" (Local Storage)" if IS_LOCAL_STORAGE else " (AWS S3)"),
        "file_url": file_url
    }


# Get User Files
async def get_user_files(
    current_user
):

    if db_module.db is None:
        raise HTTPException(status_code=503, detail="Database not initialized")

    files = await db_module.db.files.find(
        {
            "uploaded_by": current_user["email"],
            "is_deleted": {"$ne": True}
        }
    ).to_list(length=None)

    # Convert ObjectId to string
    for file in files:
        file["_id"] = str(file["_id"])

    return {
        "files": files
    }


# Delete File (Soft Delete)
async def delete_file(
    file_id,
    current_user
):

    if db_module.db is None:
        raise HTTPException(status_code=503, detail="Database not initialized")

    # Find file in database
    file = await db_module.db.files.find_one(
        {
            "_id": ObjectId(file_id),
            "uploaded_by": current_user["email"]
        }
    )

    if not file:
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    # Soft delete: update is_deleted = True and set deleted_at
    await db_module.db.files.update_one(
        {"_id": ObjectId(file_id)},
        {
            "$set": {
                "is_deleted": True,
                "deleted_at": datetime.utcnow()
            }
        }
    )

    return {
        "message": "File moved to trash successfully"
    }


# Get Single File
async def get_file(
    file_id,
    current_user
):

    if db_module.db is None:
        raise HTTPException(status_code=503, detail="Database not initialized")

    file = await db_module.db.files.find_one(
        {
            "_id": ObjectId(file_id),
            "uploaded_by": current_user["email"]
        }
    )

    if not file:
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    file["_id"] = str(file["_id"])

    return {
        "file": file
    }


# Delete File (Admin)
async def delete_file_admin(
    file_id
):
    if db_module.db is None:
        raise HTTPException(status_code=503, detail="Database not initialized")

    # Find file in database
    file = await db_module.db.files.find_one(
        {
            "_id": ObjectId(file_id)
        }
    )

    if not file:
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    # Delete physical file
    if IS_LOCAL_STORAGE:
        file_path = os.path.join(UPLOAD_DIR, file["filename"])
        if os.path.exists(file_path):
            os.remove(file_path)
    else:
        s3_client.delete_object(
            Bucket=AWS_BUCKET_NAME,
            Key=file["filename"]
        )

    # Delete metadata from MongoDB
    await db_module.db.files.delete_one(
        {
            "_id": ObjectId(file_id)
        }
    )

    return {
        "message": "File deleted successfully by admin"
    }


# Get User Trash Files
async def get_trash_files(
    current_user
):
    if db_module.db is None:
        raise HTTPException(status_code=503, detail="Database not initialized")

    files = await db_module.db.files.find(
        {
            "uploaded_by": current_user["email"],
            "is_deleted": True
        }
    ).to_list(length=None)

    for file in files:
        file["_id"] = str(file["_id"])

    return {
        "files": files
    }


# Restore File from Trash
async def restore_file(
    file_id,
    current_user
):
    file = await db.files.find_one(
        {
            "_id": ObjectId(file_id),
            "uploaded_by": current_user["email"],
            "is_deleted": True
        }
    )

    if not file:
        raise HTTPException(
            status_code=404,
            detail="File not found in trash"
        )

    # Restore: update is_deleted = False and remove deleted_at
    await db.files.update_one(
        {"_id": ObjectId(file_id)},
        {
            "$set": {
                "is_deleted": False
            },
            "$unset": {
                "deleted_at": ""
            }
        }
    )

    return {
        "message": "File restored successfully"
    }


# Permanent Delete File
async def permanent_delete_file(
    file_id,
    current_user
):
    file = await db.files.find_one(
        {
            "_id": ObjectId(file_id),
            "uploaded_by": current_user["email"],
            "is_deleted": True
        }
    )

    if not file:
        raise HTTPException(
            status_code=404,
            detail="File not found in trash"
        )

    # Permanent delete: remove physical file
    if IS_LOCAL_STORAGE:
        file_path = os.path.join(UPLOAD_DIR, file["filename"])
        if os.path.exists(file_path):
            os.remove(file_path)
    else:
        s3_client.delete_object(
            Bucket=AWS_BUCKET_NAME,
            Key=file["filename"]
        )

    # Delete metadata from MongoDB
    await db.files.delete_one(
        {
            "_id": ObjectId(file_id)
        }
    )

    return {
        "message": "File permanently deleted from storage"
    }