def get_my_gallery(gallery_id):
    identity = get_jwt_identity()
    db = get_db()

    # Handle both string and dict JWT identities
    user_id = identity if isinstance(identity, str) else identity.get("id")
    user_role = None if isinstance(identity, str) else identity.get("role")

    # Validate gallery ID
    try:
        gallery = db.galleries.find_one({"_id": ObjectId(gallery_id)})
    except Exception:
        return jsonify({"error": "Invalid gallery ID"}), 400

    if not gallery:
        return jsonify({"error": "Gallery not found"}), 404

    # Only the gallery owner or an admin can view it
    if user_role != "admin" and gallery.get("user_id") != user_id:
        return jsonify({"error": "Access denied"}), 403

    # Get all photos belonging to this gallery
    photos = list(
        db.photos.find(
            {"gallery_id": gallery_id},
            sort=[("uploaded_at", 1)]
        )
    )

    photo_list = []
    for photo in photos:
        photo_list.append({
            "id": str(photo["_id"]),
            "filename": photo.get("original_filename"),
            "url": photo.get("url"),
            "watermark_url": photo.get("watermark_url", photo.get("url")),
            "size": photo.get("size", 0),
            "uploaded_at": (
                photo["uploaded_at"].isoformat()
                if photo.get("uploaded_at")
                else None
            ),
        })

    return jsonify({
        "gallery": {
            "id": str(gallery["_id"]),
            "title": gallery.get("title"),
            "booking_id": gallery.get("booking_id"),
            "user_id": gallery.get("user_id"),
            "is_paid": gallery.get("is_paid", False),
            "is_ready": gallery.get("is_ready", False),
            "cover_url": gallery.get("cover_url"),
            "created_at": (
                gallery["created_at"].isoformat()
                if gallery.get("created_at")
                else None
            ),
            "photo_count": len(photo_list),
            "photos": photo_list,
        }
    }), 200