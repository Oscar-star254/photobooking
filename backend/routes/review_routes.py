from flask import Blueprint
from flask_jwt_extended import jwt_required
from controllers.review_controller import (
    create_review,
    get_reviews,
    delete_review,
    check_can_review,
)

review_bp = Blueprint("reviews", __name__)

review_bp.route("/",                      methods=["GET"])(get_reviews)
review_bp.route("/",                      methods=["POST"])(jwt_required()(create_review))
review_bp.route("/<review_id>",           methods=["DELETE"])(jwt_required()(delete_review))
review_bp.route("/can-review/<booking_id>", methods=["GET"])(jwt_required()(check_can_review))