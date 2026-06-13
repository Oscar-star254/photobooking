from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import os

_db = None

def init_db(app):
    global _db
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/photobooking")
    try:
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        client.admin.command("ping")
        _db = client.get_database("photobooking")
        app.db = _db
        print("✅ MongoDB connected successfully")
        _create_indexes(_db)
    except ConnectionFailure as e:
        print(f"❌ MongoDB connection failed: {e}")
        raise

def get_db():
    global _db
    if _db is None:
        raise RuntimeError("Database not initialized.")
    return _db

def _create_indexes(db):
    db.users.create_index("email", unique=True)
    db.bookings.create_index([("user_id", 1), ("status", 1)])
    db.payments.create_index("booking_id")
    db.photos.create_index("gallery_id")
    db.galleries.create_index("user_id")
    print("✅ Database indexes created")