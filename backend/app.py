from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
from pathlib import Path
import os

load_dotenv()

from routes.auth_routes import auth_bp
from routes.booking_routes import booking_bp
from routes.payment_routes import payment_bp
from routes.gallery_routes import gallery_bp
from routes.photo_routes import photo_bp
from routes.admin_routes import admin_bp
from routes.review_routes import review_bp
from routes.portfolio_routes import portfolio_bp
from utils.db import init_db


def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-jwt")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 86400))
    app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024

    CORS(app, 
    origins="*",
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    supports_credentials=False
)

    JWTManager(app)
    init_db(app)

    app.register_blueprint(auth_bp,      url_prefix="/api/auth")
    app.register_blueprint(booking_bp,   url_prefix="/api/bookings")
    app.register_blueprint(payment_bp,   url_prefix="/api/payments")
    app.register_blueprint(gallery_bp,   url_prefix="/api/galleries")
    app.register_blueprint(photo_bp,     url_prefix="/api/photos")
    app.register_blueprint(admin_bp,     url_prefix="/api/admin")
    app.register_blueprint(review_bp,    url_prefix="/api/reviews")
    app.register_blueprint(portfolio_bp, url_prefix="/api/portfolio")

    uploads_dir = Path(__file__).resolve().parent / "uploads"
    uploads_dir.mkdir(exist_ok=True)

    @app.route("/uploads/<path:filename>")
    def serve_upload(filename):
        return send_from_directory(str(uploads_dir), filename)

    @app.route("/api/health")
    def health():
        return {"status": "ok", "message": "LensKenya API is running"}, 200

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
