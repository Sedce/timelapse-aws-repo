from flask_restx import Namespace, Resource, fields
from models import Camera
from models import CameraPermission
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import request, jsonify
from datetime import timedelta, datetime
from sqlalchemy.sql import func

CHECK_IN_THRESHOLD = timedelta(minutes=30)

camera_ns = Namespace("camera", description="A namespace for Cameras")


camera_model = camera_ns.model(
    "Camera",
    {"id": fields.Integer(), "camera_id": fields.Integer(), "album": fields.Integer(), "status": fields.Integer(), "name":fields.String()
})

config_model = camera_ns.model(
    "Config",
    {"source": fields.Integer(), "album": fields.Integer(), "timelapse":fields.String()
})

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

@camera_ns.route("/cameras")
class CamerasResource(Resource):
    @camera_ns.marshal_list_with(camera_model)
    @jwt_required()
    def get(self):
         try:
            """Get all cameras the user has permission to access"""
            print("im here")
            # Get the current user's ID
            current_user_id = get_jwt_identity()
            print(current_user_id)
            permitted_camera_ids = (
                CameraPermission.query.with_entities(CameraPermission.cameraid)
                .filter_by(username=current_user_id).all()
            )
            permitted_camera_ids_list = [id for (id,) in permitted_camera_ids]
            # Query to get the cameras the user has access to
            cameras = Camera.query.filter(Camera.id.in_(permitted_camera_ids_list)).all()
            print(cameras)
            return cameras
         except Exception as e:
            print(e)
            return {"message": str(e)}, 500

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
    def post(self):
        try:
            # Extract camera ID from the request data
            data = request.get_json()
            camera_id = data.get("device_id")
            if not camera_id:
                return {"message": "Camera ID is required"}, 400

            # Retrieve the camera by ID, ensuring it's a single object
            camera_to_update = Camera.query.filter_by(camera_id=camera_id).first_or_404()

            # Set the last_check_in to the current datetime
            camera_to_update.last_check_in = datetime.utcnow()
            camera_to_update.status = True
            camera_to_update.save()
            check_camera_activities()

            # Return the updated camera details
            return jsonify([{"source": camera_to_update.source,"album": camera_to_update.album, "timelapse": camera_to_update.timelapse + 300}])
        except Exception as e:
            print(e)
            return {"message": str(e)}, 500
