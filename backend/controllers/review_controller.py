from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity
from datetime import datetime, timezone
from bson import ObjectId
from utils.db import get_db


def create_review():
   identity = get_jwt_identity()
user_id, role = _get_user_id_and_role(identity)
    data = request.get_json()

    if not data.get("rating"):
        return jsonify({"error": "Rating is required"}), 400

    db = get_db()

    # Check booking exists and belongs to user
    booking_id = data.get("booking_id")
    if not booking_id:
        return jsonify({"error": "booking_id is required"}), 400

    try:
        booking = db.bookings.find_one({"_id": ObjectId(booking_id)})
    except Exception:
        return jsonify({"error": "Invalid booking ID"}), 400

    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    if booking["user_id"] != user_id:
        return jsonify({"error": "Access denied"}), 403

    if booking["payment_status"] != "paid":
        return jsonify({"error": "You can only review after payment"}), 403

    # Check if review already exists for this booking
    existing = db.reviews.find_one({"booking_id": booking_id})
    if existing:
        return jsonify({"error": "You have already reviewed this booking"}), 409

    user = db.users.find_one({"_id": ObjectId(user_id)})

    review_doc = {
        "booking_id":    booking_id,
        "user_id":       user_id],
        "full_name":     user["full_name"] if user else "Anonymous",
        "rating":        int(data["rating"]),
        "comment":       data.get("comment", "").strip(),
        "package_name":  booking["package_name"],
        "is_approved":   True,
        "created_at":    datetime.now(timezone.utc),
    }

    db.reviews.insert_one(review_doc)

    # Notify admin via db flag
    db.notifications.insert_one({
        "type":       "new_review",
        "message":    f"New review from {user['full_name']} — {int(data['rating'])} stars",
        "is_read":    False,
        "created_at": datetime.now(timezone.utc),
    })

    return jsonify({"message": "Review submitted successfully"}), 201


def get_reviews():
    db = get_db()
    rating_filter = request.args.get("rating")
    search = request.args.get("search", "")

    query = {"is_approved": True}
    if rating_filter:
        query["rating"] = int(rating_filter)
    if search:
        query["full_name"] = {"$regex": search, "$options": "i"}

    reviews = list(db.reviews.find(query, sort=[("created_at", -1)]))

    result = [{
        "id":           str(r["_id"]),
        "full_name":    r["full_name"],
        "rating":       r["rating"],
        "comment":      r.get("comment", ""),
        "package_name": r.get("package_name", ""),
        "booking_id":   r.get("booking_id", ""),
        "created_at":   r["created_at"].isoformat() if r.get("created_at") else None,
    } for r in reviews]

    # Calculate average
    all_reviews = list(db.reviews.find({"is_approved": True}))
    avg = round(sum(r["rating"] for r in all_reviews) / len(all_reviews), 1) if all_reviews else 0

    return jsonify({
        "reviews": result,
        "total":   len(all_reviews),
        "average": avg,
    }), 200


def delete_review(review_id):
    identity = get_jwt_identity()
user_id, role = _get_user_id_and_role(identity)
    if role != "admin":
        return jsonify({"error": "Admin access required"}), 403

    db = get_db()
    try:
        db.reviews.delete_one({"_id": ObjectId(review_id)})
    except Exception:
        return jsonify({"error": "Invalid review ID"}), 400

    return jsonify({"message": "Review deleted"}), 200


def check_can_review(booking_id):
   identity = get_jwt_identity()
user_id, role = _get_user_id_and_role(identity)
    db = get_db()

    try:
        booking = db.bookings.find_one({"_id": ObjectId(booking_id)})
    except Exception:
        return jsonify({"can_review": False}), 200

    if not booking:
        return jsonify({"can_review": False}), 200

    if booking["user_id"] != user_id:
        return jsonify({"can_review": False}), 200

    if booking["payment_status"] != "paid":
        return jsonify({"can_review": False, "reason": "Payment required"}), 200

    existing = db.reviews.find_one({"booking_id": booking_id})
    if existing:
        return jsonify({"can_review": False, "reason": "Already reviewed"}), 200

    return jsonify({"can_review": True}), 200