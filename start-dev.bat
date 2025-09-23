@echo off
echo Starting Video Dating App Development Environment...
echo.

echo Starting MongoDB (make sure MongoDB is installed)...
start "MongoDB" cmd /k "mongod"

echo.
echo Waiting for MongoDB to start...
timeout /t 5 /nobreak > nul

echo Starting Backend Server...
start "Backend" cmd /k "cd dating-app-backend && npm run dev"

echo.
echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend (Expo)...
start "Frontend" cmd /k "cd dating-app-frontend && npx expo start"

echo.
echo ================================
echo Video Dating App is starting!
echo ================================
echo Backend: http://localhost:5000
echo Frontend: Use Expo Go app
echo MongoDB: mongodb://localhost:27017
echo.
echo Press any key to close this window...
pause > nul