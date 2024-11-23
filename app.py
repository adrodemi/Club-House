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

if __name__ == '__main__':
    app.run(debug=True)