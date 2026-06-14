from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity, get_jwt
from datetime import datetime, timezone
from bson import ObjectId
from utils.db import get_db

def initiate_payment():
    user_id = get_jwt_identity()
    claims = get_jwt()
    user_role = claims.get("role", "client")
    data = request.get_json()
    if not data.get("booking_id") or not data.get("phone"):
        return jsonify({"error": "booking_id and phone are required"}), 400
    db = get_db()
    try:
        booking = db.bookings.find_one({"_id": ObjectId(data["booking_id"])})
    except Exception:
        return jsonify({"error": "Invalid booking ID"}), 400
    if not booking:
        return jsonify({"error": "Booking not found"}), 404
    if user_role != "admin" and booking["user_id"] != user_id:
        return jsonify({"error": "Access denied"}), 403
    if booking["payment_status"] == "paid":
        return jsonify({"error": "Already paid"}), 400
    payment_doc = {
        "booking_id": str(booking["_id"]),
        "user_id": user_id,
        "amount": booking["package_price"],
        "phone": data["phone"],
        "status": "pending",
        "checkout_request_id": None,
        "mpesa_receipt": None,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    payment_result = db.payments.insert_one(payment_doc)
    return jsonify({"message": "Payment initiated. M-Pesa integration requires live deployment.", "payment_id": str(payment_result.inserted_id)}), 200

def mpesa_callback():
    data = request.get_json(silent=True) or {}
    db = get_db()
    try:
        stk_callback = data["Body"]["stkCallback"]
        result_code = stk_callback["ResultCode"]
        checkout_request_id = stk_callback["CheckoutRequestID"]
        payment = db.payments.find_one({"checkout_request_id": checkout_request_id})
        if not payment:
            return jsonify({"ResultCode": 0, "ResultDesc": "Accepted"}), 200
        if result_code == 0:
            items = stk_callback["CallbackMetadata"]["Item"]
            meta = {item["Name"]: item.get("Value") for item in items}
            db.payments.update_one({"checkout_request_id": checkout_request_id}, {"$set": {"status": "paid", "mpesa_receipt": meta.get("MpesaReceiptNumber"), "updated_at": datetime.now(timezone.utc)}})
            db.bookings.update_one({"_id": ObjectId(payment["booking_id"])}, {"$set": {"payment_status": "paid", "updated_at": datetime.now(timezone.utc)}})
        else:
            db.payments.update_one({"checkout_request_id": checkout_request_id}, {"$set": {"status": "failed", "updated_at": datetime.now(timezone.utc)}})
    except Exception as e:
        print(f"Callback error: {e}")
    return jsonify({"ResultCode": 0, "ResultDesc": "Accepted"}), 200

def check_payment_status():
    identity = get_jwt_identity()
    payment_id = request.args.get("payment_id")
    if not payment_id:
        return jsonify({"error": "payment_id required"}), 400
    db = get_db()
    try:
        payment = db.payments.find_one({"_id": ObjectId(payment_id)})
    except Exception:
        return jsonify({"error": "Invalid payment ID"}), 400
    if not payment:
        return jsonify({"error": "Payment not found"}), 404
    return jsonify({"payment_id": payment_id, "status": payment["status"], "mpesa_receipt": payment.get("mpesa_receipt"), "amount": payment.get("amount")}), 200

def get_my_payments():
    user_id = get_jwt_identity()
    db = get_db()
    payments = list(db.payments.find({"user_id": user_id}, sort=[("created_at", -1)]))
    result = [{"id": str(p["_id"]), "booking_id": p["booking_id"], "amount": p["amount"], "status": p["status"], "mpesa_receipt": p.get("mpesa_receipt"), "created_at": p["created_at"].isoformat() if p.get("created_at") else None} for p in payments]
    return jsonify({"payments": result}), 200