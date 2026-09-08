@echo off
chcp 65001 >nul
title LogiSync Pro - Operations Platform Launcher

cd /d "%~dp0"

echo ======================================================================
echo           LogiSync Pro - AI Logistics Platform for MSMEs
echo ======================================================================
echo.

:: 1. Verify Node.js presence
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not found in system PATH.
    echo Please install Node.js (v18+) from https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: 2. Check if node_modules exists, install if missing
if not exist "node_modules\" (
    echo [SETUP] Installing required project dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b 1
    )
    echo [SUCCESS] Dependencies installed successfully.
    echo.
)

:: 3. Launch the browser after server starts
echo [INFO] Starting LogiSync Pro development server at http://localhost:3000...
echo [INFO] Press Ctrl+C in this terminal window to stop the server anytime.
echo.

start "" "http://localhost:3000"

:: 4. Start Next.js dev server
npm run dev

pause
