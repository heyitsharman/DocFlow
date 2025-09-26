@echo off
echo Starting Office Management System Backend...
echo.

REM Check if MongoDB is running
echo Checking if MongoDB is available...
timeout /t 2 > nul

REM Start the backend server
echo Starting Node.js server...
npm run dev