import boto3
import uuid

from datetime import datetime

from app.db import db

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

    # Get all user files
    user_files = await db.files.find(
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

    # Upload to S3
    s3_client.upload_fileobj(
        file.file,
        AWS_BUCKET_NAME,
        unique_filename
    )

    # File URL
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
        "created_at": datetime.utcnow()
    }

    await db.files.insert_one(file_data)

    return {
        "message": "File uploaded successfully",
        "file_url": file_url
    }


# Get User Files
async def get_user_files(
    current_user
):

    files = await db.files.find(
        {
            "uploaded_by": current_user["email"]
        }
    ).to_list(length=None)

    # Convert ObjectId to string
    for file in files:
        file["_id"] = str(file["_id"])

    return {
        "files": files
    }


# Delete File
async def delete_file(
    file_id,
    current_user
):

    # Find file in database
    file = await db.files.find_one(
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

    # Delete file from S3
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
        "message": "File deleted successfully"
    }


# Get Single File
async def get_file(
    file_id,
    current_user
):

    file = await db.files.find_one(
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