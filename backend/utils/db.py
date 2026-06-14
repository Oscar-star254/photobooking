from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError, OperationFailure
import os

_db = None


def init_db(app):
    global _db
    default_uri = "mongodb://localhost:27017/photobooking"
    mongo_uri = os.getenv("MONGO_URI")

    # In production we require an explicit MONGO_URI (no silent localhost fallback)
    if not mongo_uri:
        if os.getenv("FLASK_ENV") != "development":
            raise RuntimeError(
                "MONGO_URI environment variable is not set.\n"
                "Set `MONGO_URI` to your MongoDB connection string (e.g. mongodb+srv://<user>:<pass>@cluster/photobooking)\n"
                "on your hosting provider (Render, Heroku, etc.), then redeploy."
            )
        mongo_uri = default_uri

    try:
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        client.admin.command("ping")
        _db = client.get_database("photobooking")
        app.db = _db
        print("✅ MongoDB connected successfully")
        _create_indexes(_db)
    except (ConnectionFailure, ServerSelectionTimeoutError, OperationFailure) as e:
        print("❌ MongoDB connection failed:", e)
        # Provide a hint for common deployment issue (missing/incorrect MONGO_URI)
        if mongo_uri == default_uri:
            print(
                "Hint: app is trying to connect to localhost. In production you should set the MONGO_URI environment variable to your MongoDB Atlas URI."
            )
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