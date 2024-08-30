from exts import db


"""
class Camera:
    id:int primary key
    title:str 
    description:str (text)
"""


class Camera(db.Model):
    __tablename__= "camera_parameters"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    camera_id = db.Column(db.Integer(), unique=True, nullable=True)
    source = db.Column(db.Integer(), unique=True, nullable=True)
    album = db.Column(db.Integer(), unique=True, nullable=True)
    timelapse = db.Column(db.Integer(), unique=True, nullable=True)
    last_check_in = db.Column(db.DateTime, unique=True, nullable=True)
    status = db.Column(db.Boolean, nullable=True)
    name = db.Column(db.String(255), nullable=True)
    
    def __repr__(self):
        return '<Camera_Parameters %i>' % self.camera_id

    def save(self):
        """
        The save function is used to save the changes made to a model instance.
        It takes in no arguments and returns nothing.

        :param self: Refer to the current instance of the class
        :return: The object that was just saved
        :doc-author:jod35
        """
        db.session.add(self)
        db.session.commit()

    def delete(self):
        """
        The delete function is used to delete a specific row in the database. It takes no parameters and returns nothing.

        :param self: Refer to the current instance of the class, and is used to access variables that belongs to the class
        :return: Nothing
        :doc-author:jod35
        """
        db.session.delete(self)
        db.session.commit()

    def update(self, title, description):
        """
        The update function updates the title and description of a given blog post.
        It takes two parameters, title and description.

        :param self: Access variables that belongs to the class
        :param title: Update the title of the post
        :param description: Update the description of the blog post
        :return: A dictionary with the updated values of title and description
        :doc-author:jod35
        """
        self.camera_id = camera_id
        self.description = description
        db.session.commit()


# user model

"""
class User:
    id:integer
    username:string
    email:string
    pwd:string
"""


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(25), nullable=False, unique=True)
    email = db.Column(db.String(80), nullable=False)
    pwd = db.Column(db.Text(), nullable=False)

    def __repr__(self):
        """
        returns string rep of object

        """
        return f"<User {self.username}>"

    def save(self):
        db.session.add(self)
        db.session.commit()

class Photos(db.Model):
    __tablename__ = "photos"

    id = db.Column(db.Integer, primary_key=True)
    trigger_type = db.Column(db.String(255), unique=True, nullable=True)
    photo_md5 = db.Column(db.String(32), unique=True, nullable=True)
    daylight = db.Column(db.SmallInteger, unique=True, nullable=True)
    longitude = db.Column(db.Numeric(10), unique=True, nullable=True)
    latitude = db.Column(db.Numeric(10), unique=True, nullable=True)
    bluetooth = db.Column(db.SmallInteger, unique=True, nullable=True)
    solar_battery_voltage = db.Column(db.Numeric(10), unique=True, nullable=True)
    backup_battery_voltage = db.Column(db.Numeric(10), unique=True, nullable=True)
    supply_5_voltage = db.Column(db.Numeric(10), unique=True, nullable=True)
    supply_4dot3_voltage = db.Column(db.Numeric(10), unique=True, nullable=True)
    supply_3dot3_voltage = db.Column(db.Numeric(10), unique=True, nullable=True)
    ioio_temperature = db.Column(db.Numeric(10), unique=True, nullable=True)
    cached_photo_count = db.Column(db.Integer(), unique=True, nullable=True)
    cell_data_used = db.Column(db.Integer(), unique=True, nullable=True)
    thumbnail_data = db.Column(db.LargeBinary(length=(2 ** 32) - 1), unique=True, nullable=True)
    photo_data = db.Column(db.LargeBinary(length=(2 ** 32) - 1), unique=True, nullable=True)
    album_id = db.Column(db.Integer(), unique=True, nullable=True)
    source_name = db.Column(db.Integer(), unique=True, nullable=True)
    date_taken = db.Column(db.DateTime, unique=True, nullable=True)
    HD1080p_data = db.Column(db.LargeBinary(length=(2 ** 32) - 1), unique=True, nullable=True)

    def __repr(self):
        return '<Photos %s>' % self.username

    def save(self):
        """
        The save function is used to save the changes made to a model instance.
        It takes in no arguments and returns nothing.

        :param self: Refer to the current instance of the class
        :return: The object that was just saved
        :doc-author:jod35
        """
        db.session.add(self)
        db.session.commit()

    def delete(self):
        """
        The delete function is used to delete a specific row in the database. It takes no parameters and returns nothing.

        :param self: Refer to the current instance of the class, and is used to access variables that belongs to the class
        :return: Nothing
        :doc-author:jod35
        """
        db.session.delete(self)
        db.session.commit()

    def update(self, title, description):
        """
        The update function updates the title and description of a given blog post.
        It takes two parameters, title and description.

        :param self: Access variables that belongs to the class
        :param title: Update the title of the post
        :param description: Update the description of the blog post
        :return: A dictionary with the updated values of title and description
        :doc-author:jod35
        """
        db.session.commit()

class CameraPermission(db.Model):
    __tablename__ = "camera_permissions"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    userid = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    cameraid = db.Column(db.Integer, db.ForeignKey('camera_parameters.id'), nullable=False)
    username = db.Column(db.String(255), nullable=True) 

    # Relationships
    user = db.relationship('User', backref=db.backref('camera_permissions', cascade="all, delete-orphan"))
    camera = db.relationship('Camera', backref=db.backref('camera_permissions', cascade="all, delete-orphan"))

    def __repr__(self):
        return f'<CameraPermission userid={self.userid} cameraid={self.cameraid}>'

    def save(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

