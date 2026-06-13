from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity
from datetime import datetime, timezone
from bson import ObjectId
from utils.db import get_db

def get_my_galleries():
    identity = get_jwt_identity()
    db = get_db()
    galleries = list(db.galleries.find({"user_id": identity["id"]}, sort=[("created_at", -1)]))
    result = []
    for g in galleries:
        photo_count = db.photos.count_documents({"gallery_id": str(g["_id"])})
        result.append({"id": str(g["_id"]), "title": g["title"], "booking_id": g.get("booking_id"), "user_id": g["user_id"], "is_paid": g.get("is_paid", False), "photo_count": photo_count, "cover_url": g.get("cover_url"), "created_at": g["created_at"].isoformat() if g.get("created_at") else None})
    return jsonify({"galleries": result}), 200

def get_gallery(gallery_id):
    identity = get_jwt_identity()
    db = get_db()
    try:
        gallery = db.galleries.find_one({"_id": ObjectId(gallery_id)})
    except Exception:
        return jsonify({"error": "Invalid gallery ID"}), 400
    if not gallery:
        return jsonify({"error": "Gallery not found"}), 404
    if identity["role"] != "admin" and gallery["user_id"] != identity["id"]:
        return jsonify({"error": "Access denied"}), 403
    photos = list(db.photos.find({"gallery_id": gallery_id}))
    is_paid = gallery.get("is_paid", False)
    photo_list = [{"id": str(p["_id"]), "url": p.get("watermark_url", p.get("url")) if not is_paid else p.get("url"), "thumbnail": p.get("watermark_url", p.get("url")), "filename": p["original_filename"], "is_locked": not is_paid} for p in photos]
    return jsonify({"gallery": {"id": str(gallery["_id"]), "title": gallery["title"], "booking_id": gallery.get("booking_id"), "is_paid": is_paid, "photo_count": len(photo_list), "cover_url": gallery.get("cover_url"), "created_at": gallery["created_at"].isoformat() if gallery.get("created_at") else None}, "photos": photo_list}), 200

def upload_photos(gallery_id):
    identity = get_jwt_identity()
    if identity["role"] != "admin":
        return jsonify({"error": "Admin access required"}), 403
    db = get_db()
    try:
        gallery = db.galleries.find_one({"_id": ObjectId(gallery_id)})
    except Exception:
        return jsonify({"error": "Invalid gallery ID"}), 400
    if not gallery:
        return jsonify({"error": "Gallery not found"}), 404
    files = request.files.getlist("photos")
    if not files:
        return jsonify({"error": "No photos provided"}), 400
    uploaded = []
    for file in files:
        if not file.filename:
            continue
        photo_doc = {
            "gallery_id": gallery_id,
            "storage_key": file.filename,
            "original_filename": file.filename,
            "url": f"/uploads/{file.filename}",
            "watermark_url": f"/uploads/{file.filename}",
            "size": 0,
            "uploaded_at": datetime.now(timezone.utc),
        }
        result = db.photos.insert_one(photo_doc)
        uploaded.append({"id": str(result.inserted_id), "filename": file.filename})
    if uploaded and not gallery.get("cover_url"):
        db.galleries.update_one({"_id": ObjectId(gallery_id)}, {"$set": {"cover_url": uploaded[0].get("url", "")}})
    return jsonify({"message": f"{len(uploaded)} photo(s) uploaded", "photos": uploaded}), 201