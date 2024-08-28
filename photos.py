
from flask_restx import Namespace, Resource, fields, reqparse
from models import Photos
from flask_jwt_extended import jwt_required
from flask import request, jsonify, send_from_directory, request
from datetime import timedelta, datetime, time
import re
# Third-Party Imports
import imageio
import numpy as np
import io
from io import BytesIO
import os

import json
import hashlib
from PIL import Image
from PIL.ExifTags import TAGS
import base64
import logging
import random
import string

THUMBNAIL_SIZE = (300, 300)  # Set the size of the thumbnail images
TIMELAPSE_SIZE = (1920, 1088)  # 1088 because encoder needs div 16

#logging.basicConfig(level=logging.INFO, filename='/var/log/camera_service.log', format='%(asctime)s - %(levelname)s - %(message)s')

photos_ns = Namespace("photos", description="A namespace for Photos")

# Define the model for response data
timelapse_model = photos_ns.model('Timelapse', {
    'generated_video_path': fields.String(required=True, description='Path to the generated video')
})

photos_model = photos_ns.model(
    "Photo",
    {
        "id": fields.Integer(),
        "trigger_type": fields.String(required=False),
        "photo_md5": fields.String(required=False),
        "daylight": fields.Integer(required=False),
        "longitude": fields.Float(required=False),
        "latitude": fields.Float(required=False),
        "bluetooth": fields.Integer(required=False),
        "solar_battery_voltage": fields.Float(required=False),
        "backup_battery_voltage": fields.Float(required=False),
        "supply_5_voltage": fields.Float(required=False),
        "supply_4dot3_voltage": fields.Float(required=False),
        "supply_3dot3_voltage": fields.Float(required=False),
        "ioio_temperature": fields.Float(required=False),
        "cached_photo_count": fields.Integer(required=False),
        "cell_data_used": fields.Integer(required=False),
        "thumbnail_data": fields.Raw(required=False),  # For binary data
        "photo_data": fields.Raw(required=False),      # For binary data
        "album_id": fields.Integer(required=False),
        "source_name": fields.String(required=False),
        "date_taken": fields.DateTime(required=False),
        "HD1080p_data": fields.Raw(required=False),  # For binary data
    }
)


# def allowed_file(filename):
#     return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


# from datetime import datetime

def extract_date_taken(photo_data):
    """Extract DateTimeOriginal from the photo's EXIF data."""
    try:
        image = Image.open(BytesIO(photo_data))
        exif_data = image._getexif()

        if exif_data:
            for tag, value in exif_data.items():
                tag_name = TAGS.get(tag, tag)
                if tag_name == "DateTimeOriginal":
                    return value
    except Exception as e:
        print(f"Error processing image: {e}")
    
    return None

def update_date_taken():
    """Update all photos in the database with the date taken from EXIF data."""
    photos = Photos.query.all()

    for photo in photos:
        exif_date_taken = extract_date_taken(photo.photo_data)

        if exif_date_taken:
            # Convert exif_date_taken to datetime object
            from datetime import datetime
            try:
                photo.date_taken = datetime.strptime(exif_date_taken, "%Y:%m:%d %H:%M:%S")
                photo.save()
            except ValueError as ve:
                print(f"Error converting date: {ve}")
        else:
            print(f"No EXIF date found for photo ID {photo.id}")
    print("Date Taken updated for all photos.")

def parse_verbose_date(date_str):
    try:
        clean_date_str = re.sub(r'\s\([^\)]*\)', '', date_str)
        # Format string for the cleaned date format
        format_str = '%a %b %d %Y %H:%M:%S GMT%z'
        
        # Parse the cleaned date string
        date_obj = datetime.strptime(clean_date_str, format_str)
        string_obj = date_obj.strftime('%Y-%m-%d')
        return string_obj
    except ValueError as e:
        print("Error parsing date:", e)
        return None

def retrieve_HD1080p_by_album_id_within_date_range(album_id, begin_date_str, end_date_str):
    photos = []
    try:
        parsed_begin_date = parse_verbose_date(begin_date_str)
        parsed_end_date = parse_verbose_date(end_date_str)
        begin_date = datetime.strptime(parsed_begin_date, '%Y-%m-%d').date()
        end_date = datetime.strptime(parsed_end_date, '%Y-%m-%d').date()

        # Set time to midnight for the beginning of the day
        formatted_begin_date = datetime.combine(begin_date, time.min).strftime('%Y-%m-%d %H:%M:%S')
        # Set time to just before midnight for the end of the day
        formatted_end_date = datetime.combine(end_date, time.max).strftime('%Y-%m-%d %H:%M:%S')
       
        photos = Photos.query.with_entities(Photos.HD1080p_data).filter(Photos.album_id == album_id,Photos.date_taken.between(formatted_begin_date, formatted_end_date)).order_by(Photos.date_taken.asc()).all()
    except Exception as err:
        print("MySQL Error:", err)
    return photos


def retrieve_photo_by_id(photo_id):
    try:
        photo = Photos.query.with_entities(Photos.photo_data, Photos.date_taken).where(photo_id == Photos.id).first()
        return photo
    except Exception as err:
        print("Error retrieving photo:", err)
        return None

