from flask import Blueprint
from flask_jwt_extended import jwt_required
from controllers.review_controller import create_review, get_reviews

review_bp = Blueprint("reviews", __name__)

review_bp.route("/",  methods=["GET"])(get_reviews)
review_bp.route("/",  methods=["POST"])(jwt_required()(create_review))
