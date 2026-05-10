from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Depends
)

from app.services.file_service import (
    upload_file,
    get_user_files,
    delete_file
)

from app.utils.security import (
    get_current_user
)

from app.services.file_service import (
    upload_file,
    get_user_files,
    delete_file,
    get_file
)

router = APIRouter()


# Upload File
@router.post("/upload")
async def upload(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user)
):

    return await upload_file(
        file,
        current_user
    )


# Get User Files
@router.get("/my-files")
async def my_files(
    current_user=Depends(get_current_user)
):

    return await get_user_files(
        current_user
    )


# Delete File
@router.delete("/{file_id}")
async def remove_file(
    file_id: str,
    current_user=Depends(get_current_user)
):

    return await delete_file(
        file_id,
        current_user
    )

    # Get Single File
@router.get("/{file_id}")
async def single_file(
    file_id: str,
    current_user=Depends(get_current_user)
):

    return await get_file(
        file_id,
        current_user
    )