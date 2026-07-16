from flask import Blueprint
from flask_jwt_extended import jwt_required
from controllers.gallery_controller import (
    get_my_galleries,
    get_gallery,
    upload_photos,
    mark_gallery_ready,
    resend_whatsapp_notification,
)

gallery_bp = Blueprint("galleries", __name__)

gallery_bp.route("/my",                              methods=["GET"])(jwt_required()(get_my_galleries))
gallery_bp.route("/<gallery_id>",                    methods=["GET"])(jwt_required()(get_gallery))
gallery_bp.route("/<gallery_id>/upload",             methods=["POST"])(jwt_required()(upload_photos))
gallery_bp.route("/<gallery_id>/mark-ready",         methods=["POST"])(jwt_required()(mark_gallery_ready))
gallery_bp.route("/<gallery_id>/resend-whatsapp",    methods=["POST"])(jwt_required()(resend_whatsapp_notification))