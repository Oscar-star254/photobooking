from flask import Blueprint
from flask_jwt_extended import jwt_required
from controllers.portfolio_controller import (
    get_portfolio,
    upload_portfolio_photo,
    delete_portfolio_photo,
)

portfolio_bp = Blueprint("portfolio", __name__)

portfolio_bp.route("",           methods=["GET"], strict_slashes=False)(get_portfolio)
portfolio_bp.route("/upload",     methods=["POST"], strict_slashes=False)(jwt_required()(upload_portfolio_photo))
portfolio_bp.route("/<photo_id>", methods=["DELETE"], strict_slashes=False)(jwt_required()(delete_portfolio_photo))