def store_photo_in_database(photo_data, album_id, source_name, trigger_type, date_taken, photo_md5):
    try:
        # Create a thumbnail from the photo_data
        photo = Image.open(io.BytesIO(photo_data))
        thumbnail = photo.copy()
        thumbnail.thumbnail(THUMBNAIL_SIZE)
        thumbnail_data = io.BytesIO()
        thumbnail.save(thumbnail_data, format='JPEG')

       #need to have a function to make a decision which more accurate raspberry or photo exif date
        exif_data = photo._getexif()

        date_taken_cam = None

        if exif_data:
         for tag, value in exif_data.items():
          tag_name = TAGS.get(tag, tag)
          if tag_name == "DateTimeOriginal":
           date_taken_cam = value
           break
       
        if date_taken_cam:
         print(f"Date Taken: {date_taken}")
        else:
         print("Date Taken not found in EXIF data.")
        
        # Create a 1080p version
        HD1080p = photo.resize((1648, 1088), Image.LANCZOS)
        HD1080p_data = io.BytesIO()
        HD1080p.save(HD1080p_data, format='JPEG')

        # Create a new Photo object
        new_photo = Photos(
            album_id=album_id,
            source_name=source_name,
            trigger_type=trigger_type,
            date_taken=date_taken_cam,
            photo_md5=photo_md5,
            photo_data=photo_data,
            thumbnail_data=thumbnail_data.getvalue(),
            HD1080p_data=HD1080p_data.getvalue()
        )
        new_photo.save()

    except Exception as err:
        return {'status': 'Error', 'message': str(err)}


def retrieve_thumbnails_by_album_id_within_date_range(album_id, table_name = 'photos'):
    photos = []
    try:
        photos = Photos.query.with_entities(Photos.thumbnail_data, Photos.id, Photos.album_id, Photos.source_name, Photos.date_taken).filter(album_id == Photos.album_id).order_by(Photos.date_taken.desc()).all()
    except Exception as err:
        print("MySQL Error:", err)
    return photos

def retrieve_latest_photo_for_album(album_id):

    try:
        photo = Photos.query.with_entities(Photos.thumbnail_data, Photos.date_taken).filter(Photos.album_id == album_id).order_by(Photos.date_taken.desc()).first()
    except Exception as err:
        photo = None
    return photo


@photos_ns.route('/latest_photo/<int:album_id>')
class PhotoResource(Resource):
    def get(self, album_id):
        try:
            photo = retrieve_latest_photo_for_album(album_id)
            date_taken = photo['date_taken']
              
            return jsonify({
                    'thumbnail_data': base64.b64encode(photo.thumbnail_data).decode('utf-8'),
                    'date_taken': photo.date_taken
                })
        except Exception as e:
                return f"Error generating timelapse: {e}"

@photos_ns.route('/view_photos/<int:album_id>', methods=['GET', 'POST'])
class PhotosResource(Resource):
    @photos_ns.marshal_list_with(photos_model)
    def get(self, album_id):

        try:
            photos = retrieve_thumbnails_by_album_id_within_date_range(album_id)
            if not photos:
                return {"message": "No photos found in the selected date range."}, 404

            # Serialize the data
            serialized_photos = []
            for photo in photos:
                serialized_photo = {
                    "id": photo.id,
                    "thumbnail_data": base64.b64encode(photo.thumbnail_data).decode('utf-8') if photo.thumbnail_data else None,
                    "album_id": photo.album_id,
                    "source_name": photo.source_name,
                    "date_taken": photo.date_taken.isoformat() if photo.date_taken else None
                }
                serialized_photos.append(serialized_photo)

            return serialized_photos

        except Exception as e:
            return {"message": "Error retrieving photos"}, 500

    @photos_ns.marshal_with(photos_model)
    @photos_ns.expect(photos_model)
    @jwt_required()
    def post(self, album_id):
        try:
            photos = retrieve_thumbnails_by_album_id_within_date_range(album_id, begin_date_str, end_date_str)
            serialized_photos = [{'id': photo['id'], 'thumbnail_data': base64.b64encode(photo['thumbnail_data']).decode('utf-8')} for photo in photos]

            if not photos:
                return "No photos found in the selected date range."

            return "here"#jsonify(serialized_photos)
            #jsonify({'photos':serialized_photos})
        
        except Exception as e:
            return print("mySQL error", e)

@photos_ns.route('/photo/<int:photo_id>' )
class PhotoResource(Resource):
    @photos_ns.marshal_with(photos_model)
    def get(self, photo_id):
        photo = retrieve_photo_by_id(photo_id)  # Retrieve photo data by ID from the database
        if photo:
            return {'photo_data': base64.b64encode(photo.photo_data).decode('utf-8'), 'date_taken': photo.date_taken}
        else:
            return "Photo not found", 404


