@echo off
title Cafe Manager
echo Starting Cafe Manager...
echo.
cd /d "%~dp0"
start node backend/server.js
timeout /T 3 /NOBREAK >nul
start http://localhost:3001
echo.
echo Server is running. Close this window to stop.
pause
