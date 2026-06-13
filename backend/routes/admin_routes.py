from flask import Blueprint
from middleware.auth_middleware import admin_required
from controllers.admin_controller import get_all_bookings, update_booking_status, create_gallery_for_booking, get_analytics, get_all_clients

admin_bp = Blueprint("admin", __name__)
admin_bp.route("/bookings",                     methods=["GET"])(admin_required(get_all_bookings))
admin_bp.route("/bookings/<booking_id>/status", methods=["PUT"])(admin_required(update_booking_status))
admin_bp.route("/bookings/<booking_id>/gallery",methods=["POST"])(admin_required(create_gallery_for_booking))
admin_bp.route("/analytics",                    methods=["GET"])(admin_required(get_analytics))
admin_bp.route("/clients",                      methods=["GET"])(admin_required(get_all_clients))