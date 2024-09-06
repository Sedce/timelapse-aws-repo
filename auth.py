from flask_restx import Resource, Namespace, fields
from models import User
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    jwt_required,
)
from flask import Flask, request, jsonify, make_response


auth_ns = Namespace("auth", description="A namespace for our Authentication")


signup_model = auth_ns.model(
    "SignUp",
    {
        "username": fields.String(),
        "email": fields.String(),
        "password": fields.String(),
    },
)


login_model = auth_ns.model(
    "Login", {"username": fields.String(), "password": fields.String()}
)


@auth_ns.route("/signup")
class SignUp(Resource):
    @auth_ns.expect(signup_model)
    def post(self):
        data = request.get_json()

        username = data.get("username")

        db_user = User.query.filter_by(username=username).first()

        if db_user is not None:
            return jsonify({"message": f"User with username {username} already exists"})

        new_user = User(
            username=data.get("username"),
            email=data.get("email"),
            pwd=generate_password_hash(data.get("password")),
        )

        new_user.save()

        return make_response(jsonify({"message": "User created successfuly"}), 201)


@auth_ns.route("/login")
class Login(Resource):
    @auth_ns.expect(login_model)
    def post(self):
        data = request.get_json()

        username = data.get("username")
        pwd = data.get("password")

        db_user = User.query.filter_by(username=username).first()

        if db_user and check_password_hash(db_user.pwd, pwd):

            access_token = create_access_token(identity=db_user.username)
            refresh_token = create_refresh_token(identity=db_user.username)

            return jsonify(
                {"access_token": access_token, "refresh_token": refresh_token}
            )

        else:
            return jsonify({"message": "Invalid username or password"})

@auth_ns.route("/user")
class UserResource(Resource):
    @jwt_required()
    def get(self):

        current_user = get_jwt_identity()

        db_user = User.query.filter_by(username=current_user).first()
        
        if db_user is None:
            return jsonify({"message": f"User with username {current_user} already exists"})
        else:
            print(db_user.username)
            return make_response(jsonify({"username": db_user.username,"email": db_user.email}), 200)
    @jwt_required()
    def put(self):

        data = request.get_json()
        current_user = get_jwt_identity()
        print(current_user)
        new_password = data.get("password")
        
        # Find the user in the database
        db_user = User.query.filter_by(username=current_user).first()
        
        if db_user is None:
            return make_response(jsonify({"message": "User not found"}), 404)
        
        # Verify the current password
        if not check_password_hash(db_user.pwd, current_password):
            return make_response(jsonify({"message": "Current password is incorrect"}), 400)
        
        # Hash the new password and update it in the database
        db_user.pwd = generate_password_hash(new_password)
        db_user.save()
        
        return make_response(jsonify({"message": "Password updated successfully"}), 200)

@auth_ns.route("/refresh")
class RefreshResource(Resource):
    @jwt_required(refresh=True)
    def post(self):

        current_user = get_jwt_identity()

        new_access_token = create_access_token(identity=current_user)

        return make_response(jsonify({"access_token": new_access_token}), 200)
