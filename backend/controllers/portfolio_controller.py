from flask import request, jsonify, current_app
from flask_jwt_extended import get_jwt_identity, get_jwt
from datetime import datetime, timezone
from bson import ObjectId
from utils.db import get_db
from services.storage_service import storage
import logging


def get_portfolio():
    db = get_db()
    photos = list(db.portfolio.find(
        {"is_active": True},
        sort=[("created_at", -1)]
    ))
    result = [{
        "id":         str(p["_id"]),
        "url":        p["url"],
        "category":   p["category"],
        "title":      p.get("title", ""),
        "created_at": p["created_at"].isoformat() if p.get("created_at") else None,
    } for p in photos]
    return jsonify({"photos": result}), 200


def upload_portfolio_photo():
    user_id = get_jwt_identity()
    claims = get_jwt()
    if not user_id or claims.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403

    db = get_db()
    file = request.files.get("photo")
    if not file:
        return jsonify({"error": "No photo provided"}), 400

    category = request.form.get("category", "General")
    title = request.form.get("title", "")

    try:
        filename = file.filename or "upload"
        ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
        allowed = {"jpg", "jpeg", "png", "gif", "webp"}
        max_size = current_app.config.get("MAX_CONTENT_LENGTH", 50 * 1024 * 1024)

        file_bytes = file.read()
        if len(file_bytes) == 0:
            return jsonify({"error": "Empty file uploaded"}), 400
        if len(file_bytes) > max_size:
            return jsonify({"error": "File too large"}), 400
        if ext and ext not in allowed:
            return jsonify({"error": "Unsupported file type"}), 400

        content_type = file.content_type or "image/jpeg"

        try:
            logging.info("Uploading portfolio photo: filename=%s size=%d user=%s", filename, len(file_bytes), user_id)
            uploaded = storage.upload_photo(file_bytes, filename, "portfolio", content_type)
        except Exception:
            logging.exception("Storage upload failed")
            return jsonify({"error": "Storage upload failed"}), 502

        # Fix URL — make absolute so frontend can load it
        backend_url = "https://photobooking-2-d4nb.onrender.com"
        photo_url = uploaded["url"]
        if photo_url.startswith("/"):
            photo_url = f"{backend_url}{photo_url}"

        try:
            photo_doc = {
                "storage_key": uploaded["key"],
                "url":         photo_url,
                "category":    category,
                "title":       title,
                "is_active":   True,
                "uploaded_by": user_id,
                "created_at":  datetime.now(timezone.utc),
            }
            result = db.portfolio.insert_one(photo_doc)
        except Exception:
            logging.exception("Failed to save portfolio record to database")
            try:
                storage.delete_photo(uploaded.get("key"))
            except Exception:
                pass
            return jsonify({"error": "Failed to record upload"}), 500

        return jsonify({
            "message": "Photo uploaded successfully",
            "photo": {
                "id":       str(result.inserted_id),
                "url":      photo_url,
                "category": category,
                "title":    title,
            }
        }), 201
    except Exception:
        logging.exception("Unexpected error during portfolio upload")
        return jsonify({"error": "Internal server error"}), 500


def delete_portfolio_photo(photo_id):
    user_id = get_jwt_identity()
    claims = get_jwt()
    if not user_id or claims.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403

    db = get_db()
    try:
        photo = db.portfolio.find_one({"_id": ObjectId(photo_id)})
    except Exception:
        return jsonify({"error": "Invalid photo ID"}), 400

    if not photo:
        return jsonify({"error": "Photo not found"}), 404

    try:
        storage.delete_photo(photo["storage_key"])
    except Exception:
        pass

    db.portfolio.delete_one({"_id": ObjectId(photo_id)})
    return jsonify({"message": "Photo deleted"}), 200


def storage_health():
    try:
        if storage.client:
            try:
                storage.client.list_buckets()
                ok = True
                details = "remote storage reachable"
            except Exception as e:
                ok = False
                details = f"remote storage error: {str(e)}"
        else:
            from pathlib import Path
            UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
            ok = UPLOAD_DIR.exists() and UPLOAD_DIR.is_dir()
            details = "local uploads directory present" if ok else "uploads directory missing"
    except Exception as e:
        ok = False
        details = str(e)

    status_code = 200 if ok else 500
    return jsonify({"ok": ok, "details": details}), status_code