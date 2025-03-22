# Chit Funds Management Client

The frontend application for the Chit Funds Management System, built with React, Vite, and Tailwind CSS.

## Development

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### Docker Development

The client application can be run in Docker using the provided Dockerfile.dev:

```bash
# Build and run the client in development mode
docker build -f Dockerfile.dev -t chit-client-dev .
docker run -p 5173:5173 -v $(pwd):/app -v /app/node_modules chit-client-dev
```

Or use the docker-compose.dev.yml at the root of the project.

## Production

To build the application for production:

```bash
npm run build
```

This will create a `dist` directory with the production-ready files.

### Docker Production

The client application can be deployed using the production Dockerfile:

```bash
docker build -t chit-client .
docker run -p 3000:3000 chit-client
```

Or use the docker-compose.yml at the root of the project.

## Features

- Modern UI with React and Tailwind CSS
- Modal components for creating chit funds, adding members, and more
- Notification system for user feedback
- Responsive design for all device sizes
- Integration with the Chit Funds Management Server API
