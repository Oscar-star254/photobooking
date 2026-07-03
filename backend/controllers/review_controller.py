from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity
from datetime import datetime, timezone
from bson import ObjectId
from utils.db import get_db


def create_review():
    identity = get_jwt_identity()
    data = request.get_json()

    if not data.get("comment") or not data.get("rating"):
        return jsonify({"error": "Rating and comment are required"}), 400

    db = get_db()
    user = db.users.find_one({"_id": ObjectId(identity["id"])})

    review_doc = {
        "user_id":      identity["id"],
        "full_name":    user["full_name"] if user else "Anonymous",
        "rating":       int(data["rating"]),
        "comment":      data["comment"].strip(),
        "package_name": data.get("package_name", ""),
        "is_approved":  True,
        "created_at":   datetime.now(timezone.utc),
    }

    db.reviews.insert_one(review_doc)
    return jsonify({"message": "Review submitted successfully"}), 201


def get_reviews():
    db = get_db()
    reviews = list(db.reviews.find(
        {"is_approved": True},
        sort=[("created_at", -1)],
        limit=20
    ))

    result = [{
        "id":           str(r["_id"]),
        "full_name":    r["full_name"],
        "rating":       r["rating"],
        "comment":      r["comment"],
        "package_name": r.get("package_name", ""),
        "created_at":   r["created_at"].isoformat() if r.get("created_at") else None,
    } for r in reviews]

    return jsonify({"reviews": result}), 200
