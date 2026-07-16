from flask import request, jsonify
from flask_jwt_extended import get_jwt_identity
from datetime import datetime, timezone
from bson import ObjectId
from utils.db import get_db

try:
    from services.mpesa_service import mpesa
    MPESA_AVAILABLE = True
except Exception:
    MPESA_AVAILABLE = False
    print(f"❌ M-Pesa import error: {e}")


def initiate_payment():
    identity = get_jwt_identity()
    data     = request.get_json()

    if not data.get("booking_id") or not data.get("phone"):
        return jsonify({"error": "booking_id and phone are required"}), 400

    db = get_db()

    try:
        booking = db.bookings.find_one({"_id": ObjectId(data["booking_id"])})
    except Exception:
        return jsonify({"error": "Invalid booking ID"}), 400

    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    if identity["role"] != "admin" and booking["user_id"] != identity["id"]:
        return jsonify({"error": "Access denied"}), 403

    if booking["payment_status"] == "paid":
        return jsonify({"error": "Already paid"}), 400

    # Create pending payment record
    payment_doc = {
        "booking_id":          str(booking["_id"]),
        "user_id":             identity["id"],
        "amount":              booking["package_price"],
        "phone":               data["phone"],
        "status":              "pending",
        "checkout_request_id": None,
        "mpesa_receipt":       None,
        "created_at":          datetime.now(timezone.utc),
        "updated_at":          datetime.now(timezone.utc),
    }

    payment_result = db.payments.insert_one(payment_doc)
    payment_id     = str(payment_result.inserted_id)

    # Initiate STK Push
    try:
        stk_response = mpesa.stk_push(
            phone       = data["phone"],
            amount      = booking["package_price"],
            account_ref = payment_id[:12],
            description = "PhotoGallery",
        )

        # Save checkout request ID
        db.payments.update_one(
            {"_id": payment_result.inserted_id},
            {"$set": {
                "checkout_request_id": stk_response.get("CheckoutRequestID"),
                "merchant_request_id": stk_response.get("MerchantRequestID"),
            }}
        )

        return jsonify({
            "message":             "STK Push sent! Check your phone.",
            "payment_id":          payment_id,
            "checkout_request_id": stk_response.get("CheckoutRequestID"),
        }), 200

    except Exception as e:
        db.payments.delete_one({"_id": payment_result.inserted_id})
        return jsonify({"error": f"M-Pesa request failed: {str(e)}"}), 502


def mpesa_callback():
    data = request.get_json(silent=True) or {}
    db   = get_db()

    try:
        stk_callback        = data["Body"]["stkCallback"]
        result_code         = stk_callback["ResultCode"]
        checkout_request_id = stk_callback["CheckoutRequestID"]

        payment = db.payments.find_one({"checkout_request_id": checkout_request_id})
        if not payment:
            return jsonify({"ResultCode": 0, "ResultDesc": "Accepted"}), 200

        if result_code == 0:
            items = stk_callback["CallbackMetadata"]["Item"]
            meta  = {item["Name"]: item.get("Value") for item in items}

            db.payments.update_one(
                {"checkout_request_id": checkout_request_id},
                {"$set": {
                    "status":        "paid",
                    "mpesa_receipt": meta.get("MpesaReceiptNumber"),
                    "amount_paid":   meta.get("Amount"),
                    "paid_at":       datetime.now(timezone.utc),
                    "updated_at":    datetime.now(timezone.utc),
                }}
            )

            # Unlock booking
            db.bookings.update_one(
                {"_id": ObjectId(payment["booking_id"])},
                {"$set": {
                    "payment_status": "paid",
                    "updated_at":     datetime.now(timezone.utc),
                }}
            )

            # Unlock gallery
            gallery = db.galleries.find_one({"booking_id": payment["booking_id"]})
            if gallery:
                db.galleries.update_one(
                    {"_id": gallery["_id"]},
                    {"$set": {"is_paid": True}}
                )

        else:
            db.payments.update_one(
                {"checkout_request_id": checkout_request_id},
                {"$set": {
                    "status":      "failed",
                    "result_code": result_code,
                    "result_desc": stk_callback.get("ResultDesc"),
                    "updated_at":  datetime.now(timezone.utc),
                }}
            )

    except Exception as e:
        print(f"Callback error: {e}")

    return jsonify({"ResultCode": 0, "ResultDesc": "Accepted"}), 200


def check_payment_status():
    identity   = get_jwt_identity()
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

    if identity["role"] != "admin" and payment["user_id"] != identity["id"]:
        return jsonify({"error": "Access denied"}), 403

    return jsonify({
        "payment_id":    payment_id,
        "status":        payment["status"],
        "mpesa_receipt": payment.get("mpesa_receipt"),
        "amount":        payment.get("amount"),
    }), 200


def get_my_payments():
    identity = get_jwt_identity()
    db       = get_db()

    payments = list(db.payments.find(
        {"user_id": identity["id"]},
        sort=[("created_at", -1)]
    ))

    result = [{
        "id":            str(p["_id"]),
        "booking_id":    p["booking_id"],
        "amount":        p["amount"],
        "phone":         p["phone"],
        "status":        p["status"],
        "mpesa_receipt": p.get("mpesa_receipt"),
        "created_at":    p["created_at"].isoformat() if p.get("created_at") else None,
    } for p in payments]

    return jsonify({"payments": result}), 200
