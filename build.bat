@echo off
setlocal

echo [1/2] Building...
call npm run build
if errorlevel 1 (
    echo BUILD FAILED
    pause
    exit /b 1
)

echo [2/2] Packaging...
set CSC_IDENTITY_AUTO_DISCOVERY=false
set WIN_CSC_LINK=
call npx electron-builder --win --publish never
if errorlevel 1 (
    echo PACKAGING FAILED
    pause
    exit /b 1
)

echo.
echo Done! Installer in release\
dir /b release\*.exe
pause
