from flask import Blueprint
from flask_jwt_extended import jwt_required
from controllers.payment_controller import initiate_payment, mpesa_callback, check_payment_status, get_my_payments

payment_bp = Blueprint("payments", __name__)
payment_bp.route("/mpesa/callback", methods=["POST"])(mpesa_callback)
payment_bp.route("/initiate",       methods=["POST"])(jwt_required()(initiate_payment))
payment_bp.route("/status",         methods=["GET"])(jwt_required()(check_payment_status))
payment_bp.route("/my",             methods=["GET"])(jwt_required()(get_my_payments))