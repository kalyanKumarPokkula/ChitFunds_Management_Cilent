from flask import Flask
from routes import *
from db import init_db  # Import the database initialization function
from routes import register_routes
from flask_cors import CORS 

# Initialize the Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://localhost:3000", "http://chit-client:3000"]}})
# Initialize the database

register_routes(app)

if __name__ == "__main__":
    init_db()
    app.run(host='0.0.0.0', port=5001, debug=True)
