from flask import Blueprint
from flask_jwt_extended import jwt_required
from controllers.gallery_controller import get_my_galleries, get_gallery, upload_photos

gallery_bp = Blueprint("galleries", __name__)
gallery_bp.route("/my",                  methods=["GET"])(jwt_required()(get_my_galleries))
gallery_bp.route("/<gallery_id>",        methods=["GET"])(jwt_required()(get_gallery))
gallery_bp.route("/<gallery_id>/upload", methods=["POST"])(jwt_required()(upload_photos))