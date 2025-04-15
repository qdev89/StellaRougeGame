@echo off
echo Stellar Rogue Game Server
echo ========================
echo.
echo Attempting to start a local web server...
echo.

REM Try Python 3
python --version > nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Python found! Starting server...
    echo.
    echo Open your browser and navigate to: http://localhost:8000
    echo Press Ctrl+C to stop the server when done.
    echo.
    python -m http.server 8000
    goto :end
)

REM Try Python 3 as python3
python3 --version > nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Python 3 found! Starting server...
    echo.
    echo Open your browser and navigate to: http://localhost:8000
    echo Press Ctrl+C to stop the server when done.
    echo.
    python3 -m http.server 8000
    goto :end
)

REM Try Python 2
py --version > nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Python found! Starting server...
    echo.
    echo Open your browser and navigate to: http://localhost:8000
    echo Press Ctrl+C to stop the server when done.
    echo.
    py -m http.server 8000
    goto :end
)

REM If we get here, no Python was found
echo Python was not found on your system.
echo.
echo Please install Python or use another method to run a local web server.
echo See README.html for other options.
echo.
echo Press any key to open the README file...
pause > nul
start README.html

:end
pause
