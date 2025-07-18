#!/bin/bash

# Start development servers for the team management system

echo "🚀 Starting Team Management System in Development Mode"
echo "================================================="

# Kill any existing processes on our ports
echo "📋 Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

# Start backend in background
echo "🔧 Starting FastAPI backend on port 8000..."
cd backend
PYTHONPATH=$(pwd) python3 -m uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 3

# Start frontend in background
echo "🎨 Starting Next.js frontend on port 3000..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Development servers started!"
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend API: http://localhost:8000"
echo "📍 API Docs: http://localhost:8000/docs"
echo ""
echo "💡 To stop all servers, run: kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "🎯 Ready for development! Register your first admin user at:"
echo "   http://localhost:3000/auth/register"

# Wait for user input to stop
echo ""
echo "Press Ctrl+C to stop all servers..."
trap 'echo "🛑 Stopping servers..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT
wait