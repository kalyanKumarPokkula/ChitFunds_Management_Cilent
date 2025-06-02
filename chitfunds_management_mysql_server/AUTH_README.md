# JWT Authentication Implementation

This document explains the implementation of JWT (JSON Web Token) authentication in the ChitFunds Management API.

## Features

- User registration (signup)
- User login with JWT token generation
- Password hashing for security
- JWT token-based route protection

## API Endpoints

### Authentication Endpoints

- `POST /auth/signup`: Create a new user account
  - Request body: `{ "full_name": "...", "email": "...", "password": "...", "phone": "..." }`
  - Returns: JWT token and user information

- `POST /auth/login`: Login to an existing account
  - Request body: `{ "email": "...", "password": "..." }`
  - Returns: JWT token and user information

### Protected Routes

All other API routes are protected and require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your_token_here>
```

## Implementation Details

1. **Password Security**: All passwords are hashed using bcrypt before storage
2. **Token Generation**: JWT tokens include user ID and role information
3. **Token Validation**: All protected routes verify token authenticity before processing requests
4. **Token Expiry**: Tokens expire after 24 hours (can be configured via the `ACCESS_TOKEN_EXPIRE_MINUTES` setting)

## Migration for Existing Users

A migration script has been provided to convert existing plaintext passwords to hashed passwords:

```
python migrate_passwords.py
```

Run this script after updating to the new version with authentication.

## Environment Variables

The following environment variables can be set to configure authentication:

- `JWT_SECRET_KEY`: Secret key used to sign JWT tokens (default: "chitfunds_secret_key")

For production, it's strongly recommended to set a custom secret key. 