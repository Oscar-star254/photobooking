def get_my_galleries():
   identity = get_jwt_identity()
user_id, role = _get_user_id_and_role(identity)
    db = get_db()
def _get_user_id_and_role(identity):
    if isinstance(identity, str):
        return identity, "client"
    return identity.get("id"), identity.get("role", "client")

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
            "id": str(g["_id"]),
            "title": g.get("title"),
            "booking_id": g.get("booking_id"),
            "user_id": g.get("user_id"),
            "is_paid": g.get("is_paid", False),
            "is_ready": g.get("is_ready", False),
            "photo_count": photo_count,
            "cover_url": g.get("cover_url"),
            "created_at": (
                g["created_at"].isoformat()
                if g.get("created_at")
                else None
            ),
        })

    return jsonify({"galleries": result}), 200