import os
import uuid
from pathlib import Path
from datetime import datetime

UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads" / "portfolio"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


class StorageService:
    def __init__(self):
        self.enabled = bool(os.getenv("S3_BUCKET"))

    def upload_photo(self, file_bytes, filename, folder, content_type):
        if not self.enabled:
            ext = Path(filename).suffix or ".jpg"
            key = f"{folder}/{uuid.uuid4().hex}{ext}"
            file_path = UPLOAD_DIR / key.split("/", 1)[1]
            file_path.parent.mkdir(parents=True, exist_ok=True)
            file_path.write_bytes(file_bytes)
            return {
                "key": key,
                "url": f"/uploads/portfolio/{file_path.name}",
            }

        raise RuntimeError("Cloud storage is not configured")

    def delete_photo(self, storage_key):
        if not self.enabled:
            relative = storage_key.split("/", 1)[1] if "/" in storage_key else storage_key
            file_path = UPLOAD_DIR / relative
            if file_path.exists():
                file_path.unlink()
            return

        raise RuntimeError("Cloud storage is not configured")


storage = StorageService()
