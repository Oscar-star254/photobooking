from datetime import datetime, timezone
import bcrypt

class UserModel:
    @staticmethod
    def schema(email, password, full_name, phone, role="client"):
        hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        return {
            "email": email.lower().strip(),
            "password": hashed_pw,
            "full_name": full_name.strip(),
            "phone": phone.strip(),
            "role": role,
            "is_active": True,
            "profile_photo": None,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }

    @staticmethod
    def verify_password(plain_password, hashed_password):
        if isinstance(hashed_password, bytes):
            hashed = hashed_password
        else:
            hashed = hashed_password.encode("utf-8")
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed)

    @staticmethod
    def safe_user(user):
        return {
            "id": str(user["_id"]),
            "email": user["email"],
            "full_name": user["full_name"],
            "phone": user["phone"],
            "role": user["role"],
            "is_active": user["is_active"],
            "profile_photo": user.get("profile_photo"),
            "created_at": user["created_at"].isoformat() if user.get("created_at") else None,
        }