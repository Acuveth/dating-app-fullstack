#!/bin/bash

echo "Starting Video Dating App Development Environment..."
echo ""

echo "Starting MongoDB (make sure MongoDB is installed)..."
# Start MongoDB in background (adjust path as needed)
mongod --fork --logpath /tmp/mongodb.log --dbpath /tmp/mongodb-data 2>/dev/null || echo "MongoDB may already be running or not installed"

echo ""
echo "Starting Backend Server..."
cd dating-app-backend
npm run dev &
BACKEND_PID=$!

echo ""
echo "Waiting for backend to start..."
sleep 3

echo "Starting Frontend (Expo)..."
cd ../dating-app-frontend
npx expo start &
FRONTEND_PID=$!

echo ""
echo "================================"
echo "Video Dating App is running!"
echo "================================"
echo "Backend: http://localhost:5000"
echo "Frontend: Use Expo Go app"
echo "MongoDB: mongodb://localhost:27017"
echo ""
echo "Press Ctrl+C to stop all services..."

# Wait for interrupt
trap "echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait