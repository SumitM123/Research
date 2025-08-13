@echo off
echo ========================================
echo    MERN Stack Application Startup
echo ========================================
echo.

echo Installing dependencies...
call npm run install-all

echo.
echo ========================================
echo    Starting the application...
echo ========================================
echo.
echo Frontend will be available at: http://localhost:3000
echo Backend API will be available at: http://localhost:5000
echo.
echo Press Ctrl+C to stop both servers
echo.

call npm start
