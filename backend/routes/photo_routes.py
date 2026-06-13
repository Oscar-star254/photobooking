from flask import Blueprint
from flask_jwt_extended import jwt_required
from controllers.photo_controller import download_photo, download_gallery_zip

photo_bp = Blueprint("photos", __name__)
photo_bp.route("/<photo_id>/download",      methods=["GET"])(jwt_required()(download_photo))
photo_bp.route("/gallery/<gallery_id>/zip", methods=["GET"])(jwt_required()(download_gallery_zip))