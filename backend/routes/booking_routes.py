from flask import Blueprint
from flask_jwt_extended import jwt_required
from controllers.booking_controller import (
    get_packages,
    create_booking,
    get_my_bookings,
    get_booking,
    cancel_booking,
    get_booked_dates,
)

booking_bp = Blueprint("bookings", __name__)

booking_bp.route("/packages",               methods=["GET"])(get_packages)
booking_bp.route("/",                       methods=["POST"])(jwt_required()(create_booking))
booking_bp.route("/my",                     methods=["GET"])(jwt_required()(get_my_bookings))
booking_bp.route("/booked-dates",           methods=["GET"])(get_booked_dates)
booking_bp.route("/<booking_id>",           methods=["GET"])(jwt_required()(get_booking))
booking_bp.route("/<booking_id>/cancel",    methods=["PUT"])(jwt_required()(cancel_booking))