from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Database paths
USER_DATABASE = 'registration.db'
EVENT_DATABASE = 'events.db'


# Initialize the user database
def init_user_db():
    conn = sqlite3.connect(USER_DATABASE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            full_name TEXT NOT NULL,
            age INTEGER NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            location TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()


# Initialize the event database
def init_event_db():
    conn = sqlite3.connect(EVENT_DATABASE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            photo_path TEXT
        )
    ''')
    conn.commit()
    conn.close()


# Initialize databases
init_user_db()
init_event_db()


@app.route('/register', methods=['POST'])
def register():
    """Handle user registration."""
    data = request.get_json()

    username = data.get('username')
    full_name = data.get('fullName')
    age = data.get('age')
    email = data.get('email')
    password = data.get('password')
    location = data.get('location')

    # Validate input
    if not all([username, full_name, age, email, password, location]):
        return jsonify({'error': 'All fields are required'}), 400

    try:
        conn = sqlite3.connect(USER_DATABASE)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO users (username, full_name, age, email, password, location)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (username, full_name, age, email, password, location))
        conn.commit()
        conn.close()

        return jsonify({'message': 'Registration successful'}), 201
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Email already exists'}), 409
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/create-event', methods=['POST'])
def create_event():
    """Handle event creation."""
    title = request.form.get('title')
    description = request.form.get('description', '')
    latitude = request.form.get('latitude')
    longitude = request.form.get('longitude')
    photo = request.files.get('photo')

    # Validate input
    if not title or not latitude or not longitude:
        return jsonify({'error': 'Title, latitude, and longitude are required'}), 400

    try:
        # Save the photo if provided
        photo_path = None
        if photo:
            photo_filename = os.path.join(app.config['UPLOAD_FOLDER'], photo.filename)
            photo.save(photo_filename)
            photo_path = photo_filename

        # Insert event into database
        conn = sqlite3.connect(EVENT_DATABASE)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO events (title, description, latitude, longitude, photo_path)
            VALUES (?, ?, ?, ?, ?)
        ''', (title, description, float(latitude), float(longitude), photo_path))
        conn.commit()
        conn.close()

        return jsonify({'message': 'Event created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/events', methods=['GET'])
def get_events():
    """Retrieve all events."""
    try:
        conn = sqlite3.connect(EVENT_DATABASE)
        cursor = conn.cursor()
        cursor.execute('SELECT id, title, description, latitude, longitude, photo_path FROM events')
        rows = cursor.fetchall()
        conn.close()

        events = [
            {
                'id': row[0],
                'title': row[1],
                'description': row[2],
                'latitude': row[3],
                'longitude': row[4],
                'photoUrl': row[5] if row[5] else None
            }
            for row in rows
        ]

        return jsonify(events), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
