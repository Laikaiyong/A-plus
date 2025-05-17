#!/bin/bash

# Script to run Next.js frontend and FastAPI backend together

# Function to kill processes on exit
cleanup() {
    echo "Shutting down services..."
    if [ ! -z "$FRONTEND_PID" ]; then
        echo "Killing frontend process $FRONTEND_PID"
        kill $FRONTEND_PID
    fi
    if [ ! -z "$BACKEND_PID" ]; then
        echo "Killing backend process $BACKEND_PID"
        kill $BACKEND_PID
    fi
    exit 0
}

# Set up trap to catch SIGINT (Ctrl+C)
trap cleanup SIGINT SIGTERM

# Configuration (adjust these paths as needed)
FRONTEND_DIR="./frontend"
BACKEND_DIR="../backend"
FRONTEND_PORT=3080
BACKEND_PORT=8090

# Function to check and kill processes using specific ports
kill_process_on_port() {
    local port=$1
    local pid=$(lsof -t -i:$port)
    if [ ! -z "$pid" ]; then
        echo "Port $port is in use by process $pid. Terminating..."
        kill -9 $pid
        sleep 1
    fi
}

# Check and kill processes using our ports
kill_process_on_port $FRONTEND_PORT
kill_process_on_port $BACKEND_PORT

# Start frontend
echo "Starting Next.js frontend on port ${FRONTEND_PORT}..."
cd "$FRONTEND_DIR" || { echo "Frontend directory not found!"; exit 1; }
PORT=$FRONTEND_PORT npm run dev &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"

# Start backend
echo "Starting FastAPI backend on port ${BACKEND_PORT}..."
cd "$BACKEND_DIR" || { echo "Backend directory not found!"; exit 1; }

# Activate virtual environment and run using python instead of direct uvicorn call
if [ -d "venv" ]; then
    echo "Activating Python virtual environment..."
    source venv/bin/activate || { echo "Failed to activate virtual environment"; exit 1; }
    BACKEND_PORT=$BACKEND_PORT python3 main.py &
    BACKEND_PID=$!
    echo "Backend started with PID: $BACKEND_PID"
else
    echo "Virtual environment not found at $BACKEND_DIR/venv!"
    exit 1
fi

echo "Both services are running!"
echo "Frontend available at http://localhost:${FRONTEND_PORT}"
echo "Backend available at http://localhost:${BACKEND_PORT}"
echo "Press Ctrl+C to stop both services"

# Wait for both processes
wait $FRONTEND_PID $BACKEND_PID