@photos_ns.route('/generate_timelapse/<int:album_id>')
class TimelapseResource(Resource):
    @photos_ns.doc(params={'album_id': 'ID of the album'})
    @photos_ns.expect(timelapse_model)
    @photos_ns.marshal_with(timelapse_model)
    def post(self, album_id):
        if request.method == 'POST':
            try:
                begin_date_str = request.form['begin_date']
                end_date_str = request.form['end_date']

                # Retrieve photos from the specified album_id within the selected date range
                photos = retrieve_HD1080p_by_album_id_within_date_range(album_id, begin_date_str, end_date_str)

                if not photos:
                    return {"message": "No photos found in the selected date range."}, 404

                # Specify the output video path
                video_path = f'generated/timelapse_video_{album_id}_{"".join(random.choices(string.ascii_letters + string.digits, k=8))}.mp4'

                # Specify the dimensions of the video frames
                frame_width = 1920
                frame_height = 1088

                # Find the first frame with HD1080p data to calculate the aspect ratio
                aspect_ratio_set = False
                for photo in photos:
                    if photo.HD1080p_data:
                        img_array = np.frombuffer(photo.HD1080p_data, dtype=np.uint8)
                        img = Image.open(BytesIO(img_array))
                        img_aspect_ratio = img.width / img.height
                        frame_width = int(frame_height * img_aspect_ratio)
                        aspect_ratio_set = True
                        break

                # Specify the desired frame rate for the timelapse video
                frame_rate = 30
                video_writer = imageio.get_writer(video_path, format='mp4', fps=frame_rate)
                
                # Iterate through the photos and add them to the video
                for photo in photos:
                    if photo.HD1080p_data:
                        try:
                            img_array = np.frombuffer(photo.HD1080p_data, dtype=np.uint8)
                            img = Image.open(BytesIO(img_array))
                            img_array_resized = np.array(img)
                            video_writer.append_data(img_array_resized)
                        except Exception as e:
                            continue

                # Release the VideoWriter
                video_writer.close()

                generated_video_path = video_path

                return {'generated_video_path': generated_video_path}

            except Exception as e:
                logging.exception(f"ERROR: {e}")
                return {"message": f"Error generating timelapse: {e}"}, 500

@photos_ns.route('/generated/<path:video_filename>')
class VideoResource(Resource):
    @photos_ns.doc(params={'video_filename': 'The name of the video file to retrieve'})
    def get(self, video_filename):
        try:
            # Ensure that video_filename is properly sanitized
            filename = video_filename.replace('/', '_').replace(' ', '_').replace(':', '_')
        
            video_directory = './generated/' # Replace with your actual directory path
            
            return send_from_directory(video_directory, filename, as_attachment=True)
        
        except FileNotFoundError:
            # Handle file not found error
            return {'message': 'Video file not found'}, 404
        
        except Exception as e:
            # Handle other potential errors
            print("Exception:", e)
            return {'message': f"Error retrieving video: {e}"}, 500

@photos_ns.route('/videos')
class VideoListResource(Resource):
    @photos_ns.doc(description='List all video files in the /generated directory')
    def get(self):
        try:
            # Get the list of all files in the directory
            all_files = os.listdir('./generated/')
            # Filter the files to include only video files
            # You can extend this list based on your supported video formats
            video_extensions = ('.mp4', '.avi', '.mov', '.mkv', '.webm')
            video_files = [f"/generated/{f}" for f in all_files if f.lower().endswith(video_extensions)]
            
            return jsonify({'videos': video_files})
        
        except Exception as e:
            print("Exception:", e)
            return {'message': f"Error retrieving video list: {e}"}, 500

@photos_ns.route('/accept_incoming_image' ,methods=['POST'])
class AcceptIncomingImageResource(Resource):
    @photos_ns.expect(photos_model)
    @photos_ns.response(200, 'Success')
    @photos_ns.response(400, 'Bad Request')
    @photos_ns.response(500, 'Internal Server Error')
    @photos_ns.response(405, 'Internal Server Error')
    def post(self):
        try:
           # update_date_taken();
            # Read the photo file and JSON file
            photo_data = request.files['file'].read()
            json_data = json.load(request.files['JSON_data'])

            if not json_data:
                error_message = "JSON data is missing or malformed."
                return {'status': 'Error', 'message': error_message}, 400

            # Check MD5 hash
            incoming_md5 = json_data.get('photo_md5', '')
            calculated_md5 = hashlib.md5(photo_data).hexdigest()


            if incoming_md5 != calculated_md5:
                error_message = "MD5 hash mismatch."
                return {'status': 'Error', 'message': error_message}, 400

            # Process metadata
            incoming_album_id = int(json_data.get('album', 0))
            incoming_source_name = json_data.get('source', '')
            incoming_trigger_type = json_data.get('trigger_type', '')

            # Parse the date
            incoming_date_iso = json_data.get('date_taken', '')
            incoming_date = datetime.fromisoformat(incoming_date_iso)
            incoming_date_formatted = incoming_date.strftime('%Y-%m-%d %H:%M:%S')

            # Store the photo data and metadata
            store_photo_in_database(photo_data, incoming_album_id, incoming_source_name, incoming_trigger_type, incoming_date_formatted, incoming_md5)
            return {'status': 'Success'}

        except Exception as e:
            print("Exception in accept_incoming_image:", e)
            return {'status': 'Error', 'message': str(e)}, 500
