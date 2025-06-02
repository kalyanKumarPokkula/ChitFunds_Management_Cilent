import jwt
import bcrypt
from datetime import datetime, timedelta
import os
from functools import wraps
from flask import request, jsonify
from db import get_db
from models.user import User
import uuid

# Get secret key from environment variable or use a default for development
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'chitfunds_secret_key')
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 day

def get_password_hash(password):
    """Generate a bcrypt hash of the password"""
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed_password.decode('utf-8')

def verify_password(plain_password, hashed_password):
    """Verify a password against a hash"""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict, expires_delta: timedelta = None):
    """
    Create a new JWT token
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token):
    """
    Decode a JWT token
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    """
    Decorator to protect routes with JWT authentication
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check if token is in headers
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({'message': 'Authentication token is missing'}), 401
        
        # Decode the token and get the user
        payload = decode_token(token)
        if payload is None:
            return jsonify({'message': 'Invalid or expired token'}), 401
        
        # Get the user from the database
        db = get_db()
        try:
            current_user = db.query(User).filter(User.user_id == payload['user_id']).first()
            
            if not current_user:
                return jsonify({'message': 'User not found'}), 401
                
            # Add the current user to the request context
            request.current_user = current_user
            
            return f(*args, **kwargs)
        finally:
            db.close()
    
    return decorated

def register_auth_routes(app):
    """
    Register authentication routes to the Flask app
    """
    @app.route('/auth/login', methods=['POST'])
    def login():
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Missing request body"}), 400
            
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
            
        db = get_db()
        try:
            # Find user by email
            user = db.query(User).filter(User.email == email).first()
            
            if not user:
                return jsonify({"error": "Invalid email or password"}), 401
                
            # Verify password
            if not verify_password(password, user.password):
                return jsonify({"error": "Invalid email or password"}), 401
                
            # Create access token
            access_token = create_access_token(
                data={"user_id": user.user_id, "role": user.role.value}
            )
            
            return jsonify({
                "message": "Login successful",
                "access_token": access_token,
                "token_type": "bearer",
                "user_id": user.user_id,
                "full_name": user.full_name,
                "role": user.role.value
            }), 200
                
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        finally:
            db.close()
            
    @app.route('/auth/signup', methods=['POST'])
    def signup():
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "Missing request body"}), 400
            
        required_fields = ['full_name', 'email', 'password', 'phone']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
                
        db = get_db()
        try:
            # Check if user already exists
            existing_email = db.query(User).filter(User.email == data['email']).first()
            if existing_email:
                return jsonify({"error": f"User with email {data['email']} already exists"}), 400
                
            existing_phone = db.query(User).filter(User.phone == data['phone']).first()
            if existing_phone:
                return jsonify({"error": f"User with phone number {data['phone']} already exists"}), 400
                
            # Hash the password
            hashed_password = get_password_hash(data['password'])
            
            # Create new user
            user_id = str(uuid.uuid4().hex[:12])
            new_user = User(
                user_id=user_id,
                full_name=data['full_name'],
                email=data['email'],
                password=hashed_password,
                phone=data['phone'],
                aadhaar_number=data.get('aadhaar_number', None),
                pan_number=data.get('pan_number', None),
                address=data.get('address', None),
                city=data.get('city', None),
                state=data.get('state', None),
                pincode=data.get('pincode', None),
                is_verified=True  # Set as needed
            )
            
            db.add(new_user)
            db.commit()
            
            # Create access token
            access_token = create_access_token(
                data={"user_id": user_id, "role": new_user.role.value}
            )
            
            return jsonify({
                "message": "User registered successfully",
                "access_token": access_token,
                "token_type": "bearer",
                "user_id": user_id,
                "full_name": data['full_name'],
                "role": new_user.role.value
            }), 201
                
        except Exception as e:
            db.rollback()
            return jsonify({"error": str(e)}), 500
        finally:
            db.close() 