from flask import Blueprint
from flask_jwt_extended import jwt_required
from controllers.portfolio_controller import (
    get_portfolio,
    upload_portfolio_photo,
    delete_portfolio_photo,
)

portfolio_bp = Blueprint("portfolio", __name__)

portfolio_bp.route("/",           methods=["GET", "OPTIONS"])(get_portfolio)
portfolio_bp.route("/upload",     methods=["POST", "OPTIONS"])(jwt_required()(upload_portfolio_photo))
portfolio_bp.route("/<photo_id>", methods=["DELETE", "OPTIONS"])(jwt_required()(delete_portfolio_photo))
