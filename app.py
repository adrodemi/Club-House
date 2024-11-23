from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

# Database initialization
DATABASE = 'registration.db'

def init_db():
    """Initialize the SQLite database."""
    conn = sqlite3.connect(DATABASE)
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

# Initialize the database
init_db()

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
        conn = sqlite3.connect(DATABASE)
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


DATABASE1 = "events.db"

def init_db1():
    conn = sqlite3.connect("DATABASE1")
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS events (
                   id INTEGER PRIMARY KEY AUTOINCREMENT,
                   title TEXT NOT NULL,
                   description TEXT,
                   latitude REAL NOT NULL,
                   longitude REAL NOT NULL
                   )
                ''')
    
    conn.commit()
    conn.close()


init_db1()

@app.route('/create-event', methods=['POST'])
def create_event():
    """Handle event creation."""

    data = request.get_json()

    title = data.get('title')
    description = data.get('description', '')
    latitude = data.get('latitude')
    longitude = data.get('longitude')

    if not title or latitude is None or longitude is None:
        return jsonify({'error': 'Title, latitude, and longitude are required'}), 400
    
    try:
        conn = sqlite3.connect(DATABASE1)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO events (title, description, latitude, longitude)
            VALUES (?,?,?,?)
        ''', (title, description, latitude, longitude))
        conn.commit()
        conn.close()

        return jsonify({'message': 'Event created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@app.route('/events', methods=['GET'])
def get_events():
    """Retrieve all events from the database."""
    try:
        conn = sqlite3.connect(DATABASE1)
        cursor = conn.cursor()
        cursor.execute('SELECT id, title, description, latitude, longitude FROM events')
        rows = cursor.fetchall()        
        conn.close()
    
        events = [
            {
                'id': row[0],
                'title': row[1],
                'description': row[2],
                'latitude': row[3],
                'longitude': row[4]
            }
            for row in rows
        ]

        return jsonify(events), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    


if __name__ == '__main__':
    app.run(debug=True)

