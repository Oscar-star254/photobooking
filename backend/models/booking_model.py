from datetime import datetime, timezone

PACKAGES = {
    "graduation": {"name": "Graduation Shoot", "price": 8000, "duration": "2 hours", "description": "Celebrate your milestone with beautiful graduation photos"},
    "birthday":   {"name": "Birthday Shoot",   "price": 6000, "duration": "1.5 hours","description": "Make your birthday unforgettable with stunning portraits"},
    "wedding":    {"name": "Wedding Shoot",    "price": 35000,"duration": "Full day",  "description": "Capture every magical moment of your special day"},
    "portrait":   {"name": "Studio Portrait",  "price": 4000, "duration": "1 hour",   "description": "Professional studio portraits for any occasion"},
    "events":     {"name": "Event Coverage",   "price": 15000,"duration": "4 hours",  "description": "Professional coverage for corporate and social events"},
}

BOOKING_STATUSES = ["pending", "confirmed", "completed", "cancelled"]

class BookingModel:
    @staticmethod
    def schema(user_id, package_key, booking_date, location, phone, notes=""):
        package = PACKAGES.get(package_key)
        if not package:
            raise ValueError(f"Invalid package: {package_key}")
        return {
            "user_id": user_id,
            "package_key": package_key,
            "package_name": package["name"],
            "package_price": package["price"],
            "booking_date": booking_date,
            "location": location.strip(),
            "phone": phone.strip(),
            "notes": notes.strip(),
            "status": "pending",
            "payment_status": "unpaid",
            "gallery_id": None,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }

    @staticmethod
    def safe_booking(booking):
        return {
            "id": str(booking["_id"]),
            "user_id": str(booking["user_id"]),
            "package_key": booking["package_key"],
            "package_name": booking["package_name"],
            "package_price": booking["package_price"],
            "booking_date": booking["booking_date"].isoformat() if hasattr(booking["booking_date"], "isoformat") else booking["booking_date"],
            "location": booking["location"],
            "phone": booking["phone"],
            "notes": booking.get("notes", ""),
            "status": booking["status"],
            "payment_status": booking["payment_status"],
            "gallery_id": str(booking["gallery_id"]) if booking.get("gallery_id") else None,
            "created_at": booking["created_at"].isoformat() if booking.get("created_at") else None,
        }