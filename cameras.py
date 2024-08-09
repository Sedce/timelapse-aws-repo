from flask_restx import Namespace, Resource, fields
from models import Camera
from flask_jwt_extended import jwt_required
from flask import request
from datetime import timedelta, datetime
from sqlalchemy.sql import func

CHECK_IN_THRESHOLD = timedelta(minutes=30)

camera_ns = Namespace("camera", description="A namespace for Cameras")


camera_model = camera_ns.model(
    "Camera",
    {"id": fields.Integer(), "camera_id": fields.Integer(), "album": fields.Integer(), "status": fields.Integer()},
)

def check_camera_activities():
    try:
        # Current time
        now = datetime.utcnow()
        
        # Select cameras that haven't checked in recently
        cameras_to_update = Camera.query.filter(
        (func.now() - Camera.last_check_in > CHECK_IN_THRESHOLD) |
        (Camera.last_check_in == None)).all()
        for camera in cameras_to_update:
            # Process each camera
            camera.status = False
            camera.save()  # Save each camera individually if `save` method exists
        
        # Log or handle cameras that haven't checked in
    except Exception as e:
            print("Exception:", e)



@camera_ns.route("/hello")
class HelloResource(Resource):
    def get(self):
        return {"message": "Hello World"}


@camera_ns.route("/cameras")
class CamerasResource(Resource):
    @camera_ns.marshal_list_with(camera_model)
    def get(self):
        """Get all cameras"""
        cameras = Camera.query.all()
        return cameras

    @camera_ns.marshal_with(camera_model)
    @camera_ns.expect(camera_model)
    @jwt_required()
    def post(self):
        """Create a new camera"""

        data = request.get_json()

        new_camera = Camera(
            title=data.get("title"), description=data.get("description")
        )

        new_camera.save()

        return new_camera, 201


@camera_ns.route("/camera/<int:id>")
class CameraResource(Resource):
    @camera_ns.marshal_with(camera_model)
    def get(self, id):
        """Get a camera by id"""
        camera = Camera.query.get_or_404(id)

        return camera

    @camera_ns.marshal_with(camera_model)
    @jwt_required()
    def put(self, id):
        """Update a camera by id"""

        camera_to_update = Camera.query.get_or_404(id)

        data = request.get_json()

        camera_to_update.update(data.get("id"), data.get("source"))

        return camera_to_update

    @camera_ns.marshal_with(camera_model)
    @jwt_required()
    def delete(self, id):
        """Delete a camera by id"""

        camera_to_delete = Camera.query.get_or_404(id)

        camera_to_delete.delete()

        return camera_to_delete

@camera_ns.route('/cameracheckin', methods=['POST'])
class CameraCheckinResource(Resource):
    @camera_ns.marshal_with(camera_model)
    # Remove the @jwt_required() decorator
    def post(self):
        try:
            # Extract camera ID from the request data
            data = request.get_json()
            camera_id = data.get("device_id")

            if not camera_id:
                return {"message": "Camera ID is required"}, 400

            # Retrieve the camera by ID, ensuring it's a single object
            camera_to_update = Camera.query.filter_by(id=camera_id).first_or_404()

            # Set the last_check_in to the current datetime
            camera_to_update.last_check_in = datetime.utcnow()
            camera_to_update.status = True
            camera_to_update.save()
            check_camera_activities()

            # Return the updated camera details
            return camera_to_update, 200
        except Exception as e:
            return {"message": str(e)}, 500