from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity
from datetime import datetime, timezone
from bson import ObjectId
from utils.db import get_db
from models.booking_model import BookingModel, PACKAGES, BOOKING_STATUSES


def _get_user_id_and_role(identity):
    if isinstance(identity, str):
        return identity, "client"
    return identity.get("id"), identity.get("role", "client")


def get_packages():
    return jsonify({"packages": PACKAGES}), 200


def create_booking():
    identity      = get_jwt_identity()
    user_id, role = _get_user_id_and_role(identity)
    data          = request.get_json()
    required      = ["package_key", "booking_date", "location", "phone"]
    missing       = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400
    if data["package_key"] not in PACKAGES:
        return jsonify({"error": "Invalid package selected"}), 400
    try:
        booking_date = datetime.fromisoformat(data["booking_date"])
    except ValueError:
        return jsonify({"error": "Invalid booking date format"}), 400
    db          = get_db()
    booking_doc = BookingModel.schema(
        user_id, data["package_key"], booking_date,
        data["location"], data["phone"], data.get("notes", "")
    )
    result              = db.bookings.insert_one(booking_doc)
    booking_doc["_id"]  = result.inserted_id
    return jsonify({
        "message": "Booking submitted successfully!",
        "booking": BookingModel.safe_booking(booking_doc),
    }), 201


def get_my_bookings():
    identity      = get_jwt_identity()
    user_id, role = _get_user_id_and_role(identity)
    db            = get_db()
    bookings      = list(db.bookings.find(
        {"user_id": user_id},
        sort=[("created_at", -1)]
    ))
    return jsonify({"bookings": [BookingModel.safe_booking(b) for b in bookings]}), 200


def get_booking(booking_id):
    identity      = get_jwt_identity()
    user_id, role = _get_user_id_and_role(identity)
    db            = get_db()
    try:
        booking = db.bookings.find_one({"_id": ObjectId(booking_id)})
    except Exception:
        return jsonify({"error": "Invalid booking ID"}), 400
    if not booking:
        return jsonify({"error": "Booking not found"}), 404
    if role != "admin" and booking["user_id"] != user_id:
        return jsonify({"error": "Access denied"}), 403
    return jsonify({"booking": BookingModel.safe_booking(booking)}), 200


def get_booked_dates():
    db       = get_db()
    bookings = list(db.bookings.find(
        {"status": {"$in": ["pending", "confirmed"]}},
        {"booking_date": 1, "_id": 0}
    ))
    booked_dates = []
    for b in bookings:
        if b.get("booking_date"):
            date = b["booking_date"]
            booked_dates.append(
                date.strftime("%Y-%m-%d") if hasattr(date, "strftime") else str(date)[:10]
            )
    return jsonify({"booked_dates": booked_dates}), 200


def cancel_booking(booking_id):
    identity      = get_jwt_identity()
    user_id, role = _get_user_id_and_role(identity)
    db            = get_db()
    try:
        booking = db.bookings.find_one({"_id": ObjectId(booking_id)})
    except Exception:
        return jsonify({"error": "Invalid booking ID"}), 400
    if not booking:
        return jsonify({"error": "Booking not found"}), 404
    if booking["user_id"] != user_id:
        return jsonify({"error": "Access denied"}), 403
    if booking["status"] in ["completed", "cancelled"]:
        return jsonify({"error": f"Cannot cancel a {booking['status']} booking"}), 400
    db.bookings.update_one(
        {"_id": ObjectId(booking_id)},
        {"$set": {"status": "cancelled", "updated_at": datetime.now(timezone.utc)}}
    )
    return jsonify({"message": "Booking cancelled successfully"}), 200