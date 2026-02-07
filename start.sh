#!/bin/bash

echo "🎮 CROWDSTORY - Startup Script"
echo "=============================="
echo ""

# Navigate to the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "Starting backend server..."
node server.js &
BACKEND_PID=$!

sleep 2

echo ""
echo "Starting frontend web server..."
cd frontend
npx vite --port 5173

# Cleanup on Ctrl+C
trap "kill $BACKEND_PID" EXIT
