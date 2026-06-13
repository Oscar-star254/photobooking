from flask import request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity
from datetime import datetime, timezone
from bson import ObjectId
from utils.db import get_db
from models.user_model import UserModel

def register():
    data = request.get_json()
    required = ["email", "password", "full_name", "phone"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400
    if len(data["password"]) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    db = get_db()
    if db.users.find_one({"email": data["email"].lower().strip()}):
        return jsonify({"error": "Email already registered"}), 409
    user_doc = UserModel.schema(data["email"], data["password"], data["full_name"], data["phone"], data.get("role", "client"))
    result = db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    token = create_access_token(identity={"id": str(result.inserted_id), "role": user_doc["role"]})
    return jsonify({"message": "Account created successfully", "token": token, "user": UserModel.safe_user(user_doc)}), 201

def login():
    data = request.get_json()
    if not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email and password are required"}), 400
    db = get_db()
    user = db.users.find_one({"email": data["email"].lower().strip()})
    if not user or not UserModel.verify_password(data["password"], user["password"]):
        return jsonify({"error": "Invalid email or password"}), 401
    if not user.get("is_active"):
        return jsonify({"error": "Account deactivated"}), 403
    db.users.update_one({"_id": user["_id"]}, {"$set": {"last_login": datetime.now(timezone.utc)}})
    token = create_access_token(identity={"id": str(user["_id"]), "role": user["role"]})
    return jsonify({"message": "Login successful", "token": token, "user": UserModel.safe_user(user)}), 200

def get_profile():
    identity = get_jwt_identity()
    db = get_db()
    user = db.users.find_one({"_id": ObjectId(identity["id"])})
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": UserModel.safe_user(user)}), 200

def update_profile():
    identity = get_jwt_identity()
    data = request.get_json()
    db = get_db()
    allowed_updates = {}
    for field in ["full_name", "phone"]:
        if data.get(field):
            allowed_updates[field] = data[field].strip()
    if not allowed_updates:
        return jsonify({"error": "No valid fields to update"}), 400
    allowed_updates["updated_at"] = datetime.now(timezone.utc)
    db.users.update_one({"_id": ObjectId(identity["id"])}, {"$set": allowed_updates})
    user = db.users.find_one({"_id": ObjectId(identity["id"])})
    return jsonify({"message": "Profile updated", "user": UserModel.safe_user(user)}), 200