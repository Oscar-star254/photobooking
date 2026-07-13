from flask import request, jsonify, current_app
from flask_jwt_extended import get_jwt_identity
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
    identity = get_jwt_identity()
    if identity["role"] != "admin":
        return jsonify({"error": "Admin access required"}), 403

    db       = get_db()
    file     = request.files.get("photo")
    category = request.form.get("category", "General")
    title    = request.form.get("title", "")

    # Basic validation: check size and allowed extensions
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
        uploaded = storage.upload_photo(
            file_bytes, file.filename, "portfolio", content_type
        )
    except Exception as e:
        logging.exception("Storage upload failed")
        # return safe error to client and log details server-side
        return jsonify({"error": "Storage upload failed"}), 502

    try:
        photo_doc = {
            "storage_key": uploaded["key"],
            "url":         uploaded["url"],
            "category":    category,
            "title":       title,
            "is_active":   True,
            "uploaded_by": identity["id"],
            "created_at":  datetime.now(timezone.utc),
        }
        result = db.portfolio.insert_one(photo_doc)
    except Exception:
        logging.exception("Failed to save portfolio record to database")
        # attempt to clean up storage if possible
        try:
            storage.delete_photo(uploaded.get("key"))
        except Exception:
            pass
        return jsonify({"error": "Failed to record upload"}), 500

    return jsonify({
        "message": "Photo uploaded successfully",
        "photo": {
            "id":       str(result.inserted_id),
            "url":      uploaded["url"],
            "category": category,
            "title":    title,
        }
    }), 201


def delete_portfolio_photo(photo_id):
    identity = get_jwt_identity()
    if identity["role"] != "admin":
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
