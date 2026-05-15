@echo off
echo ========================================
echo Brandentifier - Quick Setup Script
echo ========================================
echo.

REM Check if .env file has DATABASE_URL configured
findstr /C:"DATABASE_URL=postgresql" .env >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] DATABASE_URL not configured in .env file
    echo.
    echo Please edit .env file and add your PostgreSQL connection string:
    echo DATABASE_URL=postgresql://postgres:your_password@localhost:5432/brandentifier
    echo.
    echo Then run this script again.
    pause
    exit /b 1
)

echo [1/3] Checking database connection...
echo.

REM Try to connect to database (this will fail if database doesn't exist yet)
psql -U postgres -d brandentifier -c "SELECT 1;" >nul 2>&1
if %errorlevel% neq 0 (
    echo Database 'brandentifier' not found. Creating it now...
    echo.
    echo Please enter your PostgreSQL password when prompted:
    psql -U postgres -c "CREATE DATABASE brandentifier;"
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create database
        pause
        exit /b 1
    )
    echo [SUCCESS] Database created!
) else (
    echo [SUCCESS] Database exists!
)

echo.
echo [2/3] Pushing database schema...
echo.
call npm run db:push
if %errorlevel% neq 0 (
    echo [ERROR] Failed to push database schema
    pause
    exit /b 1
)

echo.
echo [3/3] Starting development server...
echo.
echo ========================================
echo Server will start on:
echo - Frontend: http://localhost:5001
echo - Backend:  http://localhost:5000
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev
