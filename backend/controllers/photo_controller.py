from flask import request, jsonify, send_file
from flask_jwt_extended import get_jwt_identity, get_jwt
from bson import ObjectId
import io, zipfile
from utils.db import get_db

def download_photo(photo_id):
    user_id = get_jwt_identity()
    claims = get_jwt()
    user_role = claims.get("role", "client")
    db = get_db()
    try:
        photo = db.photos.find_one({"_id": ObjectId(photo_id)})
    except Exception:
        return jsonify({"error": "Invalid photo ID"}), 400
    if not photo:
        return jsonify({"error": "Photo not found"}), 404
    gallery = db.galleries.find_one({"_id": ObjectId(photo["gallery_id"])})
    if not gallery:
        return jsonify({"error": "Gallery not found"}), 404
    if user_role != "admin" and gallery["user_id"] != user_id:
        return jsonify({"error": "Access denied"}), 403
    if not gallery.get("is_paid") and user_role != "admin":
        return jsonify({"error": "Payment required"}), 402
    return jsonify({"download_url": photo.get("url")}), 200

def download_gallery_zip(gallery_id):
    user_id = get_jwt_identity()
    claims = get_jwt()
    user_role = claims.get("role", "client")
    db = get_db()
    try:
        gallery = db.galleries.find_one({"_id": ObjectId(gallery_id)})
    except Exception:
        return jsonify({"error": "Invalid gallery ID"}), 400
    if not gallery:
        return jsonify({"error": "Gallery not found"}), 404
    if user_role != "admin" and gallery["user_id"] != user_id:
        return jsonify({"error": "Access denied"}), 403
    if not gallery.get("is_paid") and user_role != "admin":
        return jsonify({"error": "Payment required"}), 402
    photos = list(db.photos.find({"gallery_id": gallery_id}))
    if not photos:
        return jsonify({"error": "No photos in gallery"}), 404
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        for photo in photos:
            zf.writestr(photo["original_filename"], b"placeholder")
    zip_buffer.seek(0)
    return send_file(zip_buffer, mimetype="application/zip", as_attachment=True, download_name="gallery.zip")