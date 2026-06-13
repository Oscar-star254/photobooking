from flask import Blueprint
from flask_jwt_extended import jwt_required
from controllers.auth_controller import register, login, get_profile, update_profile

auth_bp = Blueprint("auth", __name__)
auth_bp.route("/register", methods=["POST"])(register)
auth_bp.route("/login",    methods=["POST"])(login)
auth_bp.route("/profile",  methods=["GET"])(jwt_required()(get_profile))
auth_bp.route("/profile",  methods=["PUT"])(jwt_required()(update_profile))