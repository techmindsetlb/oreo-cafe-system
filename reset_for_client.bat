@echo off
title Cue Corner — Reset for New Client
echo.
echo ========================================
echo   ☕ Cue Corner — Reset for New Client
echo ========================================
echo.
echo This will clear all ORDERS, BUSINESS DAYS,
echo EXPENSES, CUSTOMERS, and CART DRAFTS.
echo.
echo DEMO DATA WILL BE KEPT:
echo   ✅ Employees (superadmin account)
echo   ✅ Categories
echo   ✅ Menu Items
echo   ✅ Inventory
echo   ✅ Tables and Gaming Stations
echo   ✅ Settings
echo.
echo Press Ctrl+C to cancel, or any key to continue...
pause >nul
echo.

echo Stopping server...
call npx kill-port 3001 2>nul
timeout /t 2 /nobreak >nul
echo Server stopped.
echo.

echo Clearing transactional data...
cd /d "%~dp0"
node backend/reset_for_client.js
echo.
echo ========================================
echo   ✅ Reset Complete!
echo ========================================
echo.
echo Start the server with: start.bat
echo Login: admin@cafe.com / admin123
echo.
pause
