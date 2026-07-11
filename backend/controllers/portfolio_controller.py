import os
from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity
from datetime import datetime, timezone
from bson import ObjectId
from utils.db import get_db
from services.storage_service import storage


def _to_public_url(url, base_url):
    if not url:
        return url
    if url.startswith(("http://", "https://")):
        return url
    if url.startswith("/"):
        return f"{base_url}{url}"
    return f"{base_url}/{url}"


def get_portfolio():
    db = get_db()
    base_url = os.getenv("APP_BASE_URL", request.host_url.rstrip("/"))
    photos = list(db.portfolio.find(
        {"is_active": True},
        sort=[("created_at", -1)]
    ))
    result = [{
        "id":       str(p["_id"]),
        "url":      _to_public_url(p["url"], base_url),
        "category": p["category"],
        "title":    p.get("title", ""),
        "created_at": p["created_at"].isoformat() if p.get("created_at") else None,
    } for p in photos]
    return jsonify({"photos": result}), 200


def upload_portfolio_photo():
    identity = get_jwt_identity()
    if identity["role"] != "admin":
        return jsonify({"error": "Admin access required"}), 403

    db = get_db()
    base_url = os.getenv("APP_BASE_URL", request.host_url.rstrip("/"))
    file     = request.files.get("photo")
    category = request.form.get("category", "General")
    title    = request.form.get("title", "")

    if not file:
        return jsonify({"error": "No photo provided"}), 400

    file_bytes   = file.read()
    content_type = file.content_type or "image/jpeg"

    try:
        uploaded = storage.upload_photo(
            file_bytes, file.filename, "portfolio", content_type
        )
        photo_doc = {
            "storage_key": uploaded["key"],
            "url":         _to_public_url(uploaded["url"], base_url),
            "category":    category,
            "title":       title,
            "is_active":   True,
            "uploaded_by": identity["id"],
            "created_at":  datetime.now(timezone.utc),
        }
        result = db.portfolio.insert_one(photo_doc)
        return jsonify({
            "message": "Photo uploaded successfully",
            "photo": {
                "id":       str(result.inserted_id),
                "url":      _to_public_url(uploaded["url"], base_url),
                "category": category,
                "title":    title,
            }
        }), 201
    except Exception as e:
        return jsonify({"error": f"Upload failed: {str(e)}"}), 500


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