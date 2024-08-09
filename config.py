from decouple import config
import os
from datetime import timedelta

from dotenv import load_dotenv


load_dotenv()

BASE_DIR = os.path.dirname(os.path.realpath(__file__))


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "secret")
    SQLALCHEMY_TRACK_MODIFICATIONS = os.getenv("SQLALCHEMY_TRACK_MODIFICATIONS", False)


class DevConfig(Config):
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URI", "sqlite:///dev.db")
    DEBUG = True
    # SQLALCHEMY_ECHO=True


class ProdConfig(Config):
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URI", "mysql://timelapse:3vvp3agl3$@database-1.c3ggm2sqauad.us-east-1.rds.amazonaws.com:3306/timelapse")
    DEBUG = os.getenv("DEBUG", False)
    SQLALCHEMY_ECHO = os.getenv("ECHO", False)
    SQLALCHEMY_TRACK_MODIFICATIONS = os.getenv("SQLALCHEMY_TRACK_MODIFICATIONS", False)


class TestConfig(Config):
    SQLALCHEMY_DATABASE_URI = "sqlite:///test.db"
    SQLALCHEMY_ECHO = False
    TESTING = True
