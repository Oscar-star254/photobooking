from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity
from datetime import datetime, timezone
from bson import ObjectId
from utils.db import get_db
from models.booking_model import BookingModel, BOOKING_STATUSES


def _get_user_id_and_role(identity):
    if isinstance(identity, str):
        return identity, "client"
    return identity.get("id"), identity.get("role", "client")


def get_all_bookings():
    db     = get_db()
    page   = int(request.args.get("page", 1))
    limit  = int(request.args.get("limit", 20))
    status = request.args.get("status")
    query  = {}
    if status and status in BOOKING_STATUSES:
        query["status"] = status
    total    = db.bookings.count_documents(query)
    bookings = list(db.bookings.find(
        query,
        skip=(page - 1) * limit,
        limit=limit,
        sort=[("created_at", -1)]
    ))
    result = []
    for b in bookings:
        user = db.users.find_one({"_id": ObjectId(b["user_id"])}) if b.get("user_id") else None
        booking_data = BookingModel.safe_booking(b)
        booking_data["client_name"]  = user["full_name"] if user else "Unknown"
        booking_data["client_email"] = user["email"]     if user else "Unknown"
        result.append(booking_data)
    return jsonify({
        "bookings": result,
        "total":    total,
        "page":     page,
        "pages":    (total + limit - 1) // limit,
    }), 200


def update_booking_status(booking_id):
    data       = request.get_json()
    new_status = data.get("status")
    if new_status not in BOOKING_STATUSES:
        return jsonify({"error": "Invalid status"}), 400
    db = get_db()
    try:
        booking = db.bookings.find_one({"_id": ObjectId(booking_id)})
    except Exception:
        return jsonify({"error": "Invalid booking ID"}), 400
    if not booking:
        return jsonify({"error": "Booking not found"}), 404
    db.bookings.update_one(
        {"_id": ObjectId(booking_id)},
        {"$set": {"status": new_status, "updated_at": datetime.now(timezone.utc)}}
    )

    # Send WhatsApp notification when booking is confirmed
    if new_status == "confirmed":
        try:
            user = db.users.find_one({"_id": ObjectId(booking["user_id"])})
            if user:
                from services.whatsapp_service import whatsapp
                whatsapp.send_booking_confirmed(
                    phone        = user.get("phone", booking.get("phone", "")),
                    client_name  = user["full_name"],
                    package_name = booking["package_name"],
                    booking_date = booking["booking_date"].strftime("%A, %d %B %Y") if hasattr(booking.get("booking_date"), "strftime") else str(booking.get("booking_date", ""))[:10],
                )
        except Exception as e:
            print(f"WhatsApp notification failed: {e}")

    return jsonify({"message": f"Booking status updated to '{new_status}'"}), 200


def create_gallery_for_booking(booking_id):
    data = request.get_json() or {}
    db   = get_db()
    try:
        booking = db.bookings.find_one({"_id": ObjectId(booking_id)})
    except Exception:
        return jsonify({"error": "Invalid booking ID"}), 400
    if not booking:
        return jsonify({"error": "Booking not found"}), 404
    existing = db.galleries.find_one({"booking_id": booking_id})
    if existing:
        return jsonify({
            "error":      "Gallery already exists",
            "gallery_id": str(existing["_id"])
        }), 409
    gallery_doc = {
        "booking_id":  booking_id,
        "user_id":     booking["user_id"],
        "title":       data.get("title", booking["package_name"]),
        "is_paid":     False,
        "is_ready":    False,
        "cover_url":   None,
        "created_at":  datetime.now(timezone.utc),
        "updated_at":  datetime.now(timezone.utc),
    }
    result = db.galleries.insert_one(gallery_doc)
    db.bookings.update_one(
        {"_id": ObjectId(booking_id)},
        {"$set": {"gallery_id": str(result.inserted_id)}}
    )
    return jsonify({
        "message":    "Gallery created",
        "gallery_id": str(result.inserted_id),
    }), 201


def get_analytics():
    db           = get_db()
    paid_payments = list(db.payments.find({"status": "paid"}))
    total_revenue = sum(p.get("amount", 0) for p in paid_payments)
    recent        = list(db.bookings.find({}, sort=[("created_at", -1)], limit=5))
    recent_bookings = []
    for b in recent:
        user = db.users.find_one({"_id": ObjectId(b["user_id"])}) if b.get("user_id") else None
        recent_bookings.append({
            "id":      str(b["_id"]),
            "client":  user["full_name"] if user else "Unknown",
            "package": b["package_name"],
            "status":  b["status"],
            "date":    b["created_at"].isoformat() if b.get("created_at") else None,
        })
    return jsonify({
        "analytics": {
            "total_bookings":     db.bookings.count_documents({}),
            "pending_bookings":   db.bookings.count_documents({"status": "pending"}),
            "confirmed_bookings": db.bookings.count_documents({"status": "confirmed"}),
            "completed_bookings": db.bookings.count_documents({"status": "completed"}),
            "total_clients":      db.users.count_documents({"role": "client"}),
            "total_galleries":    db.galleries.count_documents({}),
            "total_photos":       db.photos.count_documents({}),
            "total_revenue":      total_revenue,
            "pending_payments":   db.payments.count_documents({"status": "pending"}),
        },
        "recent_bookings": recent_bookings,
    }), 200


def get_all_clients():
    db    = get_db()
    page  = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 20))
    total   = db.users.count_documents({"role": "client"})
    clients = list(db.users.find(
        {"role": "client"},
        {"password": 0},
        skip=(page - 1) * limit,
        limit=limit,
        sort=[("created_at", -1)]
    ))
    result = [{
        "id":            str(c["_id"]),
        "full_name":     c["full_name"],
        "email":         c["email"],
        "phone":         c["phone"],
        "booking_count": db.bookings.count_documents({"user_id": str(c["_id"])}),
        "is_active":     c.get("is_active", True),
        "created_at":    c["created_at"].isoformat() if c.get("created_at") else None,
    } for c in clients]
    return jsonify({"clients": result, "total": total, "page": page}), 200