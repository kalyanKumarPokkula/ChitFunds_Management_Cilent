# Chitfunds Management Server

A server application for managing chitfunds, with data storage in MySQL database.

## Prerequisites

- Docker and Docker Compose
- Python 3.9 or higher (for local development)
- MySQL 8.0 or higher (for local development without Docker)

## Running the Application

### Using Docker (Recommended)

The easiest way to run the application is using Docker Compose:

1. Make sure you have Docker and Docker Compose installed on your system.

2. Build and start the Docker containers:

```bash
docker-compose up -d
```

This will:
- Start a MySQL database container
- Start the Flask application container
- Initialize the database tables

3. To check if the application is running properly:

```bash
docker-compose logs -f app
```

4. The application will be available at http://localhost:5000

### Local Development Setup (without Docker)

1. Create a MySQL database:

```bash
mysql -u root -p
CREATE DATABASE chitfunds;
```

2. Install the required dependencies:

```bash
pip install -r requirements.txt
```

3. Set the environment variables for the database connection:

```bash
export DB_USER=root
export DB_PASSWORD=your_password
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=chitfunds
```

4. Start the application:

```bash
python run.py
```

## API Endpoints

Here are some of the main endpoints:

- `GET /chit-groups`: Get all chit groups
- `POST /chit-groups`: Create a new chit group
- `GET /get_chit?chit_group_id=<id>`: Get details of a specific chit group
- `DELETE /delete-chit?chit_group_id=<id>`: Delete a chit group
- `PATCH /update-chit-group`: Update a chit group
- `GET /users`: Get all users
- `POST /create_new_user`: Create a new user
- `GET /user_details?user_id=<id>`: Get user details

## Database Schema

The MySQL database includes the following tables:

1. `users`: Stores user information
2. `chit_groups`: Stores chit group details
3. `chit_members`: Maps users to chit groups they belong to
4. `monthly_projections`: Stores monthly projections for each chit group
5. `installments`: Tracks payments and dues for each member

## Troubleshooting

- If you encounter database connection errors, make sure the MySQL server is running and accessible.
- For Docker issues, check the container logs:

```bash
docker-compose logs -f
```

## License

This project is proprietary and confidential.
