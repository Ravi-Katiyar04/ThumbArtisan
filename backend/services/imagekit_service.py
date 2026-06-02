from imagekitio import ImageKit

from config import IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT

imagekit = ImageKit(
    private_key=IMAGEKIT_PRIVATE_KEY
)

def upload_file(file_bytes: bytes, file_name: str, folder: str, content_type: str = "image/jpeg") -> str:
    """upload image"""
    try:
        response = imagekit.files.upload(
            file=file_bytes,
            file_name=file_name,
            folder=folder,
            is_private_file=False,
            use_unique_file_name=True
        )
        return response.url
    except Exception as e:
        print(f"Error uploading file to ImageKit: {e}")
        raise


def get_variant(base_url: str) -> dict:
    """Return 3 variants of the image with different transformations."""
    return {
        "youtube": f"{base_url}?tr=w-1280,h-720,c-maintain_ratio,fo-auto",
        "shorts": f"{base_url}?tr=w-1080,h-1920,c-maintain_ratio,fo-auto",
        "square": f"{base_url}?tr=w-1080,h-1080,c-maintain_ratio,fo-auto"
    }