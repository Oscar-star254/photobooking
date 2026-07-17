from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity
from datetime import datetime, timezone
from bson import ObjectId
from utils.db import get_db
from services.storage_service import storage


def get_my_galleries():
    identity = get_jwt_identity()
    db = get_db()
    galleries = list(db.galleries.find(
        {"user_id": identity["id"]},
        sort=[("created_at", -1)]
    ))
    result = []
    for g in galleries:
        photo_count = db.photos.count_documents({"gallery_id": str(g["_id"])})
        result.append({
            "id":         str(g["_id"]),
            "title":      g["title"],
            "booking_id": g.get("booking_id"),
            "user_id":    g["user_id"],
            "is_paid":    g.get("is_paid", False),
            "is_ready":   g.get("is_ready", False),
            "photo_count": photo_count,
            "cover_url":  g.get("cover_url"),
            "created_at": g["created_at"].isoformat() if g.get("created_at") else None,
        })
    return jsonify({"galleries": result}), 200


def get_my_galleries():
    identity = get_jwt_identity()
    db = get_db()

    # Handle both string identity and dict identity
    user_id = identity if isinstance(identity, str) else identity.get("id")

    galleries = list(db.galleries.find(
        {"user_id": user_id},
        sort=[("created_at", -1)]
    ))
    result = []
    for g in galleries:
        photo_count = db.photos.count_documents({"gallery_id": str(g["_id"])})
        result.append({
            "id":          str(g["_id"]),
            "title":       g["title"],
            "booking_id":  g.get("booking_id"),
            "user_id":     g["user_id"],
            "is_paid":     g.get("is_paid", False),
            "is_ready":    g.get("is_ready", False),
            "photo_count": photo_count,
            "cover_url":   g.get("cover_url"),
            "created_at":  g["created_at"].isoformat() if g.get("created_at") else None,
        })
    return jsonify({"galleries": result}), 200


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
    folder   = f"galleries/{gallery_id}"

    for file in files:
        if not file.filename:
            continue
        file_bytes   = file.read()
        content_type = file.content_type or "image/jpeg"
        original     = storage.upload_photo(file_bytes, file.filename, folder, content_type)

        try:
            watermarked = storage.upload_watermarked(file_bytes, file.filename, folder)
            watermark_url = watermarked["url"]
        except Exception:
            watermark_url = original["url"]

        photo_doc = {
            "gallery_id":        gallery_id,
            "storage_key":       original["key"],
            "original_filename": file.filename,
            "url":               original["url"],
            "watermark_url":     watermark_url,
            "size":              original.get("size", 0),
            "uploaded_at":       datetime.now(timezone.utc),
        }
        result = db.photos.insert_one(photo_doc)
        uploaded.append({
            "id":       str(result.inserted_id),
            "filename": file.filename,
            "url":      original["url"],
        })

    if uploaded and not gallery.get("cover_url"):
        db.galleries.update_one(
            {"_id": ObjectId(gallery_id)},
            {"$set": {"cover_url": uploaded[0]["url"]}}
        )

    return jsonify({
        "message": f"{len(uploaded)} photo(s) uploaded successfully",
        "photos":  uploaded,
    }), 201


def mark_gallery_ready(gallery_id):
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

    # Check if already notified
    already_notified = gallery.get("whatsapp_notified", False)

    # Update gallery status
    db.galleries.update_one(
        {"_id": ObjectId(gallery_id)},
        {"$set": {
            "is_ready":   True,
            "ready_at":   datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }}
    )

    # Get booking and client info
    booking = db.bookings.find_one({"_id": ObjectId(gallery["booking_id"])}) if gallery.get("booking_id") else None
    user    = db.users.find_one({"_id": ObjectId(gallery["user_id"])}) if gallery.get("user_id") else None

    whatsapp_result = {"success": False, "error": "No client info"}

    if not already_notified and booking and user:
        try:
            from services.whatsapp_service import whatsapp
            whatsapp_result = whatsapp.send_gallery_ready(
                phone        = user.get("phone", booking.get("phone", "")),
                client_name  = user["full_name"],
                package_name = booking["package_name"],
                gallery_id   = gallery_id,
                is_paid      = gallery.get("is_paid", False),
            )

            # Log notification
            db.galleries.update_one(
                {"_id": ObjectId(gallery_id)},
                {"$set": {
                    "whatsapp_notified":    whatsapp_result.get("success", False),
                    "whatsapp_notified_at": datetime.now(timezone.utc),
                    "whatsapp_result":      str(whatsapp_result),
                }}
            )

            # Save notification log
            db.notifications.insert_one({
                "type":       "gallery_ready",
                "gallery_id": gallery_id,
                "user_id":    str(user["_id"]),
                "phone":      user.get("phone", ""),
                "success":    whatsapp_result.get("success", False),
                "result":     str(whatsapp_result),
                "created_at": datetime.now(timezone.utc),
            })

        except Exception as e:
            whatsapp_result = {"success": False, "error": str(e)}

    return jsonify({
        "message":          "Gallery marked as ready",
        "whatsapp_sent":    whatsapp_result.get("success", False),
        "whatsapp_message": "WhatsApp notification sent to client!" if whatsapp_result.get("success") else f"WhatsApp failed: {whatsapp_result.get('error', 'Unknown')}",
        "already_notified": already_notified,
    }), 200


def resend_whatsapp_notification(gallery_id):
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

    booking = db.bookings.find_one({"_id": ObjectId(gallery["booking_id"])}) if gallery.get("booking_id") else None
    user    = db.users.find_one({"_id": ObjectId(gallery["user_id"])}) if gallery.get("user_id") else None

    if not booking or not user:
        return jsonify({"error": "Client or booking info not found"}), 404

    try:
        from services.whatsapp_service import whatsapp
        result = whatsapp.send_gallery_ready(
            phone        = user.get("phone", booking.get("phone", "")),
            client_name  = user["full_name"],
            package_name = booking["package_name"],
            gallery_id   = gallery_id,
            is_paid      = gallery.get("is_paid", False),
        )

        db.galleries.update_one(
            {"_id": ObjectId(gallery_id)},
            {"$set": {
                "whatsapp_notified":    result.get("success", False),
                "whatsapp_notified_at": datetime.now(timezone.utc),
                "whatsapp_result":      str(result),
            }}
        )

        return jsonify({
            "message":       "Notification resent",
            "whatsapp_sent": result.get("success", False),
            "result":        result,
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500