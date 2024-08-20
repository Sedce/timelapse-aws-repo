# Standard Library Imports
import base64
import os
import random
import string
from datetime import timedelta, datetime, time
from flask import Flask
from flask_restx import Api
from models import Camera, User
from exts import db
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from cameras import camera_ns
from photos import photos_ns
from auth import auth_ns
from flask_cors import CORS


def create_app(config):
    app = Flask(__name__, static_url_path="/", static_folder="./client/build")
    app.config.from_object(config)

    CORS(app)

    db.init_app(app)

    migrate = Migrate(app, db)
    JWTManager(app)

    api = Api(app, doc="/docs")

    api.add_namespace(camera_ns)
    api.add_namespace(auth_ns)
    api.add_namespace(photos_ns)

    @app.route("/")
    def index():
        return app.send_static_file("index.html")

    @app.errorhandler(404)
    def not_found(err):
        return app.send_static_file("index.html")

    # model (serializer)
    @app.shell_context_processor
    def make_shell_context():
        return {"db": db, "camera": Camera, "user": User, "photos": Photos} 

    return app
