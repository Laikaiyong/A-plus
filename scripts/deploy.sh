#!/bin/bash

# Script to deploy frontend and backend to Alibaba Cloud ECS using Docker Compose
# This version builds images directly on the ECS instance without using a registry

set -e  # Exit on error

# Configuration variables
PROJECT_NAME="aplus"                             # Project name
ECS_HOST="8.219.211.230"                         # Your ECS instance public IP or hostname
ECS_USER="ecs-user"                                  # SSH user for ECS
SSH_KEY_PATH="~/.ssh/id_rsa"                     # Path to SSH key
REMOTE_DIR="/root/aplus"                         # Remote directory on ECS

# Color formatting
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colorful messages
print_message() {
    echo -e "${GREEN}=== $1 ===${NC}"
}

print_warning() {
    echo -e "${YELLOW}WARNING: $1${NC}"
}

# Check if Docker is running locally
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker first."
    exit 1
fi

# Create remote directories if they don't exist
print_message "Preparing directories on ECS instance"
ssh -i $SSH_KEY_PATH $ECS_USER@$ECS_HOST "mkdir -p $REMOTE_DIR/frontend $REMOTE_DIR/backend $REMOTE_DIR/deployment"

# Copy application code to ECS
print_message "Copying frontend code to ECS"
cd "$(dirname "$0")/.."
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' ./frontend/ $ECS_USER@$ECS_HOST:$REMOTE_DIR/frontend/

print_message "Copying backend code to ECS"
rsync -avz --exclude 'venv' --exclude '__pycache__' --exclude '.git' ./backend/ $ECS_USER@$ECS_HOST:$REMOTE_DIR/backend/

# Copy docker-compose.yml to ECS
print_message "Copying Docker Compose configuration to ECS"
rsync -avz ./deployment/docker-compose.yml $ECS_USER@$ECS_HOST:$REMOTE_DIR/deployment/

# Deploy using Docker Compose on ECS
print_message "Building and deploying on ECS using Docker Compose"
ssh -i $SSH_KEY_PATH $ECS_USER@$ECS_HOST "cd $REMOTE_DIR/deployment && \
    docker-compose down --remove-orphans && \
    docker-compose build --no-cache && \
    docker-compose up -d"

print_message "Deployment completed successfully!"
print_message "Frontend available at: http://$ECS_HOST:80"
print_message "Backend available at: http://$ECS_HOST:8090"