#!/bin/bash

# Color definitions
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to display usage information
show_usage() {
  echo -e "${YELLOW}Usage:${NC} ./start-app.sh [prod|dev]"
  echo ""
  echo "Options:"
  echo "  prod    Start the application in production mode"
  echo "  dev     Start the application in development mode with hot-reloading"
  echo ""
  echo "Example:"
  echo "  ./start-app.sh dev"
}

# Check for the environment parameter
if [ "$1" != "prod" ] && [ "$1" != "dev" ]; then
  show_usage
  exit 1
fi

# Stop any running containers
echo -e "${GREEN}Stopping any running containers...${NC}"
if [ "$1" = "dev" ]; then
  docker-compose -f docker-compose.dev.yml down
else
  docker-compose down
fi

# Start the application
echo -e "${GREEN}Starting the application in $1 mode...${NC}"
if [ "$1" = "dev" ]; then
  docker-compose -f docker-compose.dev.yml up -d --build
  
  echo -e "${GREEN}Development environment started:${NC}"
  echo -e "  Frontend: http://localhost:5173"
  echo -e "  Backend API: http://localhost:5001"
  echo -e "${YELLOW}Note:${NC} Changes to code will automatically reload"
else
  docker-compose up -d --build
  
  echo -e "${GREEN}Production environment started:${NC}"
  echo -e "  Frontend: http://localhost:3000"
  echo -e "  Backend API: http://localhost:5001"
fi

echo -e "${GREEN}Containers are running in the background. To view logs, run:${NC}"
if [ "$1" = "dev" ]; then
  echo "  docker-compose -f docker-compose.dev.yml logs -f"
else
  echo "  docker-compose logs -f"
fi 