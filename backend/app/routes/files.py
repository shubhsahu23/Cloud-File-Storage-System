from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Depends,
    HTTPException
)

from app.services.file_service import (
    upload_file,
    get_user_files,
    delete_file,
    get_file,
    delete_file_admin,
    get_trash_files,
    restore_file,
    permanent_delete_file
)

from app.utils.security import (
    get_current_user
)

from app.db import db

router = APIRouter()


# 1. Upload File
@router.post("/upload")
async def upload(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user)
):
    return await upload_file(
        file,
        current_user
    )


# 2. Get User Files
@router.get("/my-files")
async def my_files(
    current_user=Depends(get_current_user)
):
    return await get_user_files(
        current_user
    )


# 3. Get User Trash Files (Must be above GET /{file_id})
@router.get("/trash")
async def trash_files(
    current_user=Depends(get_current_user)
):
    return await get_trash_files(
        current_user
    )


# 4. Admin Route: Get All Files Across System (Must be above GET /{file_id})
@router.get("/all-files")
async def all_files(
    current_user=Depends(get_current_user)
):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin privileges required"
        )
    
    files = await db.files.find({}).to_list(length=None)
    for file in files:
        file["_id"] = str(file["_id"])
    return {"files": files}


# 5. Restore File from Trash (Must be above GET /{file_id})
@router.post("/{file_id}/restore")
async def restore(
    file_id: str,
    current_user=Depends(get_current_user)
):
    return await restore_file(
        file_id,
        current_user
    )


# 6. Permanent Delete File (Must be above DELETE /{file_id})
@router.delete("/{file_id}/permanent")
async def permanent_remove(
    file_id: str,
    current_user=Depends(get_current_user)
):
    return await permanent_delete_file(
        file_id,
        current_user
    )


# 7. Get Single File (Dynamic route - placed below static/restore routes)
@router.get("/{file_id}")
async def single_file(
    file_id: str,
    current_user=Depends(get_current_user)
):
    return await get_file(
        file_id,
        current_user
    )


# 8. Admin Route: Delete Any File (Must be above DELETE /{file_id})
@router.delete("/admin/{file_id}")
async def admin_remove_file(
    file_id: str,
    current_user=Depends(get_current_user)
):
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin privileges required"
        )
    
    return await delete_file_admin(file_id)


# 9. Delete File (Soft Delete - Dynamic route - placed below static/admin delete routes)
@router.delete("/{file_id}")
async def remove_file(
    file_id: str,
    current_user=Depends(get_current_user)
):
    return await delete_file(
        file_id,
        current_user
    )