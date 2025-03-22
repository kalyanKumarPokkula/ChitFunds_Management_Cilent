# Chit Funds Management Server

The backend API for the Chit Funds Management System, built with Flask.

## Development

### Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
python app.py
```

### Docker Development

The server application can be run in Docker:

```bash
# Build and run the server in development mode
docker build -t chit-server .
docker run -p 5001:5001 -v $(pwd):/app chit-server
```

Or use the docker-compose.dev.yml at the root of the project.

## API Endpoints

### Chit Groups

- `GET /chit-groups`: Get all chit groups
- `POST /chit-groups`: Create a new chit group
- `GET /chit-groups/<id>`: Get a specific chit group
- `DELETE /chit-groups/<id>`: Delete a chit group
- `PATCH /chit-groups/<id>/add-members`: Add members to a chit group
- `PATCH /chit-groups/<id>/projections/<month>/add-lifter`: Add a lifter to a specific month

### Users

- `GET /users`: Get all users
- `GET /users/<id>`: Get a specific user
- `GET /users/chit-group/<chit_group_id>`: Get users in a specific chit group

## Features

- RESTful API design
- CORS support for cross-origin requests
- JSON response format
- Error handling with appropriate status codes
