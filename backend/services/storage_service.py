import os
import uuid
from pathlib import Path
from flask import current_app

UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"


class StorageService:
    def __init__(self):
        self.provider = os.getenv("STORAGE_PROVIDER", "local")
        self.public_url = os.getenv("R2_PUBLIC_URL", "")
        self.bucket = os.getenv("R2_BUCKET_NAME", "")

        if self.provider in ("r2", "s3"):
            import boto3
            from botocore.config import Config
            if self.provider == "r2":
                account_id = os.getenv("R2_ACCOUNT_ID")
                self.client = boto3.client(
                    "s3",
                    endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
                    aws_access_key_id=os.getenv("R2_ACCESS_KEY_ID"),
                    aws_secret_access_key=os.getenv("R2_SECRET_ACCESS_KEY"),
                    config=Config(signature_version="s3v4"),
                    region_name="auto",
                )
            else:
                self.client = boto3.client(
                    "s3",
                    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
                    region_name=os.getenv("AWS_REGION", "af-south-1"),
                )
        else:
            self.client = None

    def upload_photo(self, file_bytes, filename, folder, content_type="image/jpeg"):
        ext = Path(filename).suffix.lower() or ".jpg"
        unique_name = f"{uuid.uuid4().hex}{ext}"
        key = f"{folder}/{unique_name}"

        if self.client:
            self.client.put_object(
                Bucket=self.bucket,
                Key=key,
                Body=file_bytes,
                ContentType=content_type,
            )
            url = f"{self.public_url}/{key}" if self.public_url else self.get_signed_url(key)
        else:
            # Local storage fallback
            save_dir = UPLOAD_DIR / folder
            save_dir.mkdir(parents=True, exist_ok=True)
            save_path = save_dir / unique_name
            save_path.write_bytes(file_bytes)
            url = f"/uploads/{folder}/{unique_name}"

        return {
            "key": key,
            "filename": unique_name,
            "original_filename": filename,
            "url": url,
            "size": len(file_bytes),
        }

    def upload_watermarked(self, file_bytes, filename, folder):
        try:
            watermarked = self._apply_watermark(file_bytes)
        except Exception:
            watermarked = file_bytes
        return self.upload_photo(watermarked, f"wm_{filename}", f"{folder}/watermarked")

    def get_signed_url(self, key, expires_in=3600):
        if self.client:
            return self.client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket, "Key": key},
                ExpiresIn=expires_in,
            )
        return f"/uploads/{key}"

    def delete_photo(self, key):
        if self.client:
            try:
                self.client.delete_object(Bucket=self.bucket, Key=key)
            except Exception:
                pass
        else:
            try:
                file_path = UPLOAD_DIR / key
                if file_path.exists():
                    file_path.unlink()
            except Exception:
                pass

    def _apply_watermark(self, image_bytes):
        from PIL import Image, ImageDraw, ImageFont
        import io

        img = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
        width, height = img.size
        overlay = Image.new("RGBA", img.size, (255, 255, 255, 0))
        draw = ImageDraw.Draw(overlay)
        text = "© LENSKENYA"
        font_size = max(width // 20, 24)
        try:
            font = ImageFont.truetype(
                "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size
            )
        except Exception:
            font = ImageFont.load_default()

        for y in range(0, height, height // 3):
            for x in range(0, width, width // 2):
                draw.text((x, y), text, fill=(255, 255, 255, 100), font=font)

        watermarked = Image.alpha_composite(img, overlay).convert("RGB")
        output = io.BytesIO()
        watermarked.save(output, format="JPEG", quality=85)
        return output.getvalue()


storage = StorageService()
