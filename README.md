# Chit Funds Management Application

A comprehensive application for managing chit funds, with a React frontend and Flask backend.

## Running with Docker

### Production Mode

To run the application in production mode:

```bash
docker-compose up -d
```

This will build and start both the client and server containers. The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

### Development Mode

For development with hot reloading:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

In development mode:

- Frontend will be available at http://localhost:5173
- Backend API will be available at http://localhost:5001
- Changes to both frontend and backend code will automatically reload

## Running Without Docker

### Server

```bash
cd chitfunds_management_server
pip install -r requirements.txt
python app.py
```

### Client

```bash
cd chitfunds_management_client
npm install
npm run dev
```

## Accessing the Application

After starting the application, you can access:

- Frontend: http://localhost:3000 (production) or http://localhost:5173 (development)
- Backend API: http://localhost:5001
